"""
Test script for PredictionScheduler
Tests scheduled prediction job execution
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.prediction_scheduler import PredictionScheduler
from src.logger import logger
import time


def test_manual_prediction_job():
    """Test running prediction job manually"""
    print("\n" + "=" * 80)
    print("Testing Manual Prediction Job Execution")
    print("=" * 80)
    
    try:
        # Create scheduler
        scheduler = PredictionScheduler()
        
        # Run prediction job manually
        print("\nRunning prediction job...")
        result = scheduler.run_prediction_job()
        
        # Print results
        print("\n" + "=" * 80)
        print("Job Results:")
        print("=" * 80)
        for key, value in result.items():
            print(f"{key}: {value}")
        
        # Close scheduler
        scheduler.stop()
        
        print("\n✓ Manual prediction job test completed successfully")
        return True
        
    except Exception as e:
        print(f"\n✗ Manual prediction job test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_scheduler_setup():
    """Test scheduler setup and configuration"""
    print("\n" + "=" * 80)
    print("Testing Scheduler Setup")
    print("=" * 80)
    
    try:
        # Create scheduler
        scheduler = PredictionScheduler()
        
        # Schedule daily predictions
        scheduler.schedule_daily_predictions(hour=2, minute=0)
        
        # Get job status
        status = scheduler.get_job_status('daily_predictions')
        
        print("\nScheduler Status:")
        for key, value in status.items():
            print(f"{key}: {value}")
        
        # Start scheduler
        scheduler.start()
        print("\n✓ Scheduler started successfully")
        
        # Wait a moment
        time.sleep(2)
        
        # Stop scheduler
        scheduler.stop()
        print("✓ Scheduler stopped successfully")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Scheduler setup test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def run_all_tests():
    """Run all scheduler tests"""
    print("\n" + "=" * 80)
    print("PREDICTION SCHEDULER TESTS")
    print("=" * 80)
    
    tests = [
        ("Scheduler Setup", test_scheduler_setup),
        ("Manual Prediction Job", test_manual_prediction_job),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, "PASS" if success else "FAIL"))
        except Exception as e:
            print(f"\nERROR in {test_name}: {e}")
            results.append((test_name, "ERROR"))
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    for test_name, status in results:
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, status in results if status == "PASS")
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
    except Exception as e:
        print(f"\n\nFatal error: {e}")
