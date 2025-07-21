/*
  # Complete Database Schema Setup for Radlett Lodge

  1. New Tables
    - `member_profiles` - Member information and roles
    - `lodge_documents` - Document storage and categorization  
    - `meeting_minutes` - Meeting records and minutes

  2. Security
    - Enable RLS on all tables
    - Add policies for member access and admin management
    - Create admin users with proper permissions

  3. Triggers
    - Auto-update timestamps on record changes
*/

-- Create member_profiles table
CREATE TABLE IF NOT EXISTS member_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text NOT NULL,
  position text,
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  UNIQUE(user_id)
);

-- Create lodge_documents table
CREATE TABLE IF NOT EXISTS lodge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meeting_minutes table
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date date NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Create function to handle updated_at (drop and recreate to avoid conflicts)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_member_profiles_updated_at ON member_profiles;
DROP TRIGGER IF EXISTS update_lodge_documents_updated_at ON lodge_documents;
DROP TRIGGER IF EXISTS update_meeting_minutes_updated_at ON meeting_minutes;

-- Create triggers for updated_at
CREATE TRIGGER update_member_profiles_updated_at
  BEFORE UPDATE ON member_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lodge_documents_updated_at
  BEFORE UPDATE ON lodge_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_minutes_updated_at
  BEFORE UPDATE ON meeting_minutes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Members can view all profiles" ON member_profiles;
DROP POLICY IF EXISTS "Members can update their own profile" ON member_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON member_profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON member_profiles;
DROP POLICY IF EXISTS "Members can view all documents" ON lodge_documents;
DROP POLICY IF EXISTS "Members can view all meeting minutes" ON meeting_minutes;

-- Create policies for member_profiles
CREATE POLICY "Members can view all profiles"
  ON member_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can update their own profile"
  ON member_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
  ON member_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM member_profiles mp 
      WHERE mp.user_id = auth.uid() 
      AND mp.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_profiles mp 
      WHERE mp.user_id = auth.uid() 
      AND mp.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete profiles"
  ON member_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM member_profiles mp 
      WHERE mp.user_id = auth.uid() 
      AND mp.role = 'admin'
    )
  );

-- Create policies for lodge_documents
CREATE POLICY "Members can view all documents"
  ON lodge_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for meeting_minutes
CREATE POLICY "Members can view all meeting minutes"
  ON meeting_minutes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create member profiles for existing users if they don't already exist
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all existing auth users and create profiles if they don't exist
  FOR user_record IN 
    SELECT id, email FROM auth.users 
    WHERE id NOT IN (SELECT user_id FROM member_profiles WHERE user_id IS NOT NULL)
  LOOP
    INSERT INTO public.member_profiles (
      user_id,
      full_name,
      role,
      join_date
    ) VALUES (
      user_record.id,
      COALESCE(
        CASE 
          WHEN user_record.email = 'ptalbot37@fastmail.com' THEN 'Paul Talbot'
          WHEN user_record.email = 'admin@radlettlodge6652.org.uk' THEN 'Lodge Administrator'
          ELSE 'Member User'
        END
      ),
      CASE 
        WHEN user_record.email IN ('ptalbot37@fastmail.com', 'admin@radlettlodge6652.org.uk') THEN 'admin'
        ELSE 'member'
      END,
      CURRENT_DATE
    );
  END LOOP;
END $$;