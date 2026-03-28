"""
One-time script to generate predictions for all machines
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.prediction_scheduler import PredictionScheduler
from src.logger import logger

def main():
    """Run predictions once for all machines"""
    logger.info("Starting one-time prediction generation...")
    
    try:
        scheduler = PredictionScheduler()
        result = scheduler.run_prediction_job()
        
        logger.info("Prediction job completed")
        logger.info(f"Result: {result}")
        
        print("\n=== Prediction Job Complete ===")
        print(f"Status: {result.get('status', 'unknown')}")
        print(f"Machines processed: {result.get('machines_processed', 0)}")
        print(f"High-risk machines: {result.get('high_risk_count', 0)}")
        print(f"Errors: {result.get('errors', 0)}")
        
        if result.get('status') == 'failed':
            print(f"Error: {result.get('error', 'Unknown error')}")
            sys.exit(1)
        
    except Exception as e:
        logger.error(f"Failed to run predictions: {e}")
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
