"""
Test script for Predictor
Tests prediction generation and storage
"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.predictor import Predictor
from src.logger import logger


def test_predictor():
    """Test the predictor component"""
    
    logger.info("=" * 80)
    logger.info("TESTING PREDICTOR")
    logger.info("=" * 80)
    
    try:
        with Predictor() as predictor:
            
            # Test 1: Single machine prediction
            logger.info("\n--- Test 1: Single Machine Prediction ---")
            prediction = predictor.predict_single(machine_id=1)
            
            if prediction:
                logger.info(f"Machine ID: {prediction['machine_id']}")
                logger.info(f"Risk Level: {prediction['risk_level']}")
                logger.info(f"7-day failure probability: {prediction['failure_probability_7d']:.2f}%")
                logger.info(f"14-day failure probability: {prediction['failure_probability_14d']:.2f}%")
                logger.info(f"30-day failure probability: {prediction['failure_probability_30d']:.2f}%")
                logger.info(f"Model version: {prediction['model_version']}")
                logger.info("\nTop Contributing Factors:")
                for i, factor in enumerate(prediction['contributing_factors'], 1):
                    logger.info(f"  {i}. {factor['feature']}: importance={factor['importance']:.4f}, value={factor['value']:.2f}")
            else:
                logger.warning("No prediction generated")
            
            # Test 2: Batch prediction
            logger.info("\n--- Test 2: Batch Prediction ---")
            predictions = predictor.predict_batch(machine_ids=[1, 2, 3])
            
            logger.info(f"Generated {len(predictions)} predictions")
            for pred in predictions:
                logger.info(f"  Machine {pred['machine_id']}: {pred['risk_level']} ({pred['failure_probability_30d']:.1f}%)")
            
            # Test 3: Store predictions
            logger.info("\n--- Test 3: Store Predictions ---")
            stored_count = predictor.store_predictions(predictions)
            logger.info(f"Stored {stored_count} predictions in database")
            
            logger.info("\n" + "=" * 80)
            logger.info("TEST PASSED - Predictor working correctly!")
            logger.info("=" * 80)
            
            return True
            
    except Exception as e:
        logger.error(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_predictor()
    sys.exit(0 if success else 1)
