"""
LSTM-based predictor for predictive maintenance.
Loads a pre-trained PyTorch LSTM model and runs inference on time-series data.
"""
import os
import numpy as np
import torch
import torch.nn as nn
import psycopg2
from psycopg2.extras import RealDictCursor

from src.config import Config
from src.logger import logger

SEQ_LEN   = 5
FEATURES  = ["read_errors", "write_errors", "temperature", "health_score"]
N_FEAT    = len(FEATURES)
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "lstm_model.pth")

# Fixed normalization ranges — must match train_lstm_schema.py
_FEAT_MAX = np.array([100.0, 80.0, 80.0, 1.0], dtype=np.float32)


# ── Model definition (must match training architecture) ───────────────────────
class LSTMModel(nn.Module):
    def __init__(self, input_size=N_FEAT, hidden=32):
        super().__init__()
        self.lstm  = nn.LSTM(input_size, hidden, batch_first=True)
        self.dense = nn.Linear(hidden, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return torch.sigmoid(self.dense(out[:, -1, :]))


# ── Singleton model loader ─────────────────────────────────────────────────────
_model = None

def _load_model():
    global _model
    if _model is not None:
        return _model

    _model = LSTMModel()

    if not os.path.exists(MODEL_PATH):
        logger.warning(f"LSTM model not found at {MODEL_PATH}. Using untrained model — predictions will be unreliable.")
    else:
        _model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
        logger.info(f"LSTM model loaded from {MODEL_PATH}")

    _model.eval()
    return _model


def _health_score(status: str) -> float:
    """Convert health_status string to numeric score."""
    return {"GOOD": 0.0, "WARNING": 0.5, "CRITICAL": 1.0}.get(status, 0.0)


def _normalize(seq: np.ndarray) -> np.ndarray:
    """
    Scale features by fixed max values, then clip to [0, 1].
    Clipping prevents out-of-range inputs (e.g. read_errors > 100)
    from producing saturated sigmoid outputs.
    """
    normalized = seq / _FEAT_MAX
    clipped    = np.clip(normalized, 0.0, 1.0)
    return clipped


def predict_for_machine(machine_id: int) -> dict:
    """
    Fetch last SEQ_LEN smart_data rows for machine_id, run LSTM inference.
    Returns dict with keys: prediction, risk_level, anomaly, explanation
    """
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST, port=Config.DB_PORT,
            database=Config.DB_NAME, user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT read_errors, write_errors, temperature, health_status
            FROM (
                SELECT read_errors, write_errors, temperature, health_status, timestamp
                FROM smart_data
                WHERE machine_id = %s
                ORDER BY timestamp DESC
                LIMIT %s
            ) sub
            ORDER BY timestamp ASC
        """, (machine_id, SEQ_LEN))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error(f"DB error for machine {machine_id}: {e}")
        return {"error": str(e)}

    if len(rows) < SEQ_LEN:
        return {
            "prediction": None,
            "risk_level": "UNKNOWN",
            "anomaly": False,
            "explanation": f"Not enough data for prediction (need {SEQ_LEN}, got {len(rows)})"
        }

    # Build raw feature matrix (SEQ_LEN, N_FEAT)
    seq_raw = np.array([
        [
            float(r["read_errors"]  or 0),
            float(r["write_errors"] or 0),
            float(r["temperature"]  or 36.0),
            _health_score(r["health_status"])
        ]
        for r in rows
    ], dtype=np.float32)

    # Debug: log raw values so we can spot out-of-range inputs
    logger.debug(f"[LSTM] machine={machine_id} raw input:\n{seq_raw}")

    # Normalize + clip to [0, 1]
    seq_norm = _normalize(seq_raw)

    logger.debug(f"[LSTM] machine={machine_id} normalized+clipped:\n{seq_norm}")

    # Run inference
    model  = _load_model()
    tensor = torch.from_numpy(seq_norm).unsqueeze(0)  # shape: (1, 5, 4)

    with torch.no_grad():
        prob = float(model(tensor).item())  # full precision, no rounding

    logger.info(f"[LSTM] machine={machine_id} → prob={prob:.4f}")

    # Risk classification
    if prob > 0.7:
        risk_level  = "HIGH"
        anomaly     = True
        explanation = (
            "High failure risk detected due to increasing disk errors "
            "and abnormal SMART metrics trends."
        )
    elif prob > 0.5:
        risk_level  = "MEDIUM"
        anomaly     = True
        explanation = (
            "Moderate failure risk detected. Disk metrics show early "
            "signs of degradation."
        )
    else:
        risk_level  = "LOW"
        anomaly     = False
        explanation = "Disk metrics are within normal range. No immediate risk detected."

    return {
        "prediction": round(prob, 4),
        "risk_level": risk_level,
        "anomaly":    anomaly,
        "explanation": explanation
    }
