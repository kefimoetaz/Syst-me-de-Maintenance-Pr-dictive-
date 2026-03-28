"""
Train LSTM on synthetic data matching the real smart_data schema.
Features: read_errors, write_errors, temperature, health_score
Label: continuous risk score in [0, 1] — NOT binary 0/1

Key changes vs previous version:
- Labels are continuous (soft targets), not hard 0/1
- Failing sequences use GRADUAL degradation with noise and overlap
- Healthy sequences can have occasional spikes (realistic)
- Label smoothing prevents the model from being overconfident
- Reduced epochs + higher dropout to avoid overfitting to clean patterns

Run from project root:
    python train_lstm_schema.py
"""
import os
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

SEQ_LEN   = 5
N_FEAT    = 4
EPOCHS    = 30
BATCH     = 64
N_SAMPLES = 10000

# ── 1. Generate sequences with SOFT labels ────────────────────────────────────
np.random.seed(42)

def gen_sequence():
    """
    Generate a (SEQ_LEN, 4) sequence and a continuous risk label in [0, 1].

    Risk is determined by how degraded the disk metrics are — not a hard 0/1.
    This creates a spectrum: 0.05 (very healthy) → 0.95 (near failure).
    """
    # Sample a risk level uniformly — this is the ground truth
    risk = np.random.uniform(0.0, 1.0)

    # Map risk to realistic metric ranges with overlap between classes
    # read_errors: healthy=0-5, degraded=3-30, failing=15-60
    read_base  = risk * 55 + np.random.uniform(-3, 3)
    write_base = risk * 40 + np.random.uniform(-2, 2)
    temp_base  = 30 + risk * 40 + np.random.uniform(-3, 3)  # 30°C → 70°C
    health_base = risk * 0.9 + np.random.uniform(-0.05, 0.05)

    # Build a sequence with temporal trend (values increase toward failure)
    trend = np.linspace(max(0, risk - 0.15), risk, SEQ_LEN)

    read_err  = np.clip(trend * 55 + np.random.randn(SEQ_LEN) * 4,  0, 100)
    write_err = np.clip(trend * 40 + np.random.randn(SEQ_LEN) * 3,  0, 80)
    temp      = np.clip(30 + trend * 40 + np.random.randn(SEQ_LEN) * 2, 20, 80)
    health    = np.clip(trend * 0.9 + np.random.randn(SEQ_LEN) * 0.04, 0, 1)

    seq = np.stack([read_err, write_err, temp, health], axis=1).astype(np.float32)

    # Soft label: add small noise to prevent overconfidence
    label = float(np.clip(risk + np.random.uniform(-0.05, 0.05), 0.05, 0.95))

    return seq, label

X_list, y_list = [], []
for _ in range(N_SAMPLES):
    seq, label = gen_sequence()
    X_list.append(seq)
    y_list.append(label)

X = np.array(X_list, dtype=np.float32)  # (N, 5, 4)
y = np.array(y_list, dtype=np.float32)  # (N,)

print(f"Label distribution: min={y.min():.2f} max={y.max():.2f} mean={y.mean():.2f}")

# ── 2. Normalize ──────────────────────────────────────────────────────────────
FEAT_MAX = np.array([100.0, 80.0, 80.0, 1.0], dtype=np.float32)
X = np.clip(X / FEAT_MAX, 0.0, 1.0)

# ── 3. Train/test split ───────────────────────────────────────────────────────
idx   = np.random.permutation(len(X))
split = int(len(X) * 0.8)
X_train, X_test = X[idx[:split]], X[idx[split:]]
y_train, y_test = y[idx[:split]], y[idx[split:]]

train_dl = DataLoader(
    TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train)),
    batch_size=BATCH, shuffle=True
)
test_dl = DataLoader(
    TensorDataset(torch.from_numpy(X_test), torch.from_numpy(y_test)),
    batch_size=BATCH
)

print(f"Train: {X_train.shape}  Test: {X_test.shape}")

# ── 4. Model with dropout to prevent overconfidence ───────────────────────────
class LSTMModel(nn.Module):
    def __init__(self, input_size=N_FEAT, hidden=32):
        super().__init__()
        self.lstm    = nn.LSTM(input_size, hidden, batch_first=True)
        self.dropout = nn.Dropout(0.3)   # prevents memorizing clean patterns
        self.dense   = nn.Linear(hidden, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        out    = self.dropout(out[:, -1, :])
        return torch.sigmoid(self.dense(out))

model     = LSTMModel()
# MSELoss on continuous targets — forces gradual output instead of 0/1
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=5e-4)
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)

# ── 5. Train ──────────────────────────────────────────────────────────────────
for epoch in range(1, EPOCHS + 1):
    model.train()
    total_loss = 0
    for xb, yb in train_dl:
        optimizer.zero_grad()
        pred = model(xb).squeeze()
        loss = criterion(pred, yb)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    scheduler.step()
    if epoch % 5 == 0 or epoch == 1:
        print(f"Epoch {epoch:2d}/{EPOCHS}  loss={total_loss/len(train_dl):.4f}")

# ── 6. Evaluate ───────────────────────────────────────────────────────────────
model.eval()
all_preds = []
with torch.no_grad():
    for xb, yb in test_dl:
        all_preds.extend(model(xb).squeeze().numpy())

y_pred = np.array(all_preds)
mae  = np.mean(np.abs(y_pred - y_test))
mse  = np.mean((y_pred - y_test) ** 2)
rmse = np.sqrt(mse)

print(f"\nTest MAE:  {mae:.4f}")
print(f"Test MSE:  {mse:.4f}")
print(f"Test RMSE: {rmse:.4f}")
print(f"Prediction range: min={y_pred.min():.3f}  max={y_pred.max():.3f}  mean={y_pred.mean():.3f}")

# Show distribution buckets
buckets = [(0.0, 0.2), (0.2, 0.4), (0.4, 0.6), (0.6, 0.8), (0.8, 1.0)]
print("\nPrediction distribution:")
for lo, hi in buckets:
    count = np.sum((y_pred >= lo) & (y_pred < hi))
    print(f"  [{lo:.1f}-{hi:.1f}): {count} samples ({100*count/len(y_pred):.1f}%)")

# ── 7. Save ───────────────────────────────────────────────────────────────────
os.makedirs("ml-service/models", exist_ok=True)
torch.save(model.state_dict(), "ml-service/models/lstm_model.pth")
print("\nModel saved to: ml-service/models/lstm_model.pth")
