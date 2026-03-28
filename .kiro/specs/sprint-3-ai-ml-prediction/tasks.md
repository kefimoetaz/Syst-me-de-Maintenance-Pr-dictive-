# Implementation Plan: AI/ML Predictive Maintenance System

## Overview

This implementation plan breaks down the AI/ML prediction engine into discrete coding tasks. The approach follows an incremental development strategy:

1. Set up core infrastructure and database schema
2. Implement feature extraction and data preprocessing
3. Build ML training pipeline with model management
4. Implement prediction service with API endpoints
5. Add anomaly detection capabilities
6. Integrate with existing backend and dashboard
7. Add scheduling and automation

Each task builds on previous work, with property-based tests integrated throughout to validate correctness early.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create `ml-service/` directory with Python project structure
  - Set up virtual environment and install dependencies (scikit-learn, pandas, numpy, Flask, psycopg2, APScheduler, Hypothesis)
  - Create configuration management module for environment variables
  - Set up logging infrastructure with rotating file handlers
  - _Requirements: 15.1, 15.3, 15.4, 14.1_

- [x] 2. Create database schema extensions
  - [x] 2.1 Create predictions table migration
    - Write SQL migration for predictions table with all columns and constraints
    - Add indexes on machine_id and prediction_date
    - Add foreign key constraint to machines table
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [x] 2.2 Create anomalies table migration
    - Write SQL migration for anomalies table with all columns and constraints
    - Add indexes on machine_id, detected_at, and severity
    - _Requirements: 7.2_
  
  - [x] 2.3 Create ml_models table migration
    - Write SQL migration for ml_models table with all columns and constraints
    - Add indexes on model_type, version, and is_active
    - Add CHECK constraints for metric values (0-1 range)
    - _Requirements: 7.3, 7.6, 7.7_
  
  - [ ]* 2.4 Write unit tests for database schema
    - Test table existence and column definitions
    - Test foreign key constraints
    - Test default value for created_at
    - _Requirements: 7.1, 7.2, 7.3, 7.7_

- [x] 3. Implement Feature Extractor component
  - [x] 3.1 Create FeatureExtractor class with data loading
    - Implement method to fetch historical data from database
    - Add data validation and cleaning logic
    - Handle missing data with forward-fill (max 3 gaps)
    - _Requirements: 1.1, 4.6_
  
  - [x] 3.2 Implement rolling statistics calculation
    - Calculate mean, median, std, min, max for 24h, 7d, 30d windows
    - Implement for CPU, RAM, and disk metrics
    - _Requirements: 4.1, 4.2_
  
  - [x] 3.3 Implement trend and volatility features
    - Calculate linear regression slopes over 7-day windows
    - Compute coefficient of variation for each metric
    - Calculate rate of change (hour-over-hour, day-over-day)
    - _Requirements: 4.3, 4.4_
  
  - [x] 3.4 Implement SMART feature extraction
    - Extract raw SMART attribute values
    - Calculate distance from thresholds
    - Add time-based features (hour of day, day of week)
    - _Requirements: 4.5_
  
  - [ ]* 3.5 Write property test for feature extraction completeness
    - **Property 2: Feature Extraction Completeness**
    - **Validates: Requirements 1.2, 4.1, 4.2, 4.3, 4.4, 4.5**
  
  - [ ]* 3.6 Write property test for missing data handling
    - **Property 15: Missing Data Handling**
    - **Validates: Requirements 4.6**
  
  - [ ]* 3.7 Write property test for feature extraction consistency
    - **Property 32: Feature Extraction Consistency**
    - **Validates: Requirements 10.2**

