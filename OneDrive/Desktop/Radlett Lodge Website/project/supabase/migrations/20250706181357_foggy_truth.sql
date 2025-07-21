/*
  # Add Member Status and Verification Fields

  1. New Columns
    - `email_verified` (boolean) - Track if email has been verified
    - `registration_date` (timestamptz) - When the user registered
    - `last_login` (timestamptz) - Last login timestamp
    - `status` (text) - Member status (active, pending, inactive)
    - `notes` (text) - Admin notes about the member

  2. Security
    - Existing RLS policies remain unchanged
    - New columns follow same access patterns
*/

-- Add new columns to member_profiles table if they don't exist
DO $$ 
BEGIN
  -- Add email_verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'member_profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.member_profiles 
    ADD COLUMN email_verified BOOLEAN DEFAULT false;
  END IF;

  -- Add registration_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'member_profiles' AND column_name = 'registration_date'
  ) THEN
    ALTER TABLE public.member_profiles 
    ADD COLUMN registration_date TIMESTAMPTZ DEFAULT now();
  END IF;

  -- Add last_login column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'member_profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE public.member_profiles 
    ADD COLUMN last_login TIMESTAMPTZ;
  END IF;

  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'member_profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.member_profiles 
    ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive'));
  END IF;

  -- Add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'member_profiles' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.member_profiles 
    ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Create index for status for faster filtering
CREATE INDEX IF NOT EXISTS idx_member_profiles_status ON public.member_profiles(status);

-- Create function to update last_login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Run with definer's privileges
SET search_path = public -- Explicitly set search_path
AS $$
BEGIN
  UPDATE public.member_profiles
  SET last_login = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Revoke all permissions from PUBLIC and grant only to authenticated users
REVOKE ALL ON FUNCTION public.update_last_login() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_last_login() TO authenticated;

-- Create trigger to update last_login on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

-- Comment on function to document security measures
COMMENT ON FUNCTION public.update_last_login() IS 'Updates the last_login field in member_profiles when a user signs in. SECURITY DEFINER with explicit search_path to prevent injection attacks.';

-- Insert default page content for member welcome
INSERT INTO public.page_content (page_name, section_name, content_type, content) VALUES
('members', 'welcome_title', 'text', 'Welcome to the Members Area'),
('members', 'welcome_text', 'html', '<p>Thank you for joining Radlett Lodge No. 6652. This members area provides access to lodge documents, meeting minutes, and other resources exclusive to our members.</p><p>If you have any questions or need assistance, please contact the Lodge Secretary.</p>'),
('members', 'pending_title', 'text', 'Your Membership is Pending'),
('members', 'pending_text', 'html', '<p>Thank you for registering. Your membership is currently pending verification by an administrator.</p><p>Once approved, you will have full access to all member resources. This typically takes 1-2 business days.</p><p>If you have any questions, please contact the Lodge Secretary.</p>')
ON CONFLICT (page_name, section_name) DO UPDATE 
SET 
  content = EXCLUDED.content,
  content_type = EXCLUDED.content_type;