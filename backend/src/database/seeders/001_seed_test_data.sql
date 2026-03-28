-- Seed data for testing
-- Requirements: 14.3, 14.4, 14.5, 14.6

-- Insert 3 test machines with different configurations
INSERT INTO machines (hostname, ip_address, serial_number, os) VALUES
('PC-ADMIN-01', '192.168.1.100', 'SN-2024-001-ADMIN', 'Windows 11 Pro'),
('PC-DEV-02', '192.168.1.101', 'SN-2024-002-DEV', 'Windows 10 Enterprise'),
('PC-SUPPORT-03', '192.168.1.102', 'SN-2024-003-SUPPORT', 'Windows 11 Home')
ON CONFLICT (serial_number) DO NOTHING;

-- Insert corresponding agents with valid tokens
INSERT INTO agents (agent_id, machine_id, token) VALUES
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM machines WHERE serial_number = 'SN-2024-001-ADMIN'), 'token_admin_2024_secure_001'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM machines WHERE serial_number = 'SN-2024-002-DEV'), 'token_dev_2024_secure_002'),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM machines WHERE serial_number = 'SN-2024-003-SUPPORT'), 'token_support_2024_secure_003')
ON CONFLICT (agent_id) DO NOTHING;

-- Insert historical system metrics data for testing queries
-- Data for PC-ADMIN-01 (last 24 hours, hourly)
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-001-ADMIN'),
    NOW() - (interval '1 hour' * generate_series(0, 23)),
    45.5 + (random() * 30),  -- CPU usage 45-75%
    55.0 + (random() * 15),  -- CPU temp 55-70°C
    60.0 + (random() * 20),  -- Memory usage 60-80%
    4096 + (random() * 2048)::INTEGER,  -- Available memory 4-6 GB
    16384,  -- Total memory 16 GB
    70.0 + (random() * 10),  -- Disk usage 70-80%
    153600 + (random() * 51200)::BIGINT,  -- Free disk 150-200 GB
    512000  -- Total disk 500 GB
FROM generate_series(0, 23);

-- Data for PC-DEV-02 (last 24 hours, hourly)
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-002-DEV'),
    NOW() - (interval '1 hour' * generate_series(0, 23)),
    65.0 + (random() * 25),  -- CPU usage 65-90%
    60.0 + (random() * 20),  -- CPU temp 60-80°C
    75.0 + (random() * 15),  -- Memory usage 75-90%
    2048 + (random() * 2048)::INTEGER,  -- Available memory 2-4 GB
    32768,  -- Total memory 32 GB
    55.0 + (random() * 15),  -- Disk usage 55-70%
    307200 + (random() * 102400)::BIGINT,  -- Free disk 300-400 GB
    1024000  -- Total disk 1 TB
FROM generate_series(0, 23);

-- Data for PC-SUPPORT-03 (last 24 hours, hourly)
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-003-SUPPORT'),
    NOW() - (interval '1 hour' * generate_series(0, 23)),
    30.0 + (random() * 20),  -- CPU usage 30-50%
    50.0 + (random() * 10),  -- CPU temp 50-60°C
    50.0 + (random() * 20),  -- Memory usage 50-70%
    2048 + (random() * 2048)::INTEGER,  -- Available memory 2-4 GB
    8192,  -- Total memory 8 GB
    80.0 + (random() * 10),  -- Disk usage 80-90%
    51200 + (random() * 25600)::BIGINT,  -- Free disk 50-75 GB
    256000  -- Total disk 250 GB
FROM generate_series(0, 23);

-- Insert historical SMART data for testing queries
-- Data for PC-ADMIN-01 (GOOD health)
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-001-ADMIN'),
    NOW() - (interval '1 hour' * generate_series(0, 23)),
    'GOOD',
    0,
    0,
    40.0 + (random() * 10)  -- Disk temp 40-50°C
FROM generate_series(0, 23);

-- Data for PC-DEV-02 (WARNING health with some errors)
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-002-DEV'),
    NOW() - (interval '1 hour' * generate_series(0, 23)),
    'WARNING',
    (random() * 5)::INTEGER,  -- 0-5 read errors
    (random() * 3)::INTEGER,  -- 0-3 write errors
    45.0 + (random() * 15)  -- Disk temp 45-60°C
FROM generate_series(0, 23);

-- Data for PC-SUPPORT-03 (GOOD health)
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-003-SUPPORT'),
    NOW() - (interval '1 hour' * generate_series(0, 23)),
    'GOOD',
    0,
    0,
    38.0 + (random() * 8)  -- Disk temp 38-46°C
FROM generate_series(0, 23);
