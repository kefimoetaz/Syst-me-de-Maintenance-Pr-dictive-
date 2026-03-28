# Design Document: AI/ML Predictive Maintenance System

## Overview

The AI/ML Predictive Maintenance System is a Python-based machine learning engine that analyzes historical system metrics to predict hardware failures before they occur. The system consists of three main components:

1. **ML Engine**: Core machine learning module using scikit-learn for training and inference
2. **Prediction Service**: Flask-based REST API microservice for predictions and model management
3. **Training Pipeline**: Automated data preprocessing, feature engineering, and model training workflow

The system integrates with the existing predictive maintenance platform by:
- Reading historical metrics from PostgreSQL database
- Storing predictions, anomalies, and model metadata in new database tables
- Exposing REST API endpoints consumed by the Node.js backend
- Running scheduled predictions daily via cron or APScheduler

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Prediction Service (Flask)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   REST API   │  │  Scheduler   │  │ Model Cache  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│  ┌─────────────────────────▼──────────────────────────────┐ │
│  │                     ML Engine                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │   Predictor  │  │   Trainer    │  │   Anomaly   │  │ │
│  │  │              │  │              │  │   Detector  │  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │ │
│  │         │                  │                  │         │ │
│  │         └──────────────────┼──────────────────┘         │ │
│  │                            │                            │ │
│  │  ┌─────────────────────────▼──────────────────────────┐│ │
│  │  │            Feature Extractor                       ││ │
│  │  └────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ predictions  │  │  anomalies   │  │  ml_models   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │system_metrics│  │  smart_data  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend API (Express)                   │
│                          │                                   │
│                          ▼                                   │
│                  React Dashboard                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Training Flow**:
   - Training Pipeline fetches historical data from database
   - Feature Extractor transforms raw metrics into ML features
   - Trainer trains multiple models (Random Forest, Isolation Forest)
   - Best model is saved to Model Registry with metadata
   - Model metadata stored in ml_models table

2. **Prediction Flow**:
   - Scheduler triggers daily prediction job
   - Predictor loads active model from cache
   - Feature Extractor processes recent metrics for each machine
   - Predictor generates failure probabilities (7d, 14d, 30d)
   - Predictions stored in predictions table
   - High-risk predictions trigger alerts

3. **Anomaly Detection Flow**:
   - Anomaly Detector runs on new metric ingestion
   - Statistical analysis identifies deviations from normal patterns
   - Anomalies classified by type and severity
   - Critical anomalies stored in anomalies table
   - Anomalies displayed in Dashboard

## Components and Interfaces

### 1. Feature Extractor

**Purpose**: Transform raw time-series metrics into ML-ready features

**Input**:
- Machine ID
- Time window (start_date, end_date)
- Metric types (cpu, ram, disk, smart)

**Output**:
- Feature vector (pandas DataFrame)
- Feature names and types
- Missing data indicators

**Key Methods**:
```python
class FeatureExtractor:
    def extract_features(machine_id: str, start_date: datetime, end_date: datetime) -> pd.DataFrame
    def calculate_rolling_stats(data: pd.DataFrame, windows: List[int]) -> pd.DataFrame
    def calculate_trends(data: pd.DataFrame, window: int) -> pd.DataFrame
    def calculate_volatility(data: pd.DataFrame) -> pd.DataFrame
    def handle_missing_data(data: pd.DataFrame, max_gap: int) -> pd.DataFrame
    def extract_smart_features(smart_data: pd.DataFrame) -> pd.DataFrame
```

**Features Generated**:
- Rolling statistics (24h, 7d, 30d): mean, median, std, min, max
- Trend slopes (7d linear regression)
- Coefficient of variation (volatility measure)
- Rate of change (hour-over-hour, day-over-day)
- SMART attribute distances from thresholds
- Time-based features (hour of day, day of week)

### 2. ML Engine - Trainer

**Purpose**: Train and evaluate machine learning models

**Input**:
- Training data (features + labels)
- Model configuration (algorithm, hyperparameters)
- Validation split ratio

**Output**:
- Trained model object
- Performance metrics (accuracy, precision, recall, F1)
- Feature importance scores
- Model metadata

**Key Methods**:
```python
class ModelTrainer:
    def train_random_forest(X_train: pd.DataFrame, y_train: pd.Series, params: dict) -> RandomForestClassifier
    def train_isolation_forest(X_train: pd.DataFrame, params: dict) -> IsolationForest
    def evaluate_model(model: Any, X_test: pd.DataFrame, y_test: pd.Series) -> dict
    def calculate_feature_importance(model: Any, feature_names: List[str]) -> dict
    def cross_validate(model: Any, X: pd.DataFrame, y: pd.Series, folds: int) -> dict
    def save_model(model: Any, model_path: str, metadata: dict) -> str
```

**Algorithms**:
- **Random Forest Classifier**: For failure prediction (binary classification)
  - Hyperparameters: n_estimators=100, max_depth=10, min_samples_split=5
  - Handles imbalanced data with class_weight='balanced'
  
- **Isolation Forest**: For anomaly detection (unsupervised)
  - Hyperparameters: contamination=0.1, n_estimators=100
  - Identifies outliers in metric patterns

### 3. ML Engine - Predictor

**Purpose**: Generate failure predictions for machines

**Input**:
- Machine ID
- Active model from Model Registry
- Recent metrics (past 30 days)

**Output**:
- Failure probabilities (7d, 14d, 30d)
- Risk level (LOW, MEDIUM, HIGH, CRITICAL)
- Contributing factors (top 5 features)
- Confidence score

