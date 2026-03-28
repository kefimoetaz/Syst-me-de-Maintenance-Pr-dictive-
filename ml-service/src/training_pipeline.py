"""
Training Pipeline for ML Predictive Maintenance
Orchestrates data extraction, feature engineering, model training, and evaluation
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
import psycopg2
from psycopg2.extras import RealDictCursor
import time

from src.config import Config
from src.logger import logger
from src.feature_extractor import FeatureExtractor
from src.model_trainer import ModelTrainer
from src.model_registry import ModelRegistry


class TrainingPipeline:
    """
    Orchestrates the end-to-end ML training pipeline
    """
    
    def __init__(self):
        """Initialize training pipeline components"""
        self.conn = None
        self.feature_extractor = None
        self.model_trainer = ModelTrainer()
        self.model_registry = None
        self._connect_db()
    
    def _connect_db(self):
        """Establish database connection with retry logic"""
        max_retries = 3
        retry_delay = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                self.conn = psycopg2.connect(
                    host=Config.DB_HOST,
                    port=Config.DB_PORT,
                    database=Config.DB_NAME,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD
                )
                logger.info("Training pipeline connected to database")
                return
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Database connection attempt {attempt + 1} failed: {e}. Retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    logger.error(f"Database connection failed after {max_retries} attempts: {e}")
                    raise
    
    def close(self):
        """Close all connections"""
        if self.conn:
            self.conn.close()
        if self.feature_extractor:
            self.feature_extractor.close()
        if self.model_registry:
            self.model_registry.close()
        logger.info("Training pipeline connections closed")
    
    def get_active_machines(self):
        """
        Get list of all machines from database
        
        Returns:
            List of machine IDs
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT id FROM machines")
            results = cursor.fetchall()
            cursor.close()
            
            machine_ids = [row[0] for row in results]
            logger.info(f"Found {len(machine_ids)} machines")
            
            return machine_ids
            
        except Exception as e:
            logger.error(f"Failed to get machines: {e}")
            raise
    
    def extract_data(self, days=90):
        """
        Extract historical data for all active machines
        
        Args:
            days: Number of days of historical data to extract (default: 90)
            
        Returns:
            DataFrame with features for all machines
        """
        logger.info(f"Extracting data for past {days} days...")
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get active machines
        machine_ids = self.get_active_machines()
        
        if not machine_ids:
            logger.warning("No active machines found")
            return pd.DataFrame()
        
        # Initialize feature extractor
        self.feature_extractor = FeatureExtractor()
        
        # Extract features for each machine
        all_features = []
        
        for machine_id in machine_ids:
            try:
                logger.info(f"Extracting features for machine {machine_id}...")
                features_df = self.feature_extractor.extract_features(
                    machine_id=machine_id,
                    start_date=start_date,
                    end_date=end_date
                )
                
                if not features_df.empty:
                    all_features.append(features_df)
                    
            except Exception as e:
                logger.error(f"Failed to extract features for machine {machine_id}: {e}")
                continue
        
        # Combine all features
        if all_features:
            combined_df = pd.concat(all_features, ignore_index=True)
            logger.info(f"Extracted features for {len(combined_df)} machine samples")
            return combined_df
        else:
            logger.warning("No features extracted")
            return pd.DataFrame()
    
    def prepare_training_data(self, features_df, test_size=0.2, random_state=42):
        """
        Prepare data for training with train-test split
        
        Args:
            features_df: DataFrame with extracted features
            test_size: Proportion of data for testing (default: 0.2 = 80/20 split)
            random_state: Random seed for reproducibility
            
        Returns:
            Tuple of (X_train, X_test, y_train, y_test)
        """
        logger.info("Preparing training data...")
        
        if features_df.empty:
            raise ValueError("Cannot prepare training data: features DataFrame is empty")
        
        # For now, we'll create synthetic labels since we don't have real failure data
        # In production, you would load actual failure labels from a failures table
        # This is a placeholder that creates random labels for demonstration
        logger.warning("Using synthetic labels for training (replace with real failure data in production)")
        
        # Create synthetic labels (0 = no failure, 1 = failure)
        # Use a simple heuristic: high CPU/memory/disk usage = higher failure probability
        features_df['failure_label'] = 0
        
        # Mark as failure if any metric is consistently high
        if 'cpu_usage_mean_720h' in features_df.columns:
            features_df.loc[features_df['cpu_usage_mean_720h'] > 80, 'failure_label'] = 1
        if 'memory_usage_mean_720h' in features_df.columns:
            features_df.loc[features_df['memory_usage_mean_720h'] > 85, 'failure_label'] = 1
        if 'disk_usage_mean_720h' in features_df.columns:
            features_df.loc[features_df['disk_usage_mean_720h'] > 90, 'failure_label'] = 1
        
        # Separate features and labels
        # Drop non-feature columns
        drop_columns = ['machine_id', 'timestamp', 'failure_label']
        X = features_df.drop(columns=[col for col in drop_columns if col in features_df.columns])
        y = features_df['failure_label']
        
        # Handle any remaining NaN values by filling with 0
        X = X.fillna(0)
        
        logger.info(f"Feature matrix shape: {X.shape}")
        logger.info(f"Label distribution: {y.value_counts().to_dict()}")
        
        # Handle small datasets (< 10 samples)
        n_samples = len(X)
        if n_samples < 10:
            logger.warning(f"Small dataset detected ({n_samples} samples). Using all data for training without test split.")
            # Use all data for training, create empty test sets
            X_train, X_test = X, X.iloc[:0]  # Empty test set with same columns
            y_train, y_test = y, y.iloc[:0]  # Empty test labels
        else:
            # Adjust test_size for small datasets
            min_test_samples = max(2, len(y.unique()))  # At least 2 samples or 1 per class
            adjusted_test_size = max(min_test_samples / n_samples, test_size)
            
            # Disable stratification if we don't have enough samples per class
            use_stratify = None
            if len(y.unique()) > 1:
                min_class_count = y.value_counts().min()
                if min_class_count >= 2:  # Need at least 2 samples per class for stratification
                    use_stratify = y
            
            logger.info(f"Using test_size={adjusted_test_size:.2f}, stratify={use_stratify is not None}")
            
            # Split into train and test sets
            X_train, X_test, y_train, y_test = train_test_split(
                X, y,
                test_size=adjusted_test_size,
                random_state=random_state,
                stratify=use_stratify
            )
        
        logger.info(f"Training set size: {len(X_train)}")
        logger.info(f"Test set size: {len(X_test)}")
        
        return X_train, X_test, y_train, y_test
    
    def train_model(self, X_train, y_train, X_test, y_test, model_type='random_forest', params=None):
        """
        Train and evaluate a model with fallback to alternative algorithms
        
        Args:
            X_train: Training features
            y_train: Training labels
            X_test: Test features
            y_test: Test labels
            model_type: Type of model to train ('random_forest' or 'isolation_forest')
            params: Optional hyperparameters
            
        Returns:
            Tuple of (trained_model, evaluation_metrics, feature_importance)
        """
        logger.info(f"Training {model_type} model...")
        
        try:
            # Train model
            if model_type == 'random_forest':
                model = self.model_trainer.train_random_forest(X_train, y_train, params)
            elif model_type == 'isolation_forest':
                model = self.model_trainer.train_isolation_forest(X_train, params)
            else:
                raise ValueError(f"Unsupported model type: {model_type}")
            
            # Evaluate model (skip if no test data)
            if len(X_test) > 0:
                metrics = self.model_trainer.evaluate_model(model, X_test, y_test)
            else:
                logger.warning("No test data available. Skipping evaluation. Using training accuracy as proxy.")
                # Use training accuracy as a proxy when no test data
                from sklearn.metrics import accuracy_score
                y_train_pred = model.predict(X_train)
                train_accuracy = accuracy_score(y_train, y_train_pred)
                metrics = {
                    'accuracy': train_accuracy,
                    'precision': train_accuracy,  # Approximation
                    'recall': train_accuracy,     # Approximation
                    'f1_score': train_accuracy    # Approximation
                }
                logger.info(f"Training accuracy (proxy): {train_accuracy:.4f}")
            
            # Calculate feature importance
            feature_importance = self.model_trainer.calculate_feature_importance(
                model,
                feature_names=X_train.columns.tolist()
            )
            
            return model, metrics, feature_importance
            
        except Exception as e:
            logger.error(f"Training failed for {model_type}: {e}")
            
            # Fallback: try simpler model with different parameters
            if model_type == 'random_forest':
                logger.info("Attempting fallback with simpler Random Forest parameters...")
                try:
                    fallback_params = {
                        'n_estimators': 50,  # Fewer trees
                        'max_depth': 5,      # Shallower trees
                        'min_samples_split': 10,
                        'class_weight': 'balanced',
                        'random_state': 42
                    }
                    model = self.model_trainer.train_random_forest(X_train, y_train, fallback_params)
                    if len(X_test) > 0:
                        metrics = self.model_trainer.evaluate_model(model, X_test, y_test)
                    else:
                        from sklearn.metrics import accuracy_score
                        y_train_pred = model.predict(X_train)
                        train_accuracy = accuracy_score(y_train, y_train_pred)
                        metrics = {
                            'accuracy': train_accuracy,
                            'precision': train_accuracy,
                            'recall': train_accuracy,
                            'f1_score': train_accuracy
                        }
                    feature_importance = self.model_trainer.calculate_feature_importance(
                        model,
                        feature_names=X_train.columns.tolist()
                    )
                    logger.info("Fallback training succeeded")
                    return model, metrics, feature_importance
                except Exception as fallback_error:
                    logger.error(f"Fallback training also failed: {fallback_error}")
                    raise
            else:
                # No fallback for other model types
                raise
    
    def save_and_register_model(self, model, model_type, metrics, params=None):
        """
        Save model to registry
        
        Args:
            model: Trained model object
            model_type: Type of model
            metrics: Evaluation metrics
            params: Model hyperparameters
            
        Returns:
            model_id
        """
        logger.info("Saving model to registry...")
        
        # Initialize model registry
        self.model_registry = ModelRegistry()
        
        # Save model
        model_id = self.model_registry.save_model(
            model=model,
            model_type=model_type,
            metrics=metrics,
            params=params
        )
        
        logger.info(f"Model saved with ID: {model_id}")
        
        return model_id
    
    def run(self, days=90, model_type='random_forest', params=None, auto_activate=True):
        """
        Run the complete training pipeline
        
        Args:
            days: Number of days of historical data to use
            model_type: Type of model to train
            params: Optional model hyperparameters
            auto_activate: Whether to automatically activate model if it's better
            
        Returns:
            Dictionary with training results
        """
        try:
            logger.info("=" * 80)
            logger.info("STARTING TRAINING PIPELINE")
            logger.info("=" * 80)
            
            # Step 1: Extract data
            features_df = self.extract_data(days=days)
            
            if features_df.empty:
                raise ValueError("No data extracted - cannot train model")
            
            # Step 2: Prepare training data
            X_train, X_test, y_train, y_test = self.prepare_training_data(features_df)
            
            # Step 3: Train model
            model, metrics, feature_importance = self.train_model(
                X_train, y_train, X_test, y_test,
                model_type=model_type,
                params=params
            )
            
            # Step 4: Save model
            model_id = self.save_and_register_model(
                model=model,
                model_type=model_type,
                metrics=metrics,
                params=params
            )
            
            # Step 5: Check if we should activate this model
            if auto_activate:
                self._check_and_activate_model(model_id, metrics, model_type)
            
            logger.info("=" * 80)
            logger.info("TRAINING PIPELINE COMPLETED SUCCESSFULLY")
            logger.info("=" * 80)
            
            return {
                'model_id': model_id,
                'metrics': metrics,
                'feature_importance': feature_importance,
                'training_samples': len(X_train),
                'test_samples': len(X_test)
            }
            
        except Exception as e:
            logger.error(f"Training pipeline failed: {e}")
            raise
        finally:
            self.close()
    
    def _check_and_activate_model(self, new_model_id, new_metrics, model_type):
        """
        Compare new model with active model and activate if better
        
        Args:
            new_model_id: ID of newly trained model
            new_metrics: Metrics of new model
            model_type: Type of model
        """
        logger.info("Checking if new model should be activated...")
        
        try:
            # Get current active model
            _, active_model_metadata = self.model_registry.get_active_model(model_type)
            
            if active_model_metadata is None:
                # No active model exists, activate this one
                logger.info("No active model exists - activating new model")
                self.model_registry.set_active_model(new_model_id)
                return
            
            # Compare accuracy (convert to float to handle Decimal from database)
            active_accuracy = float(active_model_metadata.get('accuracy', 0))
            new_accuracy = float(new_metrics.get('accuracy', 0))
            
            improvement = new_accuracy - active_accuracy
            improvement_pct = (improvement / active_accuracy * 100) if active_accuracy > 0 else 0
            
            logger.info(f"Active model accuracy: {active_accuracy:.4f}")
            logger.info(f"New model accuracy: {new_accuracy:.4f}")
            logger.info(f"Improvement: {improvement:.4f} ({improvement_pct:.2f}%)")
            
            # Activate if improvement is >= 5%
            if improvement_pct >= 5.0:
                logger.info(f"New model is {improvement_pct:.2f}% better - activating")
                self.model_registry.set_active_model(new_model_id)
            else:
                logger.info(f"New model improvement ({improvement_pct:.2f}%) is below 5% threshold - keeping current model active")
                
        except Exception as e:
            logger.error(f"Failed to check and activate model: {e}")
            # Don't raise - this is not critical
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
