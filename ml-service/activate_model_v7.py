"""
Activate model v7 (trained with scikit-learn 1.7.2)
"""
import psycopg2
from src.config import Config

def activate_model():
    conn = psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    
    cursor = conn.cursor()
    
    # Deactivate all models
    cursor.execute("UPDATE ml_models SET is_active = false")
    
    # Activate model v7
    cursor.execute("UPDATE ml_models SET is_active = true WHERE model_id = 'random_forest_v7_20260212'")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("✅ Model v7 activated successfully!")

if __name__ == '__main__':
    activate_model()
