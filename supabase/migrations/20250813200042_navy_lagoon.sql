/*
  # Complete Church App Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `sermons` - Church sermons with audio/video
    - `events` - Church events and activities
    - `prayer_requests` - Community prayer requests
    - `giving_categories` - Donation categories
    - `donations` - User donations and payments
    - `event_rsvps` - Event RSVP responses
    - `daily_verses` - Daily scripture verses
    - `bible_reading_plans` - Bible reading plans
    - `bible_reading_plan_days` - Daily readings for plans
    - `user_reading_progress` - User progress tracking
    - `word_of_day_slides` - Word of day content slides
    - `announcements` - Church announcements
    - `small_group_requests` - Small group join requests
    - `help_support_requests` - Help and support requests

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Secure user data access

  3. Functions
    - Helper functions for counters and updates
    - Trigger functions for updated_at timestamps
*/

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  member_since date DEFAULT CURRENT_DATE,
  profile_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sermons table
CREATE TABLE IF NOT EXISTS sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  speaker text NOT NULL,
  date text NOT NULL,
  duration text NOT NULL,
  series text NOT NULL,
  audio_url text,
  video_url text,
  image_url text NOT NULL,
  description text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  attendees integer DEFAULT 0,
  capacity integer,
  image_url text,
  is_rsvp_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Prayer requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  submitted_by text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  is_anonymous boolean DEFAULT false,
  prayer_count integer DEFAULT 0,
  category text NOT NULL CHECK (category IN ('health', 'family', 'work', 'spiritual', 'other')),
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Giving categories table
CREATE TABLE IF NOT EXISTS giving_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  goal numeric NOT NULL,
  raised numeric DEFAULT 0,
  color text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  category_id uuid REFERENCES giving_categories(id),
  amount numeric(10,2) NOT NULL,
  is_recurring boolean DEFAULT false,
  frequency text,
  payment_method text NOT NULL,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id bigserial PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'attending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Daily verses table
CREATE TABLE IF NOT EXISTS daily_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verse text NOT NULL,
  reference text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bible reading plans table
CREATE TABLE IF NOT EXISTS bible_reading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  duration_days integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bible reading plan days table
CREATE TABLE IF NOT EXISTS bible_reading_plan_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES bible_reading_plans(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  reading_reference text NOT NULL,
  reading_text text,
  reflection_question text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, day_number)
);

-- User reading progress table
CREATE TABLE IF NOT EXISTS user_reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES bible_reading_plans(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, plan_id, day_number)
);

-- Word of day slides table
CREATE TABLE IF NOT EXISTS word_of_day_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('image', 'video')),
  content_url text NOT NULL,
  word text NOT NULL,
  verse text NOT NULL,
  reference text NOT NULL,
  order_index integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Small group requests table
CREATE TABLE IF NOT EXISTS small_group_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  group_leader text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone_number text,
  message text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Help support requests table
CREATE TABLE IF NOT EXISTS help_support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone_number text,
  subject text NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_reading_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_of_day_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_group_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_support_requests ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
-- Profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Sermons policies
DROP POLICY IF EXISTS "Allow public read access on sermons" ON sermons;
DROP POLICY IF EXISTS "Allow authenticated users to insert sermons" ON sermons;
DROP POLICY IF EXISTS "Allow authenticated users to update sermons" ON sermons;
DROP POLICY IF EXISTS "Allow authenticated users to delete sermons" ON sermons;
DROP POLICY IF EXISTS "Anyone can read sermons" ON sermons;

-- Events policies
DROP POLICY IF EXISTS "Allow public read access on events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to insert events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON events;
DROP POLICY IF EXISTS "Anyone can read events" ON events;

-- Prayer requests policies
DROP POLICY IF EXISTS "Allow public read access on approved prayer_requests" ON prayer_requests;
DROP POLICY IF EXISTS "Allow anyone to insert prayer_requests" ON prayer_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update prayer_requests" ON prayer_requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete prayer_requests" ON prayer_requests;
DROP POLICY IF EXISTS "Anyone can read prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Authenticated users can create prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Users can update own prayer requests" ON prayer_requests;

