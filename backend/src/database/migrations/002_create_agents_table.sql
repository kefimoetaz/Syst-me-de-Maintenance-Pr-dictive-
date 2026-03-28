-- Migration: Create agents table
-- Requirements: 10.2, 10.8

CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    agent_id UUID UNIQUE NOT NULL,
    machine_id INTEGER REFERENCES machines(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique indexes for fast authentication lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_agent_id ON agents(agent_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_token ON agents(token);

-- Create index on machine_id for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_agents_machine_id ON agents(machine_id);

-- Add comments for documentation
COMMENT ON TABLE agents IS 'Stores agent authentication tokens and links agents to machines';
COMMENT ON COLUMN agents.agent_id IS 'Unique UUID identifier for each agent instance';
COMMENT ON COLUMN agents.token IS 'Authentication token used by agent to access the API';
