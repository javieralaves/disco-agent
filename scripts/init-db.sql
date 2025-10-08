-- Disco Database Initialization Script
-- This script sets up the pgvector extension for Supabase/PostgreSQL

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT extversion FROM pg_extension WHERE extname = 'vector';
