/*
  # Enhanced Member Profiles with Contact and Rank Information

  1. New Columns Added to member_profiles
    - `contact_email` (text, nullable) - Alternative contact email
    - `contact_phone` (text, nullable) - Contact phone number
    - `masonic_provincial_rank` (text, nullable) - Provincial rank
    - `grand_lodge_rank` (text, nullable) - Grand Lodge rank

  2. Security
    - Existing RLS policies remain unchanged
    - New columns follow same access patterns

  3. Performance
    - Add indexes for better query performance
*/

-- Add new columns to member_profiles table
ALTER TABLE public.member_profiles 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS masonic_provincial_rank TEXT,
ADD COLUMN IF NOT EXISTS grand_lodge_rank TEXT;

-- Add indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_member_profiles_contact_email ON public.member_profiles(contact_email);
CREATE INDEX IF NOT EXISTS idx_member_profiles_provincial_rank ON public.member_profiles(masonic_provincial_rank);
CREATE INDEX IF NOT EXISTS idx_member_profiles_grand_lodge_rank ON public.member_profiles(grand_lodge_rank);

-- Update existing admin profile with sample data
UPDATE public.member_profiles 
SET 
  contact_email = 'ptalbot37@gmail.com',
  contact_phone = '+44 123 456 7890',
  masonic_provincial_rank = 'Provincial Grand Steward',
  grand_lodge_rank = 'Past Master'
WHERE role = 'admin' 
AND user_id IN (
  SELECT id FROM auth.users WHERE email = 'ptalbot37@gmail.com'
);