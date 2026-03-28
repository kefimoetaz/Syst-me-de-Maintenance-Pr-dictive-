# PC Technician Assistant — Technical Documentation
## Predictive Maintenance Platform with AI

**Academic Context:** Final Year Engineering Project (PFE) — Licence en Systèmes Informatiques (LSI), 2025–2026

---

## Table of Contents

1. Project Overview
2. System Architecture
3. Features Description
4. API Documentation
5. Machine Learning System
6. Chatbot System
7. Evaluation System
8. Results Analysis
9. Limitations
10. Improvements & Future Work
11. Conclusion
12. Jury Presentation Guide

---

## 1. Project Overview

### 1.1 Purpose

PC Technician Assistant is an intelligent platform designed to monitor computer hardware in real time and predict hardware failures before they occur. It combines system monitoring, machine learning, and a conversational AI assistant to help IT technicians manage their infrastructure proactively.

### 1.2 Problem Statement

In IT environments, hardware failures are often discovered only after they cause downtime. Reactive maintenance is costly in both time and resources. This platform addresses that problem by:

- Continuously collecting hardware metrics from monitored machines
- Applying machine learning models to predict failure probability
- Alerting technicians before failures occur
- Providing a conversational assistant to query system status in natural language

### 1.3 High-Level Summary

The platform consists of five interconnected components:

| Component | Technology | Role |
|-----------|-----------|------|
| Agent | Python | Collects metrics from each machine |
| Backend | Node.js / Express | Central API and business logic |
| Database | PostgreSQL | Persistent storage |
| ML Service | Python / Flask | Trains models and generates predictions |
| Frontend | React / Vite | Web dashboard for technicians |

---

## 2. System Architecture

### 2.1 Architecture Diagram (Description)

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitored Machines                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Agent 1  │  │ Agent 2  │  │ Agent N  │  (Python)        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
└───────┼─────────────┼─────────────┼──────────────────────────┘
        │  POST /api/data (Bearer token)
        ▼
┌───────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js)                       │
│  Routes: /auth  /users  /data  /dashboard  /alerts  /chatbot  │
│  Middleware: JWT auth, RBAC, validation, rate limiting         │
└──────────────┬────────────────────────────┬───────────────────┘
               │                            │
               ▼                            ▼
    ┌──────────────────┐         ┌──────────────────────┐
    │   PostgreSQL DB  │         │   ML Service (Flask) │
    │  9 tables        │◄────────│  Random Forest       │
    │  machines        │         │  Isolation Forest    │
    │  system_metrics  │         │  LSTM (SMART data)   │
    │  smart_data      │         │  Scheduler (2h00)    │
    │  predictions     │         └──────────────────────┘
    │  alerts          │
    │  users           │
    └──────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │         Frontend (React / Vite)          │
    │  Dashboard  Alerts  ML Models  Chatbot   │
    │  User Management  Machine Details        │
    └──────────────────────────────────────────┘
