/*
  # Fix Database Error in update_last_login Function

  1. Changes
    - Add SECURITY DEFINER to update_last_login function
    - Explicitly revoke and grant permissions on the function
    - This allows the function to bypass RLS policies when updating member_profiles

  2. Security
    - Function will execute with the privileges of its owner
    - Explicit permission control for better security
*/

-- Drop the existing function and recreate it with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER
SECURITY DEFINER -- This is the key change - allows function to bypass RLS
AS $$
BEGIN
  UPDATE public.member_profiles
  SET last_login = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Revoke all permissions from PUBLIC and grant only to authenticated users
REVOKE ALL ON FUNCTION public.update_last_login() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_last_login() TO authenticated;

-- Recreate the trigger to ensure it's using the updated function
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();