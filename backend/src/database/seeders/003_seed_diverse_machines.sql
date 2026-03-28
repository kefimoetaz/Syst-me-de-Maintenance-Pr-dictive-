-- Seed diverse machines with varied health patterns
-- This creates realistic data for ML training with different risk levels

-- ============================================
-- HEALTHY MACHINES (LOW RISK) - 5 machines
-- ============================================

INSERT INTO machines (hostname, ip_address, serial_number, os) VALUES
('PC-HR-04', '192.168.1.104', 'SN-2024-004-HR', 'Windows 11 Pro'),
('PC-FINANCE-05', '192.168.1.105', 'SN-2024-005-FIN', 'Windows 10 Enterprise'),
('PC-MARKETING-06', '192.168.1.106', 'SN-2024-006-MKT', 'Windows 11 Pro'),
('PC-SALES-07', '192.168.1.107', 'SN-2024-007-SALES', 'Windows 10 Pro'),
('PC-RECEPTION-08', '192.168.1.108', 'SN-2024-008-RECEP', 'Windows 11 Home')
ON CONFLICT (serial_number) DO NOTHING;

-- ============================================
-- MEDIUM RISK MACHINES - 5 machines
-- ============================================

INSERT INTO machines (hostname, ip_address, serial_number, os) VALUES
('PC-DESIGN-09', '192.168.1.109', 'SN-2024-009-DESIGN', 'Windows 10 Enterprise'),
('PC-VIDEO-10', '192.168.1.110', 'SN-2024-010-VIDEO', 'Windows 11 Pro'),
('PC-DATA-11', '192.168.1.111', 'SN-2024-011-DATA', 'Windows 10 Enterprise'),
('PC-QA-12', '192.168.1.112', 'SN-2024-012-QA', 'Windows 11 Pro'),
('PC-BACKUP-13', '192.168.1.113', 'SN-2024-013-BACKUP', 'Windows 10 Pro')
ON CONFLICT (serial_number) DO NOTHING;

-- ============================================
-- HIGH RISK MACHINES - 5 machines
-- ============================================

INSERT INTO machines (hostname, ip_address, serial_number, os) VALUES
('PC-OLD-SERVER-14', '192.168.1.114', 'SN-2024-014-OLDSRV', 'Windows Server 2016'),
('PC-LEGACY-15', '192.168.1.115', 'SN-2024-015-LEGACY', 'Windows 7 Pro'),
('PC-WAREHOUSE-16', '192.168.1.116', 'SN-2024-016-WRHS', 'Windows 10 Home'),
('PC-LAB-17', '192.168.1.117', 'SN-2024-017-LAB', 'Windows 10 Enterprise'),
('PC-ARCHIVE-18', '192.168.1.118', 'SN-2024-018-ARCH', 'Windows Server 2012')
ON CONFLICT (serial_number) DO NOTHING;

-- ============================================
-- INSERT AGENTS FOR ALL NEW MACHINES
-- ============================================

