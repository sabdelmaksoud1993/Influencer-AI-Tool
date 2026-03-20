-- ═══════════════════════════════════════════
-- GLOW PASS — Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- Applications table
CREATE TABLE applications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name TEXT NOT NULL,
  instagram TEXT NOT NULL,
  follower_count INTEGER DEFAULT 0,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  why_join TEXT DEFAULT '',
  referred_by TEXT DEFAULT '',
  heard_from TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT DEFAULT ''
);

-- Members table
CREATE TABLE members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name TEXT NOT NULL,
  instagram TEXT NOT NULL,
  follower_count INTEGER DEFAULT 0,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  access_code TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'New' CHECK (tier IN ('New', 'Inner Circle', 'Muse')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blacklisted', 'inactive')),
  content_score INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  events_hosted INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_event_at TIMESTAMPTZ,
  strikes INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  reliability_score REAL DEFAULT 100,
  total_events_applied INTEGER DEFAULT 0,
  total_content_submitted INTEGER DEFAULT 0,
  total_content_verified INTEGER DEFAULT 0,
  blacklisted BOOLEAN DEFAULT FALSE,
  blacklisted_at TIMESTAMPTZ,
  blacklist_reason TEXT DEFAULT '',
  blocked_by_venues TEXT[] DEFAULT '{}'
);

-- Venues table
CREATE TABLE venues (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  description TEXT DEFAULT '',
  venue_type TEXT DEFAULT '',
  capacity INTEGER DEFAULT 0,
  deal_type TEXT DEFAULT '',
  rate TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  access_code TEXT UNIQUE NOT NULL,
  total_events INTEGER DEFAULT 0,
  total_members_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  blocked_creators TEXT[] DEFAULT '{}'
);

-- Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_id TEXT REFERENCES venues(id),
  date TEXT DEFAULT '',
  time TEXT DEFAULT '',
  arrival_deadline TEXT DEFAULT '',
  dress_code TEXT DEFAULT '',
  description TEXT DEFAULT '',
  capacity INTEGER DEFAULT 10,
  perks TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  template_id TEXT
);

-- RSVPs table (was nested in events)
CREATE TABLE rsvps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  member_name TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  follower_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'attended', 'no_show')),
  rsvp_at TIMESTAMPTZ DEFAULT NOW(),
  check_in_token TEXT,
  checked_in_at TIMESTAMPTZ,
  checked_in_by TEXT,
  content_status TEXT CHECK (content_status IN ('submitted', 'verified')),
  content_posted BOOLEAN DEFAULT FALSE,
  UNIQUE(event_id, member_id)
);

-- Content Proofs table (was nested in rsvps)
CREATE TABLE content_proofs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rsvp_id TEXT NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  link TEXT NOT NULL,
  type TEXT DEFAULT 'story' CHECK (type IN ('story', 'post', 'reel')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by TEXT
);

-- Event Templates table
CREATE TABLE event_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  title TEXT NOT NULL,
  time TEXT DEFAULT '',
  arrival_deadline TEXT DEFAULT '',
  dress_code TEXT DEFAULT '',
  description TEXT DEFAULT '',
  capacity INTEGER DEFAULT 10,
  perks TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════
CREATE INDEX idx_members_access_code ON members(access_code);
CREATE INDEX idx_venues_access_code ON venues(access_code);
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX idx_rsvps_member_id ON rsvps(member_id);
CREATE INDEX idx_rsvps_check_in_token ON rsvps(check_in_token);
CREATE INDEX idx_content_proofs_rsvp_id ON content_proofs(rsvp_id);
CREATE INDEX idx_content_proofs_member_id ON content_proofs(member_id);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_members_status ON members(status);

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY — Disable for now (MVP)
-- Enable when adding proper auth later
-- ═══════════════════════════════════════════
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (MVP - tighten later)
CREATE POLICY "Allow all on applications" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on venues" ON venues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on rsvps" ON rsvps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on content_proofs" ON content_proofs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on event_templates" ON event_templates FOR ALL USING (true) WITH CHECK (true);
