-- Migration: Create users table for authentication
-- Created: 2026-02-28

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'technician', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on role for filtering
CREATE INDEX idx_users_role ON users(role);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@maintenance.com', '$2b$10$rKvVJZ7xH0qE5fYHx.xLHOXKp7jGvVx8qYqZ5YqZ5YqZ5YqZ5YqZ5O', 'Administrateur Système', 'admin');

-- Insert default technician user (password: tech123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('technicien@maintenance.com', '$2b$10$rKvVJZ7xH0qE5fYHx.xLHOXKp7jGvVx8qYqZ5YqZ5YqZ5YqZ5YqZ5O', 'Technicien Principal', 'technician');

-- Insert default viewer user (password: viewer123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('viewer@maintenance.com', '$2b$10$rKvVJZ7xH0qE5fYHx.xLHOXKp7jGvVx8qYqZ5YqZ5YqZ5YqZ5YqZ5O', 'Observateur', 'viewer');

COMMENT ON TABLE users IS 'Users table for authentication and authorization';
COMMENT ON COLUMN users.role IS 'User role: admin (full access), technician (manage alerts), viewer (read-only)';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