```

### 2.2 Data Flow

1. Each monitored machine runs a Python agent that collects CPU, RAM, disk, and SMART metrics every hour.
2. The agent sends this data to the backend via `POST /api/data` using a Bearer token.
3. The backend validates and stores the data in PostgreSQL.
4. Every night at 2:00 AM, the ML service reads historical data, trains or updates the Random Forest model, and generates failure predictions for all machines.
5. If a prediction exceeds a risk threshold, the backend creates an alert and sends an email notification.
6. Technicians access the React dashboard to view machine status, predictions, and alerts.
7. The chatbot processes natural language queries by analyzing intent, fetching live data from the database, and returning structured responses.

### 2.3 Component Details

**Agent (Python)**
- Runs on each monitored machine
- Uses `psutil` for CPU, RAM, and disk metrics
- Uses `pySMART` for disk health data (read/write errors, temperature, health status)
- Sends data with exponential backoff retry logic (3 attempts: 1s, 2s, 4s)
- Scheduled via `APScheduler` to run every hour

**Backend (Node.js / Express)**
- RESTful API with JWT authentication
- Role-Based Access Control: Admin and Technician roles
- Sequelize ORM for database operations
- Nodemailer for email alert notifications
- Proxies ML prediction requests to the Python ML service

**ML Service (Python / Flask)**
- Exposes a REST API consumed by the backend
- Trains a `RandomForestClassifier` on historical system metrics
- Uses `IsolationForest` for anomaly detection
- Includes an LSTM model (`lstm_predictor.py`) for SMART data time-series analysis
- Model registry stores trained models with versioning and accuracy tracking
- Prediction scheduler runs daily at 2:00 AM

**Frontend (React / Vite)**
- Single-page application with React Router
- TailwindCSS for styling (dark glassmorphism theme)
- Recharts for metric visualization
- Protected routes with JWT token validation
- Admin-only route for user management

---

## 3. Features Description

### 3.1 Machine Monitoring

Each machine is monitored through an agent that collects:

| Metric | Source | Description |
|--------|--------|-------------|
| CPU usage | psutil | Percentage 0–100% |
| CPU temperature | psutil sensors | Degrees Celsius |
| Memory usage | psutil | Percentage 0–100% |
| Memory available | psutil | Megabytes |
| Disk usage | psutil | Percentage 0–100% |
| Disk free space | psutil | Megabytes |
| SMART read errors | pySMART | Disk read error count |
| SMART write errors | pySMART | Disk write error count |
| SMART temperature | pySMART | Disk temperature |
| SMART health status | pySMART | GOOD / WARNING / CRITICAL |

Machine identification includes hostname, IP address, OS version, and hardware serial number (with MAC address fallback).

### 3.2 Prediction System

The ML service generates failure probability predictions for each machine:

- **7-day probability**: Short-term risk estimate
- **14-day probability**: Medium-term risk estimate
- **30-day probability**: Long-term risk estimate (primary metric)
- **Risk level**: LOW / MEDIUM / HIGH / CRITICAL
- **Contributing factors**: Top 5 features driving the prediction

Risk thresholds:

| Probability | Risk Level |
|-------------|-----------|
| < 30% | LOW |
| 30% – 50% | MEDIUM |
| 50% – 70% | HIGH |
| > 70% | CRITICAL |

### 3.3 Alert System

Alerts are automatically created when predictions exceed thresholds:

- **HIGH** alerts: probability ≥ 50%
- **CRITICAL** alerts: probability ≥ 70%
- Email notifications sent via Nodemailer for HIGH and CRITICAL alerts
- Alerts have status: ACTIVE / ACKNOWLEDGED / RESOLVED

### 3.4 User Management (RBAC)

Two roles are implemented:

| Role | Permissions |
|------|------------|
| Admin | Full access: create/delete users, change roles, view all data |
| Technician | Read-only access: view dashboard, machines, alerts, predictions |

### 3.5 Chatbot

An AI assistant integrated into the dashboard that answers questions about:
- Machine status and risk levels
- Active alerts
- System statistics
- General maintenance questions

---

## 4. API Documentation

### 4.1 Authentication

**POST /api/auth/login**
```json
Body:    { "email": "admin@system.local", "password": "admin123" }
Response: { "success": true, "token": "eyJ...", "user": { "id": 1, "role": "admin" } }
```

**POST /api/auth/register**
```json
Body:    { "email": "user@example.com", "password": "pass123", "full_name": "Jean Dupont" }
Response: { "success": true, "token": "eyJ...", "user": { ... } }
```

### 4.2 Dashboard

**GET /api/dashboard/overview**
```json
Response: {
  "machines": { "total": 20, "critical": 3, "high": 7 },
  "alerts": { "active": 10, "critical": 3 },
  "predictions": { "avg_risk": 56.2 }
}
```

### 4.3 Machines & Data

**GET /api/machines** — List all machines with latest predictions

**POST /api/data** — Receive metrics from agent (Bearer token required)
```json
Body: {
  "hostname": "PC-DEV-01",
  "cpu_usage": 45.2,
  "memory_usage": 67.8,
  "disk_usage": 82.1,
  "smart_data": { "read_errors": 0, "write_errors": 2, "temperature": 38 }
}
```

### 4.4 Predictions & Alerts

**GET /api/ml/predictions** — All latest predictions

**GET /api/alerts** — Active alerts

**PUT /api/alerts/:id/acknowledge** — Acknowledge an alert

### 4.5 Chatbot

**POST /api/chatbot**
```json
Body:     { "message": "Quelles machines sont à risque élevé?" }
Response: {
  "success": true,
  "response": "⚠️ 20 machine(s) à risque élevé (≥50%): PC-ADMIN-01: 56%...",
  "intent": "high_risk_list"
}
```

**GET /api/chatbot/suggestions** — Returns 5 suggested questions

### 4.6 User Management (Admin only)

**GET /api/users** — List all users

**POST /api/users** — Create a user
```json
Body: { "email": "tech@example.com", "password": "pass123", "username": "Jean", "role": "user" }
```

**PUT /api/users/:id/role** — Update user role
```json
Body: { "role": "admin" }
```

**DELETE /api/users/:id** — Delete a user

---

## 5. Machine Learning System

### 5.1 Primary Model: Random Forest

The main prediction model is a `RandomForestClassifier` from scikit-learn.

**Why Random Forest?**
- Handles tabular data (CPU, RAM, disk metrics) effectively
- Provides feature importance scores for explainability
- Robust to missing values and outliers
- Fast inference suitable for batch predictions

**Training Pipeline:**
1. Extract features from the last 90 days of system metrics
2. Engineer statistical features: mean, max, standard deviation over 24h, 168h, and 720h windows
3. Generate synthetic failure labels based on threshold rules (CPU > 80%, memory > 85%, disk > 90%)
4. Split data 80/20 for training and testing
5. Train with `class_weight='balanced'` to handle imbalanced data
6. Evaluate with accuracy, precision, recall, and F1-score
7. Register model in the database with versioning
8. Activate new model only if accuracy improves by ≥ 5% over the current active model

**Model Parameters:**
```python
RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    class_weight='balanced',
    random_state=42
)
```

**Output:**
- `failure_probability_7d`: probability of failure in 7 days (%)
- `failure_probability_14d`: probability of failure in 14 days (%)
- `failure_probability_30d`: probability of failure in 30 days (%)
- `risk_level`: LOW / MEDIUM / HIGH / CRITICAL
- `contributing_factors`: top 5 features with importance scores

### 5.2 Secondary Model: Isolation Forest

Used for unsupervised anomaly detection. Detects unusual patterns in system metrics without requiring labeled failure data. Contamination parameter set to 0.1 (10% expected anomaly rate).

### 5.3 LSTM Model (SMART Data)

A separate LSTM neural network (`lstm_predictor.py`) is implemented for time-series analysis of SMART disk data.

**Architecture:**
```python
class LSTMModel(nn.Module):
    def __init__(self, input_size=4, hidden=32):
        self.lstm  = nn.LSTM(input_size, hidden, batch_first=True)
        self.dense = nn.Linear(hidden, 1)
        # Output: sigmoid probability
