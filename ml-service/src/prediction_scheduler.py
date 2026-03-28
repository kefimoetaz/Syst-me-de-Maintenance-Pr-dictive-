"""
Prediction Scheduler for ML Predictive Maintenance
Automates daily prediction runs using APScheduler
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import time

from src.config import Config
from src.logger import logger
from src.predictor import Predictor
from src.model_registry import ModelRegistry
from src.feature_extractor import FeatureExtractor
from src.alert_notifier import AlertNotifier


class PredictionScheduler:
    """
    Manages scheduled prediction jobs using APScheduler
    """
    
    def __init__(self):
        """Initialize scheduler"""
        self.scheduler = BackgroundScheduler()
        self.conn = None
        self.last_run_timestamp = None
        self.job_start_time = None
        self._connect_db()
    
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
            logger.info("PredictionScheduler connected to database")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def schedule_daily_predictions(self, hour=None, minute=None):
        """
        Schedule daily predictions at specified time
        
        Args:
            hour: Hour to run (0-23), defaults to Config.PREDICTION_SCHEDULE_HOUR
            minute: Minute to run (0-59), defaults to Config.PREDICTION_SCHEDULE_MINUTE
        """
        if hour is None:
            hour = Config.PREDICTION_SCHEDULE_HOUR
        if minute is None:
            minute = Config.PREDICTION_SCHEDULE_MINUTE
        
        # Create cron trigger for daily execution
        trigger = CronTrigger(hour=hour, minute=minute)
        
        # Add job to scheduler
        self.scheduler.add_job(
            func=self.run_prediction_job,
            trigger=trigger,
            id='daily_predictions',
            name='Daily Prediction Job',
            replace_existing=True,
            max_instances=1  # Prevent concurrent runs
        )
        
        logger.info(f"Scheduled daily predictions at {hour:02d}:{minute:02d}")

    def run_prediction_job(self):
        """
        Execute prediction job for all active machines
        Uses PostgreSQL advisory lock to prevent duplicate runs
        
        Returns:
            Dictionary with job results
        """
        # Try to acquire distributed lock
        lock_acquired = self._acquire_lock()
        
        if not lock_acquired:
            logger.warning("Could not acquire distributed lock - another instance is running predictions")
            return {
                'status': 'skipped',
                'reason': 'Another instance is already running predictions'
            }
        
        try:
            self.job_start_time = datetime.now()
            logger.info("=" * 80)
            logger.info("STARTING SCHEDULED PREDICTION JOB")
            logger.info(f"Start time: {self.job_start_time.isoformat()}")
            logger.info("=" * 80)
            
            # Schedule a warning check for long-running jobs (30 minutes)
            warning_time = self.job_start_time + timedelta(minutes=30)
            self.scheduler.add_job(
                func=self._check_long_running_job,
                trigger='date',
                run_date=warning_time,
                id='long_running_warning',
                name='Long Running Job Warning',
                replace_existing=True
            )
            
            # Get all active machines
            machine_ids = self._get_active_machines()
            
            if not machine_ids:
                logger.warning("No active machines found")
                return {
                    'status': 'completed',
                    'machines_processed': 0,
                    'high_risk_count': 0,
                    'errors': 0
                }
            
            logger.info(f"Processing {len(machine_ids)} machines...")
            
            # Initialize components
            predictor = Predictor()
            model_registry = ModelRegistry()
            feature_extractor = FeatureExtractor()
            alert_notifier = AlertNotifier()
            
            # Get active model
            model, model_metadata = model_registry.get_active_model('random_forest')
            
            if model is None:
                logger.error("No active model found - cannot generate predictions")
                return {
                    'status': 'failed',
                    'error': 'No active model available',
                    'machines_processed': 0
                }
            
            logger.info(f"Using model: {model_metadata['model_id']}")

            # Process each machine
            predictions = []
            errors = 0
            high_risk_count = 0
            
            for machine_id in machine_ids:
                try:
                    # Extract features
                    end_date = datetime.now()
                    start_date = end_date - timedelta(days=30)
                    
                    features_df = feature_extractor.extract_features(
                        machine_id=machine_id,
                        start_date=start_date,
                        end_date=end_date
                    )
                    
                    if features_df.empty:
                        logger.warning(f"No features for machine {machine_id}, skipping")
                        continue
                    
                    # Generate prediction
                    # Get the latest feature row
                    latest_features = features_df.iloc[-1:].copy()
                    
                    # Drop non-feature columns
                    drop_columns = ['machine_id', 'timestamp']
                    feature_vector = latest_features.drop(
                        columns=[col for col in drop_columns if col in latest_features.columns]
                    )
                    
                    # Fill NaN values
                    feature_vector = feature_vector.fillna(0)
                    
                    # Predict
                    prediction_proba = model.predict_proba(feature_vector)[0]
                    
                    # Handle both binary and single-class predictions
                    if len(prediction_proba) > 1:
                        failure_probability = prediction_proba[1] * 100  # Probability of class 1 (failure)
                    else:
                        # Single class - use prediction directly
                        prediction = model.predict(feature_vector)[0]
                        failure_probability = prediction * 100
                    
                    # Calculate probabilities for different windows
                    failure_probability_7d = failure_probability * 0.7
                    failure_probability_14d = failure_probability * 0.85
                    failure_probability_30d = failure_probability
                    
                    # Calculate risk level
                    if failure_probability_30d >= 70:
                        risk_level = 'CRITICAL'
                        high_risk_count += 1
                    elif failure_probability_30d >= 50:
                        risk_level = 'HIGH'
                        high_risk_count += 1
                    elif failure_probability_30d >= 30:
                        risk_level = 'MEDIUM'
                    else:
                        risk_level = 'LOW'

                    # Get contributing factors
                    if hasattr(model, 'feature_importances_'):
                        feature_importance = model.feature_importances_
                        feature_names = feature_vector.columns.tolist()
                        
                        # Get top 5 features
                        importance_pairs = list(zip(feature_names, feature_importance))
                        importance_pairs.sort(key=lambda x: x[1], reverse=True)
                        top_features = importance_pairs[:5]
                        
                        contributing_factors = [
                            {
                                'feature': name,
                                'importance': float(importance),
                                'value': float(feature_vector[name].iloc[0])
                            }
                            for name, importance in top_features
                        ]
                    else:
                        contributing_factors = []
                    
                    # Store prediction
                    self._store_prediction(
                        machine_id=machine_id,
                        failure_probability_7d=failure_probability_7d,
                        failure_probability_14d=failure_probability_14d,
                        failure_probability_30d=failure_probability_30d,
                        risk_level=risk_level,
                        model_version=model_metadata['model_id'],
                        contributing_factors=contributing_factors
                    )
                    
                    # Send alert for HIGH/CRITICAL risk
                    if risk_level in ['HIGH', 'CRITICAL']:
                        try:
                            # Get machine hostname
                            cursor = self.conn.cursor()
                            cursor.execute("SELECT hostname FROM machines WHERE id = %s", (machine_id,))
                            result = cursor.fetchone()
                            hostname = result[0] if result else f"Machine-{machine_id}"
                            cursor.close()
                            
                            # Send alert
                            alert_notifier.send_prediction_alert(
                                machine_id=machine_id,
                                hostname=hostname,
                                prediction_data={
                                    'failure_probability_7d': failure_probability_7d,
                                    'failure_probability_14d': failure_probability_14d,
                                    'failure_probability_30d': failure_probability_30d,
                                    'risk_level': risk_level,
                                    'model_version': model_metadata['model_id'],
                                    'contributing_factors': contributing_factors
                                }
                            )
                        except Exception as alert_error:
                            logger.error(f"Failed to send alert for machine {machine_id}: {alert_error}")
                    
                    predictions.append({
                        'machine_id': machine_id,
                        'risk_level': risk_level,
                        'failure_probability_30d': failure_probability_30d
                    })
                    
                    logger.info(f"Machine {machine_id}: {risk_level} risk ({failure_probability_30d:.2f}%)")
                    
                except Exception as e:
                    logger.error(f"Failed to process machine {machine_id}: {e}")
                    errors += 1
                    continue

            # Close connections
            predictor.close()
            model_registry.close()
            feature_extractor.close()
            
            # Cancel long-running warning since job completed
            try:
                self.scheduler.remove_job('long_running_warning')
            except:
                pass  # Job may have already fired or been removed
            
            # Update last run timestamp
            self.last_run_timestamp = datetime.now()
            
            # Calculate duration
            duration = (self.last_run_timestamp - self.job_start_time).total_seconds()
            
            # Generate summary
            result = {
                'status': 'completed',
                'start_time': self.job_start_time.isoformat(),
                'end_time': self.last_run_timestamp.isoformat(),
                'duration_seconds': duration,
                'machines_processed': len(predictions),
                'high_risk_count': high_risk_count,
                'errors': errors
            }
            
            logger.info("=" * 80)
            logger.info("PREDICTION JOB COMPLETED")
            logger.info(f"Machines processed: {len(predictions)}")
            logger.info(f"High-risk machines: {high_risk_count}")
            logger.info(f"Errors: {errors}")
            logger.info(f"Duration: {duration:.2f} seconds")
            logger.info("=" * 80)
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction job failed: {e}")
            logger.error("Scheduling retry in 1 hour...")
            
            # Schedule retry
            retry_time = datetime.now() + timedelta(hours=1)
            self.scheduler.add_job(
                func=self.run_prediction_job,
                trigger='date',
                run_date=retry_time,
                id='prediction_retry',
                name='Prediction Job Retry',
                replace_existing=True
            )
            
            return {
                'status': 'failed',
                'error': str(e),
                'retry_scheduled': retry_time.isoformat()
            }
        
        finally:
            # Always release the lock
            self._release_lock()

    def _acquire_lock(self, lock_id=12345):
        """
        Acquire PostgreSQL advisory lock for distributed locking
        
        Args:
            lock_id: Unique integer identifier for the lock
            
        Returns:
            True if lock acquired, False otherwise
        """
        try:
            cursor = self.conn.cursor()
            # Try to acquire lock (non-blocking)
            cursor.execute("SELECT pg_try_advisory_lock(%s)", (lock_id,))
            result = cursor.fetchone()[0]
            cursor.close()
            
            if result:
                logger.info(f"Acquired distributed lock {lock_id}")
            else:
                logger.warning(f"Failed to acquire distributed lock {lock_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error acquiring lock: {e}")
            return False
    
    def _release_lock(self, lock_id=12345):
        """
        Release PostgreSQL advisory lock
        
        Args:
            lock_id: Unique integer identifier for the lock
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT pg_advisory_unlock(%s)", (lock_id,))
            result = cursor.fetchone()[0]
            cursor.close()
            
            if result:
                logger.info(f"Released distributed lock {lock_id}")
            else:
                logger.warning(f"Lock {lock_id} was not held by this session")
            
        except Exception as e:
            logger.error(f"Error releasing lock: {e}")

    def _get_active_machines(self):
        """
        Get list of all active machines from database
        
        Returns:
            List of machine IDs
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT id FROM machines")
            results = cursor.fetchall()
            cursor.close()
            
            machine_ids = [row[0] for row in results]
            return machine_ids
            
        except Exception as e:
            logger.error(f"Failed to get active machines: {e}")
            return []
    
    def _store_prediction(self, machine_id, failure_probability_7d, failure_probability_14d,
                         failure_probability_30d, risk_level, model_version, contributing_factors):
        """
        Store prediction in database
        
        Args:
            machine_id: Machine ID
            failure_probability_7d: 7-day failure probability
            failure_probability_14d: 14-day failure probability
            failure_probability_30d: 30-day failure probability
            risk_level: Risk level (LOW, MEDIUM, HIGH, CRITICAL)
            model_version: Model version used
            contributing_factors: List of contributing factors
        """
        try:
            import json
            import numpy as np
            
            # Convert numpy types to Python native types
            def convert_to_native(val):
                """Convert numpy types to Python native types"""
                if isinstance(val, (np.integer, np.int64, np.int32)):
                    return int(val)
                elif isinstance(val, (np.floating, np.float64, np.float32)):
                    return float(val)
                elif isinstance(val, np.ndarray):
                    return val.tolist()
                return val
            
            # Convert all numeric values
            machine_id = convert_to_native(machine_id)
            failure_probability_7d = convert_to_native(failure_probability_7d)
            failure_probability_14d = convert_to_native(failure_probability_14d)
            failure_probability_30d = convert_to_native(failure_probability_30d)
            
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO predictions (
                    machine_id, prediction_date,
                    failure_probability_7d, failure_probability_14d, failure_probability_30d,
                    risk_level, model_version, contributing_factors
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                machine_id,
                datetime.now(),
                failure_probability_7d,
                failure_probability_14d,
                failure_probability_30d,
                risk_level,
                model_version,
                json.dumps(contributing_factors) if contributing_factors else None
            ))
            self.conn.commit()
            cursor.close()
            
        except Exception as e:
            logger.error(f"Failed to store prediction for machine {machine_id}: {e}")
            if self.conn:
                self.conn.rollback()

    def _check_long_running_job(self):
        """
        Check if prediction job is still running after 30 minutes
        Send notification if job is taking too long
        """
        if self.job_start_time:
            duration = (datetime.now() - self.job_start_time).total_seconds() / 60
            
            if duration >= 30:
                logger.warning("=" * 80)
                logger.warning("LONG-RUNNING JOB DETECTED")
                logger.warning(f"Prediction job has been running for {duration:.1f} minutes")
                logger.warning(f"Started at: {self.job_start_time.isoformat()}")
                logger.warning("This may indicate a performance issue or stuck process")
                logger.warning("=" * 80)
                
                # TODO: Send email/Slack notification here
                # This would be implemented in Task 13.3

    def start(self):
        """Start the scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler stopped")
        
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def get_job_status(self, job_id='daily_predictions'):
        """
        Get status of a scheduled job
        
        Args:
            job_id: Job identifier
            
        Returns:
            Dictionary with job status
        """
        job = self.scheduler.get_job(job_id)
        
        if job is None:
            return {'status': 'not_found'}
        
        # Get next run time safely
        next_run = None
        if hasattr(job, 'next_run_time') and job.next_run_time:
            next_run = job.next_run_time.isoformat()
        elif hasattr(job, 'trigger') and hasattr(job.trigger, 'get_next_fire_time'):
            try:
                from datetime import datetime
                next_fire = job.trigger.get_next_fire_time(None, datetime.now())
                if next_fire:
                    next_run = next_fire.isoformat()
            except:
                pass
        
        # Build status response
        status = {
            'job_id': job.id,
            'name': job.name,
            'next_run_time': next_run,
            'last_run_timestamp': self.last_run_timestamp.isoformat() if self.last_run_timestamp else None
        }
        
        # Add current job duration if running
        if self.job_start_time and not self.last_run_timestamp:
            duration = (datetime.now() - self.job_start_time).total_seconds()
            status['current_job_duration_seconds'] = duration
            status['current_job_status'] = 'running'
        elif self.job_start_time and self.last_run_timestamp:
            # Calculate last job duration
            duration = (self.last_run_timestamp - self.job_start_time).total_seconds()
            status['last_job_duration_seconds'] = duration
            status['current_job_status'] = 'idle'
        
        return status
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.stop()
