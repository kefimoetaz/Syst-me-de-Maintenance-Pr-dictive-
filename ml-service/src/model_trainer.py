"""
Model Trainer for ML Predictive Maintenance
Trains and evaluates machine learning models
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from src.logger import logger


class ModelTrainer:
    """
    Trains and evaluates ML models for failure prediction
    """
    
    def __init__(self):
        """Initialize model trainer"""
        self.models = {}
        self.feature_names = []
    
    def train_random_forest(self, X_train, y_train, params=None):
        """
        Train Random Forest classifier for failure prediction
        
        Args:
            X_train: Training features (DataFrame or array)
            y_train: Training labels (Series or array)
            params: Optional hyperparameters dict
            
        Returns:
            Trained RandomForestClassifier model
        """
        # Default hyperparameters
        default_params = {
            'n_estimators': 100,
            'max_depth': 10,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'class_weight': 'balanced',  # Handle imbalanced data
            'random_state': 42,
            'n_jobs': -1  # Use all CPU cores
        }
        
        # Override with custom params if provided
        if params:
            default_params.update(params)
        
        logger.info(f"Training Random Forest with params: {default_params}")
        
        # Store feature names if X_train is DataFrame
        if isinstance(X_train, pd.DataFrame):
            self.feature_names = X_train.columns.tolist()
        
        # Train model
        model = RandomForestClassifier(**default_params)
        model.fit(X_train, y_train)
        
        logger.info("Random Forest training completed")
        
        return model
    
    def train_isolation_forest(self, X_train, params=None):
        """
        Train Isolation Forest for anomaly detection (unsupervised)
        
        Args:
            X_train: Training features (DataFrame or array)
            params: Optional hyperparameters dict
            
        Returns:
            Trained IsolationForest model
        """
        # Default hyperparameters
        default_params = {
            'n_estimators': 100,
            'contamination': 0.1,  # Expected proportion of outliers
            'random_state': 42,
            'n_jobs': -1
        }
        
        # Override with custom params if provided
        if params:
            default_params.update(params)
        
        logger.info(f"Training Isolation Forest with params: {default_params}")
        
        # Store feature names if X_train is DataFrame
        if isinstance(X_train, pd.DataFrame):
            self.feature_names = X_train.columns.tolist()
        
        # Train model
        model = IsolationForest(**default_params)
        model.fit(X_train)
        
        logger.info("Isolation Forest training completed")
        
        return model
    
    def evaluate_model(self, model, X_test, y_test):
        """
        Evaluate model performance on test data
        
        Args:
            model: Trained model
            X_test: Test features
            y_test: Test labels
            
        Returns:
            Dictionary with evaluation metrics
        """
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_test, y_pred, average='weighted', zero_division=0)
        }
        
        logger.info(f"Model evaluation metrics:")
        logger.info(f"  Accuracy:  {metrics['accuracy']:.4f}")
        logger.info(f"  Precision: {metrics['precision']:.4f}")
        logger.info(f"  Recall:    {metrics['recall']:.4f}")
        logger.info(f"  F1-Score:  {metrics['f1_score']:.4f}")
        
        # Detailed classification report
        report = classification_report(y_test, y_pred, zero_division=0)
        logger.info(f"\nClassification Report:\n{report}")
        
        return metrics
    
    def calculate_feature_importance(self, model, feature_names=None):
        """
        Calculate feature importance scores for tree-based models
        
        Args:
            model: Trained model (must have feature_importances_ attribute)
            feature_names: List of feature names (optional)
            
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if not hasattr(model, 'feature_importances_'):
            logger.warning("Model does not support feature importance")
            return {}
        
        # Get feature importances
        importances = model.feature_importances_
        
        # Use stored feature names or generate generic names
        if feature_names is None:
            feature_names = self.feature_names if self.feature_names else [f"feature_{i}" for i in range(len(importances))]
        
        # Create dictionary of feature: importance
        feature_importance = dict(zip(feature_names, importances))
        
        # Sort by importance (descending)
        feature_importance = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True))
        
        # Log top 10 features
        logger.info("Top 10 most important features:")
        for i, (feature, importance) in enumerate(list(feature_importance.items())[:10], 1):
            logger.info(f"  {i}. {feature}: {importance:.4f}")
        
        return feature_importance
    
    def cross_validate(self, model, X, y, folds=5):
        """
        Perform cross-validation on the model
        
        Args:
            model: Model to validate
            X: Features
            y: Labels
            folds: Number of cross-validation folds
            
        Returns:
            Dictionary with cross-validation scores
        """
        logger.info(f"Performing {folds}-fold cross-validation...")
        
        # Perform cross-validation
        cv_scores = cross_val_score(model, X, y, cv=folds, scoring='accuracy', n_jobs=-1)
        
        cv_results = {
            'mean_score': cv_scores.mean(),
            'std_score': cv_scores.std(),
            'scores': cv_scores.tolist()
        }
        
        logger.info(f"Cross-validation results:")
        logger.info(f"  Mean accuracy: {cv_results['mean_score']:.4f} (+/- {cv_results['std_score']:.4f})")
        logger.info(f"  Individual scores: {cv_results['scores']}")
        
        return cv_results
