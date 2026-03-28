# ML Prediction Service API Documentation

## Overview

The ML Prediction Service provides REST API endpoints for machine failure predictions, anomaly detection, and model management. The service is built with Flask and uses JWT token authentication.

## Base URL

```
http://localhost:5000
```

## Authentication

All API endpoints (except `/health`) require authentication using a Bearer token.

**Header Format:**
```
Authorization: Bearer <your_api_token>
```

The API token is configured in the `.env` file as `API_TOKEN`.

## Endpoints

### Health Check

Check if the service is running.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-11T20:14:39.603070",
  "service": "ml-prediction-service"
}
```

---

### Get Prediction for Machine

Get the latest failure prediction for a specific machine.

**Endpoint:** `GET /api/predictions/<machine_id>`

**Authentication:** Required

**Parameters:**
- `machine_id` (path, integer): Machine ID

**Response (200 OK):**
```json
{
  "machine_id": 1,
  "prediction_date": "2026-02-11T20:01:32.412500",
  "failure_probability_7d": "0.00",
  "failure_probability_14d": "0.00",
  "failure_probability_30d": "0.00",
  "risk_level": "LOW",
  "model_version": "random_forest_v3_20260211",
  "contributing_factors": [
    {
      "feature": "cpu_usage_mean_24h",
      "importance": 0.0,
      "value": 58.065
    }
  ],
  "confidence_score": null,
  "created_at": "2026-02-11T20:01:32.752246"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: No prediction found for this machine
- `500 Internal Server Error`: Server error

---

### Get High-Risk Machines

Get all machines with HIGH or CRITICAL risk level.

**Endpoint:** `GET /api/predictions/high-risk`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "machines": [
    {
      "machine_id": 1,
      "prediction_date": "2026-02-11T20:01:32.412500",
      "failure_probability_7d": "75.50",
      "failure_probability_14d": "82.30",
      "failure_probability_30d": "88.10",
      "risk_level": "CRITICAL",
      "model_version": "random_forest_v3_20260211",
      "created_at": "2026-02-11T20:01:32.752246"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

### Get Anomalies

Get recent anomalies with optional filtering.

**Endpoint:** `GET /api/anomalies`

**Authentication:** Required

**Query Parameters:**
- `days` (optional, integer, default: 7): Number of days to look back
- `severity` (optional, string): Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `machine_id` (optional, integer): Filter by machine ID

**Example:**
```
GET /api/anomalies?days=7&severity=CRITICAL&machine_id=1
```

**Response (200 OK):**
```json
{
  "anomalies": [
    {
      "id": 1,
      "machine_id": 1,
      "detected_at": "2026-02-11T20:05:26.464420",
      "anomaly_type": "spike",
      "severity": "CRITICAL",
      "metric_name": "disk_usage",
      "metric_value": 95.0,
      "expected_range": "69.59-80.76",
      "anomaly_score": 100.0,
      "created_at": "2026-02-11T20:05:26.391513"
    }
  ],
  "count": 1,
  "filters": {
    "days": 7,
    "severity": "CRITICAL",
    "machine_id": 1
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid severity level
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

### Get Models List

Get list of all trained models with their performance metrics.

**Endpoint:** `GET /api/ml/models`

**Authentication:** Required

**Query Parameters:**
- `model_type` (optional, string): Filter by model type (random_forest, isolation_forest)

**Response (200 OK):**
```json
{
  "models": [
    {
      "id": 3,
      "model_id": "random_forest_v3_20260211",
      "model_type": "random_forest",
      "version": 3,
      "trained_at": "2026-02-11T20:01:14.705318",
      "accuracy": 1.0,
      "precision_score": 1.0,
      "recall": 1.0,
      "f1_score": 1.0,
      "parameters": null,
      "file_path": "./models/random_forest_v3_20260211.joblib",
      "is_active": true,
      "created_at": "2026-02-11T20:01:14.603468"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request`: Invalid model type
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

### Trigger Model Training

Trigger model retraining with custom parameters.

**Endpoint:** `POST /api/ml/train`

**Authentication:** Required

**Request Body:**
```json
{
  "data_window_days": 90,
  "model_type": "random_forest",
  "hyperparameters": {
    "n_estimators": 100,
    "max_depth": 10
  }
}
```

**Parameters:**
- `data_window_days` (integer, 7-365): Number of days of historical data to use
- `model_type` (string): Type of model (random_forest, isolation_forest)
- `hyperparameters` (object, optional): Model hyperparameters

**Response (200 OK):**
```json
{
  "job_id": "random_forest_v4_20260211",
  "status": "completed",
  "message": "Training completed successfully",
  "result": {
    "model_id": "random_forest_v4_20260211",
    "accuracy": 0.95,
    "training_samples": 800,
    "test_samples": 200
  }
}
```

**Response (500 Error):**
```json
{
  "job_id": null,
  "status": "failed",
  "message": "Training failed: <error details>"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Training failed

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information (optional)"
}
```

**HTTP Status Codes:**
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Running the Service

### Start the Server

```bash
cd ml-service
.\venv\Scripts\Activate.ps1
python src/app.py
```

The server will start on `http://localhost:5000` by default.

### Configuration

Configure the service using environment variables in `.env`:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_PORT=5000
SECRET_KEY=your_secret_key_here

# Authentication
API_TOKEN=your_api_token_here

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=predictive_maintenance
DB_USER=postgres
DB_PASSWORD=your_password
```

### Testing

Run the test script to validate all endpoints:

```bash
python test_api.py
```

---

## Example Usage

### Python

```python
import requests

BASE_URL = "http://localhost:5000"
API_TOKEN = "your_api_token_here"

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# Get prediction for machine 1
response = requests.get(
    f"{BASE_URL}/api/predictions/1",
    headers=headers
)
print(response.json())

# Get high-risk machines
response = requests.get(
    f"{BASE_URL}/api/predictions/high-risk",
    headers=headers
)
print(response.json())

# Get anomalies
response = requests.get(
    f"{BASE_URL}/api/anomalies?days=7&severity=CRITICAL",
    headers=headers
)
print(response.json())
```

### cURL

```bash
# Get prediction
curl -H "Authorization: Bearer your_api_token_here" \
     http://localhost:5000/api/predictions/1

# Get high-risk machines
curl -H "Authorization: Bearer your_api_token_here" \
     http://localhost:5000/api/predictions/high-risk

# Get anomalies
curl -H "Authorization: Bearer your_api_token_here" \
     "http://localhost:5000/api/anomalies?days=7&severity=CRITICAL"

# Trigger training
curl -X POST \
     -H "Authorization: Bearer your_api_token_here" \
     -H "Content-Type: application/json" \
     -d '{"data_window_days": 90, "model_type": "random_forest"}' \
     http://localhost:5000/api/ml/train
```

---

## Notes

- The service runs in development mode by default with debug enabled
- For production deployment, use a production WSGI server (e.g., Gunicorn, uWSGI)
- Training endpoint runs synchronously - consider using async task queue (Celery, RQ) for production
- All timestamps are in ISO 8601 format
- Decimal values from database are converted to floats in responses
