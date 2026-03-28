-- Migration: Create system_metrics table
-- Requirements: 10.3, 10.6, 10.7

CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    cpu_usage DECIMAL(5,2) NOT NULL,
    cpu_temperature DECIMAL(5,2),
    memory_usage DECIMAL(5,2) NOT NULL,
    memory_available INTEGER NOT NULL,
    memory_total INTEGER NOT NULL,
    disk_usage DECIMAL(5,2) NOT NULL,
    disk_free BIGINT NOT NULL,
    disk_total BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance on common queries
CREATE INDEX IF NOT EXISTS idx_system_metrics_machine_id ON system_metrics(machine_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_machine_timestamp ON system_metrics(machine_id, timestamp DESC);

-- Add comments for documentation
COMMENT ON TABLE system_metrics IS 'Stores system performance metrics collected by agents';
COMMENT ON COLUMN system_metrics.cpu_usage IS 'CPU usage percentage (0-100)';
COMMENT ON COLUMN system_metrics.cpu_temperature IS 'CPU temperature in Celsius';
COMMENT ON COLUMN system_metrics.memory_usage IS 'Memory usage percentage (0-100)';
COMMENT ON COLUMN system_metrics.memory_available IS 'Available memory in MB';
COMMENT ON COLUMN system_metrics.memory_total IS 'Total memory in MB';
COMMENT ON COLUMN system_metrics.disk_usage IS 'Disk usage percentage (0-100)';
COMMENT ON COLUMN system_metrics.disk_free IS 'Free disk space in MB';
COMMENT ON COLUMN system_metrics.disk_total IS 'Total disk space in MB';
