# ML Service - Predictive Maintenance

Machine learning service for predicting hardware failures in the PC Technician Assistant platform.

## Features

- Machine learning model training with Random Forest and Isolation Forest
- Failure prediction with 7-day, 14-day, and 30-day probability scores
- Real-time anomaly detection
- REST API for predictions and model management
- Automated daily prediction scheduling
- Model versioning and management

## Setup

### 1. Create Virtual Environment

```bash
cd ml-service
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and update with your settings:

```bash
copy .env.example .env
```

Edit `.env` and set:
- Database credentials
- API token
- Model path
- Prediction schedule

### 5. Create Models Directory

```bash
mkdir models
```

## Project Structure

```
ml-service/
├── src/
│   ├── __init__.py
│   ├── config.py           # Configuration management
│   ├── logger.py           # Logging infrastructure
│   ├── feature_extractor.py
│   ├── model_trainer.py
│   ├── predictor.py
│   ├── anomaly_detector.py
│   ├── model_registry.py
│   ├── training_pipeline.py
│   ├── scheduler.py
│   └── app.py              # Flask application
├── tests/
│   └── ...
├── models/                 # Trained ML models
├── requirements.txt
├── .env.example
└── README.md
```

## Usage

### Run Flask API Server

```bash
python -m src.app
```

The API will be available at `http://localhost:5000`

### Train a Model

```bash
python -m src.training_pipeline
```

### Run Predictions

```bash
python -m src.predictor
```

## API Endpoints

- `GET /api/predictions/:machineId` - Get latest prediction for a machine
- `GET /api/predictions/high-risk` - Get all high-risk machines
- `GET /api/anomalies` - Get recent anomalies
- `POST /api/ml/train` - Trigger model retraining
- `GET /api/ml/models` - List all models

## Development

### Run Tests

```bash
pytest tests/
```

### Run with Debug Mode

Set `FLASK_ENV=development` in `.env` and run:

```bash
python -m src.app
```

## License

MIT
