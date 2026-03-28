"""
Lightweight LSTM model for predictive maintenance using Backblaze dataset.
Uses PyTorch (no TensorFlow/Keras dependency issues).
"""
import os
import glob
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, r2_score
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# ── Config ────────────────────────────────────────────────────────────────────
DATA_DIR = "C:/Users/kefii/Downloads/data_Q1_2020/"
FEATURES = ["smart_5_raw", "smart_187_raw", "smart_197_raw", "smart_198_raw"]
TARGET   = "failure"
SEQ_LEN  = 5
MAX_ROWS = 10_000
EPOCHS   = 5
BATCH    = 16

# ── 1. Load data ──────────────────────────────────────────────────────────────
csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
if not csv_files:
    raise FileNotFoundError(f"No CSV files found in {DATA_DIR}")

print(f"Loading: {csv_files[0]}")
df = pd.read_csv(csv_files[0], nrows=MAX_ROWS)
print(f"Loaded {len(df)} rows")

# ── 2. Preprocessing ──────────────────────────────────────────────────────────
for c in FEATURES:
    if c not in df.columns:
        df[c] = 0

df = df[["date", "serial_number"] + FEATURES + [TARGET]].copy()
df[FEATURES + [TARGET]] = df[FEATURES + [TARGET]].fillna(0)

# ── 3. Time-series preparation ────────────────────────────────────────────────
# Try to find a disk with enough rows, otherwise use all data sorted by date
disk_counts = df["serial_number"].value_counts()
good_disks  = disk_counts[disk_counts > SEQ_LEN + 5]

if len(good_disks) > 0:
    top_disk = good_disks.idxmax()
    disk_df  = df[df["serial_number"] == top_disk].sort_values("date").reset_index(drop=True)
    print(f"Using disk: {top_disk}  ({len(disk_df)} rows)")
else:
    # No single disk has enough rows — use all data sorted by date
    print("No single disk has enough rows. Using all data sorted by date.")
    disk_df = df.sort_values("date").reset_index(drop=True)
    print(f"Total rows used: {len(disk_df)}")

scaler   = MinMaxScaler()
X_scaled = scaler.fit_transform(disk_df[FEATURES].values)
y        = disk_df[TARGET].values.astype(np.float32)

def make_sequences(X, y, seq_len):
    Xs, ys = [], []
    for i in range(len(X) - seq_len):
        Xs.append(X[i:i + seq_len])
        ys.append(y[i + seq_len])
    return np.array(Xs, dtype=np.float32), np.array(ys, dtype=np.float32)

X_seq, y_seq = make_sequences(X_scaled, y, SEQ_LEN)
print(f"Sequences: {X_seq.shape}  Labels: {y_seq.shape}")

# ── 4. Train/Test split (80/20, no shuffle for time-series) ───────────────────
split    = int(len(X_seq) * 0.8)
X_train, X_test = X_seq[:split], X_seq[split:]
y_train, y_test = y_seq[:split], y_seq[split:]

train_ds = TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train))
test_ds  = TensorDataset(torch.from_numpy(X_test),  torch.from_numpy(y_test))
train_dl = DataLoader(train_ds, batch_size=BATCH, shuffle=True)
test_dl  = DataLoader(test_ds,  batch_size=BATCH)

print(f"Train: {X_train.shape}  Test: {X_test.shape}")

# ── 5. LSTM Model ─────────────────────────────────────────────────────────────
class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden=32):
        super().__init__()
        self.lstm  = nn.LSTM(input_size, hidden, batch_first=True)
        self.dense = nn.Linear(hidden, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return torch.sigmoid(self.dense(out[:, -1, :]))

model     = LSTMModel(input_size=len(FEATURES))
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters())
print(model)

# ── 6. Training ───────────────────────────────────────────────────────────────
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
    print(f"Epoch {epoch}/{EPOCHS}  loss={total_loss/len(train_dl):.4f}")

# ── 7. Evaluation ─────────────────────────────────────────────────────────────
model.eval()
all_preds, all_labels = [], []
with torch.no_grad():
    for xb, yb in test_dl:
        pred = model(xb).squeeze()
        all_preds.extend(pred.numpy())
        all_labels.extend(yb.numpy())

y_pred_prob = np.array(all_preds)
y_true      = np.array(all_labels)
y_pred_bin  = (y_pred_prob >= 0.5).astype(int)

accuracy = (y_pred_bin == y_true.astype(int)).mean()
mae      = mean_absolute_error(y_true, y_pred_prob)
rmse     = np.sqrt(np.mean((y_true - y_pred_prob) ** 2))
r2       = r2_score(y_true, y_pred_prob)

# ── 8. Output ─────────────────────────────────────────────────────────────────
print("\n" + "="*45)
print("         LSTM Model Evaluation Results")
print("="*45)
print(f"  Accuracy : {accuracy:.4f}")
print(f"  MAE      : {mae:.4f}")
print(f"  RMSE     : {rmse:.4f}")
print(f"  R² Score : {r2:.4f}")
print("="*45)

# ── 9. Save model ──────────────────────────────────────────────────────────────
os.makedirs("ml-service/models", exist_ok=True)
torch.save(model.state_dict(), "ml-service/models/lstm_model.pth")
print("\nModel saved to: ml-service/models/lstm_model.pth")
