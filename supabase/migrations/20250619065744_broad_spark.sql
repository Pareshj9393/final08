/*
  # Create posts table for social feed content

  1. New Tables
    - `posts`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, foreign key to profiles.id)
      - `post_type` (text, either 'wisdom' or 'donation')
      - `content` (text, nullable, for wisdom posts)
      - `resource_title` (text, nullable, for donation posts)
      - `resource_category` (text, nullable, for donation posts)
      - `resource_contact` (text, nullable, for donation posts)
      - `created_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `posts` table
    - Add policy for authenticated users to read all posts
    - Add policy for users to create their own posts
    - Add policy for users to update/delete their own posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_type text NOT NULL CHECK (post_type IN ('wisdom', 'donation')),
  content text,
  resource_title text,
  resource_category text,
  resource_contact text,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure wisdom posts have content and donation posts have resource fields
  CONSTRAINT wisdom_posts_have_content CHECK (
    (post_type = 'wisdom' AND content IS NOT NULL) OR 
    (post_type = 'donation' AND resource_title IS NOT NULL AND resource_category IS NOT NULL AND resource_contact IS NOT NULL)
  )
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all posts
CREATE POLICY "Authenticated users can view all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow users to create posts
CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own posts
CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);