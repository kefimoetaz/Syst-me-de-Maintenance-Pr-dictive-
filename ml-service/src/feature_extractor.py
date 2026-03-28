"""
Feature Extractor for ML Predictive Maintenance
Transforms raw time-series metrics into ML-ready features
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from src.config import Config
from src.logger import logger


class FeatureExtractor:
    """
    Extracts features from raw system metrics for ML model training and prediction
    """
    
    def __init__(self):
        """Initialize feature extractor with database connection"""
        self.conn = None
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
            logger.info("Connected to database for feature extraction")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def load_historical_data(self, machine_id, start_date, end_date):
        """
        Load historical metrics from database for a specific machine
        
        Args:
            machine_id: Machine ID (integer)
            start_date: Start datetime
            end_date: End datetime
            
        Returns:
            tuple: (system_metrics_df, smart_data_df)
        """
        try:
            # Load system metrics
            system_query = """
                SELECT 
                    created_at as timestamp,
                    cpu_usage,
                    memory_usage,
                    disk_usage
                FROM system_metrics
                WHERE machine_id = %s
                    AND created_at >= %s
                    AND created_at <= %s
                ORDER BY created_at ASC
            """
            
            system_df = pd.read_sql_query(
                system_query,
                self.conn,
                params=(machine_id, start_date, end_date)
            )
            
            # Load SMART data
            smart_query = """
                SELECT 
                    created_at as timestamp,
                    health_status,
                    temperature,
                    read_errors,
                    write_errors
                FROM smart_data
                WHERE machine_id = %s
                    AND created_at >= %s
                    AND created_at <= %s
                ORDER BY created_at ASC
            """
            
            smart_df = pd.read_sql_query(
                smart_query,
                self.conn,
                params=(machine_id, start_date, end_date)
            )
            
            logger.info(f"Loaded {len(system_df)} system metrics and {len(smart_df)} SMART records for machine {machine_id}")
            
            return system_df, smart_df
            
        except Exception as e:
            logger.error(f"Failed to load historical data: {e}")
            raise
    
    def handle_missing_data(self, df, max_gap=3):
        """
        Handle missing data using forward-fill with maximum gap limit
        
        Args:
            df: DataFrame with potential missing values
            max_gap: Maximum number of consecutive missing values to fill
            
        Returns:
            DataFrame with missing data handled
        """
        # Forward fill with limit
        df_filled = df.fillna(method='ffill', limit=max_gap)
        
        # Mark rows that still have missing data after filling
        remaining_nulls = df_filled.isnull().sum()
        if remaining_nulls.any():
            logger.warning(f"Remaining null values after forward-fill: {remaining_nulls[remaining_nulls > 0].to_dict()}")
        
        return df_filled
    
    def extract_features(self, machine_id, start_date, end_date):
        """
        Extract all features for a machine within a date range
        
        Args:
            machine_id: Machine ID (integer)
            start_date: Start datetime
            end_date: End datetime
            
        Returns:
            DataFrame with extracted features
        """
        # Load raw data
        system_df, smart_df = self.load_historical_data(machine_id, start_date, end_date)
        
        if system_df.empty:
            logger.warning(f"No data found for machine {machine_id}")
            return pd.DataFrame()
        
        # Handle missing data
        system_df = self.handle_missing_data(system_df)
        smart_df = self.handle_missing_data(smart_df)
        
        # Set timestamp as index for time-series operations
        system_df.set_index('timestamp', inplace=True)
        if not smart_df.empty:
            smart_df.set_index('timestamp', inplace=True)
        
        # Extract features
        features = {}
        
        # Add machine ID
        features['machine_id'] = machine_id
        
        # Add timestamp (use end_date as the feature timestamp)
        features['timestamp'] = end_date
        
        # Extract rolling statistics
        rolling_features = self.calculate_rolling_stats(system_df, windows=[24, 168, 720])  # 24h, 7d, 30d in hours
        features.update(rolling_features)
        
        # Extract trend features
        trend_features = self.calculate_trends(system_df, window=168)  # 7 days
        features.update(trend_features)
        
        # Extract volatility features
        volatility_features = self.calculate_volatility(system_df)
        features.update(volatility_features)
        
        # Extract SMART features
        if not smart_df.empty:
            smart_features = self.extract_smart_features(smart_df)
            features.update(smart_features)
        
        # Convert to DataFrame
        features_df = pd.DataFrame([features])
        
        logger.info(f"Extracted {len(features)} features for machine {machine_id}")
        
        return features_df
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()

    def calculate_rolling_stats(self, df, windows):
        """
        Calculate rolling statistics for multiple time windows
        
        Args:
            df: DataFrame with time-series data (timestamp as index)
            windows: List of window sizes in hours (e.g., [24, 168, 720])
            
        Returns:
            Dictionary of rolling statistics features
        """
        features = {}
        metrics = ['cpu_usage', 'memory_usage', 'disk_usage']
        
        for metric in metrics:
            if metric not in df.columns:
                continue
                
            for window in windows:
                window_name = f"{window}h"
                
                # Calculate rolling mean
                rolling_mean = df[metric].rolling(window=window, min_periods=1).mean()
                features[f"{metric}_mean_{window_name}"] = rolling_mean.iloc[-1] if len(rolling_mean) > 0 else 0
                
                # Calculate rolling median
                rolling_median = df[metric].rolling(window=window, min_periods=1).median()
                features[f"{metric}_median_{window_name}"] = rolling_median.iloc[-1] if len(rolling_median) > 0 else 0
                
                # Calculate rolling std
                rolling_std = df[metric].rolling(window=window, min_periods=1).std()
                features[f"{metric}_std_{window_name}"] = rolling_std.iloc[-1] if len(rolling_std) > 0 else 0
                
                # Calculate rolling min
                rolling_min = df[metric].rolling(window=window, min_periods=1).min()
                features[f"{metric}_min_{window_name}"] = rolling_min.iloc[-1] if len(rolling_min) > 0 else 0
                
                # Calculate rolling max
                rolling_max = df[metric].rolling(window=window, min_periods=1).max()
                features[f"{metric}_max_{window_name}"] = rolling_max.iloc[-1] if len(rolling_max) > 0 else 0
        
        return features

    def calculate_trends(self, df, window):
        """
        Calculate trend slopes using linear regression
        
        Args:
            df: DataFrame with time-series data
            window: Window size in hours for trend calculation
            
        Returns:
            Dictionary of trend features
        """
        features = {}
        metrics = ['cpu_usage', 'memory_usage', 'disk_usage']
        
        for metric in metrics:
            if metric not in df.columns or len(df) < 2:
                features[f"{metric}_trend_{window}h"] = 0
                features[f"{metric}_rate_of_change_1h"] = 0
                continue
            
            # Get last 'window' hours of data
            recent_data = df[metric].tail(window)
            
            if len(recent_data) < 2:
                features[f"{metric}_trend_{window}h"] = 0
                features[f"{metric}_rate_of_change_1h"] = 0
                continue
            
            # Calculate linear regression slope (trend)
            x = np.arange(len(recent_data))
            y = recent_data.values
            
            # Handle NaN values
            mask = ~np.isnan(y)
            if mask.sum() < 2:
                features[f"{metric}_trend_{window}h"] = 0
                features[f"{metric}_rate_of_change_1h"] = 0
                continue
            
            x_clean = x[mask]
            y_clean = y[mask]
            
            # Calculate slope using numpy polyfit
            slope = np.polyfit(x_clean, y_clean, 1)[0]
            features[f"{metric}_trend_{window}h"] = slope
            
            # Calculate rate of change (hour-over-hour)
            if len(df) >= 2:
                current_value = df[metric].iloc[-1]
                previous_value = df[metric].iloc[-2]
                rate_of_change = current_value - previous_value
                features[f"{metric}_rate_of_change_1h"] = rate_of_change
            else:
                features[f"{metric}_rate_of_change_1h"] = 0
        
        return features
    
    def calculate_volatility(self, df):
        """
        Calculate volatility (coefficient of variation) for metrics
        
        Args:
            df: DataFrame with time-series data
            
        Returns:
            Dictionary of volatility features
        """
        features = {}
        metrics = ['cpu_usage', 'memory_usage', 'disk_usage']
        
        for metric in metrics:
            if metric not in df.columns or len(df) == 0:
                features[f"{metric}_volatility"] = 0
                continue
            
            mean_value = df[metric].mean()
            std_value = df[metric].std()
            
            # Coefficient of variation (CV = std / mean)
            if mean_value > 0:
                cv = std_value / mean_value
                features[f"{metric}_volatility"] = cv
            else:
                features[f"{metric}_volatility"] = 0
        
        return features

    def extract_smart_features(self, smart_df):
        """
        Extract features from SMART data
        
        Args:
            smart_df: DataFrame with SMART data
            
        Returns:
            Dictionary of SMART features
        """
        features = {}
        
        if smart_df.empty:
            # Return default values if no SMART data
            features['smart_temperature'] = 0
            features['smart_read_errors'] = 0
            features['smart_write_errors'] = 0
            features['smart_health_good'] = 0
            features['smart_health_warning'] = 0
            features['smart_health_critical'] = 0
            features['hour_of_day'] = datetime.now().hour
            features['day_of_week'] = datetime.now().weekday()
            features['is_weekend'] = 1 if datetime.now().weekday() >= 5 else 0
            return features
        
        # Get latest SMART values
        latest = smart_df.iloc[-1]
        
        # Raw SMART attribute values
        features['smart_temperature'] = latest.get('temperature', 0)
        features['smart_read_errors'] = latest.get('read_errors', 0)
        features['smart_write_errors'] = latest.get('write_errors', 0)
        
        # Health status as one-hot encoding
        health_status = latest.get('health_status', 'UNKNOWN')
        features['smart_health_good'] = 1 if health_status == 'GOOD' else 0
        features['smart_health_warning'] = 1 if health_status == 'WARNING' else 0
        features['smart_health_critical'] = 1 if health_status == 'CRITICAL' else 0
        
        # Time-based features (from latest timestamp)
        if len(smart_df) > 0:
            latest_time = smart_df.index[-1]
            features['hour_of_day'] = latest_time.hour
            features['day_of_week'] = latest_time.weekday()
            features['is_weekend'] = 1 if latest_time.weekday() >= 5 else 0
        else:
            features['hour_of_day'] = datetime.now().hour
            features['day_of_week'] = datetime.now().weekday()
            features['is_weekend'] = 1 if datetime.now().weekday() >= 5 else 0
        
        return features