**Key Methods**:
```python
class Predictor:
    def predict_failure(machine_id: str, model: Any, features: pd.DataFrame) -> dict
    def calculate_risk_level(probability: float) -> str
    def get_contributing_factors(model: Any, features: pd.DataFrame, top_n: int) -> List[dict]
    def predict_batch(machine_ids: List[str], model: Any) -> List[dict]
    def calculate_confidence(model: Any, features: pd.DataFrame) -> float
```

**Risk Level Thresholds**:
- CRITICAL: probability >= 70%
- HIGH: 50% <= probability < 70%
- MEDIUM: 30% <= probability < 50%
- LOW: probability < 30%

### 4. Anomaly Detector

**Purpose**: Identify unusual patterns in real-time metrics

**Input**:
- Current metric value
- Historical metric data (past 30 days)
- Metric type (cpu, ram, disk, smart_attribute)

**Output**:
- Anomaly detected (boolean)
- Anomaly type (spike, degradation, erratic_behavior)
- Severity level (LOW, MEDIUM, HIGH, CRITICAL)
- Anomaly score (0-100)
- Expected range

**Key Methods**:
```python
class AnomalyDetector:
    def detect_anomaly(metric_name: str, current_value: float, historical_data: pd.Series) -> dict
    def classify_anomaly_type(current_value: float, historical_data: pd.Series) -> str
    def calculate_severity(anomaly_score: float, metric_type: str) -> str
    def calculate_expected_range(historical_data: pd.Series, confidence: float) -> tuple
    def aggregate_anomalies(anomalies: List[dict], time_window: int) -> dict
```

**Anomaly Detection Methods**:
- **Statistical**: Z-score > 3 (3 standard deviations from mean)
- **IQR Method**: Values outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
- **Isolation Forest**: Anomaly score from trained model
- **Rate of Change**: Sudden changes > 50% in 1 hour

**Anomaly Types**:
- **Spike**: Sudden increase > 2 std deviations
- **Degradation**: Gradual decline over 24+ hours
- **Erratic**: High variance (CV > 0.5) in recent window

### 5. Prediction Service API

**Purpose**: Expose REST endpoints for predictions and model management

**Endpoints**:

```python
# Get latest prediction for a machine
GET /api/predictions/:machineId
Response: {
    "machine_id": "string",
    "prediction_date": "datetime",
    "failure_probability_7d": "float",
    "failure_probability_14d": "float",
    "failure_probability_30d": "float",
    "risk_level": "string",
    "contributing_factors": [
        {"feature": "string", "importance": "float"}
    ],
    "model_version": "string"
}

# Get all high-risk machines
GET /api/predictions/high-risk
Response: {
    "machines": [
        {
            "machine_id": "string",
            "risk_level": "string",
            "failure_probability_7d": "float",
            "prediction_date": "datetime"
        }
    ],
    "count": "int"
}

# Get recent anomalies
GET /api/anomalies?days=7&severity=HIGH
Response: {
    "anomalies": [
        {
            "machine_id": "string",
            "detected_at": "datetime",
            "anomaly_type": "string",
            "severity": "string",
            "metric_name": "string",
            "metric_value": "float",
            "expected_range": "string",
            "anomaly_score": "float"
        }
    ],
    "count": "int"
}

# Trigger model retraining
POST /api/ml/train
Request: {
    "data_window_days": "int",
    "model_type": "string",
    "hyperparameters": "dict"
}
Response: {
    "job_id": "string",
    "status": "string",
    "message": "string"
}

# Get model information
GET /api/ml/models
Response: {
    "models": [
        {
            "model_id": "string",
            "model_type": "string",
            "version": "int",
            "trained_at": "datetime",
            "accuracy": "float",
            "precision": "float",
            "recall": "float",
            "f1_score": "float",
            "is_active": "boolean"
        }
    ]
}

# Get training job status
GET /api/ml/train/:jobId
Response: {
    "job_id": "string",
    "status": "string",
    "progress": "float",
    "started_at": "datetime",
    "completed_at": "datetime",
    "result": "dict"
}
```

### 6. Model Registry

**Purpose**: Store and manage trained ML models with versioning

**Storage Structure**:
```
models/
├── random_forest_v1_20240215.pkl
├── random_forest_v2_20240301.pkl
├── isolation_forest_v1_20240215.pkl
└── metadata.json
```

**Key Methods**:
```python
class ModelRegistry:
    def save_model(model: Any, model_type: str, metrics: dict) -> str
    def load_model(model_id: str) -> Any
    def get_active_model(model_type: str) -> Any
    def list_models(model_type: str) -> List[dict]
    def set_active_model(model_id: str) -> bool
    def archive_old_models(days_threshold: int) -> int
```

### 7. Training Pipeline

**Purpose**: Orchestrate end-to-end model training workflow

**Pipeline Steps**:
1. Data extraction from database
2. Data validation and cleaning
3. Feature engineering
4. Train-test split (80/20)
5. Model training (multiple algorithms)
6. Model evaluation and comparison
7. Model selection (best accuracy)
8. Model registration and activation
9. Performance reporting

**Key Methods**:
```python
class TrainingPipeline:
    def run_training(config: dict) -> dict
    def extract_training_data(start_date: datetime, end_date: datetime) -> pd.DataFrame
    def validate_data(data: pd.DataFrame) -> bool
    def split_data(data: pd.DataFrame, test_size: float) -> tuple
    def train_all_models(X_train: pd.DataFrame, y_train: pd.Series) -> List[Any]
    def select_best_model(models: List[Any], X_test: pd.DataFrame, y_test: pd.Series) -> Any
    def generate_report(model: Any, metrics: dict) -> dict
```

### 8. Scheduler

