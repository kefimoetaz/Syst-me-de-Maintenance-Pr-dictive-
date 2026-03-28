"""
Collection scheduler - orchestrates data collection and sending
Requirements: 4.5, 5.1, 6.3
"""

import logging
import schedule
import time
from datetime import datetime
from typing import Dict

from collector import SystemCollector
from smart_reader import SmartReader
from sender import DataSender

logger = logging.getLogger(__name__)


class CollectionScheduler:
    """Orchestrates hourly data collection and sending"""
    
    def __init__(self, config: Dict):
        """
        Initialize scheduler with configuration
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.collector = SystemCollector()
        self.smart_reader = SmartReader()
        self.sender = DataSender(
            api_url=config['api_url'],
            token=config['token']
        )
        self.running = False
    
    def start(self):
        """Start the collection scheduler"""
        logger.info("=" * 60)
        logger.info("Starting Collection Scheduler")
        logger.info("=" * 60)
        logger.info(f"API URL: {self.config['api_url']}")
        logger.info(f"Agent ID: {self.config['agent_id']}")
        logger.info(f"Collection interval: {self.config['collection_interval_hours']} hour(s)")
        logger.info("=" * 60)
        
        self.running = True
        
        # Schedule collection
        interval_hours = self.config.get('collection_interval_hours', 1)
        schedule.every(interval_hours).hours.do(self.collect_and_send)
        
        # Run immediately on start
        logger.info("Running initial collection...")
        self.collect_and_send()
        
        # Keep running
        logger.info("Scheduler started. Press Ctrl+C to stop.")
        try:
            while self.running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logger.info("Received stop signal")
            self.stop()
    
    def collect_and_send(self):
        """
        Collect all metrics and send to API
        Requirements: 4.5, 5.1
        """
        try:
            logger.info("-" * 60)
            logger.info(f"Starting data collection at {datetime.now().isoformat()}")
            logger.info("-" * 60)
            
            # 1. Collect machine info
            logger.info("Collecting machine information...")
            machine_info = self.collector.collect_machine_info()
            logger.info(f"Machine: {machine_info['hostname']} ({machine_info['serial_number']})")
            
            # 2. Collect system metrics
            logger.info("Collecting system metrics...")
            system_metrics = self.collector.collect_all()
            logger.info(f"CPU: {system_metrics.get('cpu_usage', 'N/A')}%, "
                       f"Memory: {system_metrics.get('memory_usage', 'N/A')}%, "
                       f"Disk: {system_metrics.get('disk_usage', 'N/A')}%")
            
            # 3. Collect SMART data
            logger.info("Collecting SMART data...")
            smart_data = self.smart_reader.read_smart_data()
            
            if smart_data is None:
                logger.warning("SMART data not available, using defaults")
                smart_data = {
                    'health_status': 'GOOD',
                    'read_errors': 0,
                    'write_errors': 0,
                    'temperature': 40.0
                }
            
            logger.info(f"SMART: {smart_data['health_status']}, "
                       f"Temp: {smart_data['temperature']}°C")
            
            # 4. Build payload
            payload = {
                'agent_id': self.config['agent_id'],
                'machine': machine_info,
                'timestamp': datetime.now().isoformat(),
                'system_metrics': system_metrics,
                'smart_data': smart_data
            }
            
            # 5. Send data
            logger.info("Sending data to API...")
            success = self.sender.send_data(payload)
            
            if success:
                logger.info("[OK] Collection cycle completed successfully")
            else:
                logger.error("[ERROR] Collection cycle failed - data not sent")
            
            logger.info("-" * 60)
            
        except Exception as e:
            logger.error(f"Error in collection cycle: {e}", exc_info=True)
            logger.error("Continuing to next cycle...")
    
    def stop(self):
        """Stop the scheduler gracefully"""
        logger.info("Stopping scheduler...")
        self.running = False
        schedule.clear()
        logger.info("Scheduler stopped")