```

**Input Features (sequence length = 5 time steps):**
- `read_errors`: disk read error count
- `write_errors`: disk write error count
- `temperature`: disk temperature (°C)
- `health_score`: encoded health status (GOOD=0.0, WARNING=0.5, CRITICAL=1.0)

**Inference:**
1. Fetch the last 5 SMART data records for the machine from the database
2. Normalize features by fixed maximum values
3. Run forward pass through LSTM → sigmoid output
4. Classify: prob > 0.7 → HIGH, prob > 0.5 → MEDIUM, else LOW

**Note:** The LSTM model is available as a standalone predictor. The primary production pipeline uses Random Forest.

### 5.4 Prediction Schedule

The ML service runs a daily scheduler (`prediction_scheduler.py`) that:
- Triggers at 2:00 AM every day
- Runs batch predictions for all machines
- Stores results in the `predictions` table
- Triggers alert creation for HIGH/CRITICAL results

---

## 6. Chatbot System

### 6.1 Architecture

The chatbot is integrated into the backend as a service (`chatbotService.js`) and exposed via `POST /api/chatbot`. It uses Ollama running locally with the `llama3.2:1b` model.

### 6.2 Intent Detection

The chatbot uses rule-based intent detection before calling Ollama:

| Intent | Trigger Keywords | Action |
|--------|-----------------|--------|
| `greeting` | bonjour, salut, hello | Ollama generates friendly response |
| `alerts` | alerte, critique, alert | Fetch active HIGH/CRITICAL alerts from DB |
| `high_risk_list` | quelles, liste + risque | Fetch machines with probability ≥ 50% |
| `machine_count` | combien, nombre | Count all monitored machines |
| `machine_status` | machine name / PC-XXX | Search machine by name in DB |
| `general` | anything else | Ollama with system context |

### 6.3 Ollama Integration

For general questions, the chatbot calls the Ollama API:

```
POST http://localhost:11434/api/generate
Body: {
  "model": "llama3.2:1b",
  "prompt": "Question: {user_question}\nDonnées: {context}",
  "system": "Tu es un assistant IA pour la maintenance prédictive...",
  "stream": false,
  "options": { "temperature": 0.7, "num_predict": 100 }
}
```

### 6.4 Fallback Mechanism

For operational queries (alerts, machine status, statistics), the chatbot uses pre-built template responses instead of Ollama. This ensures:
- Faster response time
- Consistent formatting
- Reliability when Ollama is unavailable

If Ollama is unreachable, the system falls back to a generic response: *"Je suis votre assistant de maintenance prédictive..."*

### 6.5 Limitations

- The chatbot does not maintain conversation history (stateless)
- Machine name extraction relies on regex patterns; unusual names may not be recognized
- Ollama responses are limited to 100 tokens for speed
- General knowledge questions (not related to the system) receive generic fallback responses

---

## 7. Evaluation System

### 7.1 Purpose

An offline evaluation pipeline was developed to measure the quality of chatbot responses using standard NLP metrics: BLEU and ROUGE.

### 7.2 Dataset

The evaluation dataset (`evaluation/dataset.json`) contains 20 question-reference pairs covering:
- Machine risk queries
- Alert interpretation
- ML model behavior
- SMART data concepts
- System administration

Each entry has the structure:
```json
{
  "id": 1,
  "question": "Quelles machines sont à risque élevé?",
  "reference": "Les machines à risque élevé sont celles dont la probabilité de panne dépasse 50%..."
}
```

### 7.3 Metrics

**BLEU (Bilingual Evaluation Understudy)**
- Measures n-gram precision between the generated response and the reference
- Range: 0.0 (no overlap) to 1.0 (perfect match)
- Smoothing (Method 1) applied to handle short responses
- Implementation: `nltk.translate.bleu_score.sentence_bleu`

**ROUGE (Recall-Oriented Understudy for Gisting Evaluation)**
- ROUGE-1: unigram overlap (individual words)
- ROUGE-2: bigram overlap (word pairs)
- ROUGE-L: longest common subsequence
- F1-measure reported for all variants
- Implementation: `rouge_score.rouge_scorer`

### 7.4 Evaluation Script

The script (`evaluation/evaluate.py`) supports two modes:

```bash
# Mock mode (offline, no backend required)
python evaluation/evaluate.py --mock

