/*
  # Storage Bucket Permissions for CMS Media

  1. New Storage Bucket
    - Create 'cms-media' bucket if it doesn't exist
    - Set up proper RLS policies for the bucket

  2. Security
    - Public can view media files
    - Only authenticated users can upload files
    - Only admins can delete files
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view files (read-only)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-media');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cms-media'
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cms-media' AND
  EXISTS (
    SELECT 1 FROM public.member_profiles mp
    WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
  )
);

-- Allow admins to update files
CREATE POLICY "Admins can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cms-media' AND
  EXISTS (
    SELECT 1 FROM public.member_profiles mp
    WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'cms-media' AND
  EXISTS (
    SELECT 1 FROM public.member_profiles mp
    WHERE mp.user_id = auth.uid() AND mp.role = 'admin'
  )
);