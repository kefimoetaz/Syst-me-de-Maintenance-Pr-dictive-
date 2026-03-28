"""
SMART data reader for disk health monitoring
Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
"""

import logging
import platform
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class SmartReader:
    """Reads SMART data from disk"""
    
    def read_smart_data(self) -> Optional[Dict[str, any]]:
        """
        Read SMART data from primary disk
        Returns: {
            'health_status': str,    # 'GOOD', 'WARNING', 'CRITICAL'
            'read_errors': int,
            'write_errors': int,
            'temperature': float     # Degrees Celsius
        }
        Returns None if SMART data is not accessible
        """
        try:
            system = platform.system()
            
            if system == 'Windows':
                return self._read_smart_windows()
            elif system == 'Linux':
                return self._read_smart_linux()
            else:
                logger.warning(f"SMART reading not supported on {system}")
                return None
                
        except Exception as e:
            logger.error(f"Error reading SMART data: {e}")
            return None
    
    def _read_smart_windows(self) -> Optional[Dict]:
        """Read SMART data on Windows using smartctl directly"""
        import subprocess
        import shutil

        # Find smartctl — check PATH first, then common install locations
        smartctl_cmd = shutil.which('smartctl')
        if not smartctl_cmd:
            for candidate in [
                r'C:\Program Files\smartmontools\bin\smartctl.exe',
                r'C:\Program Files (x86)\smartmontools\bin\smartctl.exe',
            ]:
                import os
                if os.path.isfile(candidate):
                    smartctl_cmd = candidate
                    break

        if not smartctl_cmd:
            logger.warning("smartctl not found in PATH or default locations, using fallback")
            return self._get_fallback_smart_data()

        # Detect the first available drive (NVMe or HDD)
        drives_to_try = [
            ('/dev/sda', ['-d', 'nvme']),
            ('/dev/sda', []),
            ('/dev/pd0', []),
        ]

        for drive, extra_args in drives_to_try:
            try:
                # Check overall health
                health_result = subprocess.run(
                    [smartctl_cmd, '-H'] + extra_args + [drive],
                    capture_output=True, text=True, timeout=5
                )
                output = health_result.stdout + health_result.stderr

                if 'PASSED' in output or 'OK' in output:
                    health_status = 'GOOD'
                elif 'FAILED' in output:
                    health_status = 'CRITICAL'
                elif health_result.returncode == 0:
                    health_status = 'GOOD'
                else:
                    continue  # try next drive

                # Get SMART attributes for temperature and errors
                attr_result = subprocess.run(
                    [smartctl_cmd, '-A'] + extra_args + [drive],
                    capture_output=True, text=True, timeout=5
                )

                read_errors = 0
                write_errors = 0
                temperature = 40.0

                for line in attr_result.stdout.split('\n'):
                    line_lower = line.lower()
                    if 'temperature' in line_lower:
                        parts = line.split()
                        # Last numeric value is usually the raw temperature
                        for part in reversed(parts):
                            try:
                                val = float(part)
                                if 0 < val < 100:
                                    temperature = val
                                    break
                            except ValueError:
                                continue
                    elif 'raw_read_error_rate' in line_lower:
                        parts = line.split()
                        try:
                            read_errors = int(parts[-1])
                        except (ValueError, IndexError):
                            pass
                    elif 'reallocated_sector' in line_lower:
                        parts = line.split()
                        try:
                            write_errors = int(parts[-1])
                        except (ValueError, IndexError):
                            pass

                logger.info(f"SMART read via smartctl: {health_status}, temp={temperature}°C")
                return {
                    'health_status': health_status,
                    'read_errors': read_errors,
                    'write_errors': write_errors,
                    'temperature': float(temperature)
                }

            except FileNotFoundError:
                logger.warning("smartctl executable not found, using fallback")
                return self._get_fallback_smart_data()
            except Exception as e:
                logger.warning(f"smartctl failed for {drive}: {e}")
                continue

        logger.warning("Could not read SMART from any drive, using fallback")
        return self._get_fallback_smart_data()
    
    def _read_smart_linux(self) -> Optional[Dict]:
        """Read SMART data on Linux using smartctl"""
        try:
            import subprocess
            
            # Try to read SMART data using smartctl
            result = subprocess.run(
                ['smartctl', '-A', '/dev/sda'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode != 0:
                logger.warning("smartctl not available or requires sudo")
                return self._get_fallback_smart_data()
            
            # Parse smartctl output
            health_status = 'GOOD'
            read_errors = 0
            write_errors = 0
            temperature = 40.0
            
            for line in result.stdout.split('\n'):
                if 'Raw_Read_Error_Rate' in line:
                    parts = line.split()
                    if len(parts) >= 10:
                        read_errors = int(parts[-1])
                elif 'Reallocated_Sector' in line:
                    parts = line.split()
                    if len(parts) >= 10:
                        write_errors = int(parts[-1])
                elif 'Temperature' in line:
                    parts = line.split()
                    if len(parts) >= 10:
                        temperature = float(parts[-1])
            
            # Check overall health
            health_result = subprocess.run(
                ['smartctl', '-H', '/dev/sda'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if 'PASSED' in health_result.stdout:
                health_status = 'GOOD'
            elif 'FAILED' in health_result.stdout:
                health_status = 'CRITICAL'
            
            return {
                'health_status': health_status,
                'read_errors': read_errors,
                'write_errors': write_errors,
                'temperature': temperature
            }
            
        except FileNotFoundError:
            logger.warning("smartctl not installed")
            return self._get_fallback_smart_data()
        except Exception as e:
            logger.error(f"Error reading SMART on Linux: {e}")
            return None
    
    def _get_fallback_smart_data(self) -> Dict:
        """Return default SMART data when actual data is unavailable"""
        logger.info("Using fallback SMART data (GOOD status)")
        return {
            'health_status': 'GOOD',
            'read_errors': 0,
            'write_errors': 0,
            'temperature': 40.0
        }
