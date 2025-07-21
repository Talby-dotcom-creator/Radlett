/*
  # Create Admin User and Fix Database Setup

  1. Create all required tables if they don't exist
  2. Set up proper RLS policies
  3. Create admin user with correct email
  4. Create member profile for admin user

  This migration is safe to run multiple times.
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

-- Create admin user and profile
DO $$
DECLARE
  admin_user_id UUID;
  existing_user_id UUID;
BEGIN
  -- First, check if user already exists with the correct email
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'ptalbot37@gmail.com' 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    -- User exists, use that ID
    admin_user_id := existing_user_id;
  ELSE
    -- Check if user exists with old email and update it
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'ptalbot37@gmail.com' 
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
      -- Update the email
      UPDATE auth.users 
      SET email = 'ptalbot37@gmail.com'
      WHERE id = existing_user_id;
      admin_user_id := existing_user_id;
    ELSE
      -- Create new user
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        aud,
        role
      ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'ptalbot37@gmail.com',
        crypt('Wxro39du!', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        'authenticated',
        'authenticated'
      )
      RETURNING id INTO admin_user_id;
    END IF;
  END IF;
  
  -- Create or update the admin profile
  INSERT INTO public.member_profiles (
    user_id,
    full_name,
    role,
    join_date
  ) VALUES (
    admin_user_id,
    'Paul Talbot',
    'admin',
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    full_name = 'Paul Talbot';
    
  RAISE NOTICE 'Admin user created/updated with ID: %', admin_user_id;
    
END $$;