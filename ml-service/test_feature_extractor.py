"""
Test script for Feature Extractor
Run this to verify feature extraction works correctly
"""
from datetime import datetime, timedelta
from src.feature_extractor import FeatureExtractor
from src.logger import logger

def test_feature_extraction():
    """Test feature extraction for a machine"""
    
    # Use machine ID 1 (from seed data)
    machine_id = 1
    
    # Extract features for the last 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    logger.info(f"Testing feature extraction for machine {machine_id}")
    logger.info(f"Date range: {start_date} to {end_date}")
    
    try:
        # Create feature extractor
        with FeatureExtractor() as extractor:
            # Extract features
            features_df = extractor.extract_features(machine_id, start_date, end_date)
            
            if features_df.empty:
                logger.warning("No features extracted - check if data exists in database")
                return
            
            # Display extracted features
            logger.info(f"\nExtracted {len(features_df.columns)} features:")
            logger.info(f"\nFeature names:")
            for col in sorted(features_df.columns):
                value = features_df[col].iloc[0]
                logger.info(f"  {col}: {value}")
            
            logger.info("\n✓ Feature extraction test completed successfully!")
            
    except Exception as e:
        logger.error(f"Feature extraction test failed: {e}")
        raise


if __name__ == "__main__":
    test_feature_extraction()
