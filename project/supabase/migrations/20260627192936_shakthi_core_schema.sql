/*
# SHAKTHI Platform - Core Database Schema

## Overview
Safety-first sports empowerment platform for rural girl athletes in India.
This schema supports athlete profiles, mentor verification, scholarship matching,
safety reporting, and guardian approval workflows.

## Tables Created

### Core Tables
1. **profiles** - Extended user data beyond auth.users
   - id (uuid, PK, references auth.users)
   - full_name (text)
   - phone (text)
   - role (enum: ATHLETE, MENTOR, GUARDIAN, ADMIN, COLLEGE_REP, SPONSOR)
   - verified (boolean)
   - is_active (boolean)
   - preferred_language (text, default 'en')
   - avatar_url (text)
   - created_at, updated_at

2. **athlete_profiles** - Sports-specific athlete data
   - id (uuid, PK)
   - user_id (uuid, FK -> profiles, DEFAULT auth.uid())
   - sport (text)
   - position (text)
   - district (text)
   - state (text)
   - level (enum: SCHOOL, DISTRICT, STATE, NATIONAL, INTERNATIONAL)
   - achievements (jsonb)
   - video_urls (jsonb)
   - goals (text)
   - bio (text)
   - guardian_name (text)
   - guardian_phone (text)
   - guardian_email (text)
   - date_of_birth (date)
   - profile_completion (integer, 0-100)
   - visibility_settings (jsonb)
   - badges (jsonb)
   - created_at, updated_at

3. **mentor_profiles** - Verified mentor information
   - id (uuid, PK)
   - user_id (uuid, FK -> profiles, DEFAULT auth.uid())
   - expertise (text[])
   - experience_years (integer)
   - verified (boolean, default false)
   - certifications (jsonb)
   - languages (text[])
   - trust_score (decimal, 0-100)
   - availability (text[])
   - training_philosophy (text)
   - code_of_conduct_accepted (boolean)
   - response_time_hours (integer)
   - total_reviews (integer, default 0)
   - average_rating (decimal, 0-5)
   - district (text)
   - state (text)
   - bio (text)
   - created_at, updated_at

4. **scholarships** - Sports scholarship opportunities
   - id (uuid, PK)
   - name (text)
   - provider (text)
   - amount (decimal)
   - eligibility (text)
   - deadline (date)
   - state (text)
   - sport (text)
   - girls_only (boolean)
   - hostel_support (boolean)
   - application_mode (text)
   - description (text)
   - application_url (text)
   - required_level (text)
   - min_age (integer)
   - max_age (integer)
   - is_active (boolean, default true)
   - created_at, updated_at

5. **saved_scholarships** - User's saved scholarships
   - id (uuid, PK)
   - user_id (uuid, FK -> profiles, DEFAULT auth.uid())
   - scholarship_id (uuid, FK -> scholarships)
   - status (enum: SAVED, APPLYING, SUBMITTED, SHORTLISTED, APPROVED, REJECTED)
   - notes (text)
   - created_at, updated_at

6. **mentorship_requests** - Mentor-athlete connection requests
   - id (uuid, PK)
   - athlete_id (uuid, FK -> profiles)
   - mentor_id (uuid, FK -> profiles)
   - guardian_id (uuid, FK -> profiles, nullable)
   - status (enum: PENDING, PENDING_GUARDIAN, APPROVED, REJECTED, COMPLETED, CANCELLED)
   - goal (text)
   - mode (enum: ONLINE, OFFLINE, GROUP, CAREER_GUIDANCE, TRIAL_PREP)
   - message (text)
   - guardian_approved (boolean)
   - guardian_approved_at (timestamptz)
   - start_date (date)
   - end_date (date)
   - rejection_reason (text)
   - created_at, updated_at

7. **safety_reports** - Safety incident reports
   - id (uuid, PK)
   - ticket_id (text, unique) - Format: SHK-YYYY-XXXXX
   - reporter_id (uuid, FK -> profiles, DEFAULT auth.uid())
   - reported_user_id (uuid, FK -> profiles, nullable)
   - category (enum: HARASSMENT, INAPPROPRIATE_LANGUAGE, FRAUD, UNSAFE_MEETING, PRESSURE, DISCRIMINATION, MISUSE_CONTENT, SAFETY_CONCERN, OTHER)
   - severity (enum: NORMAL, URGENT, EMERGENCY)
   - description (text)
   - anonymous (boolean)
   - evidence_urls (jsonb)
   - status (enum: SUBMITTED, UNDER_REVIEW, ESCALATED, RESOLVED, DISMISSED)
   - assigned_to (uuid, FK -> profiles, nullable)
   - resolution_notes (text)
   - resolved_at (timestamptz)
   - created_at, updated_at

8. **colleges** - Sports quota college information
   - id (uuid, PK)
   - name (text)
   - location (text)
   - state (text)
   - sports_quota (boolean)
   - fee_concession (decimal)
   - hostel (boolean)
   - supported_sports (text[])
   - quota_rules (text)
   - required_achievement_level (text)
   - academic_streams (text[])
   - last_date (date)
   - website_url (text)
   - contact_email (text)
   - contact_phone (text)
   - is_active (boolean, default true)
   - created_at, updated_at

9. **opportunities** - Tournaments, trials, camps, schemes
   - id (uuid, PK)
   - title (text)
   - type (enum: TOURNAMENT, TRIAL, CAMP, GOVERNMENT_SCHEME, ACADEMY, SCHOLARSHIP)
   - organization (text)
   - location (text)
   - state (text)
   - deadline (date)
   - event_date (date)
   - description (text)
   - sport (text)
   - women_focused (boolean)
   - age_min (integer)
   - age_max (integer)
   - registration_url (text)
   - contact_email (text)
   - contact_phone (text)
   - is_active (boolean, default true)
   - created_at, updated_at

10. **training_resources** - Educational content
    - id (uuid, PK)
    - title (text)
    - category (text)
    - content_type (enum: VIDEO, ARTICLE, GUIDE, EXERCISE, NUTRITION, MENTAL_HEALTH)
    - content (text)
    - video_url (text)
    - author (text)
    - created_by (uuid, FK -> profiles)
    - duration_minutes (integer)
    - view_count (integer, default 0)
    - is_published (boolean)
    - sport (text)
    - thumbnail_url (text)
    - tags (text[])
    - created_at, updated_at

11. **mentor_reviews** - Feedback on mentors
    - id (uuid, PK)
    - mentor_id (uuid, FK -> profiles)
    - athlete_id (uuid, FK -> profiles, DEFAULT auth.uid())
    - mentorship_request_id (uuid, FK -> mentorship_requests)
    - respectful (integer, 1-5)
    - helpful (integer, 1-5)
    - knowledgeable (integer, 1-5)
    - safe_communication (integer, 1-5)
    - punctual (integer, 1-5)
    - comment (text)
    - private_safety_flag (boolean)
    - moderated (boolean, default false)
    - visible (boolean, default true)
    - created_at, updated_at

12. **chat_threads** - Mentor-athlete conversation threads
    - id (uuid, PK)
    - athlete_id (uuid, FK -> profiles)
    - mentor_id (uuid, FK -> profiles)
    - mentorship_request_id (uuid, FK -> mentorship_requests)
    - guardian_visible (boolean, default true)
    - is_active (boolean, default true)
    - is_blocked (boolean, default false)
    - blocked_by (uuid, FK -> profiles, nullable)
    - blocked_reason (text)
    - last_message_at (timestamptz)
    - created_at, updated_at

13. **chat_messages** - Individual messages in threads
    - id (uuid, PK)
    - thread_id (uuid, FK -> chat_threads)
    - sender_id (uuid, FK -> profiles)
    - content (text)
    - read (boolean, default false)
    - read_at (timestamptz)
    - attachment_urls (jsonb)
    - moderation_flag (boolean, default false)
    - moderation_reason (text)
    - guardian_visible (boolean, default true)
    - is_system_message (boolean, default false)
    - created_at

14. **notifications** - User notifications
    - id (uuid, PK)
    - user_id (uuid, FK -> profiles, DEFAULT auth.uid())
    - type (enum: MENTORSHIP, SCHOLARSHIP, REPORT, VERIFICATION, REWARD, ADMIN, CHAT, REMINDER)
    - title (text)
    - message (text)
    - read (boolean, default false)
    - read_at (timestamptz)
    - extra_data (jsonb)
    - action_url (text)
    - created_at

15. **success_stories** - Featured athlete achievements
    - id (uuid, PK)
    - athlete_id (uuid, FK -> profiles)
    - title (text)
    - story (text)
    - achievement (text)
    - featured (boolean, default false)
    - approved (boolean, default false)
    - image_url (text)
    - created_at, updated_at

## Security (RLS)
All tables have RLS enabled with appropriate ownership-based policies.
Guardian-scoped access for minor athletes' data.
Admin-level access for moderation and verification.
*/

