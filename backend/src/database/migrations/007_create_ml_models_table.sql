-- Migration: Create ml_models table
-- Description: Stores metadata for trained ML models with versioning
-- Date: 2024-02-11

CREATE TABLE IF NOT EXISTS ml_models (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('random_forest', 'isolation_forest')),
    version INTEGER NOT NULL,
    trained_at TIMESTAMP NOT NULL,
    accuracy DECIMAL(5,4) CHECK (accuracy >= 0 AND accuracy <= 1),
    precision_score DECIMAL(5,4) CHECK (precision_score >= 0 AND precision_score <= 1),
    recall DECIMAL(5,4) CHECK (recall >= 0 AND recall <= 1),
    f1_score DECIMAL(5,4) CHECK (f1_score >= 0 AND f1_score <= 1),
    parameters JSONB,
    file_path VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: one version per model type
    CONSTRAINT unique_model_type_version
        UNIQUE (model_type, version)
);

-- Create indexes for fast queries
CREATE INDEX idx_ml_models_type_version ON ml_models(model_type, version DESC);
CREATE INDEX idx_ml_models_active ON ml_models(is_active);
CREATE INDEX idx_ml_models_created_at ON ml_models(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE ml_models IS 'Stores metadata for trained ML models with versioning';
COMMENT ON COLUMN ml_models.model_id IS 'Unique identifier for the model (e.g., random_forest_v1_20240211)';
COMMENT ON COLUMN ml_models.model_type IS 'Type of ML algorithm: random_forest or isolation_forest';
COMMENT ON COLUMN ml_models.version IS 'Sequential version number for this model type';
COMMENT ON COLUMN ml_models.accuracy IS 'Model accuracy on test data (0-1)';
COMMENT ON COLUMN ml_models.precision_score IS 'Model precision on test data (0-1)';
COMMENT ON COLUMN ml_models.recall IS 'Model recall on test data (0-1)';
COMMENT ON COLUMN ml_models.f1_score IS 'Model F1 score on test data (0-1)';
COMMENT ON COLUMN ml_models.parameters IS 'JSON object containing model hyperparameters';
COMMENT ON COLUMN ml_models.file_path IS 'File system path to the saved model file';
COMMENT ON COLUMN ml_models.is_active IS 'Whether this model is currently being used for predictions';
