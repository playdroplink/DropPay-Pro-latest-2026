-- Create Storage Bucket for Payment Content
-- This fixes the "Bucket not found" error

-- Create the payment-content bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'payment-content'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'payment-content',
      'payment-content',
      true,
      52428800, -- 50MB limit
      ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4',
        'audio/mpeg',
        'audio/mp3'
      ]
    );
  END IF;
END $$;

-- Create RLS policies for the bucket
-- Allow anyone to upload files (Pi Network users don't use Supabase auth)
DROP POLICY IF EXISTS "Anyone can upload files" ON storage.objects;
CREATE POLICY "Anyone can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-content');

DROP POLICY IF EXISTS "Anyone can update files" ON storage.objects;
-- Allow anyone to update files
CREATE POLICY "Anyone can update files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'payment-content');

DROP POLICY IF EXISTS "Anyone can delete files" ON storage.objects;
-- Allow anyone to delete files
CREATE POLICY "Anyone can delete files"
ON storage.objects FOR DELETE
USING (bucket_id = 'payment-content');

DROP POLICY IF EXISTS "Public can read files" ON storage.objects;
-- Allow public read access (files are public)
CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-content');

-- Verify bucket creation
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'payment-content';
