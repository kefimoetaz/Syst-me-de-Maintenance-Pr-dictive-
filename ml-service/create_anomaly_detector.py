"""Script to create anomaly_detector.py file"""

anomaly_detector_code = '''"""
Anomaly Detector for ML Predictive Maintenance
Identifies unusual patterns in system metrics
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from scipy import stats

from src.config import Config
from src.logger import logger


class AnomalyDetector:
    """
    Detects anomalies in system metrics using statistical methods
    """
    
    def __init__(self):
        """Initialize anomaly detector with database connection"""
        self.conn = None
        self._connect_db()
    
    def _connect_db(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(
                host=Config.DB_HOST, port=Config.DB_PORT,
                database=Config.DB_NAME, user=Config.DB_USER,
                password=Config.DB_PASSWORD
            )
            logger.info("AnomalyDetector connected to database")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("AnomalyDetector connection closed")
    
    def load_historical_metrics(self, machine_id, metric_name, days=30):
        """Load historical metrics for baseline calculation"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            cursor = self.conn.cursor()
            cursor.execute(f"""
                SELECT created_at, {metric_name}
                FROM system_metrics
                WHERE machine_id = %s
                    AND created_at >= %s
                    AND created_at <= %s
                ORDER BY created_at ASC
            """, (machine_id, start_date, end_date))
            
            results = cursor.fetchall()
            cursor.close()
            
            if not results:
                return pd.Series(dtype=float)
            
            values = [row[1] for row in results]
            return pd.Series(values)
            
        except Exception as e:
            logger.error(f"Failed to load historical metrics: {e}")
            return pd.Series(dtype=float)
    
    def detect_anomaly(self, machine_id, metric_name, current_value, historical_data=None):
        """
        Detect if current value is anomalous
        
        Args:
            machine_id: Machine ID
            metric_name: Name of metric (cpu_usage, memory_usage, disk_usage)
            current_value: Current metric value
            historical_data: Optional historical data (if None, will load from DB)
            
        Returns:
            Dictionary with anomaly detection results
        """
        if historical_data is None or len(historical_data) == 0:
            historical_data = self.load_historical_metrics(machine_id, metric_name)
        
        if len(historical_data) < 10:
            logger.warning(f"Insufficient historical data for {metric_name}")
            return {
                'is_anomaly': False,
                'anomaly_type': None,
                'severity': 'LOW',
                'anomaly_score': 0.0,
                'expected_range': None
            }
        
        # Calculate statistics
        mean = historical_data.mean()
        std = historical_data.std()
        median = historical_data.median()
        q1 = historical_data.quantile(0.25)
        q3 = historical_data.quantile(0.75)
        iqr = q3 - q1
        
        # Z-score method
        z_score = abs((current_value - mean) / std) if std > 0 else 0
        
        # IQR method
        iqr_lower = q1 - 1.5 * iqr
        iqr_upper = q3 + 1.5 * iqr
        
        # Determine if anomaly
        is_anomaly_zscore = z_score > 3
        is_anomaly_iqr = current_value < iqr_lower or current_value > iqr_upper
        is_anomaly = is_anomaly_zscore or is_anomaly_iqr
        
        if not is_anomaly:
            return {
                'is_anomaly': False,
                'anomaly_type': None,
                'severity': 'LOW',
                'anomaly_score': 0.0,
                'expected_range': f"{mean-2*std:.2f}-{mean+2*std:.2f}"
            }
        
        # Classify anomaly type
        anomaly_type = self.classify_anomaly_type(current_value, historical_data)
        
        # Calculate anomaly score (0-100)
        anomaly_score = min(100, z_score * 20)
        
        # Calculate severity
        severity = self.calculate_severity(anomaly_score, metric_name)
        
        # Calculate expected range
        expected_range = f"{mean-2*std:.2f}-{mean+2*std:.2f}"
        
        result = {
            'is_anomaly': True,
            'anomaly_type': anomaly_type,
            'severity': severity,
            'anomaly_score': float(anomaly_score),
            'expected_range': expected_range,
            'z_score': float(z_score),
            'current_value': float(current_value),
            'mean': float(mean),
            'std': float(std)
        }
        
        logger.info(f"Anomaly detected: {metric_name}={current_value:.2f}, type={anomaly_type}, severity={severity}")
        
        return result
    
    def classify_anomaly_type(self, current_value, historical_data):
        """
        Classify the type of anomaly
        
        Returns:
            'spike', 'degradation', or 'erratic_behavior'
        """
        mean = historical_data.mean()
        recent_values = historical_data.tail(24)  # Last 24 hours
        
        # Spike: sudden increase > 2 std deviations
        if current_value > mean + 2 * historical_data.std():
            return 'spike'
        
        # Degradation: gradual decline (check if recent trend is declining)
        if len(recent_values) >= 10:
            recent_mean = recent_values.mean()
            if recent_mean < mean * 0.8:  # 20% below historical mean
                return 'degradation'
        
        # Erratic: high variance in recent window
        if len(recent_values) >= 10:
            recent_cv = recent_values.std() / recent_values.mean() if recent_values.mean() > 0 else 0
            if recent_cv > 0.5:
                return 'erratic_behavior'
        
        return 'spike'  # Default
    
    def calculate_severity(self, anomaly_score, metric_type):
        """
        Calculate severity level based on anomaly score and metric type
        
        Returns:
            'LOW', 'MEDIUM', 'HIGH', or 'CRITICAL'
        """
        # Adjust thresholds based on metric type
        if metric_type == 'disk_usage':
            # Disk anomalies are more critical
            if anomaly_score >= 80:
                return 'CRITICAL'
            elif anomaly_score >= 60:
                return 'HIGH'
            elif anomaly_score >= 40:
                return 'MEDIUM'
            else:
                return 'LOW'
        else:
            # CPU and memory anomalies
            if anomaly_score >= 90:
                return 'CRITICAL'
            elif anomaly_score >= 70:
                return 'HIGH'
            elif anomaly_score >= 50:
                return 'MEDIUM'
            else:
                return 'LOW'
    
    def store_anomaly(self, machine_id, metric_name, anomaly_result):
        """
        Store anomaly in database
        
        Args:
            machine_id: Machine ID
            metric_name: Metric name
            anomaly_result: Anomaly detection result dictionary
            
        Returns:
            Boolean success status
        """
        if not anomaly_result['is_anomaly']:
            return False
        
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO anomalies (
                    machine_id, detected_at, anomaly_type, severity,
                    metric_name, metric_value, expected_range, anomaly_score
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                machine_id,
                datetime.now(),
                anomaly_result['anomaly_type'],
                anomaly_result['severity'],
                metric_name,
                anomaly_result['current_value'],
                anomaly_result['expected_range'],
                anomaly_result['anomaly_score']
            ))
            self.conn.commit()
            cursor.close()
            
            logger.info(f"Anomaly stored for machine {machine_id}, metric {metric_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store anomaly: {e}")
            if self.conn:
                self.conn.rollback()
            return False
    
    def detect_and_store(self, machine_id, metrics):
        """
        Detect anomalies for multiple metrics and store CRITICAL ones
        
        Args:
            machine_id: Machine ID
            metrics: Dictionary of metric_name: value pairs
            
        Returns:
            List of detected anomalies
        """
        anomalies = []
        
        for metric_name, current_value in metrics.items():
            try:
                result = self.detect_anomaly(machine_id, metric_name, current_value)
                
                if result['is_anomaly']:
                    result['machine_id'] = machine_id
                    result['metric_name'] = metric_name
                    anomalies.append(result)
                    
                    # Store CRITICAL anomalies immediately
                    if result['severity'] == 'CRITICAL':
                        self.store_anomaly(machine_id, metric_name, result)
                        
            except Exception as e:
                logger.error(f"Failed to detect anomaly for {metric_name}: {e}")
                continue
        
        return anomalies
    
    def aggregate_anomalies(self, machine_id, time_window_hours=1):
        """
        Aggregate multiple anomalies within time window
        
        Args:
            machine_id: Machine ID
            time_window_hours: Time window in hours
            
        Returns:
            Aggregated anomaly or None
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=time_window_hours)
            
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT * FROM anomalies
                WHERE machine_id = %s
                    AND detected_at >= %s
                ORDER BY detected_at DESC
            """, (machine_id, cutoff_time))
            
            anomalies = cursor.fetchall()
            cursor.close()
            
            if len(anomalies) <= 1:
                return None
            
            # Aggregate: take highest severity
            severity_order = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4}
            max_severity = max(anomalies, key=lambda x: severity_order.get(x['severity'], 0))['severity']
            
            # Calculate average anomaly score
            avg_score = sum(a['anomaly_score'] for a in anomalies) / len(anomalies)
            
            logger.info(f"Aggregated {len(anomalies)} anomalies for machine {machine_id}: severity={max_severity}")
            
            return {
                'machine_id': machine_id,
                'anomaly_count': len(anomalies),
                'max_severity': max_severity,
                'avg_anomaly_score': avg_score,
                'time_window_hours': time_window_hours
            }
            
        except Exception as e:
            logger.error(f"Failed to aggregate anomalies: {e}")
            return None
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
'''

with open('src/anomaly_detector.py', 'w', encoding='utf-8') as f:
    f.write(anomaly_detector_code)

print("anomaly_detector.py created successfully!")