- [x] 4. Implement Model Training Pipeline
  - [x] 4.1 Create ModelTrainer class
    - Implement Random Forest training with hyperparameters
    - Implement Isolation Forest training for anomaly detection
    - Add model evaluation with accuracy, precision, recall, F1-score
    - _Requirements: 1.3, 1.4_
  
  - [x] 4.2 Implement model evaluation and metrics
    - Calculate all four evaluation metrics
    - Implement cross-validation
    - Calculate feature importance scores
    - _Requirements: 1.4, 11.1_
  
  - [x] 4.3 Create Model Registry for model storage
    - Implement model saving with compression (pickle + gzip)
    - Generate unique model_id with sequential versioning
    - Store model metadata in ml_models table
    - Save model files with version in filename
    - _Requirements: 1.5, 1.6, 1.7, 5.1, 5.2, 13.5_
  
  - [ ]* 4.4 Write property test for model evaluation metrics completeness
    - **Property 3: Model Evaluation Metrics Completeness**
    - **Validates: Requirements 1.4**
  
  - [x] 4.5 Write property test for model persistence with metadata
    - **Property 4: Model Persistence with Metadata**
    - **Validates: Requirements 1.5, 1.6, 5.2**
  
  - [ ]* 4.6 Write property test for model ID uniqueness
    - **Property 5: Model ID Uniqueness**
    - **Validates: Requirements 1.7**
  
  - [ ]* 4.7 Write property test for model version incrementing
    - **Property 16: Model Version Incrementing**
    - **Validates: Requirements 5.1**

- [x] 5. Implement Training Pipeline orchestration
  - [x] 5.1 Create TrainingPipeline class
    - Implement data extraction with date range filtering
    - Add train-test split (80/20)
    - Orchestrate feature extraction, training, and evaluation
    - _Requirements: 1.1, 10.1_
  
  - [x] 5.2 Implement model selection and activation logic
    - Compare new model accuracy against active model
    - Auto-activate if accuracy is 5%+ higher
    - Keep current model if new model is inferior
    - _Requirements: 10.3, 10.4, 10.5_
  
  - [x] 5.3 Add error handling and retry logic
    - Handle training failures with fallback to different algorithms
    - Implement database connection retry with exponential backoff
    - Add comprehensive error logging
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 5.4 Write property test for data loading completeness
    - **Property 1: Data Loading Completeness**
    - **Validates: Requirements 1.1**
  
  - [ ]* 5.5 Write property test for retraining data window
    - **Property 31: Retraining Data Window**
    - **Validates: Requirements 10.1**
  
  - [ ]* 5.6 Write property test for model comparison and activation
    - **Property 33: Model Comparison and Activation**
    - **Validates: Requirements 10.3, 10.4**
  
  - [ ]* 5.7 Write property test for inferior model rejection
    - **Property 34: Inferior Model Rejection**
    - **Validates: Requirements 10.5**

- [ ] 6. Checkpoint - Ensure training pipeline works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Synthetic Data Generator
  - [x] 7.1 Create SyntheticDataGenerator class
    - Implement normal operation pattern generation
    - Implement gradual degradation pattern
    - Implement sudden failure pattern (disk, memory, CPU)
    - _Requirements: 12.2, 12.3_
  
  - [x] 7.2 Add synthetic data labeling and mixing
    - Label synthetic data points clearly
    - Implement adaptive proportion based on real data availability
    - Ensure validation uses only real data
    - _Requirements: 12.1, 12.4, 12.5, 12.7_
  
  - [ ]* 7.3 Write property test for synthetic data generation trigger
    - **Property 42: Synthetic Data Generation Trigger**
    - **Validates: Requirements 12.1**
  
  - [ ]* 7.4 Write property test for synthetic data pattern diversity
    - **Property 43: Synthetic Data Pattern Diversity**
    - **Validates: Requirements 12.2**
  
  - [ ]* 7.5 Write property test for synthetic failure type coverage
    - **Property 44: Synthetic Failure Type Coverage**
    - **Validates: Requirements 12.3**
  
  - [ ]* 7.6 Write property test for synthetic data statistical similarity
    - **Property 47: Synthetic Data Statistical Similarity**
    - **Validates: Requirements 12.6**
  
  - [ ]* 7.7 Write property test for adaptive synthetic data proportion
    - **Property 48: Adaptive Synthetic Data Proportion**
    - **Validates: Requirements 12.7**

