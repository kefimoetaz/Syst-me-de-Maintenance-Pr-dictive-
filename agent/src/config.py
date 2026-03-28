"""
Configuration loader and logging setup
Requirements: 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5
"""

import json
import logging
import os
from logging.handlers import RotatingFileHandler
from typing import Dict


def load_config(config_path: str = 'config.json') -> Dict:
    """
    Load configuration from JSON file
    Creates default config if missing or invalid
    
    Requirements: 1.3, 1.4, 1.5
    """
    default_config = {
        "api_url": "http://localhost:3000/api/data",
        "token": "your_agent_token_here",
        "agent_id": "00000000-0000-0000-0000-000000000000",
        "collection_interval_hours": 1,
        "log_file": "agent.log",
        "log_level": "INFO",
        "max_log_size_mb": 10
    }
    
    try:
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
                
            # Validate required fields
            required_fields = ['api_url', 'token', 'agent_id']
            for field in required_fields:
                if field not in config:
                    logging.warning(f"Missing required field '{field}', using default")
                    config[field] = default_config[field]
            
            # Merge with defaults for optional fields
            for key, value in default_config.items():
                if key not in config:
                    config[key] = value
            
            return config
        else:
            # Config file doesn't exist, create default
            logging.error(f"Config file '{config_path}' not found, creating default")
            with open(config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            
            return default_config
            
    except json.JSONDecodeError as e:
        logging.error(f"Invalid JSON in config file: {e}")
        logging.error("Creating default config file")
        
        # Backup invalid config
        if os.path.exists(config_path):
            backup_path = f"{config_path}.backup"
            os.rename(config_path, backup_path)
            logging.info(f"Invalid config backed up to {backup_path}")
        
        # Create default config
        with open(config_path, 'w') as f:
            json.dump(default_config, f, indent=2)
        
        return default_config
    
    except Exception as e:
        logging.error(f"Error loading config: {e}")
        return default_config


def setup_logging(log_file: str = 'agent.log', 
                  log_level: str = 'INFO',
                  max_log_size_mb: int = 10):
    """
    Setup logging with rotation
    Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
    """
    # Convert log level string to logging constant
    level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Setup root logger
    logger = logging.getLogger()
    logger.setLevel(level)
    
    # Remove existing handlers
    logger.handlers = []
    
    # File handler with rotation (10MB max, keep 5 backups)
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=max_log_size_mb * 1024 * 1024,
        backupCount=5
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    logging.info("Logging initialized")
    logging.info(f"Log file: {log_file}")
    logging.info(f"Log level: {log_level}")
    logging.info(f"Max log size: {max_log_size_mb}MB")