INSERT INTO agents (agent_id, machine_id, token) VALUES
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM machines WHERE serial_number = 'SN-2024-004-HR'), 'token_hr_2024_secure_004'),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM machines WHERE serial_number = 'SN-2024-005-FIN'), 'token_finance_2024_secure_005'),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM machines WHERE serial_number = 'SN-2024-006-MKT'), 'token_marketing_2024_secure_006'),
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM machines WHERE serial_number = 'SN-2024-007-SALES'), 'token_sales_2024_secure_007'),
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM machines WHERE serial_number = 'SN-2024-008-RECEP'), 'token_reception_2024_secure_008'),
('550e8400-e29b-41d4-a716-446655440009', (SELECT id FROM machines WHERE serial_number = 'SN-2024-009-DESIGN'), 'token_design_2024_secure_009'),
('550e8400-e29b-41d4-a716-446655440010', (SELECT id FROM machines WHERE serial_number = 'SN-2024-010-VIDEO'), 'token_video_2024_secure_010'),
('550e8400-e29b-41d4-a716-446655440011', (SELECT id FROM machines WHERE serial_number = 'SN-2024-011-DATA'), 'token_data_2024_secure_011'),
('550e8400-e29b-41d4-a716-446655440012', (SELECT id FROM machines WHERE serial_number = 'SN-2024-012-QA'), 'token_qa_2024_secure_012'),
('550e8400-e29b-41d4-a716-446655440013', (SELECT id FROM machines WHERE serial_number = 'SN-2024-013-BACKUP'), 'token_backup_2024_secure_013'),
('550e8400-e29b-41d4-a716-446655440014', (SELECT id FROM machines WHERE serial_number = 'SN-2024-014-OLDSRV'), 'token_oldserver_2024_secure_014'),
('550e8400-e29b-41d4-a716-446655440015', (SELECT id FROM machines WHERE serial_number = 'SN-2024-015-LEGACY'), 'token_legacy_2024_secure_015'),
('550e8400-e29b-41d4-a716-446655440016', (SELECT id FROM machines WHERE serial_number = 'SN-2024-016-WRHS'), 'token_warehouse_2024_secure_016'),
('550e8400-e29b-41d4-a716-446655440017', (SELECT id FROM machines WHERE serial_number = 'SN-2024-017-LAB'), 'token_lab_2024_secure_017'),
('550e8400-e29b-41d4-a716-446655440018', (SELECT id FROM machines WHERE serial_number = 'SN-2024-018-ARCH'), 'token_archive_2024_secure_018')
ON CONFLICT (agent_id) DO NOTHING;

-- ============================================
-- SYSTEM METRICS - HEALTHY MACHINES (30 days)
-- ============================================

-- PC-HR-04: Excellent health, low usage
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-004-HR'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    20.0 + (random() * 15),  -- CPU 20-35%
    45.0 + (random() * 8),   -- Temp 45-53°C
    40.0 + (random() * 15),  -- Memory 40-55%
    6144 + (random() * 2048)::INTEGER,
    16384,
    35.0 + (random() * 10),  -- Disk 35-45%
    281600 + (random() * 51200)::BIGINT,
    512000
FROM generate_series(0, 719);

-- PC-FINANCE-05: Good health, moderate usage
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-005-FIN'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    35.0 + (random() * 20),  -- CPU 35-55%
    50.0 + (random() * 10),  -- Temp 50-60°C
    50.0 + (random() * 15),  -- Memory 50-65%
    4096 + (random() * 2048)::INTEGER,
    16384,
    45.0 + (random() * 10),  -- Disk 45-55%
    230400 + (random() * 51200)::BIGINT,
    512000
FROM generate_series(0, 719);

-- PC-MARKETING-06: Good health
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-006-MKT'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    25.0 + (random() * 20),
    48.0 + (random() * 10),
    45.0 + (random() * 15),
    5120 + (random() * 2048)::INTEGER,
    16384,
    40.0 + (random() * 10),
    256000 + (random() * 51200)::BIGINT,
    512000
FROM generate_series(0, 719);

-- PC-SALES-07: Good health
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-007-SALES'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    30.0 + (random() * 20),
    50.0 + (random() * 10),
    50.0 + (random() * 15),
    4096 + (random() * 2048)::INTEGER,
    16384,
    50.0 + (random() * 10),
    204800 + (random() * 51200)::BIGINT,
    512000
FROM generate_series(0, 719);

-- PC-RECEPTION-08: Excellent health, minimal usage
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-008-RECEP'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    15.0 + (random() * 15),
    42.0 + (random() * 8),
    35.0 + (random() * 15),
    3072 + (random() * 1024)::INTEGER,
    8192,
    30.0 + (random() * 10),
    179200 + (random() * 25600)::BIGINT,
    256000
FROM generate_series(0, 719);

-- ============================================
-- SYSTEM METRICS - MEDIUM RISK MACHINES
-- ============================================

-- PC-DESIGN-09: High CPU/Memory usage, moderate temps
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-009-DESIGN'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    60.0 + (random() * 25),  -- CPU 60-85%
    65.0 + (random() * 15),  -- Temp 65-80°C
    70.0 + (random() * 15),  -- Memory 70-85%
    4096 + (random() * 4096)::INTEGER,
    32768,
    60.0 + (random() * 15),  -- Disk 60-75%
    256000 + (random() * 102400)::BIGINT,
    1024000
FROM generate_series(0, 719);