- [x] 8. Implement Predictor component
  - [x] 8.1 Create Predictor class
    - Implement model loading with caching
    - Generate predictions for single machine
    - Calculate failure probabilities for 7d, 14d, 30d windows
    - _Requirements: 2.2, 13.6_
  
  - [x] 8.2 Implement risk level classification
    - Calculate risk level based on probability thresholds
    - Assign CRITICAL (>=70%), HIGH (50-70%), MEDIUM (30-50%), LOW (<30%)
    - _Requirements: 2.5, 2.6, 2.7, 2.8_
  
  - [x] 8.3 Implement batch prediction with fault isolation
    - Process multiple machines in batch
    - Continue processing if one machine fails
    - Store predictions in database
    - _Requirements: 2.1, 2.4, 14.2_
  
  - [x] 8.4 Add feature importance and contributing factors
    - Calculate feature importance for each prediction
    - Extract top 5 contributing factors
    - Include metric values for CRITICAL predictions
    - Handle models without feature importance gracefully
    - _Requirements: 11.1, 11.2, 11.5, 11.6, 11.7_
  
  - [ ]* 8.5 Write property test for prediction completeness
    - **Property 6: Prediction Completeness for Active Machines**
    - **Validates: Requirements 2.1, 9.2**
  
  - [ ]* 8.6 Write property test for prediction time window completeness
    - **Property 7: Prediction Time Window Completeness**
    - **Validates: Requirements 2.2**
  
  - [ ]* 8.7 Write property test for risk level classification
    - **Property 10: Risk Level Classification Correctness**
    - **Validates: Requirements 2.5, 2.6, 2.7, 2.8**
  
  - [ ]* 8.8 Write property test for active model usage
    - **Property 8: Active Model Usage**
    - **Validates: Requirements 2.3, 5.4**
  
  - [ ]* 8.9 Write property test for prediction storage completeness
    - **Property 9: Prediction Storage Completeness**
    - **Validates: Requirements 2.4**
  
  - [ ]* 8.10 Write property test for feature importance calculation
    - **Property 36: Feature Importance Calculation**
    - **Validates: Requirements 11.1**
  
  - [ ]* 8.11 Write property test for model caching
    - **Property 51: Model Caching**
    - **Validates: Requirements 13.6**

- [x] 9. Implement Anomaly Detector component
  - [x] 9.1 Create AnomalyDetector class
    - Implement statistical anomaly detection (Z-score, IQR)
    - Classify anomaly types (spike, degradation, erratic_behavior)
    - Assign severity levels based on anomaly score
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 9.2 Implement anomaly storage and aggregation
    - Store CRITICAL anomalies immediately
    - Aggregate multiple anomalies within 1-hour window
    - Calculate expected range for each metric
    - _Requirements: 3.4, 3.5, 3.7_
  
  - [ ]* 9.3 Write property test for anomaly classification completeness
    - **Property 11: Anomaly Classification Completeness**
    - **Validates: Requirements 3.2, 3.3**
  
  - [ ]* 9.4 Write property test for critical anomaly storage
    - **Property 12: Critical Anomaly Storage**
    - **Validates: Requirements 3.4, 3.5**
  
  - [ ]* 9.5 Write property test for anomaly score presence
    - **Property 13: Anomaly Score Presence**
    - **Validates: Requirements 3.6**
  
  - [ ]* 9.6 Write property test for anomaly aggregation
    - **Property 14: Anomaly Aggregation**
    - **Validates: Requirements 3.7**