-- Create enum types safely
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('ATHLETE', 'MENTOR', 'GUARDIAN', 'ADMIN', 'COLLEGE_REP', 'SPONSOR'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE athlete_level AS ENUM ('SCHOOL', 'DISTRICT', 'STATE', 'NATIONAL', 'INTERNATIONAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE request_status AS ENUM ('PENDING', 'PENDING_GUARDIAN', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE mentorship_mode AS ENUM ('ONLINE', 'OFFLINE', 'GROUP', 'CAREER_GUIDANCE', 'TRIAL_PREP'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_category AS ENUM ('HARASSMENT', 'INAPPROPRIATE_LANGUAGE', 'FRAUD', 'UNSAFE_MEETING', 'PRESSURE', 'DISCRIMINATION', 'MISUSE_CONTENT', 'SAFETY_CONCERN', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_severity AS ENUM ('NORMAL', 'URGENT', 'EMERGENCY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ESCALATED', 'RESOLVED', 'DISMISSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE scholarship_status AS ENUM ('SAVED', 'APPLYING', 'SUBMITTED', 'SHORTLISTED', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('MENTORSHIP', 'SCHOLARSHIP', 'REPORT', 'VERIFICATION', 'REWARD', 'ADMIN', 'CHAT', 'REMINDER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE opportunity_type AS ENUM ('TOURNAMENT', 'TRIAL', 'CAMP', 'GOVERNMENT_SCHEME', 'ACADEMY', 'SCHOLARSHIP'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE content_type AS ENUM ('VIDEO', 'ARTICLE', 'GUIDE', 'EXERCISE', 'NUTRITION', 'MENTAL_HEALTH'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone text,
    role user_role NOT NULL DEFAULT 'ATHLETE',
    verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    preferred_language text DEFAULT 'en',
    avatar_url text,
    district text,
    state text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Athlete profiles
CREATE TABLE IF NOT EXISTS athlete_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
    sport text,
    position text,
    district text,
    state text,
    level athlete_level DEFAULT 'SCHOOL',
    achievements jsonb DEFAULT '[]'::jsonb,
    video_urls jsonb DEFAULT '[]'::jsonb,
    goals text,
    bio text,
    guardian_name text,
    guardian_phone text,
    guardian_email text,
    guardian_user_id uuid REFERENCES profiles(id),
    date_of_birth date,
    profile_completion integer DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
    visibility_settings jsonb DEFAULT '{"showProfile": true, "showAchievements": true, "showContact": false}'::jsonb,
    badges jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Mentor profiles
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
    expertise text[] DEFAULT ARRAY[]::text[],
    experience_years integer DEFAULT 0,
    verified boolean DEFAULT false,
    certifications jsonb DEFAULT '[]'::jsonb,
    languages text[] DEFAULT ARRAY['en', 'hi']::text[],
    trust_score decimal DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    availability text[] DEFAULT ARRAY[]::text[],
    training_philosophy text,
    code_of_conduct_accepted boolean DEFAULT false,
    response_time_hours integer DEFAULT 48,
    total_reviews integer DEFAULT 0,
    average_rating decimal DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    district text,
    state text,
    bio text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Scholarships
CREATE TABLE IF NOT EXISTS scholarships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    provider text NOT NULL,
    amount decimal,
    eligibility text,
    deadline date,
    state text,
    sport text,
    girls_only boolean DEFAULT true,
    hostel_support boolean DEFAULT false,
    application_mode text,
    description text,
    application_url text,
    required_level text,
    min_age integer,
    max_age integer,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Saved scholarships
CREATE TABLE IF NOT EXISTS saved_scholarships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
    scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    status scholarship_status DEFAULT 'SAVED',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, scholarship_id)
);

-- Mentorship requests
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guardian_id uuid REFERENCES profiles(id),
    status request_status DEFAULT 'PENDING',
    goal text,
    mode mentorship_mode DEFAULT 'ONLINE',
    message text,
    guardian_approved boolean DEFAULT false,
    guardian_approved_at timestamptz,
    start_date date,
    end_date date,
    rejection_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Safety reports
CREATE TABLE IF NOT EXISTS safety_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id text UNIQUE NOT NULL DEFAULT 'SHK-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 100000)::text, 5, '0'),
    reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
    reported_user_id uuid REFERENCES profiles(id),
    category report_category NOT NULL,
    severity report_severity DEFAULT 'NORMAL',
    description text NOT NULL,
    anonymous boolean DEFAULT false,
    evidence_urls jsonb DEFAULT '[]'::jsonb,
    status report_status DEFAULT 'SUBMITTED',
    assigned_to uuid REFERENCES profiles(id),
    resolution_notes text,
    resolved_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Colleges
CREATE TABLE IF NOT EXISTS colleges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    location text,
    state text,
    sports_quota boolean DEFAULT true,
    fee_concession decimal DEFAULT 0,
    hostel boolean DEFAULT false,
    supported_sports text[] DEFAULT ARRAY[]::text[],
    quota_rules text,
    required_achievement_level text,
    academic_streams text[] DEFAULT ARRAY[]::text[],
    last_date date,
    website_url text,
    contact_email text,
    contact_phone text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    type opportunity_type NOT NULL,
    organization text,
    location text,
    state text,
    deadline date,
    event_date date,
    description text,
    sport text,
    women_focused boolean DEFAULT true,
    age_min integer,
    age_max integer,
    registration_url text,
    contact_email text,
    contact_phone text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Training resources
CREATE TABLE IF NOT EXISTS training_resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    category text,
    content_type content_type DEFAULT 'ARTICLE',
    content text,
    video_url text,
    author text,
    created_by uuid REFERENCES profiles(id),
    duration_minutes integer,
    view_count integer DEFAULT 0,
    is_published boolean DEFAULT true,
    sport text,
    thumbnail_url text,
    tags text[] DEFAULT ARRAY[]::text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Mentor reviews
CREATE TABLE IF NOT EXISTS mentor_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    athlete_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
    mentorship_request_id uuid REFERENCES mentorship_requests(id) ON DELETE SET NULL,
    respectful integer DEFAULT 5 CHECK (respectful >= 1 AND respectful <= 5),
    helpful integer DEFAULT 5 CHECK (helpful >= 1 AND helpful <= 5),
    knowledgeable integer DEFAULT 5 CHECK (knowledgeable >= 1 AND knowledgeable <= 5),
    safe_communication integer DEFAULT 5 CHECK (safe_communication >= 1 AND safe_communication <= 5),
    punctual integer DEFAULT 5 CHECK (punctual >= 1 AND punctual <= 5),
    comment text,
    private_safety_flag boolean DEFAULT false,
    moderated boolean DEFAULT false,
    visible boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(mentor_id, athlete_id)
);

-- Chat threads
CREATE TABLE IF NOT EXISTS chat_threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mentorship_request_id uuid REFERENCES mentorship_requests(id) ON DELETE SET NULL,
    guardian_visible boolean DEFAULT true,
    is_active boolean DEFAULT true,
    is_blocked boolean DEFAULT false,
    blocked_by uuid REFERENCES profiles(id),
    blocked_reason text,
    last_message_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(athlete_id, mentor_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    read boolean DEFAULT false,
    read_at timestamptz,
    attachment_urls jsonb DEFAULT '[]'::jsonb,
    moderation_flag boolean DEFAULT false,
    moderation_reason text,
    guardian_visible boolean DEFAULT true,
    is_system_message boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    read_at timestamptz,
    extra_data jsonb DEFAULT '{}'::jsonb,
    action_url text,
    created_at timestamptz DEFAULT now()
);

-- Success stories
CREATE TABLE IF NOT EXISTS success_stories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    story text NOT NULL,
    achievement text,
    featured boolean DEFAULT false,
    approved boolean DEFAULT false,
    image_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
    TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- RLS Policies for athlete_profiles
DROP POLICY IF EXISTS "Athletes can view own profile" ON athlete_profiles;
CREATE POLICY "Athletes can view own profile" ON athlete_profiles FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can insert own profile" ON athlete_profiles;
CREATE POLICY "Athletes can insert own profile" ON athlete_profiles FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes can update own profile" ON athlete_profiles;
CREATE POLICY "Athletes can update own profile" ON athlete_profiles FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mentors can view athlete profiles" ON athlete_profiles;
CREATE POLICY "Mentors can view athlete profiles" ON athlete_profiles FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('MENTOR', 'ADMIN'))
        OR EXISTS (
            SELECT 1 FROM mentorship_requests 
            WHERE mentor_id = auth.uid() AND athlete_id = athlete_profiles.user_id 
            AND status IN ('APPROVED', 'PENDING', 'PENDING_GUARDIAN')
        )
    );

