/**
 * Inserts the trained LSTM model into ml_models and marks it active.
 * Run AFTER: python train_lstm_schema.py
 * Run from project root: node backend/seed-lstm-model.js
 *
 * MAE/MSE/RMSE values come from the last training run output.
 * Update them here if you retrain.
 */
require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'maintenance_predictive',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '123',
});

// ── Update these values after each training run ────────────────────────────
const LSTM_METRICS = {
  mae:  0.0272,
  mse:  0.0012,
  rmse: 0.0347,
};
// ──────────────────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const modelId = `lstm_v1_${today}`;

    // Deactivate any existing LSTM models
    await client.query(
      "UPDATE ml_models SET is_active = FALSE WHERE model_type = 'lstm'"
    );

    // Check if this exact model_id already exists
    const existing = await client.query(
      'SELECT id FROM ml_models WHERE model_id = $1', [modelId]
    );

    if (existing.rows.length > 0) {
      // Just reactivate it
      await client.query(
        'UPDATE ml_models SET is_active = TRUE, mae = $1, mse = $2, rmse = $3 WHERE model_id = $4',
        [LSTM_METRICS.mae, LSTM_METRICS.mse, LSTM_METRICS.rmse, modelId]
      );
      console.log(`✅ Reactivated existing LSTM model: ${modelId}`);
    } else {
      // Get next version
      const vRes = await client.query(
        "SELECT COALESCE(MAX(version), 0) + 1 AS v FROM ml_models WHERE model_type = 'lstm'"
      );
      const version = vRes.rows[0].v;

      await client.query(`
        INSERT INTO ml_models (
          model_id, model_type, version, trained_at,
          accuracy, precision_score, recall, f1_score,
          mae, mse, rmse,
          parameters, file_path, is_active
        ) VALUES ($1, 'lstm', $2, NOW(),
          NULL, NULL, NULL, NULL,
          $3, $4, $5,
          '{"seq_len":5,"hidden":32,"dropout":0.3,"loss":"MSELoss","epochs":30}',
          'ml-service/models/lstm_model.pth',
          TRUE
        )
      `, [modelId, version, LSTM_METRICS.mae, LSTM_METRICS.mse, LSTM_METRICS.rmse]);

      console.log(`✅ Inserted LSTM model: ${modelId}  (v${version})`);
    }

    console.log(`   MAE=${LSTM_METRICS.mae}  MSE=${LSTM_METRICS.mse}  RMSE=${LSTM_METRICS.rmse}`);
    console.log('   Refresh "Modèles ML" in the dashboard to see it.');

  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
