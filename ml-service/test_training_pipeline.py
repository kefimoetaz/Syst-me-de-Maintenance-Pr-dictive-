"""
Test script for Training Pipeline
Tests end-to-end training workflow
"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.training_pipeline import TrainingPipeline
from src.logger import logger


def test_training_pipeline():
    """Test the complete training pipeline"""
    
    logger.info("=" * 80)
    logger.info("TESTING TRAINING PIPELINE")
    logger.info("=" * 80)
    
    try:
        # Create training pipeline
        with TrainingPipeline() as pipeline:
            
            # Run training with 30 days of data (faster for testing)
            results = pipeline.run(
                days=30,
                model_type='random_forest',
                params=None,  # Use default parameters
                auto_activate=True
            )
            
            # Display results
            logger.info("\n" + "=" * 80)
            logger.info("TRAINING RESULTS")
            logger.info("=" * 80)
            logger.info(f"Model ID: {results['model_id']}")
            logger.info(f"Training samples: {results['training_samples']}")
            logger.info(f"Test samples: {results['test_samples']}")
            logger.info("\nMetrics:")
            for metric, value in results['metrics'].items():
                logger.info(f"  {metric}: {value:.4f}")
            
            logger.info("\nTop 10 Important Features:")
            for i, (feature, importance) in enumerate(list(results['feature_importance'].items())[:10], 1):
                logger.info(f"  {i}. {feature}: {importance:.4f}")
            
            logger.info("\n" + "=" * 80)
            logger.info("TEST PASSED - Training pipeline completed successfully!")
            logger.info("=" * 80)
            
            return True
            
    except Exception as e:
        logger.error(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_training_pipeline()
    sys.exit(0 if success else 1)
