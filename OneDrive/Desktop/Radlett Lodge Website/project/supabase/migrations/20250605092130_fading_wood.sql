/*
  # Members Area Database Schema

  1. New Tables
    - `member_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `position` (text)
      - `join_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lodge_documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `url` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `meeting_minutes`
      - `id` (uuid, primary key)
      - `meeting_date` (date)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated members to read data
    - Add policies for admin users to manage data
*/

-- Create member_profiles table
CREATE TABLE IF NOT EXISTS member_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text NOT NULL,
  position text,
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create lodge_documents table
CREATE TABLE IF NOT EXISTS lodge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meeting_minutes table
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date date NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Create policies for member_profiles
CREATE POLICY "Members can view all profiles"
  ON member_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can update their own profile"
  ON member_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for lodge_documents
CREATE POLICY "Members can view all documents"
  ON lodge_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for meeting_minutes
CREATE POLICY "Members can view all meeting minutes"
  ON meeting_minutes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_member_profiles_updated_at
  BEFORE UPDATE ON member_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lodge_documents_updated_at
  BEFORE UPDATE ON lodge_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_minutes_updated_at
  BEFORE UPDATE ON meeting_minutes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();