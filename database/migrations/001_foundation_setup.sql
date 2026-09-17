-- =============================================================
-- Migration: 001_foundation_setup.sql
-- Description: Establishes initial database foundation and schema migrations tracking table.
-- Phase: 1 (Foundation)
-- =============================================================

-- Enable UUID extension for unique primary keys in Phase 2
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schema Migrations Tracking Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Record execution of foundation migration
INSERT INTO schema_migrations (migration_name)
VALUES ('001_foundation_setup.sql')
ON CONFLICT (migration_name) DO NOTHING;