-- PC-VIDEO-10: Very high resource usage
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-010-VIDEO'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    70.0 + (random() * 20),  -- CPU 70-90%
    70.0 + (random() * 15),  -- Temp 70-85°C
    75.0 + (random() * 15),  -- Memory 75-90%
    3072 + (random() * 3072)::INTEGER,
    32768,
    70.0 + (random() * 15),  -- Disk 70-85%
    153600 + (random() * 102400)::BIGINT,
    1024000
FROM generate_series(0, 719);

-- PC-DATA-11: Moderate usage, increasing disk
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-011-DATA'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    50.0 + (random() * 20),
    60.0 + (random() * 12),
    65.0 + (random() * 15),
    4096 + (random() * 4096)::INTEGER,
    32768,
    65.0 + (random() * 15),  -- Disk growing
    179200 + (random() * 102400)::BIGINT,
    1024000
FROM generate_series(0, 719);

-- PC-QA-12: Moderate usage
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-012-QA'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    55.0 + (random() * 20),
    62.0 + (random() * 12),
    60.0 + (random() * 15),
    5120 + (random() * 3072)::INTEGER,
    16384,
    55.0 + (random() * 15),
    179200 + (random() * 51200)::BIGINT,
    512000
FROM generate_series(0, 719);

-- PC-BACKUP-13: High disk usage
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-013-BACKUP'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    45.0 + (random() * 20),
    58.0 + (random() * 12),
    55.0 + (random() * 15),
    6144 + (random() * 4096)::INTEGER,
    32768,
    75.0 + (random() * 10),  -- High disk usage
    204800 + (random() * 102400)::BIGINT,
    2048000
FROM generate_series(0, 719);

-- ============================================
-- SYSTEM METRICS - HIGH RISK MACHINES
-- ============================================

-- PC-OLD-SERVER-14: Critical - high everything
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-014-OLDSRV'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    75.0 + (random() * 20),  -- CPU 75-95%
    75.0 + (random() * 20),  -- Temp 75-95°C (CRITICAL!)
    80.0 + (random() * 15),  -- Memory 80-95%
    512 + (random() * 1024)::INTEGER,
    8192,
    85.0 + (random() * 10),  -- Disk 85-95%
    25600 + (random() * 25600)::BIGINT,
    512000
FROM generate_series(0, 719);

-- PC-LEGACY-15: Critical - old hardware degrading
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-015-LEGACY'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    70.0 + (random() * 25),  -- CPU 70-95%
    72.0 + (random() * 18),  -- Temp 72-90°C
    75.0 + (random() * 20),  -- Memory 75-95%
    256 + (random() * 768)::INTEGER,
    4096,
    88.0 + (random() * 10),  -- Disk 88-98%
    12800 + (random() * 12800)::BIGINT,
    256000
FROM generate_series(0, 719);

-- PC-WAREHOUSE-16: High risk - dusty environment
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-016-WRHS'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    65.0 + (random() * 25),
    78.0 + (random() * 17),  -- High temp due to dust
    70.0 + (random() * 20),
    1024 + (random() * 1024)::INTEGER,
    8192,
    80.0 + (random() * 15),
    25600 + (random() * 25600)::BIGINT,
    256000
FROM generate_series(0, 719);

-- PC-LAB-17: High risk - constant heavy testing
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-017-LAB'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    80.0 + (random() * 15),  -- CPU 80-95%
    70.0 + (random() * 20),
    85.0 + (random() * 10),  -- Memory 85-95%
    1024 + (random() * 2048)::INTEGER,
    16384,
    75.0 + (random() * 15),
    102400 + (random() * 51200)::BIGINT,
    512000
FROM generate_series(0, 719);

