"""
Test script for Model Training
Run this to verify model training and registry work correctly
"""
import numpy as np
import pandas as pd
from sklearn.datasets import make_classification
from src.model_trainer import ModelTrainer
from src.model_registry import ModelRegistry
from src.logger import logger


def test_model_training():
    """Test model training with synthetic data"""
    
    logger.info("Generating synthetic training data...")
    
    # Generate synthetic dataset (binary classification)
    X, y = make_classification(
        n_samples=1000,
        n_features=20,
        n_informative=15,
        n_redundant=5,
        n_classes=2,
        weights=[0.7, 0.3],  # Imbalanced classes
        random_state=42
    )
    
    # Convert to DataFrame
    feature_names = [f"feature_{i}" for i in range(X.shape[1])]
    X_df = pd.DataFrame(X, columns=feature_names)
    
    # Split data
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X_df, y, test_size=0.2, random_state=42
    )
    
    logger.info(f"Training set: {len(X_train)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Initialize trainer
    trainer = ModelTrainer()
    
    # Train Random Forest
    logger.info("\n=== Training Random Forest ===")
    rf_model = trainer.train_random_forest(X_train, y_train)
    
    # Evaluate model
    logger.info("\n=== Evaluating Random Forest ===")
    metrics = trainer.evaluate_model(rf_model, X_test, y_test)
    
    # Calculate feature importance
    logger.info("\n=== Feature Importance ===")
    feature_importance = trainer.calculate_feature_importance(rf_model, feature_names)
    
    # Save model to registry
    logger.info("\n=== Saving Model to Registry ===")
    try:
        with ModelRegistry() as registry:
            model_id = registry.save_model(
                model=rf_model,
                model_type='random_forest',
                metrics=metrics,
                params={'n_estimators': 100, 'max_depth': 10}
            )
            
            logger.info(f"Model saved with ID: {model_id}")
            
            # Set as active
            registry.set_active_model(model_id)
            logger.info(f"Model activated: {model_id}")
            
            # List all models
            models = registry.list_models('random_forest')
            logger.info(f"\nAll Random Forest models:")
            for model in models:
                logger.info(f"  - {model['model_id']} (v{model['version']}) - Active: {model['is_active']}")
            
            # Load model back
            loaded_model = registry.load_model(model_id)
            logger.info(f"\nModel loaded successfully: {type(loaded_model)}")
            
            logger.info("\n✓ Model training and registry test completed successfully!")
            
    except Exception as e:
        logger.error(f"Model registry test failed: {e}")
        raise


if __name__ == "__main__":
    test_model_training()
