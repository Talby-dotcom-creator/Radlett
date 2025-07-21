/*
  # Add role column to member_profiles table

  1. Changes
    - Add `role` column to `member_profiles` table with default value 'member'
    - Add check constraint to ensure role is either 'member' or 'admin'
    - Update RLS policies to restrict admin access

  2. Security
    - Only admins can access the admin dashboard
    - Only admins can modify other members' profiles
*/

-- Add role column
ALTER TABLE member_profiles 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member'
CHECK (role IN ('member', 'admin'));

-- Update RLS policies for admin access
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

-- Create policy for admin-only access to certain operations
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