-- Seeder with realistic degradation data for ML predictions
-- This creates historical data showing gradual degradation patterns

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE system_metrics, smart_data, predictions, anomalies CASCADE;

-- ============================================================================
-- MACHINE 1: PC-ADMIN-01 - Gradual CPU Degradation (HIGH RISK)
-- Pattern: CPU usage increasing over 30 days, leading to potential failure
-- ============================================================================

-- Days 1-10: Normal operation (40-50% CPU)
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total, created_at)
SELECT 
    1,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    40 + (RANDOM() * 10)::NUMERIC(5,2),
    55 + (RANDOM() * 10)::NUMERIC(5,2),
    55 + (RANDOM() * 10)::NUMERIC(5,2),
    7168,  -- 7 GB available
    16384,  -- 16 GB total
    75 + (RANDOM() * 5)::NUMERIC(5,2),
    128000,  -- 125 GB free
    512000,  -- 500 GB total
    NOW()
FROM generate_series(0, 239) AS i;

-- Days 11-20: Gradual increase (50-70% CPU)
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total, created_at)
SELECT 
    1,
    NOW() - INTERVAL '20 days' + (i || ' hours')::INTERVAL,
    50 + (i * 0.5) + (RANDOM() * 10)::NUMERIC(5,2),
    60 + (i * 0.1) + (RANDOM() * 10)::NUMERIC(5,2),
    60 + (RANDOM() * 15)::NUMERIC(5,2),
    6144,  -- 6 GB available
    16384,  -- 16 GB total
    76 + (RANDOM() * 5)::NUMERIC(5,2),
    122880,  -- 120 GB free
    512000,  -- 500 GB total
    NOW()
FROM generate_series(0, 239) AS i;

-- Days 21-30: Critical levels (70-95% CPU) - FAILURE IMMINENT
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, memory_usage, disk_usage, network_usage, created_at)
SELECT 
    1,
    NOW() - INTERVAL '10 days' + (i || ' hours')::INTERVAL,
    70 + (i * 0.8) + (RANDOM() * 15)::NUMERIC(5,2),
    70 + (RANDOM() * 20)::NUMERIC(5,2),
    78 + (RANDOM() * 8)::NUMERIC(5,2),
    30 + (RANDOM() * 20)::NUMERIC(5,2),
    NOW()
FROM generate_series(0, 239) AS i;

-- SMART data for Machine 1 - Degrading disk
INSERT INTO smart_data (machine_id, timestamp, health_status, temperature, read_errors, write_errors, created_at)
SELECT 
    1,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    CASE 
        WHEN i < 240 THEN 'GOOD'
        WHEN i < 480 THEN 'WARNING'
        ELSE 'CRITICAL'
    END,
    45 + (i * 0.02) + (RANDOM() * 5)::NUMERIC(5,2),
    (i / 50)::INTEGER,
    (i / 80)::INTEGER,
    NOW()
FROM generate_series(0, 719) AS i;

-- ============================================================================
-- MACHINE 2: PC-DEV-02 - Memory Leak Pattern (MEDIUM RISK)
-- Pattern: Memory usage slowly increasing, disk filling up
-- ============================================================================

-- Days 1-15: Normal operation
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, memory_usage, disk_usage, network_usage, created_at)
SELECT 
    2,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    50 + (RANDOM() * 20)::NUMERIC(5,2),
    50 + (RANDOM() * 10)::NUMERIC(5,2),
    60 + (RANDOM() * 5)::NUMERIC(5,2),
    15 + (RANDOM() * 10)::NUMERIC(5,2),
    NOW()
FROM generate_series(0, 359) AS i;

-- Days 16-30: Memory leak developing (60-85% memory)
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, memory_usage, disk_usage, network_usage, created_at)
SELECT 
    2,
    NOW() - INTERVAL '15 days' + (i || ' hours')::INTERVAL,
    55 + (RANDOM() * 25)::NUMERIC(5,2),
    60 + (i * 0.5) + (RANDOM() * 10)::NUMERIC(5,2),
    62 + (i * 0.3) + (RANDOM() * 5)::NUMERIC(5,2),
    20 + (RANDOM() * 15)::NUMERIC(5,2),
    NOW()
