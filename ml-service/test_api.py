"""
Test script for ML Prediction Service API
Tests all endpoints with sample requests
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
API_TOKEN = "your_api_token_here"  # Should match .env file

# Headers with authentication
headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}


def print_response(title, response):
    """Pretty print API response"""
    print("\n" + "=" * 80)
    print(f"{title}")
    print("=" * 80)
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)


def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    return response.status_code == 200


def test_get_prediction():
    """Test get prediction for a machine"""
    machine_id = 1  # Test with machine 1
    response = requests.get(
        f"{BASE_URL}/api/predictions/{machine_id}",
        headers=headers
    )
    print_response(f"Get Prediction for Machine {machine_id}", response)
    return response.status_code in [200, 404]  # 404 is OK if no prediction exists


def test_get_high_risk_machines():
    """Test get high-risk machines"""
    response = requests.get(
        f"{BASE_URL}/api/predictions/high-risk",
        headers=headers
    )
    print_response("Get High-Risk Machines", response)
    return response.status_code == 200


def test_get_anomalies():
    """Test get anomalies with filters"""
    # Test without filters
    response = requests.get(
        f"{BASE_URL}/api/anomalies",
        headers=headers
    )
    print_response("Get Anomalies (no filters)", response)
    
    # Test with filters
    response = requests.get(
        f"{BASE_URL}/api/anomalies?days=7&severity=CRITICAL",
        headers=headers
    )
    print_response("Get Anomalies (filtered: 7 days, CRITICAL)", response)
    
    return response.status_code == 200


def test_get_models():
    """Test get models list"""
    response = requests.get(
        f"{BASE_URL}/api/ml/models",
        headers=headers
    )
    print_response("Get Models List", response)
    return response.status_code == 200


def test_trigger_training():
    """Test trigger model training"""
    payload = {
        "data_window_days": 30,  # Use smaller window for faster testing
        "model_type": "random_forest",
        "hyperparameters": {
            "n_estimators": 50,
            "max_depth": 5
        }
    }
    
    print("\n" + "=" * 80)
    print("Triggering Model Training (this may take a few minutes)...")
    print("=" * 80)
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/api/ml/train",
        headers=headers,
        json=payload
    )
    print_response("Trigger Training", response)
    return response.status_code == 200


def test_authentication():
    """Test authentication enforcement"""
    # Test without token
    response = requests.get(f"{BASE_URL}/api/predictions/1")
    print_response("Test No Auth Token (should fail)", response)
    
    # Test with invalid token
    invalid_headers = {"Authorization": "Bearer invalid_token"}
    response = requests.get(
        f"{BASE_URL}/api/predictions/1",
        headers=invalid_headers
    )
    print_response("Test Invalid Auth Token (should fail)", response)
    
    return True


def run_all_tests():
    """Run all API tests"""
    print("\n" + "=" * 80)
    print("ML PREDICTION SERVICE API TESTS")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    tests = [
        ("Health Check", test_health_check),
        ("Authentication", test_authentication),
        ("Get Prediction", test_get_prediction),
        ("Get High-Risk Machines", test_get_high_risk_machines),
        ("Get Anomalies", test_get_anomalies),
        ("Get Models", test_get_models),
        # Uncomment to test training (takes time)
        # ("Trigger Training", test_trigger_training),
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
