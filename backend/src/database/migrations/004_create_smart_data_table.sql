-- Migration: Create smart_data table
-- Requirements: 10.4, 10.5, 10.6, 10.7

CREATE TABLE IF NOT EXISTS smart_data (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    health_status VARCHAR(20) NOT NULL CHECK (health_status IN ('GOOD', 'WARNING', 'CRITICAL')),
    read_errors INTEGER NOT NULL DEFAULT 0,
    write_errors INTEGER NOT NULL DEFAULT 0,
    temperature DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance on common queries
CREATE INDEX IF NOT EXISTS idx_smart_data_machine_id ON smart_data(machine_id);
CREATE INDEX IF NOT EXISTS idx_smart_data_timestamp ON smart_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_smart_data_machine_timestamp ON smart_data(machine_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_smart_data_health_status ON smart_data(health_status);

-- Add comments for documentation
COMMENT ON TABLE smart_data IS 'Stores SMART disk health data collected by agents';
COMMENT ON COLUMN smart_data.health_status IS 'Overall disk health status: GOOD, WARNING, or CRITICAL';
COMMENT ON COLUMN smart_data.read_errors IS 'Number of disk read errors detected';
COMMENT ON COLUMN smart_data.write_errors IS 'Number of disk write errors detected';
COMMENT ON COLUMN smart_data.temperature IS 'Disk temperature in Celsius';
