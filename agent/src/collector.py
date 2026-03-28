"""
System metrics collector using psutil
Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4
"""

import psutil
import socket
import platform
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class SystemCollector:
    """Collects system metrics via psutil"""
    
    def collect_cpu_metrics(self) -> Dict[str, Optional[float]]:
        """
        Collect CPU metrics
        Returns: {
            'cpu_usage': float,      # Percentage 0-100
            'cpu_temperature': float # Degrees Celsius
        }
        """
        try:
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # Try to get CPU temperature (may not be available on all systems)
            cpu_temperature = None
            try:
                temps = psutil.sensors_temperatures()
                if temps:
                    # Try common temperature sensor names
                    for name in ['coretemp', 'cpu_thermal', 'k10temp', 'zenpower']:
                        if name in temps:
                            cpu_temperature = temps[name][0].current
                            break
                    
                    # If no specific sensor found, use first available
                    if cpu_temperature is None and temps:
                        first_sensor = list(temps.values())[0]
                        if first_sensor:
                            cpu_temperature = first_sensor[0].current
            except (AttributeError, KeyError, IndexError):
                logger.warning("CPU temperature not available on this system")
                cpu_temperature = 50.0  # Default fallback value
            
            return {
                'cpu_usage': round(cpu_usage, 2),
                'cpu_temperature': round(cpu_temperature, 2) if cpu_temperature else 50.0
            }
        except Exception as e:
            logger.error(f"Error collecting CPU metrics: {e}")
            raise
    
    def collect_memory_metrics(self) -> Dict[str, float]:
        """
        Collect memory metrics
        Returns: {
            'memory_usage': float,      # Percentage 0-100
            'memory_available': int,    # MB
            'memory_total': int         # MB
        }
        """
        try:
            mem = psutil.virtual_memory()
            
            return {
                'memory_usage': round(mem.percent, 2),
                'memory_available': int(mem.available / (1024 * 1024)),  # Convert to MB
                'memory_total': int(mem.total / (1024 * 1024))  # Convert to MB
            }
        except Exception as e:
            logger.error(f"Error collecting memory metrics: {e}")
            raise
    
    def collect_disk_metrics(self) -> Dict[str, float]:
        """
        Collect disk metrics for primary drive
        Returns: {
            'disk_usage': float,  # Percentage 0-100
            'disk_free': int,     # MB
            'disk_total': int     # MB
        }
        """
        try:
            # Get primary disk (C: on Windows, / on Linux)
            disk_path = 'C:\\' if platform.system() == 'Windows' else '/'
            disk = psutil.disk_usage(disk_path)
            
            return {
                'disk_usage': round(disk.percent, 2),
                'disk_free': int(disk.free / (1024 * 1024)),  # Convert to MB
                'disk_total': int(disk.total / (1024 * 1024))  # Convert to MB
            }
        except Exception as e:
            logger.error(f"Error collecting disk metrics: {e}")
            raise
    
    def collect_machine_info(self) -> Dict[str, str]:
        """
        Collect machine identification information
        Returns: {
            'hostname': str,
            'ip_address': str,
            'serial_number': str,
            'os': str
        }
        """
        try:
            hostname = socket.gethostname()
            
            # Get IP address
            try:
                # Connect to external address to get local IP
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                ip_address = s.getsockname()[0]
                s.close()
            except Exception:
                ip_address = socket.gethostbyname(hostname)
            
            # Get serial number (platform-specific)
            serial_number = self._get_serial_number()
            
            # Get OS information
            os_info = f"{platform.system()} {platform.release()}"
            
            return {
                'hostname': hostname,
                'ip_address': ip_address,
                'serial_number': serial_number,
                'os': os_info
            }
        except Exception as e:
            logger.error(f"Error collecting machine info: {e}")
            raise
    
    def _get_serial_number(self) -> str:
        """Get hardware serial number (platform-specific)"""
        try:
            system = platform.system()
            
            if system == 'Windows':
                import subprocess
                result = subprocess.check_output(
                    'wmic bios get serialnumber',
                    shell=True,
                    text=True
                )
                lines = result.strip().split('\n')
                if len(lines) > 1:
                    serial = lines[1].strip()
                    # Check if serial is valid (not empty and not default values)
                    if serial and serial.upper() not in ['TO BE FILLED BY O.E.M.', 'DEFAULT STRING', 'SYSTEM SERIAL NUMBER']:
                        return serial
            
            elif system == 'Linux':
                try:
                    with open('/sys/class/dmi/id/product_serial', 'r') as f:
                        serial = f.read().strip()
                        if serial and serial.upper() not in ['TO BE FILLED BY O.E.M.', 'DEFAULT STRING']:
                            return serial
                except FileNotFoundError:
                    pass
            
            # Fallback: use MAC address as unique identifier
            import uuid
            mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff)
                           for elements in range(0, 2*6, 2)][::-1])
            return f"MAC-{mac}"
            
        except Exception as e:
            logger.warning(f"Could not get serial number: {e}")
            # Generate a unique identifier based on hostname and MAC
            import uuid
            return f"FALLBACK-{uuid.getnode()}"
    
    def collect_all(self) -> Dict:
        """
        Collect all metrics at once
        Continues collecting even if some metrics fail
        """
        metrics = {}
        errors = []
        
        try:
            metrics.update(self.collect_cpu_metrics())
        except Exception as e:
            logger.warning(f"Failed to collect CPU metrics: {e}")
            errors.append('cpu')
        
        try:
            metrics.update(self.collect_memory_metrics())
        except Exception as e:
            logger.warning(f"Failed to collect memory metrics: {e}")
            errors.append('memory')
        
        try:
            metrics.update(self.collect_disk_metrics())
        except Exception as e:
            logger.warning(f"Failed to collect disk metrics: {e}")
            errors.append('disk')
        
        if errors:
            logger.warning(f"Some metrics could not be collected: {', '.join(errors)}")
        
        return metrics
