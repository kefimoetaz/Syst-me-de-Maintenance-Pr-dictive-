"""
Alert Notifier for ML Predictions
Sends alerts to backend API when HIGH/CRITICAL risk is detected
"""
import requests
from datetime import datetime
from src.config import Config
from src.logger import logger


class AlertNotifier:
    """
    Sends alert notifications to backend API
    """
    
    def __init__(self):
        """Initialize alert notifier"""
        self.backend_url = Config.BACKEND_URL or 'http://localhost:3000'
        self.api_token = Config.API_TOKEN or 'dev-token-12345'
    
    def send_prediction_alert(self, machine_id, hostname, prediction_data):
        """
        Send alert for HIGH or CRITICAL prediction
        
        Args:
            machine_id: Machine ID
            hostname: Machine hostname
            prediction_data: Dictionary with prediction results
        """
        try:
            risk_level = prediction_data.get('risk_level')
            failure_prob_30d = prediction_data.get('failure_probability_30d', 0)
            
            # Only send alerts for HIGH and CRITICAL
            if risk_level not in ['HIGH', 'CRITICAL']:
                return
            
            # Prepare alert data
            alert_data = {
                'machine_id': int(machine_id),
                'alert_type': 'PREDICTION',
                'severity': risk_level,
                'title': f'{risk_level} Risk Prediction for {hostname}',
                'message': self._generate_message(hostname, prediction_data),
                'details': {
                    'failure_probability_7d': prediction_data.get('failure_probability_7d'),
                    'failure_probability_14d': prediction_data.get('failure_probability_14d'),
                    'failure_probability_30d': failure_prob_30d,
                    'risk_level': risk_level,
                    'model_version': prediction_data.get('model_version'),
                    'contributing_factors': prediction_data.get('contributing_factors', [])[:3]  # Top 3
                }
            }
            
            # Send to backend API
            response = requests.post(
                f'{self.backend_url}/api/alerts',
                json=alert_data,
                headers={
                    'Authorization': f'Bearer {self.api_token}',
                    'Content-Type': 'application/json'
                },
                timeout=5
            )
            
            if response.status_code == 201:
                logger.info(f"Alert sent successfully for machine {machine_id} ({hostname})")
            else:
                logger.warning(f"Failed to send alert: {response.status_code} - {response.text}")
        
        except Exception as e:
            logger.error(f"Failed to send alert for machine {machine_id}: {e}")
    
    def _generate_message(self, hostname, prediction_data):
        """Generate alert message"""
        risk_level = prediction_data.get('risk_level')
        failure_prob_30d = prediction_data.get('failure_probability_30d', 0)
        
        if risk_level == 'CRITICAL':
            message = f"⚠️ CRITICAL: Machine {hostname} has a {failure_prob_30d:.1f}% probability of failure within 30 days. Immediate attention required!"
        else:  # HIGH
            message = f"⚠️ HIGH RISK: Machine {hostname} has a {failure_prob_30d:.1f}% probability of failure within 30 days. Please schedule maintenance soon."
        
        # Add top contributing factors
        factors = prediction_data.get('contributing_factors', [])
        if factors:
            message += "\n\nTop contributing factors:"
            for i, factor in enumerate(factors[:3], 1):
                feature_name = factor.get('feature', 'Unknown')
                message += f"\n{i}. {feature_name}"
        
        return message
    
    def send_anomaly_alert(self, machine_id, hostname, anomaly_data):
        """
        Send alert for detected anomaly
        
        Args:
            machine_id: Machine ID
            hostname: Machine hostname
            anomaly_data: Dictionary with anomaly details
        """
        try:
            severity = anomaly_data.get('severity', 'MEDIUM')
            
            # Only send alerts for HIGH and CRITICAL anomalies
            if severity not in ['HIGH', 'CRITICAL']:
                return
            
            alert_data = {
                'machine_id': int(machine_id),
                'alert_type': 'ANOMALY',
                'severity': severity,
                'title': f'Anomaly Detected on {hostname}',
                'message': self._generate_anomaly_message(hostname, anomaly_data),
                'details': {
                    'anomaly_type': anomaly_data.get('anomaly_type'),
                    'metric_name': anomaly_data.get('metric_name'),
                    'metric_value': anomaly_data.get('metric_value'),
                    'expected_range': anomaly_data.get('expected_range'),
                    'anomaly_score': anomaly_data.get('anomaly_score')
                }
            }
            
            response = requests.post(
                f'{self.backend_url}/api/alerts',
                json=alert_data,
                headers={
                    'Authorization': f'Bearer {self.api_token}',
                    'Content-Type': 'application/json'
                },
                timeout=5
            )
            
            if response.status_code == 201:
                logger.info(f"Anomaly alert sent for machine {machine_id} ({hostname})")
            else:
                logger.warning(f"Failed to send anomaly alert: {response.status_code}")
        
        except Exception as e:
            logger.error(f"Failed to send anomaly alert for machine {machine_id}: {e}")
    
    def _generate_anomaly_message(self, hostname, anomaly_data):
        """Generate anomaly alert message"""
        metric_name = anomaly_data.get('metric_name', 'Unknown metric')
        metric_value = anomaly_data.get('metric_value', 0)
        severity = anomaly_data.get('severity', 'MEDIUM')
        
        message = f"Anomaly detected on {hostname}: {metric_name} = {metric_value}"
        
        if severity == 'CRITICAL':
            message = f"🔴 CRITICAL ANOMALY: " + message
        else:
            message = f"🟠 HIGH ANOMALY: " + message
        
        expected_range = anomaly_data.get('expected_range')
        if expected_range:
            message += f"\nExpected range: {expected_range}"
        
        return message