FROM generate_series(0, 359) AS i;

-- SMART data for Machine 2 - Stable but warming
INSERT INTO smart_data (machine_id, timestamp, health_status, temperature, read_errors, write_errors, created_at)
SELECT 
    2,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    CASE 
        WHEN i < 500 THEN 'GOOD'
        ELSE 'WARNING'
    END,
    42 + (i * 0.01) + (RANDOM() * 4)::NUMERIC(5,2),
    (i / 200)::INTEGER,
    (i / 300)::INTEGER,
    NOW()
FROM generate_series(0, 719) AS i;

-- ============================================================================
-- MACHINE 3: PC-SUPPORT-03 - Disk Failure Pattern (CRITICAL RISK)
-- Pattern: Disk usage spiking, read/write errors increasing
-- ============================================================================

-- Days 1-20: Normal operation
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, memory_usage, disk_usage, network_usage, created_at)
SELECT 
    3,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    35 + (RANDOM() * 15)::NUMERIC(5,2),
    50 + (RANDOM() * 10)::NUMERIC(5,2),
    70 + (RANDOM() * 10)::NUMERIC(5,2),
    10 + (RANDOM() * 10)::NUMERIC(5,2),
    NOW()
FROM generate_series(0, 479) AS i;

-- Days 21-30: Disk filling rapidly (80-98% disk)
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, memory_usage, disk_usage, network_usage, created_at)
SELECT 
    3,
    NOW() - INTERVAL '10 days' + (i || ' hours')::INTERVAL,
    40 + (RANDOM() * 20)::NUMERIC(5,2),
    55 + (RANDOM() * 15)::NUMERIC(5,2),
    80 + (i * 0.5) + (RANDOM() * 5)::NUMERIC(5,2),
    15 + (RANDOM() * 15)::NUMERIC(5,2),
    NOW()
FROM generate_series(0, 239) AS i;

-- SMART data for Machine 3 - CRITICAL disk issues
INSERT INTO smart_data (machine_id, timestamp, health_status, temperature, read_errors, write_errors, created_at)
SELECT 
    3,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    CASE 
        WHEN i < 300 THEN 'GOOD'
        WHEN i < 500 THEN 'WARNING'
        ELSE 'CRITICAL'
    END,
    48 + (i * 0.03) + (RANDOM() * 6)::NUMERIC(5,2),
    (i / 30)::INTEGER,
    (i / 40)::INTEGER,
    NOW()
FROM generate_series(0, 719) AS i;

-- ============================================================================
-- MACHINE 4: Mori - Erratic Behavior (MEDIUM RISK)
-- Pattern: Unstable metrics, spikes and drops
-- ============================================================================

-- Days 1-30: Erratic behavior with spikes
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, memory_usage, disk_usage, network_usage, created_at)
SELECT 
    4,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    CASE 
        WHEN i % 24 < 8 THEN 20 + (RANDOM() * 30)::NUMERIC(5,2)
        WHEN i % 24 < 16 THEN 60 + (RANDOM() * 30)::NUMERIC(5,2)
        ELSE 30 + (RANDOM() * 40)::NUMERIC(5,2)
    END,
    50 + (RANDOM() * 40)::NUMERIC(5,2),
    65 + (RANDOM() * 20)::NUMERIC(5,2),
    10 + (RANDOM() * 40)::NUMERIC(5,2),
    NOW()
FROM generate_series(0, 719) AS i;

-- SMART data for Machine 4 - Unstable
INSERT INTO smart_data (machine_id, timestamp, health_status, temperature, read_errors, write_errors, created_at)
SELECT 
    4,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    CASE 
        WHEN i % 100 < 70 THEN 'GOOD'
        WHEN i % 100 < 90 THEN 'WARNING'
        ELSE 'CRITICAL'
    END,
    40 + (RANDOM() * 15)::NUMERIC(5,2),
    (RANDOM() * 10)::INTEGER,
    (RANDOM() * 8)::INTEGER,
    NOW()
