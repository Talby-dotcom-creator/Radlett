/*
  # Add notes field to member_profiles

  1. New Columns
    - `notes` (text, nullable) - Admin notes about the member

  2. Security
    - Existing RLS policies remain unchanged
    - New column follows same access patterns
*/

-- Add notes column to member_profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'member_profiles' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.member_profiles 
    ADD COLUMN notes TEXT;
  END IF;
END $$;