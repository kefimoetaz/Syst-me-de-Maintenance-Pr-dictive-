"""
Predictor for ML Predictive Maintenance
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import psycopg2

from src.config import Config
from src.logger import logger
from src.feature_extractor import FeatureExtractor
from src.model_registry import ModelRegistry


class Predictor:
    def __init__(self):
        self.conn = None
        self.feature_extractor = None
        self.model_registry = None
        self.model_cache = {}
        self._connect_db()
    
    def _connect_db(self):
        try:
            self.conn = psycopg2.connect(
                host=Config.DB_HOST, port=Config.DB_PORT,
                database=Config.DB_NAME, user=Config.DB_USER,
                password=Config.DB_PASSWORD
            )
            logger.info("Predictor connected")
        except Exception as e:
            logger.error(f"Connection failed: {e}")
            raise
    
    def close(self):
        if self.conn:
            self.conn.close()
        if self.feature_extractor:
            self.feature_extractor.close()
        if self.model_registry:
            self.model_registry.close()
    
    def load_model(self, model_type='random_forest', use_cache=True):
        if use_cache and model_type in self.model_cache:
            return self.model_cache[model_type]
        if self.model_registry is None:
            self.model_registry = ModelRegistry()
        model, metadata = self.model_registry.get_active_model(model_type)
        if model is None:
            raise ValueError(f"No active model: {model_type}")
        self.model_cache[model_type] = (model, metadata)
        return model, metadata
    
    def calculate_risk_level(self, probability):
        prob_pct = probability * 100
        if prob_pct >= 70:
            return 'CRITICAL'
        elif prob_pct >= 50:
            return 'HIGH'
        elif prob_pct >= 30:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def get_contributing_factors(self, model, features, top_n=5):
        if not hasattr(model, 'feature_importances_'):
            return []
        importances = model.feature_importances_
        feature_names = features.columns.tolist()
        factors = []
        for i, (name, importance) in enumerate(zip(feature_names, importances)):
            factors.append({
                'feature': name,
                'importance': float(importance),
                'value': float(features.iloc[0, i])
            })
        factors.sort(key=lambda x: x['importance'], reverse=True)
        return factors[:top_n]
    
    def predict_single(self, machine_id, model_type='random_forest'):
        logger.info(f"Predicting for machine {machine_id}")
        try:
            model, model_metadata = self.load_model(model_type)
            if self.feature_extractor is None:
                self.feature_extractor = FeatureExtractor()
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            features_df = self.feature_extractor.extract_features(
                machine_id=machine_id, start_date=start_date, end_date=end_date
            )
            if features_df.empty:
                return None
            drop_columns = ['machine_id', 'timestamp']
            X = features_df.drop(columns=[col for col in drop_columns if col in features_df.columns])
            X = X.fillna(0)
            prediction_proba = model.predict_proba(X)[0]
            failure_prob = prediction_proba[1] if len(prediction_proba) > 1 else 0.0
            failure_prob_7d = failure_prob * 0.7
            failure_prob_14d = failure_prob * 0.85
            failure_prob_30d = failure_prob
            risk_level = self.calculate_risk_level(failure_prob_30d)
            contributing_factors = self.get_contributing_factors(model, X, top_n=5)
            prediction = {
                'machine_id': machine_id,
                'prediction_date': datetime.now(),
                'failure_probability_7d': float(failure_prob_7d * 100),
                'failure_probability_14d': float(failure_prob_14d * 100),
                'failure_probability_30d': float(failure_prob_30d * 100),
                'risk_level': risk_level,
                'model_version': model_metadata['model_id'],
                'contributing_factors': contributing_factors
            }
            logger.info(f"Prediction: {risk_level} ({failure_prob_30d*100:.1f}%)")
            return prediction
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return None
    
    def predict_batch(self, machine_ids=None, model_type='random_forest'):
        logger.info("Batch prediction starting")
        if machine_ids is None:
            try:
                cursor = self.conn.cursor()
                cursor.execute("SELECT id FROM machines")
                results = cursor.fetchall()
                cursor.close()
                machine_ids = [row[0] for row in results]
            except Exception as e:
                logger.error(f"Failed to get machines: {e}")
                return []
        predictions = []
        for machine_id in machine_ids:
            try:
                prediction = self.predict_single(machine_id, model_type)
                if prediction:
                    predictions.append(prediction)
            except Exception as e:
                logger.error(f"Failed for machine {machine_id}: {e}")
                continue
        logger.info(f"Batch complete: {len(predictions)} predictions")
        return predictions
    
    def store_predictions(self, predictions):
        if not predictions:
            return 0
        logger.info(f"Storing {len(predictions)} predictions")
        try:
            cursor = self.conn.cursor()
            stored_count = 0
            for pred in predictions:
                try:
                    cursor.execute("""
                        INSERT INTO predictions (
                            machine_id, prediction_date,
                            failure_probability_7d, failure_probability_14d, failure_probability_30d,
                            risk_level, model_version, contributing_factors
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        pred['machine_id'], pred['prediction_date'],
                        pred['failure_probability_7d'], pred['failure_probability_14d'],
                        pred['failure_probability_30d'], pred['risk_level'],
                        pred['model_version'], json.dumps(pred['contributing_factors'])
                    ))
                    stored_count += 1
                except Exception as e:
                    logger.error(f"Store failed for machine {pred['machine_id']}: {e}")
                    continue
            self.conn.commit()
            cursor.close()
            logger.info(f"Stored {stored_count} predictions")
            return stored_count
        except Exception as e:
            logger.error(f"Store failed: {e}")
            if self.conn:
                self.conn.rollback()
            raise
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
