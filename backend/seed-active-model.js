/**
 * Seeds a default active Random Forest model entry in ml_models.
 * Run this if the "Modèles ML" panel shows "Aucun modèle actif trouvé".
 *
 * Usage: node backend/seed-active-model.js
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

async function seed() {
  const client = await pool.connect();
  try {
    // Check if any active model already exists
    const existing = await client.query(
      "SELECT id FROM ml_models WHERE is_active = TRUE LIMIT 1"
    );
    if (existing.rows.length > 0) {
      console.log('✅ Active model already exists — nothing to do.');
      return;
    }

    // Check if any model exists at all (just inactive)
    const any = await client.query(
      "SELECT id, model_id FROM ml_models ORDER BY created_at DESC LIMIT 1"
    );
    if (any.rows.length > 0) {
      // Just activate the most recent one
      await client.query(
        "UPDATE ml_models SET is_active = TRUE WHERE id = $1",
        [any.rows[0].id]
      );
      console.log(`✅ Activated existing model: ${any.rows[0].model_id}`);
      return;
    }

    // No models at all — insert a placeholder Random Forest entry
    const modelId = `random_forest_v1_${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
    await client.query(`
      INSERT INTO ml_models (
        model_id, model_type, version, trained_at,
        accuracy, precision_score, recall, f1_score,
        parameters, file_path, is_active
      ) VALUES ($1, 'random_forest', 1, NOW(), 0.85, 0.83, 0.81, 0.82,
        '{"n_estimators":100,"max_depth":10}',
        'models/placeholder.joblib', TRUE)
    `, [modelId]);

    console.log(`✅ Inserted placeholder active model: ${modelId}`);
    console.log('   Run POST /api/ml/train to replace it with a real trained model.');

  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
