"""
Configuration management for ML Service
Loads settings from environment variables with validation
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration"""
    
    # Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 5432))
    DB_NAME = os.getenv('DB_NAME', 'predictive_maintenance')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    
    # Flask Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # ML Configuration
    MODEL_PATH = os.getenv('MODEL_PATH', './models')
    PREDICTION_SCHEDULE_HOUR = int(os.getenv('PREDICTION_SCHEDULE_HOUR', 2))
    PREDICTION_SCHEDULE_MINUTE = int(os.getenv('PREDICTION_SCHEDULE_MINUTE', 0))
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'ml-service.log')
    LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', 10485760))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))
    
    # Authentication
    API_TOKEN = os.getenv('API_TOKEN', '')
    
    # Backend API Configuration (for sending alerts)
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3000')
    
    @classmethod
    def validate(cls):
        """Validate required configuration parameters"""
        errors = []
        
        if not cls.DB_PASSWORD:
            errors.append("DB_PASSWORD is required")
        
        if not cls.API_TOKEN:
            errors.append("API_TOKEN is required for production")
        
        if cls.FLASK_ENV == 'production' and cls.SECRET_KEY == 'dev-secret-key-change-in-production':
            errors.append("SECRET_KEY must be changed in production")
        
        if errors:
            raise ValueError(f"Configuration validation failed: {', '.join(errors)}")
        
        return True
    
    @classmethod
    def get_db_connection_string(cls):
        """Get PostgreSQL connection string"""
        return f"postgresql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}"


# Validate configuration on import (only in production)
if Config.FLASK_ENV == 'production':
    Config.validate()
