/*
  # Create donor_profiles table for donor users

  1. New Tables
    - `donor_profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `email` (text, donor email address)
      - `username` (text, derived from email prefix)
      - `created_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `donor_profiles` table
    - Add policy for users to read all donor profiles
    - Add policy for donors to insert/update only their own profile
*/

CREATE TABLE IF NOT EXISTS donor_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  username text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all donor profiles (for displaying usernames, etc.)
CREATE POLICY "Users can view all donor profiles"
  ON donor_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow donors to insert their own profile
CREATE POLICY "Donors can insert own profile"
  ON donor_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy to allow donors to update only their own profile
CREATE POLICY "Donors can update own profile"
  ON donor_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow service role to manage all donor profiles (for admin functions)
CREATE POLICY "Service role can manage all donor profiles"
  ON donor_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON donor_profiles TO postgres, anon, authenticated, service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donor_profiles_email ON donor_profiles(email);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_username ON donor_profiles(username);