-- Migration: Add LSTM support to ml_models
-- Safe: only adds, never removes

-- 1. Relax the model_type constraint to allow 'lstm'
ALTER TABLE ml_models DROP CONSTRAINT IF EXISTS ml_models_model_type_check;
ALTER TABLE ml_models ADD CONSTRAINT ml_models_model_type_check
    CHECK (model_type IN ('random_forest', 'isolation_forest', 'lstm'));

-- 2. Add regression metrics (nullable — RF rows will have NULL here)
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS mae  DECIMAL(8,6);
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS mse  DECIMAL(8,6);
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS rmse DECIMAL(8,6);