- [x] 10. Implement Prediction Service API (Flask)
  - [x] 10.1 Create Flask application with authentication middleware
    - Set up Flask app with CORS and error handlers
    - Implement JWT token validation
    - Add request logging
    - _Requirements: 6.7_
  
  - [x] 10.2 Implement prediction endpoints
    - GET /api/predictions/:machineId - return latest prediction
    - GET /api/predictions/high-risk - return HIGH/CRITICAL machines
    - Add input validation and error responses
    - _Requirements: 6.1, 6.2, 6.6_
  
  - [x] 10.3 Implement anomaly endpoints
    - GET /api/anomalies - return recent anomalies with filtering
    - Add sorting by severity
    - _Requirements: 6.3_
  
  - [x] 10.4 Implement model management endpoints
    - POST /api/ml/train - trigger async training job
    - GET /api/ml/models - list all models with metrics
    - GET /api/ml/train/:jobId - get training job status
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 10.5 Write property test for API prediction retrieval
    - **Property 19: API Prediction Retrieval**
    - **Validates: Requirements 6.1**
  
  - [ ]* 10.6 Write property test for high-risk machine filtering
    - **Property 20: High-Risk Machine Filtering**
    - **Validates: Requirements 6.2**
  
  - [ ]* 10.7 Write property test for anomaly query filtering
    - **Property 21: Anomaly Query Filtering and Sorting**
    - **Validates: Requirements 6.3**
  
  - [ ]* 10.8 Write property test for API authentication enforcement
    - **Property 24: API Authentication Enforcement**
    - **Validates: Requirements 6.7**
  
  - [ ]* 10.9 Write unit tests for API error responses
    - Test invalid machine_id format
    - Test missing authentication token
    - Test resource not found scenarios
    - _Requirements: 6.6, 14.5_

- [x] 11. Implement Scheduler for automated predictions
  - [x] 11.1 Create PredictionScheduler class with APScheduler
    - Schedule daily predictions at 2:00 AM
    - Implement prediction job that processes all active machines
    - Add job failure handling with retry after 1 hour
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 11.2 Add job status tracking and reporting
    - Update last_run_timestamp after successful completion
    - Generate summary report with machine count and high-risk count
    - Send notifications for long-running jobs (>30 min)
    - _Requirements: 9.4, 9.6, 9.7_
  
  - [x] 11.3 Implement distributed locking for multiple instances
    - Use PostgreSQL advisory locks
    - Prevent duplicate prediction runs
    - _Requirements: 15.7_
  
  - [ ]* 11.4 Write property test for prediction retry on failure
    - **Property 28: Prediction Retry on Failure**
    - **Validates: Requirements 9.3**
  
  - [ ]* 11.5 Write property test for last run timestamp update
    - **Property 29: Last Run Timestamp Update**
    - **Validates: Requirements 9.4**
  
  - [ ]* 11.6 Write property test for prediction summary report
    - **Property 30: Prediction Summary Report Completeness**
    - **Validates: Requirements 9.6**
  
  - [ ]* 11.7 Write property test for distributed lock prevention
    - **Property 61: Distributed Lock Prevention**
    - **Validates: Requirements 15.7**

- [x] 12. Checkpoint - Ensure prediction service and scheduling work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Add advanced error handling and resilience
  - [x] 13.1 Implement model corruption fallback
    - Detect corrupted model files during loading
    - Automatically fall back to previous active model
    - Log fallback events
    - _Requirements: 14.4_
  
  - [x] 13.2 Add memory management for batch processing
    - Monitor memory usage during predictions
    - Clear caches when memory exceeds 80%
    - Process machines in smaller batches if needed
    - _Requirements: 13.7_
  
  - [x] 13.3 Implement critical error notifications
    - Send email/Slack notifications for critical errors
    - Configure notification channels via environment variables
    - _Requirements: 14.6_
  
  - [ ]* 13.4 Write property test for model corruption fallback
    - **Property 55: Model Corruption Fallback**
    - **Validates: Requirements 14.4**
  
  - [ ]* 13.5 Write property test for database connection retry
    - **Property 54: Database Connection Retry**
    - **Validates: Requirements 14.3**
  
  - [ ]* 13.6 Write property test for fault isolation in batch predictions
    - **Property 53: Fault Isolation in Batch Predictions**
    - **Validates: Requirements 14.2**

