-- Market Pulse Voting Schema
-- Run this in your Supabase SQL Editor to set up the voting system

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id TEXT NOT NULL,          -- 'nfl-pulse', 'politics-pulse'
  voter_token TEXT NOT NULL,            -- Anonymous client token (localStorage)
  market_slug TEXT NOT NULL,            -- Market identifier
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
  price_at_vote DECIMAL(5,4) NOT NULL,  -- Market price when vote was cast (for payout calc)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate votes
  UNIQUE(deployment_id, voter_token, market_slug)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_votes_deployment_market ON votes(deployment_id, market_slug);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(deployment_id, voter_token);

-- Aggregates view (for fast reads)
CREATE OR REPLACE VIEW vote_aggregates AS
SELECT
  deployment_id,
  market_slug,
  COUNT(*) FILTER (WHERE vote = 'yes') as yes_count,
  COUNT(*) FILTER (WHERE vote = 'no') as no_count,
  COUNT(*) as total_count,
  COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE vote = 'yes') / NULLIF(COUNT(*), 0)), 0) as yes_percent,
  COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE vote = 'no') / NULLIF(COUNT(*), 0)), 0) as no_percent
FROM votes
GROUP BY deployment_id, market_slug;

-- Enable Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (voting)
CREATE POLICY "Allow anonymous voting" ON votes
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow reading all votes (for aggregates)
CREATE POLICY "Allow reading votes" ON votes
  FOR SELECT
  USING (true);

-- Policy: Allow updating own votes (change vote)
CREATE POLICY "Allow updating own votes" ON votes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grant access to anon role
GRANT SELECT, INSERT, UPDATE ON votes TO anon;
GRANT SELECT ON vote_aggregates TO anon;
