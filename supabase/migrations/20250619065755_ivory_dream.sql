/*
  # Create storage bucket for verification uploads

  1. Storage Setup
    - Create 'verification-uploads' bucket for student ID verification
    - Set bucket to be private (not publicly accessible)
    - Add RLS policies for secure file access

  2. Security
    - Only authenticated users can upload to their own folder
    - Only the user who uploaded can access their files
    - Files are organized by user ID for privacy
*/

-- Create the verification uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'verification-uploads', 
  'verification-uploads', 
  false, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policy to allow users to upload verification files
CREATE POLICY "Users can upload verification files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'verification-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow users to view their own verification files
CREATE POLICY "Users can view own verification files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verification-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow admins to view all verification files (for verification process)
CREATE POLICY "Service role can access all verification files"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'verification-uploads');