DROP POLICY IF EXISTS "Guardians can view linked athletes" ON athlete_profiles;
CREATE POLICY "Guardians can view linked athletes" ON athlete_profiles FOR SELECT
    TO authenticated USING (
        guardian_user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'
        )
    );

-- RLS Policies for mentor_profiles
DROP POLICY IF EXISTS "Mentors can view own profile" ON mentor_profiles;
CREATE POLICY "Mentors can view own profile" ON mentor_profiles FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mentors can insert own profile" ON mentor_profiles;
CREATE POLICY "Mentors can insert own profile" ON mentor_profiles FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mentors can update own profile" ON mentor_profiles;
CREATE POLICY "Mentors can update own profile" ON mentor_profiles FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view verified mentors" ON mentor_profiles;
CREATE POLICY "Anyone can view verified mentors" ON mentor_profiles FOR SELECT
    TO authenticated USING (verified = true OR auth.uid() = user_id);

-- RLS Policies for scholarships (public read for authenticated users)
DROP POLICY IF EXISTS "Authenticated can view active scholarships" ON scholarships;
CREATE POLICY "Authenticated can view active scholarships" ON scholarships FOR SELECT
    TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage scholarships" ON scholarships;
CREATE POLICY "Admins can manage scholarships" ON scholarships FOR ALL
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- RLS Policies for saved_scholarships
DROP POLICY IF EXISTS "Users can view own saved scholarships" ON saved_scholarships;
CREATE POLICY "Users can view own saved scholarships" ON saved_scholarships FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved scholarships" ON saved_scholarships;
CREATE POLICY "Users can insert own saved scholarships" ON saved_scholarships FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved scholarships" ON saved_scholarships;
CREATE POLICY "Users can update own saved scholarships" ON saved_scholarships FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved scholarships" ON saved_scholarships;
CREATE POLICY "Users can delete own saved scholarships" ON saved_scholarships FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for mentorship_requests
DROP POLICY IF EXISTS "Athletes can view own requests" ON mentorship_requests;
CREATE POLICY "Athletes can view own requests" ON mentorship_requests FOR SELECT
    TO authenticated USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Mentors can view requests for them" ON mentorship_requests;
