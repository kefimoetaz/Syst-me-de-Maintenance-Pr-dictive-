# Implementation Plan: Sprint 1 Agent Backend

## Overview

This implementation plan breaks down the Sprint 1 predictive maintenance system into discrete, actionable tasks. The system consists of three main components:

1. **PostgreSQL Database**: Foundation with tables, indexes, and seed data
2. **Node.js/Express API Backend**: REST API with authentication, validation, and data persistence
3. **Python Agent**: Windows service that collects and transmits system metrics

The implementation follows a bottom-up approach: database → API → agent → integration. Each phase includes property-based tests to validate correctness properties from the design document.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create directory structure for backend (Node.js) and agent (Python)
  - Initialize package.json for backend with Express, Sequelize, Joi, Winston, pg
  - Initialize requirements.txt for agent with psutil, pySMART, requests, schedule
  - Set up testing frameworks: Jest + fast-check for backend, pytest + hypothesis for agent
  - Create .env.example and config.json.example files
  - _Requirements: All (foundation)_

- [x] 2. Database setup and migrations
  - [x] 2.1 Create PostgreSQL migration for Machine table
    - Define schema with id, hostname, ip_address, serial_number (unique), os, timestamps
    - Add appropriate constraints and indexes
    - _Requirements: 10.1_
  
  - [x] 2.2 Create PostgreSQL migration for Agent table
    - Define schema with id, agent_id (UUID unique), machine_id (FK), token (unique), created_at
    - Add foreign key constraint to Machine with ON DELETE CASCADE
    - Create unique index on agent_id and token
    - _Requirements: 10.2, 10.8_
  
  - [x] 2.3 Create PostgreSQL migration for SystemMetrics table
    - Define schema with all metric fields (cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
    - Add machine_id foreign key with ON DELETE CASCADE
    - Create indexes on machine_id and timestamp
    - _Requirements: 10.3, 10.6, 10.7_
  
  - [x] 2.4 Create PostgreSQL migration for SmartData table
    - Define schema with health_status (CHECK constraint), read_errors, write_errors, temperature
    - Add machine_id foreign key with ON DELETE CASCADE
    - Create indexes on machine_id and timestamp
    - _Requirements: 10.4, 10.5, 10.6, 10.7_
  
  - [x] 2.5 Create seed data script
    - Insert 3 test machines with different configurations
    - Insert corresponding agents with valid tokens
    - Insert historical metrics data for testing queries
    - _Requirements: 14.3, 14.4, 14.5, 14.6_

- [x] 3. Sequelize models and database connection
  - [x] 3.1 Create Sequelize configuration and database connection
    - Set up connection pool (min: 5, max: 20)
    - Configure environment-based settings (dev, test, prod)
    - Implement connection error handling
    - _Requirements: 13.2_
  
  - [x] 3.2 Create Sequelize model for Machine
    - Define model with validations matching database schema
    - Configure timestamps and table name
    - _Requirements: 10.1_
  
  - [x] 3.3 Create Sequelize model for Agent
    - Define model with UUID validation for agent_id
    - Configure foreign key relationship to Machine
    - _Requirements: 10.2_
  
  - [x] 3.4 Create Sequelize model for SystemMetrics
    - Define model with numeric validations (ranges, positive values)
    - Configure foreign key relationship to Machine
    - _Requirements: 10.3_
  
  - [x] 3.5 Create Sequelize model for SmartData
    - Define model with enum validation for health_status
    - Configure foreign key relationship to Machine
    - _Requirements: 10.4_
  
  - [x] 3.6 Define model associations
    - Machine hasMany SystemMetrics and SmartData
    - Machine hasOne Agent
    - Configure cascade delete behavior
    - _Requirements: 10.5_

- [x] 4. API middleware implementation
  - [x] 4.1 Create authentication middleware
    - Extract token from Authorization header (Bearer format)
    - Query Agent table to verify token existence
    - Attach agent object to req.agent if valid
    - Return 401 Unauthorized if token missing or invalid
    - _Requirements: 7.3, 7.4, 11.1, 11.2, 11.3_
  
  - [ ]* 4.2 Write property test for authentication middleware
    - **Property 16: Vérification du token d'authentification**
    - **Property 17: Rejet des tokens invalides**
    - **Validates: Requirements 7.3, 7.4, 11.1, 11.2, 11.3**
  
  - [x] 4.3 Create validation middleware with Joi schema
    - Define complete Joi schema for data payload
    - Validate agent_id as UUID (RFC 4122)
    - Validate timestamp as ISO 8601
    - Validate numeric ranges: cpu_usage, memory_usage, disk_usage (0-100)
    - Validate temperatures (-50 to 150°C)
    - Validate health_status enum ('GOOD', 'WARNING', 'CRITICAL')
    - Validate positive values for memory and disk sizes
    - Return 400 with validation details on failure
    - _Requirements: 7.2, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  
  - [ ]* 4.4 Write property test for validation middleware
    - **Property 15: Validation du schéma JSON**
    - **Property 19: Validation UUID agent_id**
    - **Property 20: Validation timestamp ISO 8601**
    - **Property 21: Validation des plages numériques**
    - **Property 22: Validation enum health_status**
    - **Property 23: Détails d'erreur de validation**
    - **Validates: Requirements 7.2, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7**
  
  - [x] 4.5 Create error handling middleware
    - Implement centralized error handler
    - Log errors with timestamp, stack trace, request details
    - Map error types to appropriate HTTP status codes
    - Return generic error messages for 5xx (security)
    - Return detailed messages for 4xx (validation)
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 4.6 Create request logging middleware
    - Log all incoming requests with method, URL, timestamp
    - Log response status codes
    - Use appropriate log levels (info, warn, error)
    - _Requirements: 12.2, 12.4_
  
  - [x] 4.7 Create payload size limit middleware
    - Limit request body to 1MB maximum
    - Return 413 Payload Too Large if exceeded
    - _Requirements: 13.3, 13.4_

- [-] 5. API data controller and routes
  - [x] 5.1 Create data controller with receiveData method
    - Extract validated payload from req.body
    - Find or create Machine by serial_number
    - Insert SystemMetrics record with machine_id
    - Insert SmartData record with machine_id
    - Wrap all operations in a database transaction
    - Commit transaction on success
    - Rollback transaction on any error
    - Return 201 with record ID on success
    - Return 500 with error logging on database failure
    - _Requirements: 7.6, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 11.4, 11.5_
  
  - [ ]* 5.2 Write property test for machine creation/retrieval
    - **Property 24: Création ou récupération de machine**
    - **Validates: Requirements 9.1**
  
  - [ ]* 5.3 Write property test for metrics insertion
    - **Property 25: Insertion des métriques système**
    - **Property 26: Insertion des données SMART**
    - **Validates: Requirements 9.2, 9.3**
  
  - [ ]* 5.4 Write property test for referential integrity
    - **Property 27: Intégrité référentielle**
    - **Validates: Requirements 9.4**
  
  - [ ]* 5.5 Write property test for transaction atomicity
    - **Property 29: Atomicité des transactions**
    - **Validates: Requirements 9.6**
  
  - [ ]* 5.6 Write property test for machine identification from token
    - **Property 30: Identification de la machine depuis le token**
    - **Validates: Requirements 11.4, 11.5**
  
  - [x] 5.7 Create routes file for /api/data endpoint
    - Define POST /api/data route
    - Chain middleware: auth → validation → controller
    - Export router
    - _Requirements: 7.1_
  
  - [x] 5.8 Create main Express app
    - Initialize Express application
    - Configure JSON body parser with size limit
    - Mount routes
    - Mount error handling middleware
    - Configure Winston logger
    - _Requirements: 12.5_

- [x] 6. Checkpoint - API Backend Complete
  - Run all API tests (unit + property tests)
  - Verify database migrations work correctly
  - Test API manually with curl/Postman
  - Ensure all tests pass, ask the user if questions arise

- [-] 7. Python agent - System metrics collector
  - [x] 7.1 Create SystemCollector class
    - Implement collect_cpu_metrics() using psutil (cpu_percent, temperature)
    - Implement collect_memory_metrics() using psutil (virtual_memory)
    - Implement collect_disk_metrics() using psutil (disk_usage)
    - Implement collect_machine_info() (hostname, IP, serial, OS)
    - Return dictionaries with all required fields
    - Handle missing metrics gracefully with logging
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 7.2 Write property test for system metrics completeness
    - **Property 2: Métriques système complètes et valides**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
  
  - [ ]* 7.3 Write property test for collection resilience
    - **Property 3: Collecte continue malgré métriques manquantes**
    - **Validates: Requirements 2.7**
  
  - [ ]* 7.4 Write property test for machine info completeness
    - **Property 6: Informations machine complètes**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [-] 8. Python agent - SMART data reader
  - [x] 8.1 Create SmartReader class
    - Implement read_smart_data() using pySMART
    - Read health status, read/write errors, temperature
    - Return dictionary with all SMART fields
    - Return None if SMART data inaccessible
    - Log errors when SMART unavailable
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 8.2 Write property test for SMART data completeness
    - **Property 4: Données SMART complètes**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  
  - [ ]* 8.3 Write property test for SMART unavailability handling
    - **Property 5: Gestion des données SMART inaccessibles**
    - **Validates: Requirements 3.5**

- [-] 9. Python agent - Data sender with retry logic
  - [x] 9.1 Create DataSender class
    - Initialize with api_url and token
    - Implement send_data() with HTTP POST to /api/data
    - Build Authorization header with Bearer token
    - Format payload as JSON according to schema
    - Implement retry logic with exponential backoff (3 attempts max)
    - Retry delays: 1s, 2s, 4s
    - Retry only on network errors and 5xx responses
    - Do not retry on 4xx responses
    - Log success on HTTP 200/201
    - Log errors on failures
    - Return True on success, False on failure
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 9.2 Write property test for JSON format conformance
    - **Property 8: Format JSON conforme au schéma**
    - **Validates: Requirements 5.2**
  
  - [ ]* 9.3 Write property test for authentication token in requests
    - **Property 9: Token d'authentification dans les requêtes**
    - **Validates: Requirements 5.4**
  
  - [ ]* 9.4 Write property test for retry with exponential backoff
    - **Property 11: Retry avec backoff exponentiel**
    - **Validates: Requirements 5.6**
  
  - [ ]* 9.5 Write property test for continuation after failure
    - **Property 12: Continuation après échec total**
    - **Validates: Requirements 5.7**

- [x] 10. Python agent - Configuration and logging
  - [x] 10.1 Create configuration loader
    - Load config.json with api_url, token, collection_interval_hours
    - Create default config.json if missing or invalid
    - Log error when creating default config
    - Validate configuration values
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [ ]* 10.2 Write property test for default config creation
    - **Property 1: Configuration par défaut en cas d'erreur**
    - **Validates: Requirements 1.5**
  
  - [x] 10.3 Create logging module
    - Configure file logging to agent.log
    - Implement log rotation at 10MB
    - Archive old logs when rotating
    - Format logs with timestamp, level, message
    - Support levels: INFO, WARN, ERROR
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 10.4 Write property test for log format
    - **Property 13: Format des logs d'erreur**
    - **Validates: Requirements 6.2**
  
  - [ ]* 10.5 Write property test for event logging
    - **Property 10: Logging des envois réussis**
    - **Property 14: Logging des événements importants**
    - **Validates: Requirements 5.5, 6.3**

- [-] 11. Python agent - Scheduler and service orchestration
  - [x] 11.1 Create CollectionScheduler class
    - Initialize with config file path
    - Load configuration on startup
    - Implement start() to begin hourly collection
    - Implement collect_and_send() to orchestrate full cycle
    - Collect system metrics via SystemCollector
    - Collect SMART data via SmartReader
    - Build complete payload with agent_id (UUID)
    - Send data via DataSender
    - Log results (success or failure)
    - Implement stop() for graceful shutdown
    - Handle exceptions without crashing
    - _Requirements: 4.5, 5.1, 6.3_
  
  - [ ]* 11.2 Write property test for UUID in payloads
    - **Property 7: UUID agent présent dans chaque envoi**
    - **Validates: Requirements 4.5**
  
  - [x] 11.3 Create Windows service wrapper
    - Implement service start/stop handlers
    - Configure service to auto-restart on failure
    - Set service to start automatically on boot
    - _Requirements: 1.2_

- [x] 12. Checkpoint - Agent Complete
  - Run all agent tests (unit + property tests)
  - Test agent locally with mock API
  - Verify log files are created correctly
  - Ensure all tests pass, ask the user if questions arise

- [ ] 13. Integration and end-to-end testing
  - [ ] 13.1 Create Docker Compose setup for integration testing
    - PostgreSQL container with test database
    - API backend container
    - Network configuration for inter-container communication
  
  - [ ]* 13.2 Write integration tests for complete data flow
    - Test agent → API → database flow
    - Verify data persistence and retrieval
    - Test authentication flow end-to-end
    - Test error scenarios (invalid token, malformed data)
  
  - [ ] 13.3 Create deployment scripts
    - Database migration script
    - Seed data script
    - API startup script with environment validation
    - Agent installation script for Windows
  
  - [ ] 13.4 Create documentation
    - API endpoint documentation
    - Agent configuration guide
    - Deployment guide
    - Troubleshooting guide

- [ ] 14. Final checkpoint - Complete system validation
  - Run full test suite (unit + property + integration)
  - Verify code coverage meets 80% threshold
  - Test complete deployment flow
  - Validate all 34 correctness properties pass
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each property test should run minimum 100 iterations with randomly generated data
- Property tests are tagged with comments referencing design document properties
- Unit tests focus on specific examples, edge cases, and error conditions
- All database operations must use transactions for atomicity
- Agent must be resilient to failures and continue operating
- API must validate all inputs and handle errors gracefully
- Security: Use HTTPS in production, never log tokens, validate all inputs