**Purpose**: Automate daily prediction runs

**Implementation**: APScheduler (Python library)

**Jobs**:
- **Daily Predictions**: Run at 2:00 AM, process all machines
- **Anomaly Detection**: Run every hour on new metrics
- **Model Retraining**: Run weekly on Sundays at 3:00 AM

**Key Methods**:
```python
class PredictionScheduler:
    def schedule_daily_predictions(hour: int, minute: int) -> None
    def schedule_anomaly_detection(interval_minutes: int) -> None
    def schedule_model_retraining(day_of_week: int, hour: int) -> None
    def run_prediction_job() -> dict
    def handle_job_failure(job_id: str, error: Exception) -> None
```

## Data Models

### Database Schema

#### predictions table
```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(255) NOT NULL REFERENCES machines(machine_id),
    prediction_date TIMESTAMP NOT NULL,
    failure_probability_7d FLOAT NOT NULL CHECK (failure_probability_7d >= 0 AND failure_probability_7d <= 100),
    failure_probability_14d FLOAT NOT NULL CHECK (failure_probability_14d >= 0 AND failure_probability_14d <= 100),
    failure_probability_30d FLOAT NOT NULL CHECK (failure_probability_30d >= 0 AND failure_probability_30d <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    model_version VARCHAR(50) NOT NULL,
    contributing_factors JSONB,
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_machine_date (machine_id, prediction_date DESC),
    INDEX idx_risk_level (risk_level),
    UNIQUE (machine_id, prediction_date)
);
```

#### anomalies table
```sql
CREATE TABLE anomalies (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(255) NOT NULL REFERENCES machines(machine_id),
    detected_at TIMESTAMP NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL CHECK (anomaly_type IN ('spike', 'degradation', 'erratic_behavior')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    expected_range VARCHAR(100),
    anomaly_score FLOAT NOT NULL CHECK (anomaly_score >= 0 AND anomaly_score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_machine_detected (machine_id, detected_at DESC),
    INDEX idx_severity (severity)
);
```

#### ml_models table
```sql
CREATE TABLE ml_models (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('random_forest', 'isolation_forest')),
    version INTEGER NOT NULL,
    trained_at TIMESTAMP NOT NULL,
    accuracy FLOAT CHECK (accuracy >= 0 AND accuracy <= 1),
    precision FLOAT CHECK (precision >= 0 AND precision <= 1),
    recall FLOAT CHECK (recall >= 0 AND recall <= 1),
    f1_score FLOAT CHECK (f1_score >= 0 AND f1_score <= 1),
    parameters JSONB,
    file_path VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_model_type_version (model_type, version DESC),
    INDEX idx_active (is_active)
);
```

### Feature Vector Schema

```python
# Example feature vector for one machine
{
    "machine_id": "MACHINE-001",
    "timestamp": "2024-02-15T14:00:00Z",
    
    # CPU features
    "cpu_mean_24h": 45.2,
    "cpu_mean_7d": 42.8,
    "cpu_std_24h": 12.3,
    "cpu_std_7d": 15.1,
    "cpu_max_24h": 89.5,
    "cpu_trend_7d": 0.05,  # slope
    "cpu_volatility": 0.27,  # coefficient of variation
    "cpu_rate_of_change_1h": 2.3,
    
    # RAM features
    "ram_mean_24h": 62.1,
    "ram_mean_7d": 58.9,
    "ram_std_24h": 8.7,
    "ram_std_7d": 10.2,
    "ram_max_24h": 85.3,
    "ram_trend_7d": 0.12,
    "ram_volatility": 0.14,
    "ram_rate_of_change_1h": 1.8,
    
    # Disk features
    "disk_mean_24h": 78.5,
    "disk_mean_7d": 77.2,
    "disk_std_24h": 2.1,
    "disk_std_7d": 3.4,
    "disk_trend_7d": 0.08,
    "disk_volatility": 0.03,
    
    # SMART features
    "smart_reallocated_sectors": 0,
    "smart_pending_sectors": 0,
    "smart_uncorrectable_errors": 0,
    "smart_temperature": 42,
    "smart_power_on_hours": 15234,
    "smart_reallocated_distance_from_threshold": 100,  # percentage
    
    # Time features
    "hour_of_day": 14,
    "day_of_week": 3,
    "is_weekend": 0
}
```

### Prediction Output Schema