-- Giving categories policies
DROP POLICY IF EXISTS "Allow public read access on active giving_categories" ON giving_categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert giving_categories" ON giving_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update giving_categories" ON giving_categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete giving_categories" ON giving_categories;
DROP POLICY IF EXISTS "Anyone can read giving categories" ON giving_categories;

-- Donations policies
DROP POLICY IF EXISTS "Users can read own donations" ON donations;
DROP POLICY IF EXISTS "Users can create own donations" ON donations;

-- Event RSVPs policies
DROP POLICY IF EXISTS "Users can manage own RSVPs" ON event_rsvps;
DROP POLICY IF EXISTS "Users can read own RSVPs" ON event_rsvps;

-- Daily verses policies
DROP POLICY IF EXISTS "Allow public read access on active daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow authenticated users to insert daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow authenticated users to update daily_verses" ON daily_verses;
DROP POLICY IF EXISTS "Allow authenticated users to delete daily_verses" ON daily_verses;

-- Bible reading plans policies
DROP POLICY IF EXISTS "Allow public read access on active bible_reading_plans" ON bible_reading_plans;
DROP POLICY IF EXISTS "Allow authenticated users to manage bible_reading_plans" ON bible_reading_plans;

-- Bible reading plan days policies
DROP POLICY IF EXISTS "Allow public read access on bible_reading_plan_days" ON bible_reading_plan_days;
DROP POLICY IF EXISTS "Allow authenticated users to manage bible_reading_plan_days" ON bible_reading_plan_days;

-- User reading progress policies
DROP POLICY IF EXISTS "Users can view their own reading progress" ON user_reading_progress;
DROP POLICY IF EXISTS "Users can create their own reading progress" ON user_reading_progress;
DROP POLICY IF EXISTS "Users can update their own reading progress" ON user_reading_progress;
DROP POLICY IF EXISTS "Users can delete their own reading progress" ON user_reading_progress;

-- Word of day slides policies
DROP POLICY IF EXISTS "Allow public read access on active word_of_day_slides" ON word_of_day_slides;
DROP POLICY IF EXISTS "Allow authenticated users to insert word_of_day_slides" ON word_of_day_slides;
DROP POLICY IF EXISTS "Allow authenticated users to update word_of_day_slides" ON word_of_day_slides;
DROP POLICY IF EXISTS "Allow authenticated users to delete word_of_day_slides" ON word_of_day_slides;

-- Announcements policies
DROP POLICY IF EXISTS "Allow public read access on active announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to insert announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to update announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to delete announcements" ON announcements;

-- Small group requests policies
DROP POLICY IF EXISTS "Allow anyone to insert small_group_requests" ON small_group_requests;
DROP POLICY IF EXISTS "Allow authenticated users to view small_group_requests" ON small_group_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update small_group_requests" ON small_group_requests;

-- Help support requests policies
DROP POLICY IF EXISTS "Allow anyone to insert help_support_requests" ON help_support_requests;
DROP POLICY IF EXISTS "Allow authenticated users to view help_support_requests" ON help_support_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update help_support_requests" ON help_support_requests;

-- Profiles policies

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Sermons policies
CREATE POLICY "Allow public read access on sermons"
  ON sermons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sermons"
  ON sermons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sermons"
  ON sermons FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete sermons"
  ON sermons FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read sermons"
  ON sermons FOR SELECT
  TO authenticated
  USING (true);

-- Events policies
CREATE POLICY "Allow public read access on events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Prayer requests policies
CREATE POLICY "Allow public read access on approved prayer_requests"
  ON prayer_requests FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Allow anyone to insert prayer_requests"
  ON prayer_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update prayer_requests"
  ON prayer_requests FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete prayer_requests"
  ON prayer_requests FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read prayer requests"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create prayer requests"
  ON prayer_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own prayer requests"
  ON prayer_requests FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = submitted_by);

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_sermons_updated_at ON sermons;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_prayer_requests_updated_at ON prayer_requests;
DROP TRIGGER IF EXISTS update_giving_categories_updated_at ON giving_categories;
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
DROP TRIGGER IF EXISTS update_event_rsvps_updated_at ON event_rsvps;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_requests_updated_at
  BEFORE UPDATE ON prayer_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_giving_categories_updated_at
  BEFORE UPDATE ON giving_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_rsvps_updated_at
  BEFORE UPDATE ON event_rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Giving categories policies
