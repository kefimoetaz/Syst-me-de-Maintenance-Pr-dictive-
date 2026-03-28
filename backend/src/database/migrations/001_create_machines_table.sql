-- Migration: Create machines table
-- Requirements: 10.1

CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    os VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on serial_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_machines_serial_number ON machines(serial_number);

-- Add comment for documentation
COMMENT ON TABLE machines IS 'Stores information about physical machines in the IT infrastructure';
COMMENT ON COLUMN machines.serial_number IS 'Unique hardware serial number used to identify machines';
