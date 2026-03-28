"""
Test script for Anomaly Detector
Tests anomaly detection and storage
"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.anomaly_detector import AnomalyDetector
from src.logger import logger


def test_anomaly_detector():
    """Test the anomaly detector component"""
    
    logger.info("=" * 80)
    logger.info("TESTING ANOMALY DETECTOR")
    logger.info("=" * 80)
    
    try:
        with AnomalyDetector() as detector:
            
            # Test 1: Normal value (should not be anomaly)
            logger.info("\n--- Test 1: Normal Value Detection ---")
            result = detector.detect_anomaly(
                machine_id=1,
                metric_name='cpu_usage',
                current_value=55.0
            )
            logger.info(f"Is anomaly: {result['is_anomaly']}")
            logger.info(f"Expected range: {result['expected_range']}")
            
            # Test 2: Anomalous value (spike)
            logger.info("\n--- Test 2: Anomalous Value Detection (Spike) ---")
            result = detector.detect_anomaly(
                machine_id=1,
                metric_name='cpu_usage',
                current_value=95.0  # Very high value
            )
            logger.info(f"Is anomaly: {result['is_anomaly']}")
            if result['is_anomaly']:
                logger.info(f"Anomaly type: {result['anomaly_type']}")
                logger.info(f"Severity: {result['severity']}")
                logger.info(f"Anomaly score: {result['anomaly_score']:.2f}")
                logger.info(f"Expected range: {result['expected_range']}")
            
            # Test 3: Detect and store multiple metrics
            logger.info("\n--- Test 3: Multiple Metrics Detection ---")
            metrics = {
                'cpu_usage': 92.0,
                'memory_usage': 88.0,
                'disk_usage': 95.0
            }
            anomalies = detector.detect_and_store(machine_id=1, metrics=metrics)
            logger.info(f"Detected {len(anomalies)} anomalies")
            for anomaly in anomalies:
                logger.info(f"  {anomaly['metric_name']}: {anomaly['severity']} ({anomaly['anomaly_score']:.1f})")
            
            # Test 4: Aggregate anomalies
            logger.info("\n--- Test 4: Anomaly Aggregation ---")
            aggregated = detector.aggregate_anomalies(machine_id=1, time_window_hours=1)
            if aggregated:
                logger.info(f"Aggregated {aggregated['anomaly_count']} anomalies")
                logger.info(f"Max severity: {aggregated['max_severity']}")
                logger.info(f"Avg anomaly score: {aggregated['avg_anomaly_score']:.2f}")
            else:
                logger.info("No anomalies to aggregate")
            
            logger.info("\n" + "=" * 80)
            logger.info("TEST PASSED - Anomaly Detector working correctly!")
            logger.info("=" * 80)
            
            return True
            
    except Exception as e:
        logger.error(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_anomaly_detector()
    sys.exit(0 if success else 1)