CREATE POLICY "Mentors can view requests for them" ON mentorship_requests FOR SELECT
    TO authenticated USING (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Guardians can view linked requests" ON mentorship_requests;
CREATE POLICY "Guardians can view linked requests" ON mentorship_requests FOR SELECT
    TO authenticated USING (
        auth.uid() = guardian_id
        OR EXISTS (
            SELECT 1 FROM athlete_profiles WHERE user_id = mentorship_requests.athlete_id 
            AND guardian_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Athletes can create requests" ON mentorship_requests;
CREATE POLICY "Athletes can create requests" ON mentorship_requests FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Mentors can update requests" ON mentorship_requests;
CREATE POLICY "Mentors can update requests" ON mentorship_requests FOR UPDATE
    TO authenticated USING (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Athletes can update own requests" ON mentorship_requests;
CREATE POLICY "Athletes can update own requests" ON mentorship_requests FOR UPDATE
    TO authenticated USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Guardians can approve requests" ON mentorship_requests;
CREATE POLICY "Guardians can approve requests" ON mentorship_requests FOR UPDATE
    TO authenticated USING (
        auth.uid() = guardian_id
        OR EXISTS (
            SELECT 1 FROM athlete_profiles WHERE user_id = mentorship_requests.athlete_id 
            AND guardian_user_id = auth.uid()
        )
    );

-- RLS Policies for safety_reports
DROP POLICY IF EXISTS "Users can view own reports" ON safety_reports;
CREATE POLICY "Users can view own reports" ON safety_reports FOR SELECT
    TO authenticated USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create reports" ON safety_reports;
CREATE POLICY "Users can create reports" ON safety_reports FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can update own reports" ON safety_reports;
CREATE POLICY "Users can update own reports" ON safety_reports FOR UPDATE
    TO authenticated USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can view all reports" ON safety_reports;
CREATE POLICY "Admins can view all reports" ON safety_reports FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

DROP POLICY IF EXISTS "Admins can update reports" ON safety_reports;
CREATE POLICY "Admins can update reports" ON safety_reports FOR UPDATE
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- RLS Policies for colleges (public read)
DROP POLICY IF EXISTS "Authenticated can view colleges" ON colleges;
CREATE POLICY "Authenticated can view colleges" ON colleges FOR SELECT
    TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage colleges" ON colleges;
CREATE POLICY "Admins can manage colleges" ON colleges FOR ALL
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- RLS Policies for opportunities
DROP POLICY IF EXISTS "Authenticated can view opportunities" ON opportunities;
CREATE POLICY "Authenticated can view opportunities" ON opportunities FOR SELECT
    TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage opportunities" ON opportunities;
CREATE POLICY "Admins can manage opportunities" ON opportunities FOR ALL
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- RLS Policies for training_resources
DROP POLICY IF EXISTS "Authenticated can view published resources" ON training_resources;
CREATE POLICY "Authenticated can view published resources" ON training_resources FOR SELECT
    TO authenticated USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage resources" ON training_resources;
CREATE POLICY "Admins can manage resources" ON training_resources FOR ALL
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MENTOR'))
    );

-- RLS Policies for mentor_reviews
DROP POLICY IF EXISTS "Athletes can view reviews for mentors" ON mentor_reviews;
CREATE POLICY "Athletes can view reviews for mentors" ON mentor_reviews FOR SELECT
    TO authenticated USING (visible = true OR auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can create reviews" ON mentor_reviews;
CREATE POLICY "Athletes can create reviews" ON mentor_reviews FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Mentors can view own reviews" ON mentor_reviews;
CREATE POLICY "Mentors can view own reviews" ON mentor_reviews FOR SELECT
    TO authenticated USING (auth.uid() = mentor_id);

-- RLS Policies for chat_threads
DROP POLICY IF EXISTS "Participants can view threads" ON chat_threads;
CREATE POLICY "Participants can view threads" ON chat_threads FOR SELECT
    TO authenticated USING (auth.uid() = athlete_id OR auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Guardians can view threads" ON chat_threads;
CREATE POLICY "Guardians can view threads" ON chat_threads FOR SELECT
    TO authenticated USING (
        EXISTS (
            SELECT 1 FROM athlete_profiles 
            WHERE user_id = chat_threads.athlete_id AND guardian_user_id = auth.uid()
        )
    );

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "Participants can view messages" ON chat_messages;
CREATE POLICY "Participants can view messages" ON chat_messages FOR SELECT
    TO authenticated USING (
        EXISTS (
            SELECT 1 FROM chat_threads 
            WHERE chat_threads.id = chat_messages.thread_id 
            AND (chat_threads.athlete_id = auth.uid() OR chat_threads.mentor_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Participants can send messages" ON chat_messages;
CREATE POLICY "Participants can send messages" ON chat_messages FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_threads 
            WHERE chat_threads.id = chat_messages.thread_id 
            AND (chat_threads.athlete_id = auth.uid() OR chat_threads.mentor_id = auth.uid())
            AND chat_threads.is_active = true
            AND chat_threads.is_blocked = false
        )
        AND auth.uid() = sender_id
    );

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for success_stories
DROP POLICY IF EXISTS "Users can view approved stories" ON success_stories;
CREATE POLICY "Users can view approved stories" ON success_stories FOR SELECT
    TO authenticated USING (approved = true OR auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can create stories" ON success_stories;
CREATE POLICY "Athletes can create stories" ON success_stories FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can update own stories" ON success_stories;
CREATE POLICY "Athletes can update own stories" ON success_stories FOR UPDATE
    TO authenticated USING (auth.uid() = athlete_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_sport ON athlete_profiles(sport);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_state ON athlete_profiles(state);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_level ON athlete_profiles(level);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_verified ON mentor_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_expertise ON mentor_profiles USING GIN(expertise);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_state ON scholarships(state);
CREATE INDEX IF NOT EXISTS idx_scholarships_sport ON scholarships(sport);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON mentorship_requests(status);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_athlete ON mentorship_requests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor ON mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_status ON safety_reports(status);
CREATE INDEX IF NOT EXISTS idx_safety_reports_severity ON safety_reports(severity);
CREATE INDEX IF NOT EXISTS idx_chat_threads_participants ON chat_threads(athlete_id, mentor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_training_resources_category ON training_resources(category);
CREATE INDEX IF NOT EXISTS idx_training_resources_sport ON training_resources(sport);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables with updated_at column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.columns 
            WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$;