```python
{
    "machine_id": "MACHINE-001",
    "prediction_date": "2024-02-15T14:00:00Z",
    "failure_probability_7d": 15.3,
    "failure_probability_14d": 28.7,
    "failure_probability_30d": 45.2,
    "risk_level": "MEDIUM",
    "model_version": "random_forest_v2",
    "confidence_score": 0.87,
    "contributing_factors": [
        {"feature": "disk_trend_7d", "importance": 0.23, "value": 0.08},
        {"feature": "ram_mean_7d", "importance": 0.18, "value": 58.9},
        {"feature": "smart_temperature", "importance": 0.15, "value": 42},
        {"feature": "cpu_volatility", "importance": 0.12, "value": 0.27},
        {"feature": "ram_trend_7d", "importance": 0.10, "value": 0.12}
    ]
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Data Loading Completeness

*For any* valid time period and machine ID, when the Training_Pipeline loads historical data, the returned dataset should contain all metrics (CPU, RAM, disk, SMART) for all timestamps within that period where data exists in the database.

**Validates: Requirements 1.1**

### Property 2: Feature Extraction Completeness

*For any* input time-series data, when the Feature_Extractor processes it, the output feature vector should contain all required features: rolling statistics (24h, 7d, 30d windows), trend slopes, volatility measures, rate of change, SMART features, and time-based features.

**Validates: Requirements 1.2, 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 3: Model Evaluation Metrics Completeness

*For any* trained model, when training completes, the ML_Engine should calculate and return all four evaluation metrics: accuracy, precision, recall, and F1-score, each with values between 0 and 1.

**Validates: Requirements 1.4**

### Property 4: Model Persistence with Metadata

*For any* model that achieves accuracy greater than 70%, when saved to the Model_Registry, the stored record should contain all required fields: model_id, model_type, version, trained_at, performance metrics, parameters, file_path, and the model file should exist at the specified path.

**Validates: Requirements 1.5, 1.6, 5.2**

### Property 5: Model ID Uniqueness

*For any* set of trained models in the Model_Registry, all model_id values should be unique (no duplicates).

**Validates: Requirements 1.7**

### Property 6: Prediction Completeness for Active Machines

*For any* prediction run, when the Prediction_Service generates predictions, all machines marked as active in the database should have corresponding prediction records created.

**Validates: Requirements 2.1, 9.2**

### Property 7: Prediction Time Window Completeness

*For any* generated prediction, the prediction record should contain failure probability values for all three time windows: 7-day, 14-day, and 30-day, each with values between 0 and 100.

**Validates: Requirements 2.2**

### Property 8: Active Model Usage

*For any* prediction generated, the model_version field in the prediction record should match the model_id of the currently active model in the Model_Registry.

**Validates: Requirements 2.3, 5.4**

### Property 9: Prediction Storage Completeness

*For any* generated prediction, when stored in the database, the record should contain all required fields: machine_id, prediction_date, failure_probability_7d, failure_probability_14d, failure_probability_30d, risk_level, and model_version.

**Validates: Requirements 2.4**

### Property 10: Risk Level Classification Correctness

*For any* failure probability value, the assigned risk_level should be: CRITICAL if probability >= 70%, HIGH if 50% <= probability < 70%, MEDIUM if 30% <= probability < 50%, and LOW if probability < 30%.

**Validates: Requirements 2.5, 2.6, 2.7, 2.8**

### Property 11: Anomaly Classification Completeness

*For any* detected anomaly, the anomaly record should have a valid anomaly_type (one of: spike, degradation, erratic_behavior) and a valid severity level (one of: LOW, MEDIUM, HIGH, CRITICAL).

**Validates: Requirements 3.2, 3.3**

### Property 12: Critical Anomaly Storage

*For any* anomaly detected with CRITICAL severity, the anomaly should be stored in the database with all required fields: machine_id, detected_at, anomaly_type, severity, metric_name, metric_value, expected_range, and anomaly_score.

**Validates: Requirements 3.4, 3.5**

### Property 13: Anomaly Score Presence

*For any* detected anomaly, the anomaly record should contain an anomaly_score value between 0 and 100.

**Validates: Requirements 3.6**

### Property 14: Anomaly Aggregation

*For any* machine with multiple anomalies detected within a 1-hour window, when aggregation is applied, the result should be a single anomaly record with severity at least as high as the maximum severity of the individual anomalies.

**Validates: Requirements 3.7**

### Property 15: Missing Data Handling

*For any* time-series data with gaps of 3 or fewer consecutive missing values, when the Feature_Extractor processes it, those gaps should be filled using forward-fill, and the resulting feature vector should not have null values for those positions.

**Validates: Requirements 4.6**

### Property 16: Model Version Incrementing

*For any* sequence of model training operations, the version numbers assigned to models of the same type should be strictly increasing (each new model gets a higher version number than all previous models of that type).

**Validates: Requirements 5.1**

### Property 17: Model Registry Query Completeness

*For any* query to the Model_Registry, the returned list should include all models with their complete metadata: model_id, model_type, version, trained_at, accuracy, precision, recall, f1_score, and is_active status.

**Validates: Requirements 5.3**

### Property 18: Model Preservation During Retraining

*For any* retraining operation, when a new model is created, the count of models in the Model_Registry should increase by one (old models are not deleted).

**Validates: Requirements 5.5**

### Property 19: API Prediction Retrieval

*For any* valid machine_id, when a GET request is made to /api/predictions/:machineId, the response should contain the prediction record with the most recent prediction_date for that machine.

**Validates: Requirements 6.1**

### Property 20: High-Risk Machine Filtering

*For any* GET request to /api/predictions/high-risk, all machines in the response should have risk_level of either HIGH or CRITICAL, and no machines with HIGH or CRITICAL risk should be excluded.

**Validates: Requirements 6.2**

### Property 21: Anomaly Query Filtering and Sorting

*For any* GET request to /api/anomalies, all returned anomalies should have detected_at timestamps within the past 7 days, and the results should be sorted by severity in descending order (CRITICAL, HIGH, MEDIUM, LOW).

**Validates: Requirements 6.3**

### Property 22: API Model Listing Completeness

*For any* GET request to /api/ml/models, the response should include all models in the Model_Registry with their performance metrics (accuracy, precision, recall, f1_score) and active status.

**Validates: Requirements 6.5**

### Property 23: API Error Response Format

*For any* API request that fails validation, the response should have HTTP status code 400 and include a detailed error message describing the validation failure.

**Validates: Requirements 6.6, 14.5**

### Property 24: API Authentication Enforcement

*For any* API endpoint request without a valid authentication token, the response should have HTTP status code 401 (Unauthorized) and the request should not be processed.

**Validates: Requirements 6.7**

### Property 25: Foreign Key Constraint Enforcement

*For any* attempt to insert a prediction with a machine_id that does not exist in the machines table, the database should reject the insertion with a foreign key constraint violation error.

**Validates: Requirements 7.4**

### Property 26: JSON Serialization of Model Parameters

*For any* model saved to the ml_models table, the parameters field should contain valid JSON that can be parsed back into a dictionary/object.

**Validates: Requirements 7.6**

### Property 27: Automatic Timestamp Population

*For any* record inserted into predictions, anomalies, or ml_models tables without explicitly setting created_at, the created_at field should be automatically populated with a timestamp within 1 second of the insertion time.

**Validates: Requirements 7.7**

### Property 28: Prediction Retry on Failure

*For any* scheduled prediction run that fails, when the error is logged, the system should schedule a retry attempt 1 hour later, and the retry should be executed.

**Validates: Requirements 9.3**

### Property 29: Last Run Timestamp Update

*For any* successful prediction run, the system configuration should be updated with a last_run_timestamp that matches the completion time of the prediction run (within 1 second).

**Validates: Requirements 9.4**

### Property 30: Prediction Summary Report Completeness

*For any* completed scheduled prediction run, the generated summary report should include the number of machines processed and the count of machines with HIGH or CRITICAL risk levels.

**Validates: Requirements 9.6**

### Property 31: Retraining Data Window

*For any* retraining operation triggered at time T, the Training_Pipeline should fetch data with timestamps between T-90 days and T.

**Validates: Requirements 10.1**

### Property 32: Feature Extraction Consistency

*For any* two training runs using the same raw input data, the Feature_Extractor should produce identical feature vectors (same features with same values).

**Validates: Requirements 10.2**

### Property 33: Model Comparison and Activation

*For any* retraining operation that produces a new model with accuracy at least 5% higher than the current active model, the new model should be marked as active (is_active=true) and the previous active model should be marked as inactive (is_active=false).

**Validates: Requirements 10.3, 10.4**

### Property 34: Inferior Model Rejection

*For any* retraining operation that produces a new model with accuracy lower than the current active model, the current active model should remain active (is_active=true) and the new model should not be marked as active.

**Validates: Requirements 10.5**

### Property 35: Prediction Continuity During Retraining

*For any* prediction request made while retraining is in progress, the prediction should be generated using the model that was active before retraining started, not the model being trained.

**Validates: Requirements 10.6**

### Property 36: Feature Importance Calculation

*For any* prediction generated by a model that supports feature importance (e.g., Random Forest), the prediction should include feature importance scores for all input features used in the prediction.

**Validates: Requirements 11.1**

### Property 37: Top Contributing Factors Storage

*For any* stored prediction, the contributing_factors field should contain the top 5 features ranked by importance score, each with the feature name and importance value.

**Validates: Requirements 11.2**

### Property 38: API Response with Contributing Factors

*For any* prediction retrieved via API, the response JSON should include a contributing_factors array containing feature names and importance scores.

**Validates: Requirements 11.3**

### Property 39: Critical Prediction Explanation

*For any* prediction with risk_level CRITICAL, the contributing_factors should include the specific metric values (not just feature names) that contributed to the high-risk classification.

**Validates: Requirements 11.5**

### Property 40: Multiple Contributor Inclusion

*For any* prediction where multiple features have importance scores within 10% of each other, all such features should be included in the contributing_factors list (not just the top 5 if there are more significant contributors).

**Validates: Requirements 11.6**

### Property 41: Graceful Degradation for Feature Importance

*For any* prediction generated by a model that does not support feature importance calculation, the prediction should still be generated successfully with contributing_factors set to null or an empty array.

**Validates: Requirements 11.7**

### Property 42: Synthetic Data Generation Trigger

*For any* training operation where available historical data spans less than 30 days, the Training_Pipeline should generate synthetic data to supplement the real data.

**Validates: Requirements 12.1**

### Property 43: Synthetic Data Pattern Diversity

*For any* synthetic dataset generated, the data should include examples of at least three pattern types: normal operation, gradual degradation, and sudden failure.

**Validates: Requirements 12.2**

### Property 44: Synthetic Failure Type Coverage

*For any* synthetic dataset generated, the failure scenarios should include at least three failure types: disk failures, memory degradation, and CPU overheating patterns.

**Validates: Requirements 12.3**

### Property 45: Synthetic Data Labeling

*For any* training dataset that includes synthetic data, each synthetic data point should have a label or flag indicating it is synthetic (not real data).

**Validates: Requirements 12.4**

### Property 46: Validation on Real Data Only

*For any* model training operation that uses synthetic data, the validation/test set used to calculate performance metrics should contain only real data (no synthetic data).

**Validates: Requirements 12.5**

### Property 47: Synthetic Data Statistical Similarity

*For any* synthetic dataset generated, the statistical properties (mean, standard deviation, distribution shape) of each metric should be within 20% of the corresponding properties in the real data.

**Validates: Requirements 12.6**

### Property 48: Adaptive Synthetic Data Proportion

*For any* training operation where available real data spans more than 90 days, the proportion of synthetic data in the training set should be 20% or less.

**Validates: Requirements 12.7**

### Property 49: Batch Insert Support

*For any* batch of up to 100 predictions, when inserted into the database in a single transaction, all predictions should be successfully inserted or all should fail together (atomic transaction).

**Validates: Requirements 13.4**

### Property 50: Model Compression

*For any* trained model saved to disk, the compressed model file size should be at least 50% smaller than the uncompressed model size.

**Validates: Requirements 13.5**

### Property 51: Model Caching

*For any* sequence of prediction requests using the same active model, after the first request loads the model from disk, subsequent requests should load the model from memory cache (not from disk).

**Validates: Requirements 13.6**

### Property 52: Error Logging Completeness

*For any* error that occurs in any system component, the log entry should contain all required fields: timestamp, component name, error type, and stack trace.

**Validates: Requirements 14.1**

### Property 53: Fault Isolation in Batch Predictions

*For any* batch prediction run where one machine's prediction fails, predictions for all other machines in the batch should still be generated successfully.

**Validates: Requirements 14.2**

### Property 54: Database Connection Retry

*For any* database connection failure, the system should attempt to reconnect exactly 3 times with exponentially increasing delays between attempts (e.g., 1s, 2s, 4s).

**Validates: Requirements 14.3**

### Property 55: Model Corruption Fallback

*For any* attempt to load a corrupted model file, the ML_Engine should detect the corruption and automatically load the previous active model version instead.

**Validates: Requirements 14.4**

### Property 56: Critical Error Notification

*For any* error classified as critical (e.g., all predictions failing, database unreachable for 3+ retries), the system should send a notification to administrators through the configured notification channels.

**Validates: Requirements 14.6**

### Property 57: Configuration Encryption Support

*For any* configuration that includes database credentials, when encryption is enabled, the system should successfully decrypt the credentials and establish a database connection.

**Validates: Requirements 15.2**

### Property 58: Configuration Validation

*For any* system startup with missing required configuration parameters, the system should log specific validation errors identifying which parameters are missing and exit with a non-zero status code.

**Validates: Requirements 15.3, 15.4**

### Property 59: Path Type Support

*For any* ML model file path configured as either absolute or relative, the system should successfully locate and load the model file.

**Validates: Requirements 15.5**

### Property 60: Cron Expression Parsing

*For any* valid cron-style expression provided in the prediction schedule configuration, the system should successfully parse it and schedule predictions according to the expression.

**Validates: Requirements 15.6**

### Property 61: Distributed Lock Prevention

*For any* scenario where multiple Prediction_Service instances are running simultaneously, when a prediction job is triggered, only one instance should execute the job (the others should be blocked by database locks).

**Validates: Requirements 15.7**


## Error Handling

### Error Categories

1. **Data Errors**
   - Missing or insufficient historical data
   - Corrupted metric values
   - Database connection failures
   - Foreign key constraint violations

2. **Model Errors**
   - Model training failures (convergence issues)
   - Corrupted model files
   - Model loading failures
   - Feature extraction errors

3. **API Errors**
   - Invalid request parameters
   - Authentication failures
   - Resource not found
   - Rate limiting exceeded

4. **System Errors**
   - Out of memory
   - Disk space exhausted
   - Configuration errors
   - Scheduling failures

### Error Handling Strategies

#### Data Errors

**Missing Data**:
```python
try:
    data = fetch_historical_data(machine_id, start_date, end_date)
    if len(data) < MIN_REQUIRED_SAMPLES:
        logger.warning(f"Insufficient data for {machine_id}, generating synthetic data")
        synthetic_data = generate_synthetic_data(machine_id, required_samples)
        data = pd.concat([data, synthetic_data])
