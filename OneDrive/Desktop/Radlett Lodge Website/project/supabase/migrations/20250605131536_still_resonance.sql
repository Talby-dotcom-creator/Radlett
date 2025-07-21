/*
  # Add new admin user

  1. Changes
    - Add new admin user with email ptalbot37@fastmail.com
    - Create corresponding member profile with admin role
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
  'ptalbot37@fastmail.com',
  crypt('Wxro39du!', gen_salt('bf')),
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
  (SELECT id FROM auth.users WHERE email = 'ptalbot37@fastmail.com'),
  'Paul Talbot',
  'admin',
  CURRENT_DATE
);