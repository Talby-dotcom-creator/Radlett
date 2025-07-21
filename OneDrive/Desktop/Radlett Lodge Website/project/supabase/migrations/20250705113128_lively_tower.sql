/*
  # Fix Function Search Path Security Issues

  1. Changes
    - Update `update_updated_at_column` function to explicitly set search_path
    - Add SECURITY DEFINER to ensure proper execution context
    - Revoke PUBLIC permissions and grant only to authenticated users
    - Fix potential SQL injection vulnerabilities

  2. Security
    - Prevent search_path manipulation attacks
    - Ensure functions operate in a secure and predictable environment
*/

-- Drop and recreate update_updated_at_column with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Run with definer's privileges
SET search_path = public -- Explicitly set search_path
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Revoke all permissions from PUBLIC and grant only to authenticated users
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;

-- Ensure update_last_login also has explicit search_path
CREATE OR REPLACE FUNCTION public.update_last_login()
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

-- Comment on functions to document security measures
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates the updated_at column with current timestamp. SECURITY DEFINER with explicit search_path to prevent injection attacks.';
COMMENT ON FUNCTION public.update_last_login() IS 'Updates the last_login field in member_profiles when a user signs in. SECURITY DEFINER with explicit search_path to prevent injection attacks.';