CREATE POLICY "Allow public read access on active giving_categories"
  ON giving_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to insert giving_categories"
  ON giving_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update giving_categories"
  ON giving_categories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete giving_categories"
  ON giving_categories FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read giving categories"
  ON giving_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Donations policies
CREATE POLICY "Users can read own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Event RSVPs policies
CREATE POLICY "Users can manage own RSVPs"
  ON event_rsvps FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own RSVPs"
  ON event_rsvps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Daily verses policies
CREATE POLICY "Allow public read access on active daily_verses"
  ON daily_verses FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to insert daily_verses"
  ON daily_verses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update daily_verses"
  ON daily_verses FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete daily_verses"
  ON daily_verses FOR DELETE
  TO authenticated
  USING (true);

-- Bible reading plans policies
CREATE POLICY "Allow public read access on active bible_reading_plans"
  ON bible_reading_plans FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage bible_reading_plans"
  ON bible_reading_plans FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bible reading plan days policies
CREATE POLICY "Allow public read access on bible_reading_plan_days"
  ON bible_reading_plan_days FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage bible_reading_plan_days"
  ON bible_reading_plan_days FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- User reading progress policies
CREATE POLICY "Users can view their own reading progress"
  ON user_reading_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading progress"
  ON user_reading_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress"
  ON user_reading_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress"
  ON user_reading_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Word of day slides policies
CREATE POLICY "Allow public read access on active word_of_day_slides"
  ON word_of_day_slides FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to insert word_of_day_slides"
  ON word_of_day_slides FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update word_of_day_slides"
  ON word_of_day_slides FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete word_of_day_slides"
  ON word_of_day_slides FOR DELETE
  TO authenticated
  USING (true);

-- Announcements policies
CREATE POLICY "Allow public read access on active announcements"
  ON announcements FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (true);

-- Small group requests policies
CREATE POLICY "Allow anyone to insert small_group_requests"
  ON small_group_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view small_group_requests"
  ON small_group_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update small_group_requests"
  ON small_group_requests FOR UPDATE
  TO authenticated
  USING (true);

-- Help support requests policies
CREATE POLICY "Allow anyone to insert help_support_requests"
  ON help_support_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view help_support_requests"
  ON help_support_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update help_support_requests"
  ON help_support_requests FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(date);
CREATE INDEX IF NOT EXISTS idx_sermons_series ON sermons(series);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_approved ON prayer_requests(is_approved);
CREATE INDEX IF NOT EXISTS idx_giving_categories_active ON giving_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);
CREATE INDEX IF NOT EXISTS idx_daily_verses_active ON daily_verses(is_active);
CREATE INDEX IF NOT EXISTS idx_word_slides_order ON word_of_day_slides(order_index);
CREATE INDEX IF NOT EXISTS idx_word_slides_active ON word_of_day_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_small_group_requests_status ON small_group_requests(status);
CREATE INDEX IF NOT EXISTS idx_small_group_requests_created_at ON small_group_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_help_support_requests_status ON help_support_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_support_requests_category ON help_support_requests(category);
CREATE INDEX IF NOT EXISTS idx_help_support_requests_created_at ON help_support_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_bible_plan_days_plan_id ON bible_reading_plan_days(plan_id);
CREATE INDEX IF NOT EXISTS idx_bible_plan_days_day_number ON bible_reading_plan_days(day_number);
 

-- Helper functions
CREATE OR REPLACE FUNCTION increment_prayer_count(request_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE prayer_requests 
  SET prayer_count = prayer_count + 1 
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_event_attendees(event_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET attendees = attendees + 1 
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_event_attendees(event_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET attendees = GREATEST(attendees - 1, 0)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_category_raised_amount(category_id uuid, donation_amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE giving_categories 
  SET raised = raised + donation_amount 
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;