- [x] 14. Integrate with Node.js backend
  - [x] 14.1 Add proxy endpoints in Node.js backend
    - Create routes that forward requests to Python Prediction Service
    - Add authentication token forwarding
    - Handle errors from Python service
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 14.2 Update backend to serve prediction data to dashboard
    - Modify existing dashboard controller to include predictions
    - Add endpoint for machine details with predictions
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 14.3 Write integration tests for backend-to-ML-service communication
    - Test prediction retrieval flow
    - Test high-risk machine query
    - Test anomaly retrieval
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 15. Update React Dashboard with prediction visualizations
  - [x] 15.1 Add prediction display to machine cards
    - Show failure probability percentage
    - Display risk level with color coding (red=CRITICAL, orange=HIGH, yellow=MEDIUM, green=LOW)
    - Add warning icon for CRITICAL machines
    - _Requirements: 8.1, 8.6_
  ta
  - [x] 15.2 Create machine details prediction section
    - Add gauge chart for risk score (0-100)
    - Display failure probabilities for 7d, 14d, 30d
    - Show contributing factors with importance scores
    - _Requirements: 8.2, 8.3, 11.4_
  
  - [x] 15.3 Create anomalies timeline component
    - Display recent anomalies in timeline chart
    - Color-code by severity
    - Show anomaly details on hover
    - _Requirements: 8.4_
  
  - [x] 15.4 Create model performance page
    - Display active model metrics (accuracy, precision, recall, F1)
    - Show model version and training date
    - Add button to trigger retraining
    - _Requirements: 8.5_
  
  - [x] 15.5 Add auto-refresh for dashboard data
    - Poll backend API every 60 seconds
    - Update predictions and anomalies
    - _Requirements: 8.7_

- [ ] 16. Add configuration and deployment setup
  - [x] 16.1 Create configuration file template
    - Define all required configuration parameters
    - Add validation for required fields
    - Support environment variables and config file
    - _Requirements: 15.1, 15.3, 15.4_
  
  - [x] 16.2 Add credential encryption support
    - Implement encryption/decryption for database credentials
    - Use environment variable for encryption key
    - _Requirements: 15.2_
  
  - [x] 16.3 Add cron expression parsing for schedule configuration
    - Support flexible scheduling via cron expressions
    - Validate cron expressions on startup
    - _Requirements: 15.6_
  
  - [ ]* 16.4 Write property test for configuration validation
    - **Property 58: Configuration Validation**
    - **Validates: Requirements 15.3, 15.4**
  
  - [ ]* 16.5 Write property test for path type support
    - **Property 59: Path Type Support**
    - **Validates: Requirements 15.5**
  
  - [ ]* 16.6 Write property test for cron expression parsing
    - **Property 60: Cron Expression Parsing**
    - **Validates: Requirements 15.6**

- [ ] 17. Create deployment documentation and scripts
  - [x] 17.1 Write deployment guide
    - Document installation steps
    - List all dependencies and versions
    - Provide configuration examples
    - _Requirements: 15.1_
  
  - [x] 17.2 Create Docker configuration
    - Write Dockerfile for Python ML service
    - Create docker-compose.yml for full stack
    - Add environment variable templates
    - _Requirements: 15.1_
  
  - [x] 17.3 Create database migration scripts
    - Add migration runner script
    - Document migration order
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 18. Final checkpoint - End-to-end system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation uses Python with scikit-learn for ML, Flask for API, and APScheduler for scheduling
- Integration with existing Node.js backend and React dashboard happens in later phases
- Database schema extensions are created first to support all subsequent components