FROM generate_series(0, 719) AS i;

-- ============================================================================
-- MACHINE 5: PC-TEST-01 - Healthy System (LOW RISK)
-- Pattern: Stable, normal operation
-- ============================================================================

-- Days 1-30: Consistently healthy
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, memory_usage, disk_usage, network_usage, created_at)
SELECT 
    5,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    35 + (RANDOM() * 20)::NUMERIC(5,2),
    45 + (RANDOM() * 20)::NUMERIC(5,2),
    55 + (RANDOM() * 15)::NUMERIC(5,2),
    15 + (RANDOM() * 15)::NUMERIC(5,2),
    NOW()
FROM generate_series(0, 719) AS i;

-- SMART data for Machine 5 - Healthy
INSERT INTO smart_data (machine_id, timestamp, health_status, temperature, read_errors, write_errors, created_at)
SELECT 
    5,
    NOW() - INTERVAL '30 days' + (i || ' hours')::INTERVAL,
    'GOOD',
    40 + (RANDOM() * 8)::NUMERIC(5,2),
    0,
    0,
    NOW()
FROM generate_series(0, 719) AS i;

-- ============================================================================
-- Add some anomalies for critical machines
-- ============================================================================

-- Anomaly for Machine 1 (CPU spike)
INSERT INTO anomalies (machine_id, detected_at, anomaly_type, severity, metric_name, metric_value, expected_range, anomaly_score, created_at)
VALUES 
(1, NOW() - INTERVAL '2 days', 'spike', 'HIGH', 'cpu_usage', 92.5, '40-70', 85.3, NOW()),
(1, NOW() - INTERVAL '1 day', 'spike', 'CRITICAL', 'cpu_usage', 96.8, '40-70', 95.2, NOW());

-- Anomaly for Machine 3 (Disk spike)
INSERT INTO anomalies (machine_id, detected_at, anomaly_type, severity, metric_name, metric_value, expected_range, anomaly_score, created_at)
VALUES 
(3, NOW() - INTERVAL '3 days', 'spike', 'HIGH', 'disk_usage', 94.2, '70-85', 88.7, NOW()),
(3, NOW() - INTERVAL '1 day', 'spike', 'CRITICAL', 'disk_usage', 97.5, '70-85', 96.8, NOW());

-- Anomaly for Machine 4 (Erratic behavior)
INSERT INTO anomalies (machine_id, detected_at, anomaly_type, severity, metric_name, metric_value, expected_range, anomaly_score, created_at)
VALUES 
(4, NOW() - INTERVAL '5 days', 'erratic_behavior', 'MEDIUM', 'cpu_usage', 85.0, '30-60', 65.4, NOW());

-- ============================================================================
-- Summary of expected ML predictions after retraining:
-- ============================================================================
-- Machine 1 (PC-ADMIN-01): HIGH/CRITICAL risk - CPU degradation pattern
-- Machine 2 (PC-DEV-02): MEDIUM risk - Memory leak pattern
-- Machine 3 (PC-SUPPORT-03): CRITICAL risk - Disk failure imminent
-- Machine 4 (Mori): MEDIUM risk - Erratic behavior
-- Machine 5 (PC-TEST-01): LOW risk - Healthy system

-- ============================================================================
-- Instructions to apply this seeder:
-- ============================================================================
-- 1. Run: node backend/src/database/seed.js
-- 2. Or manually: psql -U postgres -d maintenance_predictive -f backend/src/database/seeders/002_seed_degradation_data.sql
-- 3. Retrain ML model: cd ml-service && python -c "from src.training_pipeline import TrainingPipeline; TrainingPipeline().run_training()"
-- 4. Generate predictions: python -c "from src.prediction_scheduler import PredictionScheduler; PredictionScheduler().run_prediction_job()"
-- 5. Refresh dashboard to see updated predictions!