except DatabaseConnectionError as e:
    logger.error(f"Database connection failed: {e}", exc_info=True)
    retry_with_exponential_backoff(fetch_historical_data, max_retries=3)
```

**Corrupted Values**:
```python
def validate_metrics(data: pd.DataFrame) -> pd.DataFrame:
    # Remove outliers beyond reasonable bounds
    data = data[(data['cpu_usage'] >= 0) & (data['cpu_usage'] <= 100)]
    data = data[(data['ram_usage'] >= 0) & (data['ram_usage'] <= 100)]
    
    # Handle missing values
    data = data.fillna(method='ffill', limit=3)
    
    # Mark invalid periods
    data['is_valid'] = ~data.isnull().any(axis=1)
    
    return data
```

#### Model Errors

**Training Failures**:
```python
def train_with_fallback(X_train, y_train, model_configs):
    for config in model_configs:
        try:
            model = train_model(X_train, y_train, config)
            metrics = evaluate_model(model, X_test, y_test)
            if metrics['accuracy'] >= MIN_ACCURACY_THRESHOLD:
                return model, metrics
        except ModelTrainingError as e:
            logger.warning(f"Training failed for {config['type']}: {e}")
            continue
    
    raise AllModelsFailedError("All model training attempts failed")
```

**Corrupted Model Files**:
```python
def load_model_with_fallback(model_id: str) -> Any:
    try:
        model = pickle.load(open(get_model_path(model_id), 'rb'))
        # Validate model integrity
        test_prediction = model.predict(generate_test_features())
        return model
    except (FileNotFoundError, PickleError, AttributeError) as e:
        logger.error(f"Model {model_id} corrupted: {e}")
        previous_model_id = get_previous_active_model()
        logger.info(f"Falling back to {previous_model_id}")
        return load_model_with_fallback(previous_model_id)
