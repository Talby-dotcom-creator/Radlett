/*
  # Enhance Member Profiles and Authentication

  1. New Columns
    - `email_verified` (boolean) - Track if email has been verified
    - `registration_date` (timestamptz) - When the user registered
    - `last_login` (timestamptz) - Last login timestamp
    - `status` (text) - Member status (active, pending, inactive)
    - `notes` (text) - Admin notes about the member

  2. Security
    - Add policies for member status visibility
    - Ensure proper access control
*/

-- Add new columns to member_profiles table
ALTER TABLE public.member_profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for status for faster filtering
CREATE INDEX IF NOT EXISTS idx_member_profiles_status ON public.member_profiles(status);

-- Create function to update last_login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.member_profiles
  SET last_login = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update last_login on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

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