-- ClickLess AI — Initial Schema

-- Users table (lightweight, extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trip requests (raw user queries)
CREATE TABLE IF NOT EXISTS trip_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  intent JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trip results (full synthesized briefs)
CREATE TABLE IF NOT EXISTS trip_results (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  intent JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cached provider payloads (for future scraping/API caching)
CREATE TABLE IF NOT EXISTS cached_provider_payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  ttl_seconds INTEGER DEFAULT 86400,
  hash TEXT,
  UNIQUE(source, destination)
);

-- Saved plans (user bookmarks)
CREATE TABLE IF NOT EXISTS saved_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_result_id UUID REFERENCES trip_results(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_requests_user ON trip_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_results_created ON trip_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cached_payloads_dest ON cached_provider_payloads(destination);
CREATE INDEX IF NOT EXISTS idx_saved_plans_user ON saved_plans(user_id);
