"""
Script to create the Flask API application file
Workaround for Windows file system issues
"""

app_content = '''"""
Flask REST API for ML Prediction Service
Provides endpoints for predictions, anomalies, and model management
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import traceback
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

from src.config import Config
from src.logger import logger
from src.predictor import Predictor
from src.anomaly_detector import AnomalyDetector
from src.model_registry import ModelRegistry
from src.training_pipeline import TrainingPipeline


# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY
CORS(app)  # Enable CORS for all routes


# Authentication decorator
def require_auth(f):
    """Decorator to require authentication token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Missing authentication token'}), 401
        
        # Extract token (format: "Bearer <token>")
        try:
            token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        # Validate token
        if Config.API_TOKEN and token != Config.API_TOKEN:
            return jsonify({'error': 'Invalid authentication token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function


# Request logging middleware
@app.before_request
def log_request():
    """Log all incoming requests"""
    logger.info(f"{request.method} {request.path} - {request.remote_addr}")


# Error handlers
@app.errorhandler(400)
def bad_request(error):
    """Handle 400 Bad Request errors"""
    return jsonify({'error': 'Bad request', 'message': str(error)}), 400


@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors"""
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server Error"""
    logger.error(f"Internal server error: {error}")
    logger.error(traceback.format_exc())
    return jsonify({'error': 'Internal server error'}), 500


# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'ml-prediction-service'
    }), 200


# Prediction endpoints
@app.route('/api/predictions/<int:machine_id>', methods=['GET'])
@require_auth
def get_prediction(machine_id):
    """
    Get latest prediction for a specific machine
    
    Args:
        machine_id: Machine ID (integer)
        
    Returns:
        JSON with prediction data
    """
    try:
        # Connect to database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT 
                machine_id,
                prediction_date,
                failure_probability_7d,
                failure_probability_14d,
                failure_probability_30d,
                risk_level,
                model_version,
                contributing_factors,
                confidence_score,
                created_at
            FROM predictions
            WHERE machine_id = %s
            ORDER BY prediction_date DESC
            LIMIT 1
        """, (machine_id,))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not result:
            return jsonify({'error': 'Prediction not found for this machine'}), 404
        
        # Convert to dict and format dates
        prediction = dict(result)
        prediction['prediction_date'] = prediction['prediction_date'].isoformat() if prediction['prediction_date'] else None
        prediction['created_at'] = prediction['created_at'].isoformat() if prediction['created_at'] else None
        
        return jsonify(prediction), 200
        
    except Exception as e:
        logger.error(f"Failed to get prediction: {e}")
        return jsonify({'error': 'Failed to retrieve prediction', 'details': str(e)}), 500


@app.route('/api/predictions/high-risk', methods=['GET'])
@require_auth
def get_high_risk_machines():
    """
    Get all machines with HIGH or CRITICAL risk level
    
    Returns:
        JSON with list of high-risk machines
    """
    try:
        # Connect to database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get latest prediction for each machine with HIGH or CRITICAL risk
        cursor.execute("""
            SELECT DISTINCT ON (machine_id)
                machine_id,
                prediction_date,
                failure_probability_7d,
                failure_probability_14d,
                failure_probability_30d,
                risk_level,
                model_version,
                created_at
            FROM predictions
            WHERE risk_level IN ('HIGH', 'CRITICAL')
            ORDER BY machine_id, prediction_date DESC
        """)
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert to list of dicts and format dates
        machines = []
        for row in results:
            machine = dict(row)
            machine['prediction_date'] = machine['prediction_date'].isoformat() if machine['prediction_date'] else None
            machine['created_at'] = machine['created_at'].isoformat() if machine['created_at'] else None
            machines.append(machine)
        
        return jsonify({
            'machines': machines,
            'count': len(machines)
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get high-risk machines: {e}")
        return jsonify({'error': 'Failed to retrieve high-risk machines', 'details': str(e)}), 500


# Anomaly endpoints
@app.route('/api/anomalies', methods=['GET'])
@require_auth
def get_anomalies():
    """
    Get recent anomalies with optional filtering
    
    Query parameters:
        days: Number of days to look back (default: 7)
        severity: Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
        machine_id: Filter by machine ID
        
    Returns:
        JSON with list of anomalies
    """
    try:
        # Get query parameters
        days = request.args.get('days', 7, type=int)
        severity = request.args.get('severity', None, type=str)
        machine_id = request.args.get('machine_id', None, type=int)
        
        # Validate severity
        if severity and severity not in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
            return jsonify({'error': 'Invalid severity level'}), 400
        
        # Calculate cutoff date
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Connect to database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Build query with filters
        query = """
            SELECT 
                id,
                machine_id,
                detected_at,
                anomaly_type,
                severity,
                metric_name,
                metric_value,
                expected_range,
                anomaly_score,
                created_at
            FROM anomalies
            WHERE detected_at >= %s
        """
        params = [cutoff_date]
        
        if severity:
            query += " AND severity = %s"
            params.append(severity)
        
        if machine_id:
            query += " AND machine_id = %s"
            params.append(machine_id)
        
        # Sort by severity (CRITICAL first) then by detected_at
        query += """
            ORDER BY 
                CASE severity
                    WHEN 'CRITICAL' THEN 1
                    WHEN 'HIGH' THEN 2
                    WHEN 'MEDIUM' THEN 3
                    WHEN 'LOW' THEN 4
                END,
                detected_at DESC
        """
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert to list of dicts and format dates
        anomalies = []
        for row in results:
            anomaly = dict(row)
            anomaly['detected_at'] = anomaly['detected_at'].isoformat() if anomaly['detected_at'] else None
            anomaly['created_at'] = anomaly['created_at'].isoformat() if anomaly['created_at'] else None
            # Convert Decimal to float
            if anomaly['metric_value'] is not None:
                anomaly['metric_value'] = float(anomaly['metric_value'])
            if anomaly['anomaly_score'] is not None:
                anomaly['anomaly_score'] = float(anomaly['anomaly_score'])
            anomalies.append(anomaly)
        
        return jsonify({
            'anomalies': anomalies,
            'count': len(anomalies),
            'filters': {
                'days': days,
                'severity': severity,
                'machine_id': machine_id
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get anomalies: {e}")
        return jsonify({'error': 'Failed to retrieve anomalies', 'details': str(e)}), 500


# Model management endpoints
@app.route('/api/ml/models', methods=['GET'])
@require_auth
def get_models():
    """
    Get list of all models with their metrics
    
    Query parameters:
        model_type: Filter by model type (random_forest, isolation_forest)
        
    Returns:
        JSON with list of models
    """
    try:
        model_type = request.args.get('model_type', None, type=str)
        
        # Validate model_type
        if model_type and model_type not in ['random_forest', 'isolation_forest']:
            return jsonify({'error': 'Invalid model type'}), 400
        
        # Use ModelRegistry to list models
        with ModelRegistry() as registry:
            models = registry.list_models(model_type=model_type)
        
        # Format dates and convert Decimals to floats
        for model in models:
            if model.get('trained_at'):
                model['trained_at'] = model['trained_at'].isoformat()
            if model.get('created_at'):
                model['created_at'] = model['created_at'].isoformat()
            
            # Convert Decimal metrics to float
            for metric in ['accuracy', 'precision_score', 'recall', 'f1_score']:
                if model.get(metric) is not None:
                    model[metric] = float(model[metric])
        
        return jsonify({
            'models': models,
            'count': len(models)
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        return jsonify({'error': 'Failed to retrieve models', 'details': str(e)}), 500


@app.route('/api/ml/train', methods=['POST'])
@require_auth
def trigger_training():
    """
    Trigger model retraining (async)
    
    Request body:
        {
            "data_window_days": 90,
            "model_type": "random_forest",
            "hyperparameters": {}
        }
        
    Returns:
        JSON with job ID and status
    """
    try:
        # Get request data
        data = request.get_json() or {}
        
        days = data.get('data_window_days', 90)
        model_type = data.get('model_type', 'random_forest')
        hyperparameters = data.get('hyperparameters', None)
        
        # Validate inputs
        if model_type not in ['random_forest', 'isolation_forest']:
            return jsonify({'error': 'Invalid model type'}), 400
        
        if days < 7 or days > 365:
            return jsonify({'error': 'data_window_days must be between 7 and 365'}), 400
        
        # For now, run training synchronously
        # In production, this should be async (using Celery, RQ, or similar)
        logger.info(f"Starting training job: type={model_type}, days={days}")
        
        try:
            with TrainingPipeline() as pipeline:
                result = pipeline.run(
                    days=days,
                    model_type=model_type,
                    params=hyperparameters,
                    auto_activate=True
                )
            
            return jsonify({
                'job_id': result['model_id'],
                'status': 'completed',
                'message': 'Training completed successfully',
                'result': {
                    'model_id': result['model_id'],
                    'accuracy': result['metrics']['accuracy'],
                    'training_samples': result['training_samples'],
                    'test_samples': result['test_samples']
                }
            }), 200
            
        except Exception as training_error:
            logger.error(f"Training failed: {training_error}")
            return jsonify({
                'job_id': None,
                'status': 'failed',
                'message': f'Training failed: {str(training_error)}'
            }), 500
        
    except Exception as e:
        logger.error(f"Failed to trigger training: {e}")
        return jsonify({'error': 'Failed to trigger training', 'details': str(e)}), 500


# Run the application
if __name__ == '__main__':
    logger.info("Starting ML Prediction Service API...")
    logger.info(f"Environment: {Config.FLASK_ENV}")
    logger.info(f"Port: {Config.FLASK_PORT}")
    
    app.run(
        host='0.0.0.0',
        port=Config.FLASK_PORT,
        debug=(Config.FLASK_ENV == 'development')
    )
'''

# Write the file
with open('src/app.py', 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Flask app created successfully at src/app.py")
