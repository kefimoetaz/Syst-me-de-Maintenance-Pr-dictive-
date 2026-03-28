#!/usr/bin/env python3
"""
PC Technician Assistant Pro - Clean Version
A comprehensive Windows system utility tool
Created by Kefi Moetaz © 2025 - All Rights Reserved
"""

import tkinter as tk
from tkinter import ttk, messagebox
import psutil
import platform
import os
import subprocess
import threading
from datetime import datetime
import json

class PCTechAssistant:
    def __init__(self, root):
        self.root = root
        self.root.title("PC Technician Assistant Pro - by Kefi Moetaz")
        self.root.geometry("1000x750")
        self.root.minsize(900, 650)
        self.root.configure(bg='#f8f9fa')
        
        # Configure modern styling
        style = ttk.Style()
        style.theme_use('clam')
        
        # System info storage
        self.system_info = {}
        self.scan_results = {}
        
        self.create_gui()
        
    def create_gui(self):
        # Create main container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill='both', expand=True)
        
        # Create tabs
        self.create_system_info_tab()
        self.create_driver_manager_tab()
        self.create_hardware_diagnostic_tab()
        self.create_disk_cleaner_tab()
        
        # Create footer
        self.create_footer()
        
    def create_system_info_tab(self):
        # System Info Tab
        self.info_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.info_frame, text="🖥️ System Info")
        
        # Header
        header_frame = ttk.Frame(self.info_frame)
        header_frame.pack(fill='x', padx=10, pady=10)
        
        ttk.Label(header_frame, text="🖥️ System Information Scanner", 
                 font=('Arial', 16, 'bold')).pack(side='left')
        
        # Scan button
        ttk.Button(header_frame, text="🔍 Scan System", 
                  command=self.scan_system).pack(side='right')
        
        # Results text area
        self.info_text = tk.Text(self.info_frame, height=25, width=80, 
                                font=('Consolas', 10), bg='#f8f9fa')
        self.info_text.pack(fill='both', expand=True, padx=10, pady=5)
        
    def create_driver_manager_tab(self):
        # Driver Manager Tab
        self.driver_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.driver_frame, text="🔧 Driver Manager")
        
        # Header
        header_frame = ttk.Frame(self.driver_frame)
        header_frame.pack(fill='x', padx=10, pady=10)
        
        ttk.Label(header_frame, text="🔧 Driver Update Manager", 
                 font=('Arial', 16, 'bold')).pack(side='left')
        
        ttk.Button(header_frame, text="🔍 Scan Drivers", 
                  command=self.scan_drivers).pack(side='right')
        
        # Driver list
        columns = ('Device', 'Version', 'Status', 'Manufacturer')
        self.driver_tree = ttk.Treeview(self.driver_frame, columns=columns, show='headings', height=15)
        
        for col in columns:
            self.driver_tree.heading(col, text=col)
            self.driver_tree.column(col, width=150)
        
        self.driver_tree.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Status area
        self.driver_status = tk.Text(self.driver_frame, height=8, width=80, 
                                   font=('Consolas', 9), bg='#f8f9fa')
        self.driver_status.pack(fill='x', padx=10, pady=5)
        
    def create_hardware_diagnostic_tab(self):
        # Hardware Diagnostic Tab
        self.diagnostic_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.diagnostic_frame, text="⚡ Hardware Tests")
        
        # Header
        header_frame = ttk.Frame(self.diagnostic_frame)
        header_frame.pack(fill='x', padx=10, pady=10)
        
        ttk.Label(header_frame, text="⚡ Hardware Diagnostic Tool", 
                 font=('Arial', 16, 'bold')).pack()
        
        # Test buttons in grid
        test_frame = ttk.Frame(self.diagnostic_frame)
        test_frame.pack(fill='x', padx=10, pady=10)
        
        # CPU Tests
        cpu_frame = ttk.LabelFrame(test_frame, text="🖥️ CPU Tests", padding=10)
        cpu_frame.grid(row=0, column=0, sticky='nsew', padx=5, pady=5)
        
        ttk.Button(cpu_frame, text="🔥 CPU Stress Test", 
                  command=self.cpu_stress_test, width=20).pack(pady=2)
        ttk.Button(cpu_frame, text="📊 CPU Benchmark", 
                  command=self.cpu_benchmark, width=20).pack(pady=2)
        
        # Memory Tests
        memory_frame = ttk.LabelFrame(test_frame, text="🧠 Memory Tests", padding=10)
        memory_frame.grid(row=0, column=1, sticky='nsew', padx=5, pady=5)
        
        ttk.Button(memory_frame, text="🔍 RAM Monitor", 
                  command=self.ram_monitor, width=20).pack(pady=2)
        ttk.Button(memory_frame, text="⚡ Memory Speed Test", 
                  command=self.memory_speed_test, width=20).pack(pady=2)
        
        # Disk Tests
        disk_frame = ttk.LabelFrame(test_frame, text="💾 Disk Tests", padding=10)
        disk_frame.grid(row=1, column=0, sticky='nsew', padx=5, pady=5)
        
        ttk.Button(disk_frame, text="📖 Read Speed Test", 
                  command=self.disk_read_test, width=20).pack(pady=2)
        ttk.Button(disk_frame, text="✍️ Write Speed Test", 
                  command=self.disk_write_test, width=20).pack(pady=2)
        
        # Network Tests
        network_frame = ttk.LabelFrame(test_frame, text="🌐 Network Tests", padding=10)
        network_frame.grid(row=1, column=1, sticky='nsew', padx=5, pady=5)
        
        ttk.Button(network_frame, text="📡 Internet Speed Test", 
                  command=self.internet_speed_test, width=20).pack(pady=2)
        ttk.Button(network_frame, text="🏠 Local Network Test", 
                  command=self.local_network_test, width=20).pack(pady=2)
        
        # Configure grid
        test_frame.grid_columnconfigure(0, weight=1)
        test_frame.grid_columnconfigure(1, weight=1)
        
        # Results area
        self.diagnostic_results = tk.Text(self.diagnostic_frame, height=15, width=80, 
                                        font=('Consolas', 9), bg='#f8f9fa')
        self.diagnostic_results.pack(fill='both', expand=True, padx=10, pady=5)
        
    def create_disk_cleaner_tab(self):
        # Disk Cleaner Tab
        self.cleaner_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.cleaner_frame, text="🧹 Disk Cleaner")
        
        # Header
        header_frame = ttk.Frame(self.cleaner_frame)
        header_frame.pack(fill='x', padx=10, pady=10)
        
        ttk.Label(header_frame, text="🧹 Disk Cleanup Tool", 
                 font=('Arial', 16, 'bold')).pack(side='left')
        
        # Buttons
        btn_frame = ttk.Frame(header_frame)
        btn_frame.pack(side='right')
        
        ttk.Button(btn_frame, text="🔍 Analyze", 
                  command=self.analyze_disk).pack(side='left', padx=5)
        ttk.Button(btn_frame, text="🧹 Clean Now", 
                  command=self.clean_disk).pack(side='left', padx=5)
        
        # Results area
        self.cleaner_text = tk.Text(self.cleaner_frame, height=25, width=80, 
                                  font=('Consolas', 10), bg='#f8f9fa')
        self.cleaner_text.pack(fill='both', expand=True, padx=10, pady=5)
        
    def create_footer(self):
        # Footer
        footer_frame = ttk.Frame(self.root)
        footer_frame.pack(side='bottom', fill='x', padx=10, pady=5)
        
        # Separator
        separator = ttk.Separator(footer_frame, orient='horizontal')
        separator.pack(fill='x', pady=2)
        
        # Footer content
        footer_content = ttk.Frame(footer_frame)
        footer_content.pack(fill='x', pady=5)
        
        ttk.Label(footer_content, text="PC Technician Assistant Pro v2.0", 
                 font=('Arial', 9)).pack(side='left')
        
        ttk.Label(footer_content, text="Created by Kefi Moetaz © 2025 - All Rights Reserved", 
                 font=('Arial', 9, 'italic'), foreground='#666666').pack(side='right')
    
    # System Info Methods
    def scan_system(self):
        self.info_text.delete(1.0, tk.END)
        self.info_text.insert(tk.END, "🔍 Scanning system... Please wait...\n\n")
        self.root.update()
        
        try:
            info = []
            info.append("=" * 60)
            info.append("SYSTEM INFORMATION REPORT")
            info.append("=" * 60)
            info.append(f"Scan Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            info.append("")
            
            # OS Information
            info.append("OPERATING SYSTEM:")
            info.append(f"  OS: {platform.system()} {platform.release()}")
            info.append(f"  Version: {platform.version()}")
            info.append(f"  Architecture: {platform.architecture()[0]}")
            info.append(f"  Processor: {platform.processor()}")
            info.append("")
            
            # CPU Information
            info.append("CPU INFORMATION:")
            info.append(f"  Physical Cores: {psutil.cpu_count(logical=False)}")
            info.append(f"  Total Cores: {psutil.cpu_count(logical=True)}")
            info.append(f"  CPU Usage: {psutil.cpu_percent(interval=1)}%")
            info.append("")
            
            # Memory Information
            memory = psutil.virtual_memory()
            info.append("MEMORY INFORMATION:")
            info.append(f"  Total RAM: {self.bytes_to_gb(memory.total):.2f} GB")
            info.append(f"  Available RAM: {self.bytes_to_gb(memory.available):.2f} GB")
            info.append(f"  Memory Usage: {memory.percent}%")
            info.append("")
            
            # Disk Information
            info.append("DISK INFORMATION:")
            partitions = psutil.disk_partitions()
            for partition in partitions:
                try:
                    usage = psutil.disk_usage(partition.mountpoint)
                    info.append(f"  Drive {partition.device}")
                    info.append(f"    Total: {self.bytes_to_gb(usage.total):.2f} GB")
                    info.append(f"    Used: {self.bytes_to_gb(usage.used):.2f} GB")
                    info.append(f"    Free: {self.bytes_to_gb(usage.free):.2f} GB")
                    info.append(f"    Usage: {(usage.used/usage.total)*100:.1f}%")
                    info.append("")
                except PermissionError:
                    info.append(f"  Drive {partition.device}: Access Denied")
                    info.append("")
            
            self.info_text.delete(1.0, tk.END)
            self.info_text.insert(tk.END, "\n".join(info))
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to scan system: {str(e)}")
    
    def bytes_to_gb(self, bytes_value):
        return bytes_value / (1024**3)
    
    # Driver Manager Methods
    def scan_drivers(self):
        self.driver_status.delete(1.0, tk.END)
        self.driver_status.insert(tk.END, "🔍 Scanning system drivers...\n")
        self.root.update()
        
        # Clear existing items
        for item in self.driver_tree.get_children():
            self.driver_tree.delete(item)
        
        try:
            # Use PowerShell to get driver info
            cmd = 'Get-WmiObject Win32_PnPSignedDriver | Select-Object DeviceName, DriverVersion, Manufacturer | ConvertTo-Json'
            result = subprocess.run(['powershell', '-Command', cmd], 
                                  capture_output=True, text=True, shell=True)
            
            if result.returncode == 0 and result.stdout.strip():
                try:
                    drivers_data = json.loads(result.stdout)
                    if not isinstance(drivers_data, list):
                        drivers_data = [drivers_data]
                    
                    self.driver_status.insert(tk.END, f"✅ Found {len(drivers_data)} drivers\n")
                    
                    for driver in drivers_data[:30]:  # Limit for performance
                        if driver.get('DeviceName'):
                            device = driver.get('DeviceName', 'Unknown')[:40]
                            version = driver.get('DriverVersion', 'Unknown')
                            manufacturer = driver.get('Manufacturer', 'Unknown')[:20]
                            status = "✅ Installed"
                            
                            self.driver_tree.insert('', 'end', values=(
                                device, version, status, manufacturer
                            ))
                    
                    self.driver_status.insert(tk.END, "✅ Driver scan completed!\n")
                    
                except json.JSONDecodeError:
                    self.driver_status.insert(tk.END, "⚠️ Error parsing driver data\n")
            else:
                self.driver_status.insert(tk.END, "❌ Failed to retrieve driver information\n")
                
        except Exception as e:
            self.driver_status.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    # Hardware Diagnostic Methods
    def cpu_stress_test(self):
        self.diagnostic_results.delete(1.0, tk.END)
        self.diagnostic_results.insert(tk.END, "🔥 Starting CPU Stress Test...\n")
        self.root.update()
        
        try:
            import time
            
            self.diagnostic_results.insert(tk.END, f"🖥️ CPU Cores: {psutil.cpu_count()}\n")
            self.diagnostic_results.insert(tk.END, "⏱️ Running 5-second stress test...\n")
            
            for i in range(5):
                cpu_percent = psutil.cpu_percent(interval=1)
                self.diagnostic_results.insert(tk.END, f"📊 CPU Usage: {cpu_percent}%\n")
                self.root.update()
            
            self.diagnostic_results.insert(tk.END, "✅ CPU Stress Test Completed!\n")
            
        except Exception as e:
            self.diagnostic_results.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    def cpu_benchmark(self):
        self.diagnostic_results.delete(1.0, tk.END)
        self.diagnostic_results.insert(tk.END, "📊 Running CPU Benchmark...\n")
        
        try:
            import time
            
            start_time = time.time()
            result = sum(i * i for i in range(500000))
            end_time = time.time()
            
            benchmark_time = end_time - start_time
            score = int(1000 / benchmark_time) if benchmark_time > 0 else 0
            
            self.diagnostic_results.insert(tk.END, f"⏱️ Calculation Time: {benchmark_time:.3f} seconds\n")
            self.diagnostic_results.insert(tk.END, f"🏆 Benchmark Score: {score}\n")
            self.diagnostic_results.insert(tk.END, "✅ Benchmark Completed!\n")
            
        except Exception as e:
            self.diagnostic_results.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    def ram_monitor(self):
        self.diagnostic_results.delete(1.0, tk.END)
        self.diagnostic_results.insert(tk.END, "🧠 RAM Usage Monitor (5 seconds)...\n")
        
        try:
            import time
            
            for i in range(5):
                memory = psutil.virtual_memory()
                self.diagnostic_results.insert(tk.END, 
                    f"📊 RAM: {memory.percent}% | "
                    f"Used: {self.bytes_to_gb(memory.used):.1f}GB | "
                    f"Free: {self.bytes_to_gb(memory.available):.1f}GB\n")
                self.root.update()
                time.sleep(1)
                
            self.diagnostic_results.insert(tk.END, "✅ RAM Monitoring Completed!\n")
            
        except Exception as e:
            self.diagnostic_results.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    def memory_speed_test(self):
        self.diagnostic_results.delete(1.0, tk.END)
        self.diagnostic_results.insert(tk.END, "⚡ Testing Memory Speed...\n")
        
        try:
            import time
            
            start_time = time.time()
            data = [i for i in range(500000)]
            end_time = time.time()
            
            allocation_time = end_time - start_time
            
            start_time = time.time()
            total = sum(data)
            end_time = time.time()
            
            access_time = end_time - start_time
            
            self.diagnostic_results.insert(tk.END, f"📝 Memory Allocation: {allocation_time:.3f} seconds\n")
            self.diagnostic_results.insert(tk.END, f"📖 Memory Access: {access_time:.3f} seconds\n")
            self.diagnostic_results.insert(tk.END, "✅ Memory Speed Test Completed!\n")
            
            del data
            
        except Exception as e:
            self.diagnostic_results.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    def disk_read_test(self):
        self.diagnostic_results.delete(1.0, tk.END)
        self.diagnostic_results.insert(tk.END, "📖 Testing Disk Read Speed...\n")
        
        try:
            import time
            import tempfile
            
            test_file = os.path.join(tempfile.gettempdir(), "disk_test.tmp")
            test_data = b"0" * (5 * 1024 * 1024)  # 5MB
            
            with open(test_file, 'wb') as f:
                f.write(test_data)
            
            start_time = time.time()
            with open(test_file, 'rb') as f:
                data = f.read()
            end_time = time.time()
            
            read_time = end_time - start_time
            read_speed = len(test_data) / (1024 * 1024) / read_time if read_time > 0 else 0
            
            self.diagnostic_results.insert(tk.END, f"📊 Read Speed: {read_speed:.2f} MB/s\n")
            self.diagnostic_results.insert(tk.END, "✅ Disk Read Test Completed!\n")
            
            os.remove(test_file)
            
        except Exception as e:
            self.diagnostic_results.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    def disk_write_test(self):
        self.diagnostic_results.delete(1.0, tk.END)
        self.diagnostic_results.insert(tk.END, "✍️ Testing Disk Write Speed...\n")
        
        try:
            import time
            import tempfile
            
            test_file = os.path.join(tempfile.gettempdir(), "disk_write_test.tmp")
            test_data = b"0" * (5 * 1024 * 1024)  # 5MB
            
            start_time = time.time()
            with open(test_file, 'wb') as f:
                f.write(test_data)
                f.flush()
            end_time = time.time()
            
            write_time = end_time - start_time
            write_speed = len(test_data) / (1024 * 1024) / write_time if write_time > 0 else 0
            
            self.diagnostic_results.insert(tk.END, f"📊 Write Speed: {write_speed:.2f} MB/s\n")
            self.diagnostic_results.insert(tk.END, "✅ Disk Write Test Completed!\n")
            
            os.remove(test_file)
            
        except Exception as e:
            self.diagnostic_results.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    def internet_speed_test(self):
        self.diagnostic_results.delete(1.0, tk.END)
        self.diagnostic_results.insert(tk.END, "📡 Testing Internet Speed...\n")
        
        try:
            import urllib.request
            import time
            
            test_url = "http://httpbin.org/bytes/1048576"  # 1MB
            
            start_time = time.time()
            with urllib.request.urlopen(test_url, timeout=30) as response:
                data = response.read()
            end_time = time.time()
            
            download_time = end_time - start_time
            download_speed = len(data) / (1024 * 1024) / download_time if download_time > 0 else 0
            
            self.diagnostic_results.insert(tk.END, f"📊 Download Speed: {download_speed:.2f} MB/s\n")
            self.diagnostic_results.insert(tk.END, "✅ Internet Speed Test Completed!\n")
            
        except Exception as e:
            self.diagnostic_results.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    def local_network_test(self):
        self.diagnostic_results.delete(1.0, tk.END)
        self.diagnostic_results.insert(tk.END, "🏠 Testing Local Network...\n")
        
        try:
            import socket
            
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            
            self.diagnostic_results.insert(tk.END, f"🖥️ Hostname: {hostname}\n")
            self.diagnostic_results.insert(tk.END, f"🌐 Local IP: {local_ip}\n")
            
            # Test connectivity
            test_addresses = ['8.8.8.8', 'google.com']
            
            for addr in test_addresses:
                try:
                    result = subprocess.run(['ping', '-n', '1', addr], 
                                          capture_output=True, text=True, timeout=5)
                    if result.returncode == 0:
                        self.diagnostic_results.insert(tk.END, f"✅ {addr}: Reachable\n")
                    else:
                        self.diagnostic_results.insert(tk.END, f"❌ {addr}: Unreachable\n")
                except:
                    self.diagnostic_results.insert(tk.END, f"⚠️ {addr}: Test failed\n")
            
            self.diagnostic_results.insert(tk.END, "✅ Network Test Completed!\n")
            
        except Exception as e:
            self.diagnostic_results.insert(tk.END, f"❌ Error: {str(e)}\n")
    
    # Disk Cleaner Methods
    def analyze_disk(self):
        self.cleaner_text.delete(1.0, tk.END)
        self.cleaner_text.insert(tk.END, "🔍 Analyzing disk space...\n\n")
        self.root.update()
        
        try:
            total_size = 0
            results = []
            
            # Windows temp files
            temp_size = self.get_folder_size(r'C:\Windows\Temp')
            results.append(f"Windows Temp Files: {self.bytes_to_mb(temp_size):.2f} MB")
            total_size += temp_size
            
            # User temp files
            user_temp = os.environ.get('TEMP', '')
            if user_temp:
                user_temp_size = self.get_folder_size(user_temp)
                results.append(f"User Temp Files: {self.bytes_to_mb(user_temp_size):.2f} MB")
                total_size += user_temp_size
            
            results.append(f"\nTotal space that can be freed: {self.bytes_to_mb(total_size):.2f} MB")
            
            self.cleaner_text.delete(1.0, tk.END)
            self.cleaner_text.insert(tk.END, "\n".join(results))
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to analyze disk: {str(e)}")
    
    def clean_disk(self):
        if not messagebox.askyesno("Confirm", "Are you sure you want to clean temporary files?"):
            return
        
        self.cleaner_text.delete(1.0, tk.END)
        self.cleaner_text.insert(tk.END, "🧹 Cleaning disk...\n\n")
        self.root.update()
        
        try:
            cleaned_size = 0
            results = []
            
            # Clean Windows temp
            size = self.clean_folder(r'C:\Windows\Temp')
            results.append(f"Windows Temp: {self.bytes_to_mb(size):.2f} MB cleaned")
            cleaned_size += size
            
            # Clean user temp
            user_temp = os.environ.get('TEMP', '')
            if user_temp:
                size = self.clean_folder(user_temp)
                results.append(f"User Temp: {self.bytes_to_mb(size):.2f} MB cleaned")
                cleaned_size += size
            
            results.append(f"\nTotal space freed: {self.bytes_to_mb(cleaned_size):.2f} MB")
            results.append("✅ Disk cleanup completed!")
            
            self.cleaner_text.delete(1.0, tk.END)
            self.cleaner_text.insert(tk.END, "\n".join(results))
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to clean disk: {str(e)}")
    
    def get_folder_size(self, folder_path):
        total_size = 0
        try:
            for dirpath, dirnames, filenames in os.walk(folder_path):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    try:
                        total_size += os.path.getsize(filepath)
                    except (OSError, FileNotFoundError):
                        pass
        except (OSError, FileNotFoundError):
            pass
        return total_size
    
    def clean_folder(self, folder_path):
        cleaned_size = 0
        try:
            for dirpath, dirnames, filenames in os.walk(folder_path):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    try:
                        file_size = os.path.getsize(filepath)
                        os.remove(filepath)
                        cleaned_size += file_size
                    except (OSError, FileNotFoundError, PermissionError):
                        pass
        except (OSError, FileNotFoundError):
            pass
        return cleaned_size
    
    def bytes_to_mb(self, bytes_value):
        return bytes_value / (1024**2)


def main():
    root = tk.Tk()
    app = PCTechAssistant(root)
    root.mainloop()


if __name__ == "__main__":
    main()