-- Migration: Create alerts table
-- Description: Stores alert history for predictive maintenance notifications
-- Date: 2026-02-12

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('PREDICTION', 'METRIC', 'SMART', 'ANOMALY')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    
    -- Alert status
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')),
    acknowledged_at TIMESTAMP,
    acknowledged_by VARCHAR(100),
    resolved_at TIMESTAMP,
    
    -- Notification tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    notification_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast queries
CREATE INDEX idx_alerts_machine_id ON alerts(machine_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_type_severity ON alerts(alert_type, severity);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_alerts_timestamp
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_alerts_updated_at();

-- Add comments for documentation
COMMENT ON TABLE alerts IS 'Stores alert history and notification tracking for predictive maintenance';
COMMENT ON COLUMN alerts.alert_type IS 'Type of alert: PREDICTION (ML), METRIC (CPU/RAM/Disk), SMART (disk health), ANOMALY (ML anomaly detection)';
COMMENT ON COLUMN alerts.severity IS 'Alert severity level: LOW, MEDIUM, HIGH, CRITICAL';
COMMENT ON COLUMN alerts.status IS 'Alert lifecycle status: ACTIVE (new), ACKNOWLEDGED (seen), RESOLVED (fixed), DISMISSED (ignored)';
COMMENT ON COLUMN alerts.details IS 'JSON object with additional alert context (e.g., metric values, prediction probabilities)';
COMMENT ON COLUMN alerts.email_sent IS 'Whether email notification was sent successfully';
COMMENT ON COLUMN alerts.notification_sent IS 'Whether browser/push notification was sent';
