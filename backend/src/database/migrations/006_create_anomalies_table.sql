-- Migration: Create anomalies table
-- Description: Stores detected anomalies in system metrics
-- Date: 2024-02-11

CREATE TABLE IF NOT EXISTS anomalies (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL,
    detected_at TIMESTAMP NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL CHECK (anomaly_type IN ('spike', 'degradation', 'erratic_behavior')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    expected_range VARCHAR(100),
    anomaly_score DECIMAL(5,2) NOT NULL CHECK (anomaly_score >= 0 AND anomaly_score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_anomalies_machine
        FOREIGN KEY (machine_id) 
        REFERENCES machines(id)
        ON DELETE CASCADE
);

-- Create indexes for fast queries
CREATE INDEX idx_anomalies_machine_detected ON anomalies(machine_id, detected_at DESC);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);
CREATE INDEX idx_anomalies_created_at ON anomalies(created_at DESC);
CREATE INDEX idx_anomalies_type ON anomalies(anomaly_type);

-- Add comments for documentation
COMMENT ON TABLE anomalies IS 'Stores detected anomalies in system metrics';
COMMENT ON COLUMN anomalies.anomaly_type IS 'Type of anomaly: spike, degradation, or erratic_behavior';
COMMENT ON COLUMN anomalies.severity IS 'Severity level: LOW, MEDIUM, HIGH, or CRITICAL';
COMMENT ON COLUMN anomalies.metric_name IS 'Name of the metric that triggered the anomaly (e.g., cpu_usage, memory_usage)';
COMMENT ON COLUMN anomalies.metric_value IS 'The actual value that was detected as anomalous';
COMMENT ON COLUMN anomalies.expected_range IS 'The expected range for this metric (e.g., "40-60%")';
COMMENT ON COLUMN anomalies.anomaly_score IS 'Numerical score indicating how anomalous the value is (0-100)';
