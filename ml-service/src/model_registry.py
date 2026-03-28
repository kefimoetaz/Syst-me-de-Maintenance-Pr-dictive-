"""
Model Registry for ML Predictive Maintenance
Manages storage, versioning, and retrieval of trained models
"""
import os
import joblib
import json
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from src.config import Config
from src.logger import logger


class ModelRegistry:
    """
    Manages ML model storage with versioning and metadata
    """
    
    def __init__(self):
        """Initialize model registry with database connection"""
        self.conn = None
        self.model_path = Config.MODEL_PATH
        self._connect_db()
        self._ensure_model_directory()
    
    def _connect_db(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(
                host=Config.DB_HOST,
                port=Config.DB_PORT,
                database=Config.DB_NAME,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD
            )
            logger.info("Connected to database for model registry")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def _ensure_model_directory(self):
        """Create model directory if it doesn't exist"""
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path)
            logger.info(f"Created model directory: {self.model_path}")
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def get_next_version(self, model_type):
        """
        Get the next version number for a model type
        
        Args:
            model_type: Type of model ('random_forest' or 'isolation_forest')
            
        Returns:
            Next version number (integer)
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute(
                "SELECT MAX(version) FROM ml_models WHERE model_type = %s",
                (model_type,)
            )
            result = cursor.fetchone()
            cursor.close()
            
            max_version = result[0] if result[0] is not None else 0
            return max_version + 1
            
        except Exception as e:
            logger.error(f"Failed to get next version: {e}")
            return 1
    
    def save_model(self, model, model_type, metrics, params=None):
        """
        Save model to file system and register in database
        
        Args:
            model: Trained model object
            model_type: Type of model ('random_forest' or 'isolation_forest')
            metrics: Dictionary of evaluation metrics
            params: Optional model hyperparameters
            
        Returns:
            model_id (string)
        """
        try:
            # Get next version
            version = self.get_next_version(model_type)
            
            # Generate model ID
            timestamp = datetime.now().strftime('%Y%m%d')
            model_id = f"{model_type}_v{version}_{timestamp}"
            
            # Generate file path
            file_name = f"{model_id}.joblib"
            file_path = os.path.join(self.model_path, file_name)
            
            # Save model to file (compressed)
            joblib.dump(model, file_path, compress=3)
            logger.info(f"Model saved to: {file_path}")
            
            # Insert metadata into database
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO ml_models (
                    model_id, model_type, version, trained_at,
                    accuracy, precision_score, recall, f1_score,
                    parameters, file_path, is_active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                model_id,
                model_type,
                version,
                datetime.now(),
                metrics.get('accuracy'),
                metrics.get('precision'),
                metrics.get('recall'),
                metrics.get('f1_score'),
                json.dumps(params) if params else None,
                file_path,
                False  # Not active by default
            ))
            self.conn.commit()
            cursor.close()
            
            logger.info(f"Model registered in database: {model_id}")
            
            return model_id
            
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
            if self.conn:
                self.conn.rollback()
            raise
    
    def load_model(self, model_id):
        """
        Load model from file system by model_id
        
        Args:
            model_id: Model identifier
            
        Returns:
            Loaded model object
        """
        try:
            # Get file path from database
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                "SELECT file_path FROM ml_models WHERE model_id = %s",
                (model_id,)
            )
            result = cursor.fetchone()
            cursor.close()
            
            if not result:
                raise ValueError(f"Model not found: {model_id}")
            
            file_path = result['file_path']
            
            # Load model from file
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Model file not found: {file_path}")
            
            model = joblib.load(file_path)
            logger.info(f"Model loaded: {model_id}")
            
            return model
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def get_active_model(self, model_type):
        """
        Get the currently active model for a model type
        
        Args:
            model_type: Type of model ('random_forest' or 'isolation_forest')
            
        Returns:
            Tuple of (model_object, model_metadata)
        """
        try:
            # Get active model metadata
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT * FROM ml_models 
                WHERE model_type = %s AND is_active = TRUE
                ORDER BY version DESC
                LIMIT 1
            """, (model_type,))
            result = cursor.fetchone()
            cursor.close()
            
            if not result:
                logger.warning(f"No active model found for type: {model_type}")
                return None, None
            
            # Load model
            model = self.load_model(result['model_id'])
            
            return model, dict(result)
            
        except Exception as e:
            logger.error(f"Failed to get active model: {e}")
            raise
    
    def set_active_model(self, model_id):
        """
        Set a model as active (deactivates other models of same type)
        
        Args:
            model_id: Model identifier to activate
            
        Returns:
            Boolean success status
        """
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            # Get model type
            cursor.execute(
                "SELECT model_type FROM ml_models WHERE model_id = %s",
                (model_id,)
            )
            result = cursor.fetchone()
            
            if not result:
                raise ValueError(f"Model not found: {model_id}")
            
            model_type = result['model_type']
            
            # Deactivate all models of this type
            cursor.execute(
                "UPDATE ml_models SET is_active = FALSE WHERE model_type = %s",
                (model_type,)
            )
            
            # Activate the specified model
            cursor.execute(
                "UPDATE ml_models SET is_active = TRUE WHERE model_id = %s",
                (model_id,)
            )
            
            self.conn.commit()
            cursor.close()
            
            logger.info(f"Model activated: {model_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to set active model: {e}")
            if self.conn:
                self.conn.rollback()
            raise
    
    def list_models(self, model_type=None):
        """
        List all models, optionally filtered by type
        
        Args:
            model_type: Optional model type filter
            
        Returns:
            List of model metadata dictionaries
        """
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            if model_type:
                cursor.execute("""
                    SELECT * FROM ml_models 
                    WHERE model_type = %s
                    ORDER BY version DESC
                """, (model_type,))
            else:
                cursor.execute("""
                    SELECT * FROM ml_models 
                    ORDER BY model_type, version DESC
                """)
            
            results = cursor.fetchall()
            cursor.close()
            
            models = [dict(row) for row in results]
            
            logger.info(f"Found {len(models)} models")
            
            return models
            
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            raise
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
