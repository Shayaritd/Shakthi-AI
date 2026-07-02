-- Cache tables for live scholarship and college search results
-- These store fetched data to reduce API calls and enable faster responses

CREATE TABLE live_scholarship_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL, -- 'government', 'khelo_india', 'private_foundation', etc.
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  eligibility TEXT,
  deadline DATE,
  state TEXT,
  sport TEXT,
  girls_only BOOLEAN DEFAULT false,
  hostel_support BOOLEAN DEFAULT false,
  application_mode TEXT,
  description TEXT,
  application_url TEXT,
  min_age INTEGER,
  max_age INTEGER,
  raw_data JSONB, -- Store complete original data
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE live_college_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL, -- 'ugc', 'aicte', 'sai', 'nirf'
  name TEXT NOT NULL,
  location TEXT,
  state TEXT,
  sports_quota BOOLEAN DEFAULT false,
  fee_concession NUMERIC DEFAULT 0,
  hostel BOOLEAN DEFAULT false,
  supported_sports TEXT[] DEFAULT ARRAY[]::TEXT[],
  quota_rules TEXT,
  required_achievement_level TEXT,
  academic_streams TEXT[] DEFAULT ARRAY[]::TEXT[],
  website_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  nirf_ranking INTEGER,
  raw_data JSONB, -- Store complete original data
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for user-saved live scholarships
CREATE TABLE saved_live_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scholarship_cache_id UUID NOT NULL REFERENCES live_scholarship_cache(id) ON DELETE CASCADE,
  match_score NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'SAVED' CHECK (status IN ('SAVED', 'APPLYING', 'SUBMITTED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scholarship_cache_id)
);

-- Table for user-saved live colleges
CREATE TABLE saved_live_colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  college_cache_id UUID NOT NULL REFERENCES live_college_cache(id) ON DELETE CASCADE,
  match_score NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, college_cache_id)
);

-- Table for AI-generated match recommendations
CREATE TABLE ai_match_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('scholarship', 'college')),
  reference_id UUID NOT NULL, -- Either scholarship_cache_id or college_cache_id
  match_score NUMERIC NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_type, reference_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_live_scholarship_cache_source ON live_scholarship_cache(source);
CREATE INDEX idx_live_scholarship_cache_sport ON live_scholarship_cache(sport);
CREATE INDEX idx_live_scholarship_cache_state ON live_scholarship_cache(state);
CREATE INDEX idx_live_scholarship_cache_deadline ON live_scholarship_cache(deadline);
CREATE INDEX idx_live_scholarship_cache_expires ON live_scholarship_cache(expires_at);
CREATE INDEX idx_live_scholarship_cache_girls_only ON live_scholarship_cache(girls_only);

CREATE INDEX idx_live_college_cache_source ON live_college_cache(source);
CREATE INDEX idx_live_college_cache_state ON live_college_cache(state);
CREATE INDEX idx_live_college_cache_expires ON live_college_cache(expires_at);
CREATE INDEX idx_live_college_cache_sports_quota ON live_college_cache(sports_quota);

CREATE INDEX idx_saved_live_scholarships_user ON saved_live_scholarships(user_id);
CREATE INDEX idx_saved_live_colleges_user ON saved_live_colleges(user_id);
CREATE INDEX idx_ai_matches_user_type ON ai_match_recommendations(user_id, match_type);

-- Enable RLS
ALTER TABLE live_scholarship_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_college_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_live_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_live_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_match_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cache tables (read-only for all authenticated users)
CREATE POLICY "select_live_scholarship_cache" ON live_scholarship_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "select_live_college_cache" ON live_college_cache
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for saved items (user ownership)
CREATE POLICY "select_own_saved_live_scholarships" ON saved_live_scholarships
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_saved_live_scholarships" ON saved_live_scholarships
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_saved_live_scholarships" ON saved_live_scholarships
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_saved_live_scholarships" ON saved_live_scholarships
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "select_own_saved_live_colleges" ON saved_live_colleges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_saved_live_colleges" ON saved_live_colleges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_saved_live_colleges" ON saved_live_colleges
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for AI matches (user ownership)
CREATE POLICY "select_own_ai_matches" ON ai_match_recommendations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_ai_matches" ON ai_match_recommendations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_ai_matches" ON ai_match_recommendations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM live_scholarship_cache WHERE expires_at < NOW();
  DELETE FROM live_college_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;