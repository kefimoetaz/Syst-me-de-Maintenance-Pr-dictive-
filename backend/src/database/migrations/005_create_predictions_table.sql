-- Migration: Create predictions table
-- Description: Stores ML model predictions for hardware failure probabilities
-- Date: 2024-02-11

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER NOT NULL,
    prediction_date TIMESTAMP NOT NULL,
    failure_probability_7d DECIMAL(5,2) NOT NULL CHECK (failure_probability_7d >= 0 AND failure_probability_7d <= 100),
    failure_probability_14d DECIMAL(5,2) NOT NULL CHECK (failure_probability_14d >= 0 AND failure_probability_14d <= 100),
    failure_probability_30d DECIMAL(5,2) NOT NULL CHECK (failure_probability_30d >= 0 AND failure_probability_30d <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    model_version VARCHAR(50) NOT NULL,
    contributing_factors JSONB,
    confidence_score DECIMAL(4,3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_predictions_machine
        FOREIGN KEY (machine_id) 
        REFERENCES machines(id)
        ON DELETE CASCADE,
    
    -- Unique constraint: one prediction per machine per date
    CONSTRAINT unique_machine_prediction_date
        UNIQUE (machine_id, prediction_date)
);

-- Create indexes for fast queries
CREATE INDEX idx_predictions_machine_date ON predictions(machine_id, prediction_date DESC);
CREATE INDEX idx_predictions_risk_level ON predictions(risk_level);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE predictions IS 'Stores ML model predictions for hardware failure probabilities';
COMMENT ON COLUMN predictions.failure_probability_7d IS 'Probability of failure within 7 days (0-100%)';
COMMENT ON COLUMN predictions.failure_probability_14d IS 'Probability of failure within 14 days (0-100%)';
COMMENT ON COLUMN predictions.failure_probability_30d IS 'Probability of failure within 30 days (0-100%)';
COMMENT ON COLUMN predictions.risk_level IS 'Risk classification: LOW, MEDIUM, HIGH, or CRITICAL';
COMMENT ON COLUMN predictions.model_version IS 'Version identifier of the ML model used';
COMMENT ON COLUMN predictions.contributing_factors IS 'JSON array of top contributing features with importance scores';
COMMENT ON COLUMN predictions.confidence_score IS 'Model confidence in the prediction (0-1)';