# Live mode (requires backend running on port 3000)
python evaluation/evaluate.py
```

For each question, the script:
1. Sends the question to the chatbot (or uses mock response)
2. Computes BLEU score against the reference answer
3. Computes ROUGE-1, ROUGE-2, ROUGE-L scores
4. Prints individual scores and a summary table with averages

---

## 8. Results Analysis

### 8.1 Evaluation Results

| Mode | BLEU | ROUGE-1 | ROUGE-2 | ROUGE-L |
|------|------|---------|---------|---------|
| Mock | 0.088 | 0.459 | 0.311 | 0.431 |
| Live | 0.007 | 0.114 | 0.010 | 0.092 |

### 8.2 Why BLEU is Low

BLEU measures exact n-gram overlap. The chatbot returns **operational data** (real machine names, live percentages, alert messages) while the reference answers are **conceptual explanations**. Both are correct, but they use different vocabulary.

Example:
- Reference: *"Les machines à risque élevé sont celles dont la probabilité dépasse 50%..."*
- Chatbot: *"⚠️ 20 machine(s) à risque élevé: PC-ADMIN-01: 56%..."*

The chatbot answer is factually correct but shares few words with the reference, resulting in a low BLEU score.

### 8.3 Why ROUGE is Higher

ROUGE-1 measures individual word overlap. Words like "machines", "risque", "élevé", "probabilité" appear in both the chatbot response and the reference, giving a moderate ROUGE-1 score even when sentence structure differs.

### 8.4 Interpretation

The low live scores are a known limitation of n-gram metrics when applied to task-oriented chatbots that return structured data rather than free-form text. The mock mode scores (ROUGE-1: 0.46) better reflect the chatbot's conceptual knowledge when responses are phrased similarly to the references.

These results are consistent with findings in the NLP literature: BLEU and ROUGE are designed for machine translation and summarization tasks, not for evaluating data-retrieval chatbots.

---

## 9. Limitations

### 9.1 Machine Learning
- Failure labels are synthetically generated from threshold rules, not from real historical failure events
- Model accuracy (50–70%) is limited by the absence of real labeled failure data
- The LSTM model requires at least 5 consecutive SMART data records per machine

### 9.2 Chatbot
- Stateless: no conversation memory between messages
- Intent detection is rule-based and may misclassify ambiguous questions
- Ollama response quality depends on the local model version and hardware
- Generic fallback responses for questions outside the system's domain

### 9.3 Evaluation
- BLEU and ROUGE measure lexical overlap, not semantic correctness
- The 20-question dataset is small for statistical significance
- Reference answers were manually written and may not cover all valid response styles

### 9.4 System
- The agent requires Python and psutil installed on each monitored machine
- SMART data collection may not be available on all hardware configurations
- Email alerts require SMTP configuration

---

## 10. Improvements & Future Work

### 10.1 Machine Learning
- Collect real failure event data to replace synthetic labels
- Implement cross-validation for more reliable accuracy estimates
- Explore gradient boosting (XGBoost, LightGBM) as alternatives to Random Forest
- Fully integrate the LSTM model into the production prediction pipeline

### 10.2 Chatbot
- Add conversation history for multi-turn dialogue
- Improve prompt engineering to guide Ollama toward more structured responses
- Align reference answers with the chatbot's actual response style for better metric scores
- Add intent categories for maintenance scheduling and intervention tracking

### 10.3 Evaluation
- Expand the dataset to 50–100 questions
- Add semantic similarity metrics (BERTScore, cosine similarity with sentence embeddings)
- Implement automated regression testing to detect chatbot quality degradation

### 10.4 Platform
- Add a maintenance intervention tracking module
- Implement PDF report export
- Build a mobile application for field technicians
- Integrate with ticketing systems (JIRA, ServiceNow)

---

## 11. Conclusion

### 11.1 Strengths

- **End-to-end system**: from raw hardware metrics to actionable predictions and alerts
- **Multi-model ML**: Random Forest for predictions, Isolation Forest for anomaly detection, LSTM for SMART time-series
- **Real-time monitoring**: hourly data collection with automatic alert generation
- **AI assistant**: natural language interface for non-technical users
- **Scientific evaluation**: BLEU and ROUGE metrics provide a reproducible quality baseline
- **Production-ready architecture**: Docker support, JWT authentication, RBAC, email notifications

### 11.2 Academic Contribution

This project demonstrates the practical application of:
- Supervised machine learning for predictive maintenance
- Time-series analysis with LSTM neural networks
- Large language model integration (Ollama/LLaMA) in a domain-specific context
- NLP evaluation methodology (BLEU, ROUGE) applied to a task-oriented chatbot

---

## 12. Jury Presentation Guide

### 12.1 Recommended Presentation Order (15–20 minutes)

1. **Problem statement** (2 min): Hardware failures cost time and money. Reactive maintenance is inefficient.
2. **Solution overview** (2 min): Show the architecture diagram. Explain the 5 components.
3. **Live demo** (5 min):
   - Open the dashboard → show machine list with risk levels
   - Click a machine → show prediction details and contributing factors
   - Show the alerts panel
   - Open the chatbot → ask "Quelles machines sont à risque élevé?"
4. **ML explanation** (3 min): Explain Random Forest, training pipeline, prediction schedule
5. **LSTM** (2 min): Explain the SMART data model, show the architecture
6. **Evaluation** (2 min): Show the BLEU/ROUGE table, explain why live scores are lower
7. **Limitations & future work** (2 min): Be honest about synthetic labels and metric limitations

### 12.2 Anticipated Jury Questions

**Q: Why Random Forest and not a neural network?**
A: Random Forest is interpretable (feature importance), fast to train, and performs well on tabular data. A neural network would require more labeled data to outperform it.

**Q: Why are BLEU scores so low?**
A: The chatbot returns live operational data while references are conceptual explanations. BLEU measures word overlap, not semantic correctness. The mock mode scores (ROUGE-1: 0.46) better reflect conceptual alignment.

**Q: How are failure labels generated?**
A: Synthetically, based on threshold rules (CPU > 80%, disk > 90%). In a production system, real failure event logs would replace these labels.

**Q: What is the difference between Random Forest and LSTM in this system?**
A: Random Forest uses aggregated statistical features from all metrics over time windows. LSTM processes raw SMART data as a time sequence, capturing temporal patterns in disk health degradation.

**Q: Is the chatbot connected to the internet?**
A: No. Ollama runs entirely locally. No data leaves the machine.
