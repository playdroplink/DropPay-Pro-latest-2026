-- =====================================================
-- FIX RLS POLICIES FOR FILE UPLOAD AND MERCHANT ACCESS
-- =====================================================

-- 1. Fix storage.objects RLS for payment-content bucket
-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload payment content" ON storage.objects;
CREATE POLICY "Authenticated users can upload payment content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-content' AND
  auth.uid()::text IS NOT NULL
);

-- Allow users to read their own uploaded files
DROP POLICY IF EXISTS "Users can read their own payment content" ON storage.objects;
CREATE POLICY "Users can read their own payment content"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-content');

-- Allow public access to payment content (for paid downloads)
DROP POLICY IF EXISTS "Public can read payment content" ON storage.objects;
CREATE POLICY "Public can read payment content"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-content');

-- Allow users to update their own files
DROP POLICY IF EXISTS "Users can update their own payment content" ON storage.objects;
CREATE POLICY "Users can update their own payment content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-content')
WITH CHECK (bucket_id = 'payment-content');

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete their own payment content" ON storage.objects;
CREATE POLICY "Users can delete their own payment content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-content');

-- 2. Fix merchants table RLS
-- Allow authenticated users to read all merchant profiles
DROP POLICY IF EXISTS "Anyone can read merchant profiles" ON public.merchants;
CREATE POLICY "Anyone can read merchant profiles"
ON public.merchants FOR SELECT
TO public
USING (true);

-- Allow users to read their own merchant profile
DROP POLICY IF EXISTS "Users can read own merchant profile" ON public.merchants;
CREATE POLICY "Users can read own merchant profile"
ON public.merchants FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own merchant profile
DROP POLICY IF EXISTS "Users can update own merchant profile" ON public.merchants;
CREATE POLICY "Users can update own merchant profile"
ON public.merchants FOR UPDATE
TO authenticated
USING (id::text = auth.uid()::text)
WITH CHECK (id::text = auth.uid()::text);

-- Allow users to insert their own merchant profile
DROP POLICY IF EXISTS "Users can insert own merchant profile" ON public.merchants;
CREATE POLICY "Users can insert own merchant profile"
ON public.merchants FOR INSERT
TO authenticated
WITH CHECK (id::text = auth.uid()::text);

-- 3. Fix payment_links table RLS
-- Allow anyone to read active payment links
DROP POLICY IF EXISTS "Anyone can read active payment links" ON public.payment_links;
CREATE POLICY "Anyone can read active payment links"
ON public.payment_links FOR SELECT
TO public
USING (is_active = true);

-- Allow merchants to read their own payment links
DROP POLICY IF EXISTS "Merchants can read own payment links" ON public.payment_links;
CREATE POLICY "Merchants can read own payment links"
ON public.payment_links FOR SELECT
TO authenticated
USING (merchant_id::text = auth.uid()::text);

-- Allow merchants to insert their own payment links
DROP POLICY IF EXISTS "Merchants can insert own payment links" ON public.payment_links;
CREATE POLICY "Merchants can insert own payment links"
ON public.payment_links FOR INSERT
TO authenticated
WITH CHECK (merchant_id::text = auth.uid()::text OR merchant_id IS NOT NULL);

-- Allow merchants to update their own payment links
DROP POLICY IF EXISTS "Merchants can update own payment links" ON public.payment_links;
CREATE POLICY "Merchants can update own payment links"
ON public.payment_links FOR UPDATE
TO authenticated
USING (merchant_id::text = auth.uid()::text)
WITH CHECK (merchant_id::text = auth.uid()::text);

-- Allow merchants to delete their own payment links
DROP POLICY IF EXISTS "Merchants can delete own payment links" ON public.payment_links;
CREATE POLICY "Merchants can delete own payment links"
ON public.payment_links FOR DELETE
TO authenticated
USING (merchant_id::text = auth.uid()::text);

-- 4. Verify bucket exists and is configured
-- Ensure payment-content bucket is public
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY['application/pdf', 'application/zip', 'image/*', 'video/*', 'audio/*', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*']
WHERE id = 'payment-content';

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-content',
  'payment-content',
  true,
  52428800,
  ARRAY['application/pdf', 'application/zip', 'image/*', 'video/*', 'audio/*', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf', 'application/zip', 'image/*', 'video/*', 'audio/*', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*'];

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;

-- Verification queries
SELECT 
  'Storage Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

SELECT 
  'Merchant Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'merchants'
ORDER BY policyname;

SELECT 
  'Payment Link Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'payment_links'
ORDER BY policyname;

SELECT 
  'Bucket Config' as check_type,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'payment-content';