```

#### API Errors

**Request Validation**:
```python
@app.route('/api/predictions/<machine_id>', methods=['GET'])
def get_prediction(machine_id):
    try:
        # Validate machine_id format
        if not is_valid_machine_id(machine_id):
            return jsonify({
                'error': 'Invalid machine_id format',
                'details': 'machine_id must match pattern: MACHINE-XXX'
            }), 400
        
        # Check authentication
        if not validate_auth_token(request.headers.get('Authorization')):
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Fetch prediction
        prediction = get_latest_prediction(machine_id)
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        return jsonify(prediction), 200
        
    except DatabaseError as e:
        logger.error(f"Database error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500
```

#### System Errors

**Memory Management**:
```python
def predict_batch_with_memory_management(machine_ids: List[str]):
    results = []
    batch_size = 10
    
    for i in range(0, len(machine_ids), batch_size):
        batch = machine_ids[i:i+batch_size]
        
        # Check memory usage
        if psutil.virtual_memory().percent > 80:
            logger.warning("High memory usage, clearing cache")
            clear_feature_cache()
            gc.collect()
        
        batch_results = predict_batch(batch)
        results.extend(batch_results)
    
    return results
```

**Configuration Validation**:
```python
def validate_configuration(config: dict) -> None:
    required_fields = [
        'database_url',
        'model_storage_path',
        'prediction_schedule',
        'min_accuracy_threshold'
    ]
    
    missing_fields = [f for f in required_fields if f not in config]
    if missing_fields:
        error_msg = f"Missing required configuration: {', '.join(missing_fields)}"
        logger.error(error_msg)
        sys.exit(1)
    
    # Validate database connection
    try:
        test_db_connection(config['database_url'])
    except ConnectionError as e:
        logger.error(f"Cannot connect to database: {e}")
        sys.exit(1)
```

### Error Notification

**Critical Error Alerts**:
- All predictions failing for 2+ consecutive runs
- Database unreachable for 30+ minutes
- Model training failures for 3+ consecutive attempts
- Disk space below 10%
- Memory usage above 90% for 10+ minutes

**Notification Channels**:
- Email to administrators
- Slack/Teams webhook
- System logs with ERROR level
- Monitoring system integration (Prometheus, Datadog)

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary

### Unit Testing

Unit tests focus on:
- Specific examples that demonstrate correct behavior
- Integration points between components
- Edge cases and error conditions
- Database schema validation
- API endpoint responses

**Example Unit Tests**:

```python
# Test specific risk level classification
def test_risk_level_critical():
    assert calculate_risk_level(75.0) == "CRITICAL"
    assert calculate_risk_level(70.0) == "CRITICAL"

def test_risk_level_high():
    assert calculate_risk_level(65.0) == "HIGH"
    assert calculate_risk_level(50.0) == "HIGH"

# Test database schema
def test_predictions_table_exists():
    tables = get_database_tables()
    assert "predictions" in tables
    
def test_predictions_table_columns():
    columns = get_table_columns("predictions")
    required = ["id", "machine_id", "prediction_date", 
                "failure_probability_7d", "failure_probability_14d",
                "failure_probability_30d", "risk_level", "model_version"]
    assert all(col in columns for col in required)

# Test API endpoints
def test_get_prediction_endpoint():
    response = client.get('/api/predictions/MACHINE-001')
    assert response.status_code == 200
    data = response.json()
    assert "failure_probability_7d" in data
    assert "risk_level" in data

# Test error handling
def test_invalid_machine_id():
    response = client.get('/api/predictions/INVALID')
    assert response.status_code == 400
    assert "error" in response.json()

# Test edge cases
def test_feature_extraction_with_all_missing_data():
    data = pd.DataFrame({'cpu_usage': [None, None, None, None]})
    features = extract_features(data)
    assert features['is_valid'] == False

def test_anomaly_detection_with_empty_history():
    result = detect_anomaly("cpu_usage", 50.0, pd.Series([]))
    assert result['anomaly_detected'] == False
```

### Property-Based Testing

Property tests verify universal properties across randomized inputs using a property-based testing library.

**Library Selection**: 
- **Python**: Hypothesis (recommended)
- Alternative: pytest-quickcheck

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `# Feature: sprint-3-ai-ml-prediction, Property N: [property text]`

**Example Property Tests**:

```python
from hypothesis import given, strategies as st
import hypothesis.extra.pandas as pdst

# Property 2: Feature Extraction Completeness
# Feature: sprint-3-ai-ml-prediction, Property 2: Feature extraction completeness
@given(data=pdst.data_frames([
    pdst.column('cpu_usage', dtype=float, elements=st.floats(0, 100)),
    pdst.column('ram_usage', dtype=float, elements=st.floats(0, 100)),
    pdst.column('disk_usage', dtype=float, elements=st.floats(0, 100)),
], index=pdst.range_indexes(min_size=100, max_size=1000)))
@settings(max_examples=100)
def test_feature_extraction_completeness(data):
    features = extract_features(data)
    
    # Verify all required feature categories are present
    required_features = [
        'cpu_mean_24h', 'cpu_mean_7d', 'cpu_std_24h', 'cpu_trend_7d',
        'ram_mean_24h', 'ram_mean_7d', 'ram_std_24h', 'ram_trend_7d',
        'disk_mean_24h', 'disk_mean_7d', 'disk_std_24h', 'disk_trend_7d'
    ]
    
    for feature in required_features:
        assert feature in features.columns

# Property 10: Risk Level Classification Correctness
# Feature: sprint-3-ai-ml-prediction, Property 10: Risk level classification correctness
@given(probability=st.floats(min_value=0.0, max_value=100.0))
@settings(max_examples=100)
def test_risk_level_classification(probability):
    risk_level = calculate_risk_level(probability)
    
    if probability >= 70:
        assert risk_level == "CRITICAL"
    elif probability >= 50:
        assert risk_level == "HIGH"
    elif probability >= 30:
        assert risk_level == "MEDIUM"
    else:
        assert risk_level == "LOW"

# Property 5: Model ID Uniqueness
# Feature: sprint-3-ai-ml-prediction, Property 5: Model ID uniqueness
@given(num_models=st.integers(min_value=2, max_value=20))
@settings(max_examples=100)
def test_model_id_uniqueness(num_models):
    model_ids = []
    for i in range(num_models):
        model = train_random_model()
        model_id = save_model(model)
        model_ids.append(model_id)
    
    # All model IDs should be unique
    assert len(model_ids) == len(set(model_ids))

# Property 15: Missing Data Handling
# Feature: sprint-3-ai-ml-prediction, Property 15: Missing data handling
@given(data=pdst.data_frames([
    pdst.column('value', dtype=float, elements=st.one_of(
        st.floats(0, 100),
        st.none()
    ))
], index=pdst.range_indexes(min_size=50, max_size=200)))
@settings(max_examples=100)
def test_missing_data_forward_fill(data):
    # Ensure there are some gaps of 3 or fewer consecutive nulls
    processed = handle_missing_data(data, max_gap=3)
    
    # Check that gaps of 3 or fewer are filled
    null_runs = get_consecutive_null_runs(data)
    for start, length in null_runs:
        if length <= 3:
            # These should be filled in processed data
            assert not processed.iloc[start:start+length].isnull().any().any()

# Property 20: High-Risk Machine Filtering
# Feature: sprint-3-ai-ml-prediction, Property 20: High-risk machine filtering
@given(predictions=st.lists(
    st.fixed_dictionaries({
        'machine_id': st.text(min_size=5, max_size=20),
        'risk_level': st.sampled_from(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        'failure_probability_7d': st.floats(0, 100)
    }),
    min_size=10,
    max_size=100
))
@settings(max_examples=100)
def test_high_risk_filtering(predictions):
    # Store predictions in database
    for pred in predictions:
        store_prediction(pred)
    
    # Query high-risk machines
    high_risk = get_high_risk_machines()
    
    # All returned machines should be HIGH or CRITICAL
    for machine in high_risk:
        assert machine['risk_level'] in ['HIGH', 'CRITICAL']
    
    # No HIGH or CRITICAL machines should be excluded
    expected_high_risk = [p for p in predictions 
                          if p['risk_level'] in ['HIGH', 'CRITICAL']]
    assert len(high_risk) == len(expected_high_risk)

# Property 32: Feature Extraction Consistency
# Feature: sprint-3-ai-ml-prediction, Property 32: Feature extraction consistency
@given(data=pdst.data_frames([
    pdst.column('cpu_usage', dtype=float, elements=st.floats(0, 100)),
    pdst.column('ram_usage', dtype=float, elements=st.floats(0, 100)),
], index=pdst.range_indexes(min_size=100, max_size=500)))
@settings(max_examples=100)
def test_feature_extraction_consistency(data):
    # Extract features twice from same data
    features1 = extract_features(data.copy())
    features2 = extract_features(data.copy())
    
    # Results should be identical
    pd.testing.assert_frame_equal(features1, features2)

# Property 47: Synthetic Data Statistical Similarity
# Feature: sprint-3-ai-ml-prediction, Property 47: Synthetic data statistical similarity
@given(real_data=pdst.data_frames([
    pdst.column('cpu_usage', dtype=float, elements=st.floats(20, 80)),
    pdst.column('ram_usage', dtype=float, elements=st.floats(30, 90)),
], index=pdst.range_indexes(min_size=100, max_size=500)))
@settings(max_examples=100)
def test_synthetic_data_similarity(real_data):
    synthetic_data = generate_synthetic_data(
        pattern='normal',
        size=len(real_data)
    )
    
    # Compare statistical properties
    for column in ['cpu_usage', 'ram_usage']:
        real_mean = real_data[column].mean()
        real_std = real_data[column].std()
        
        synth_mean = synthetic_data[column].mean()
        synth_std = synthetic_data[column].std()
        
        # Synthetic stats should be within 20% of real stats
        assert abs(synth_mean - real_mean) / real_mean <= 0.20
        assert abs(synth_std - real_std) / real_std <= 0.20
```

### Integration Testing

Integration tests verify component interactions:

```python
def test_end_to_end_prediction_flow():
    # 1. Train a model
    model_id = train_model_from_historical_data(days=30)
    assert model_id is not None
    
    # 2. Activate the model
    activate_model(model_id)
    
    # 3. Run predictions
    predictions = run_prediction_job()
    assert len(predictions) > 0
    
    # 4. Verify predictions are stored
    for pred in predictions:
        stored = get_prediction(pred['machine_id'])
        assert stored['model_version'] == model_id
    
    # 5. Query via API
    response = client.get(f'/api/predictions/{predictions[0]["machine_id"]}')
    assert response.status_code == 200

def test_anomaly_detection_to_storage():
    # 1. Simulate metric ingestion
    metric = {
        'machine_id': 'TEST-001',
        'cpu_usage': 95.0,  # Anomalously high
        'timestamp': datetime.now()
    }
    
    # 2. Detect anomaly
    anomaly = detect_anomaly(metric)
    assert anomaly['anomaly_detected'] == True
    
    # 3. Verify storage
    stored_anomalies = get_anomalies('TEST-001')
    assert len(stored_anomalies) > 0
    assert stored_anomalies[0]['severity'] in ['HIGH', 'CRITICAL']
```

### Test Coverage Goals

- **Unit test coverage**: 80%+ of code lines
- **Property test coverage**: 100% of correctness properties
- **Integration test coverage**: All major workflows
- **API test coverage**: 100% of endpoints

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests nightly
- Monitor test execution time (target: <5 minutes for unit tests)
- Track flaky tests and fix immediately

### Test Data Management

**Synthetic Test Data**:
- Generate realistic test datasets for development
- Include edge cases (all nulls, extreme values, etc.)
- Version test datasets for reproducibility

**Test Database**:
- Use separate test database instance
- Reset database state before each test suite
- Seed with known test data for predictable results

**Model Fixtures**:
- Pre-trained models for testing (avoid training in tests)
- Multiple model versions for version management tests
- Corrupted model files for error handling tests
