/*
  # Complete Database Setup for Radlett Lodge

  1. Tables
    - Create member_profiles table with proper constraints
    - Create lodge_documents table for document management
    - Create meeting_minutes table for meeting records

  2. Security
    - Enable RLS on all tables
    - Create comprehensive policies for member and admin access
    - Ensure proper data isolation and permissions

  3. Admin Setup
    - Create admin profile for existing user ptalbot37@gmail.com
    - Set up proper role-based access control

  4. Sample Data
    - Add some sample documents and meeting minutes for testing
*/

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create member_profiles table
CREATE TABLE IF NOT EXISTS public.member_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    position TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT member_profiles_user_id_key UNIQUE (user_id),
    CONSTRAINT member_profiles_role_check CHECK (role IN ('member', 'admin'))
);

-- Create lodge_documents table
CREATE TABLE IF NOT EXISTS public.lodge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_minutes table
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lodge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Members can view all profiles" ON public.member_profiles;
DROP POLICY IF EXISTS "Members can update their own profile" ON public.member_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.member_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.member_profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.member_profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.member_profiles;
DROP POLICY IF EXISTS "Members can view all documents" ON public.lodge_documents;
DROP POLICY IF EXISTS "Admins can manage documents" ON public.lodge_documents;
DROP POLICY IF EXISTS "Members can view all meeting minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Admins can manage meeting minutes" ON public.meeting_minutes;

-- Member Profiles Policies
CREATE POLICY "Members can view all profiles"
    ON public.member_profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Members can update their own profile"
    ON public.member_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.member_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
    ON public.member_profiles
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.member_profiles mp 
        WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.member_profiles mp 
        WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
    ));

CREATE POLICY "Admins can insert any profile"
    ON public.member_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.member_profiles mp 
        WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
    ));

CREATE POLICY "Only admins can delete profiles"
    ON public.member_profiles
    FOR DELETE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.member_profiles mp 
        WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
    ));

-- Lodge Documents Policies
CREATE POLICY "Members can view all documents"
    ON public.lodge_documents
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage documents"
    ON public.lodge_documents
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.member_profiles mp 
        WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.member_profiles mp 
        WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
    ));

-- Meeting Minutes Policies
CREATE POLICY "Members can view all meeting minutes"
    ON public.meeting_minutes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage meeting minutes"
    ON public.meeting_minutes
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.member_profiles mp 
        WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.member_profiles mp 
        WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
    ));

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_member_profiles_updated_at ON public.member_profiles;
DROP TRIGGER IF EXISTS update_lodge_documents_updated_at ON public.lodge_documents;
DROP TRIGGER IF EXISTS update_meeting_minutes_updated_at ON public.meeting_minutes;

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_member_profiles_updated_at
    BEFORE UPDATE ON public.member_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lodge_documents_updated_at
    BEFORE UPDATE ON public.lodge_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_minutes_updated_at
    BEFORE UPDATE ON public.meeting_minutes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON public.member_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_role ON public.member_profiles(role);
CREATE INDEX IF NOT EXISTS idx_lodge_documents_category ON public.lodge_documents(category);
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_date ON public.meeting_minutes(meeting_date);

-- Create admin profile for existing user
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for the admin email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'ptalbot37@gmail.com' 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Create or update the admin profile
    INSERT INTO public.member_profiles (
      user_id,
      full_name,
      role,
      position,
      join_date
    ) VALUES (
      admin_user_id,
      'Paul Talbot',
      'admin',
      'Worshipful Master',
      CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      full_name = 'Paul Talbot',
      position = 'Worshipful Master';
      
    RAISE NOTICE 'Admin profile created/updated for user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User with email ptalbot37@gmail.com not found';
  END IF;
END $$;

-- Insert sample lodge documents
INSERT INTO public.lodge_documents (title, description, url, category) VALUES
('Lodge Bylaws 2024', 'Current bylaws and regulations for Radlett Lodge No. 6652', 'https://example.com/bylaws-2024.pdf', 'bylaws'),
('Grand Lodge Communication - January 2024', 'Monthly communication from the United Grand Lodge of England', 'https://example.com/grand-lodge-jan-2024.pdf', 'grand_lodge'),
('Provincial Newsletter - Winter 2024', 'Quarterly newsletter from the Provincial Grand Lodge of Hertfordshire', 'https://example.com/provincial-winter-2024.pdf', 'provincial'),
('Ritual Guide - Entered Apprentice', 'Guide for the Entered Apprentice degree ceremony', 'https://example.com/ea-ritual.pdf', 'ritual'),
('Membership Application Form', 'Form for new membership applications', 'https://example.com/membership-form.pdf', 'forms')
ON CONFLICT DO NOTHING;

-- Insert sample meeting minutes
INSERT INTO public.meeting_minutes (meeting_date, title, content) VALUES
('2024-12-10', 'December Regular Meeting', 'The Lodge was opened in due form at 7:00 PM by the Worshipful Master. Present were 15 members and 2 visitors from neighboring lodges. The minutes of the previous meeting were read and approved. The Treasurer reported a healthy balance. Three candidates were balloted for and accepted for initiation. The Lodge was closed in harmony at 9:30 PM.'),
('2024-10-15', 'October Regular Meeting', 'The Lodge convened at 7:00 PM with 18 members present. The Secretary read correspondence from the Provincial Grand Lodge regarding the upcoming installation ceremony. A motion was passed to donate £500 to the local children''s hospital. Two candidates were initiated into the mysteries of Freemasonry. The meeting concluded at 9:45 PM.'),
('2024-04-16', 'April Regular Meeting', 'Opening at 7:00 PM with 20 members in attendance. The Worshipful Master announced the successful completion of the charity drive, raising £2,000 for local causes. Three members were passed to the degree of Fellow Craft. Plans for the summer social event were discussed and approved. The Lodge closed at 9:15 PM.')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.member_profiles TO authenticated;
GRANT ALL ON public.lodge_documents TO authenticated;
GRANT ALL ON public.meeting_minutes TO authenticated;