-- PC-ARCHIVE-18: Critical - old server, failing
INSERT INTO system_metrics (machine_id, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-018-ARCH'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    68.0 + (random() * 27),
    80.0 + (random() * 15),  -- Temp 80-95°C (CRITICAL!)
    78.0 + (random() * 17),
    512 + (random() * 1024)::INTEGER,
    8192,
    90.0 + (random() * 8),   -- Disk 90-98% (CRITICAL!)
    20480 + (random() * 20480)::BIGINT,
    1024000
FROM generate_series(0, 719);


-- ============================================
-- SMART DATA - HEALTHY MACHINES
-- ============================================

-- PC-HR-04: Perfect SMART health
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-004-HR'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'GOOD',
    0,
    0,
    35.0 + (random() * 8)
FROM generate_series(0, 719);

-- PC-FINANCE-05: Good SMART health
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-005-FIN'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'GOOD',
    0,
    0,
    38.0 + (random() * 10)
FROM generate_series(0, 719);

-- PC-MARKETING-06: Good SMART health
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-006-MKT'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'GOOD',
    0,
    0,
    36.0 + (random() * 9)
FROM generate_series(0, 719);

-- PC-SALES-07: Good SMART health
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-007-SALES'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'GOOD',
    0,
    0,
    37.0 + (random() * 10)
FROM generate_series(0, 719);

-- PC-RECEPTION-08: Perfect SMART health
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-008-RECEP'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'GOOD',
    0,
    0,
    34.0 + (random() * 8)
FROM generate_series(0, 719);

-- ============================================
-- SMART DATA - MEDIUM RISK MACHINES
-- ============================================

-- PC-DESIGN-09: WARNING - some errors appearing
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-009-DESIGN'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'WARNING',
    (random() * 3)::INTEGER,
    (random() * 2)::INTEGER,
    45.0 + (random() * 12)
FROM generate_series(0, 719);

-- PC-VIDEO-10: WARNING - high temperature
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-010-VIDEO'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'WARNING',
    (random() * 4)::INTEGER,
    (random() * 3)::INTEGER,
    48.0 + (random() * 15)
FROM generate_series(0, 719);

-- PC-DATA-11: WARNING - increasing errors
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-011-DATA'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'WARNING',
    (random() * 5)::INTEGER,
    (random() * 3)::INTEGER,
    42.0 + (random() * 13)
FROM generate_series(0, 719);

-- PC-QA-12: WARNING
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-012-QA'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'WARNING',
    (random() * 3)::INTEGER,
    (random() * 2)::INTEGER,
    43.0 + (random() * 12)
FROM generate_series(0, 719);

-- PC-BACKUP-13: WARNING - heavy write load
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-013-BACKUP'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'WARNING',
    (random() * 2)::INTEGER,
    (random() * 5)::INTEGER,  -- More write errors
    44.0 + (random() * 13)
FROM generate_series(0, 719);

-- ============================================
-- SMART DATA - HIGH RISK MACHINES
-- ============================================

-- PC-OLD-SERVER-14: CRITICAL - many errors
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-014-OLDSRV'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'CRITICAL',
    (random() * 10)::INTEGER,  -- 0-10 read errors
    (random() * 8)::INTEGER,   -- 0-8 write errors
    55.0 + (random() * 20)     -- High temp 55-75°C
FROM generate_series(0, 719);

-- PC-LEGACY-15: CRITICAL - failing disk
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-015-LEGACY'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'CRITICAL',
    (random() * 15)::INTEGER,  -- Many read errors
    (random() * 12)::INTEGER,  -- Many write errors
    58.0 + (random() * 22)     -- Very high temp
FROM generate_series(0, 719);

-- PC-WAREHOUSE-16: CRITICAL - environmental damage
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-016-WRHS'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'CRITICAL',
    (random() * 12)::INTEGER,
    (random() * 10)::INTEGER,
    60.0 + (random() * 20)     -- Very high temp due to dust
FROM generate_series(0, 719);

-- PC-LAB-17: CRITICAL - wear from constant testing
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-017-LAB'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'CRITICAL',
    (random() * 8)::INTEGER,
    (random() * 15)::INTEGER,  -- Heavy write wear
    52.0 + (random() * 18)
FROM generate_series(0, 719);

-- PC-ARCHIVE-18: CRITICAL - imminent failure
INSERT INTO smart_data (machine_id, timestamp, health_status, read_errors, write_errors, temperature)
SELECT 
    (SELECT id FROM machines WHERE serial_number = 'SN-2024-018-ARCH'),
    NOW() - (interval '1 hour' * generate_series(0, 719)),
    'CRITICAL',
    (random() * 20)::INTEGER,  -- Very high read errors
    (random() * 18)::INTEGER,  -- Very high write errors
    62.0 + (random() * 23)     -- Extremely high temp 62-85°C
FROM generate_series(0, 719);
