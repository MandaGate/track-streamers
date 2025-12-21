-- Streamer Tracker Database Schema
-- Run this file to create the necessary tables

-- Drop tables if they exist (for clean migrations)
DROP TABLE IF EXISTS subscriber_history CASCADE;
DROP TABLE IF EXISTS streamers CASCADE;

-- Create streamers table
CREATE TABLE streamers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriber_history table
CREATE TABLE subscriber_history (
  id VARCHAR(64) PRIMARY KEY,
  streamer_id VARCHAR(64) REFERENCES streamers(id) ON DELETE CASCADE,
  count INTEGER NOT NULL CHECK (count >= 0),
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_streamer_id ON subscriber_history(streamer_id);
CREATE INDEX idx_timestamp ON subscriber_history(timestamp);

ALTER TABLE subscriber_history
ADD CONSTRAINT unique_streamer_timestamp
UNIQUE (streamer_id, timestamp);

-- Display success message
SELECT 'Database tables created successfully!' AS status;
