/*
  # Add initial admin user

  1. Changes
    - Insert initial admin user into auth.users
    - Create corresponding admin profile in member_profiles
*/

-- Create the admin user in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'admin@radlettlodge6652.org.uk',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  ''
);

-- Create the admin profile
INSERT INTO public.member_profiles (
  user_id,
  full_name,
  role,
  join_date
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@radlettlodge6652.org.uk'),
  'Lodge Administrator',
  'admin',
  CURRENT_DATE
);