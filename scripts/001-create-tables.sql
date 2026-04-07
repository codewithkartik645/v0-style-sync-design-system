-- StyleSync Database Schema
-- Creates tables for storing scraped site data, design tokens, locked tokens, and version history

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sites that have been scraped
CREATE TABLE IF NOT EXISTS scraped_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT,
  raw_css TEXT,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted design tokens (JSONB for flexibility)
CREATE TABLE IF NOT EXISTS design_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES scraped_sites(id) ON DELETE CASCADE,
  colors JSONB DEFAULT '{}',
  typography JSONB DEFAULT '{}',
  spacing JSONB DEFAULT '{}',
  shadows JSONB DEFAULT '{}',
  radii JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-locked tokens (prevent override on re-scrape)
CREATE TABLE IF NOT EXISTS locked_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES scraped_sites(id) ON DELETE CASCADE,
  token_path TEXT NOT NULL,
  locked_value TEXT NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, token_path)
);

-- Version history for time-machine functionality
CREATE TABLE IF NOT EXISTS token_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES scraped_sites(id) ON DELETE CASCADE,
  token_path TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('extracted', 'manual_edit', 'locked', 'unlocked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scraped_sites_domain ON scraped_sites(domain);
CREATE INDEX IF NOT EXISTS idx_scraped_sites_status ON scraped_sites(extraction_status);
CREATE INDEX IF NOT EXISTS idx_design_tokens_site_id ON design_tokens(site_id);
CREATE INDEX IF NOT EXISTS idx_locked_tokens_site_id ON locked_tokens(site_id);
CREATE INDEX IF NOT EXISTS idx_token_versions_site_id ON token_versions(site_id);
CREATE INDEX IF NOT EXISTS idx_token_versions_created_at ON token_versions(created_at DESC);
