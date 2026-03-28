"""
Data sender with retry logic and exponential backoff
Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
"""

import requests
import logging
import time
from typing import Dict

logger = logging.getLogger(__name__)


class DataSender:
    """Sends data to API with retry logic"""
    
    def __init__(self, api_url: str, token: str):
        """
        Initialize DataSender
        
        Args:
            api_url: Full URL to API endpoint (e.g., http://localhost:3000/api/data)
            token: Authentication token
        """
        self.api_url = api_url
        self.token = token
        self.max_retries = 3
        self.retry_delays = [1, 2, 4]  # Exponential backoff: 1s, 2s, 4s
    
    def send_data(self, payload: Dict) -> bool:
        """
        Send data to API with retry logic
        
        Args:
            payload: Data dictionary to send
            
        Returns:
            True if successful, False otherwise
        """
        headers = self._build_headers()
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Sending data to API (attempt {attempt + 1}/{self.max_retries})")
                
                response = requests.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                    timeout=10
                )
                
                # Check response status
                if response.status_code in [200, 201]:
                    logger.info(f"[OK] Data sent successfully: {response.json()}")
                    return True
                
                elif response.status_code >= 400 and response.status_code < 500:
                    # Client error (4xx) - don't retry
                    logger.error(f"[ERROR] Client error {response.status_code}: {response.text}")
                    logger.error("Not retrying for client errors")
                    return False
                
                elif response.status_code >= 500:
                    # Server error (5xx) - retry
                    logger.warning(f"Server error {response.status_code}, will retry")
                    if attempt < self.max_retries - 1:
                        delay = self.retry_delays[attempt]
                        logger.info(f"Waiting {delay}s before retry...")
                        time.sleep(delay)
                        continue
                    else:
                        logger.error("Max retries reached for server error")
                        return False
                
                else:
                    logger.warning(f"Unexpected status code: {response.status_code}")
                    return False
                    
            except requests.exceptions.ConnectionError as e:
                logger.warning(f"Connection error: {e}")
                if attempt < self.max_retries - 1:
                    delay = self.retry_delays[attempt]
                    logger.info(f"Waiting {delay}s before retry...")
                    time.sleep(delay)
                else:
                    logger.error("Max retries reached for connection error")
                    return False
            
            except requests.exceptions.Timeout as e:
                logger.warning(f"Request timeout: {e}")
                if attempt < self.max_retries - 1:
                    delay = self.retry_delays[attempt]
                    logger.info(f"Waiting {delay}s before retry...")
                    time.sleep(delay)
                else:
                    logger.error("Max retries reached for timeout")
                    return False
            
            except Exception as e:
                logger.error(f"Unexpected error sending data: {e}")
                if attempt < self.max_retries - 1:
                    delay = self.retry_delays[attempt]
                    logger.info(f"Waiting {delay}s before retry...")
                    time.sleep(delay)
                else:
                    logger.error("Max retries reached for unexpected error")
                    return False
        
        return False
    
    def _build_headers(self) -> Dict[str, str]:
        """Build HTTP headers with authentication"""
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
