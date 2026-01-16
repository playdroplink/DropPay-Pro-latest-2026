-- =====================================================
-- ⚠️ THIS SCRIPT REQUIRES OWNER/SERVICE_ROLE PERMISSIONS
-- =====================================================
-- If you get "ERROR: 42501: must be owner of table objects"
-- you MUST use the Supabase Dashboard UI instead
--
-- ❌ SQL METHOD WILL NOT WORK FOR YOU
-- ✅ USE DASHBOARD METHOD BELOW
-- =====================================================
--
-- DASHBOARD METHOD (WORKS WITHOUT OWNER PERMISSIONS):
--
-- STEP 1: Enable RLS on storage.objects
-- 1. Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/database/tables
-- 2. Click "storage" schema (left sidebar)
-- 3. Click "objects" table
-- 4. Click "Enable RLS" button (top right)
--
-- STEP 2: Create policies for each bucket
-- Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/storage/buckets
--
-- For EACH bucket, click it → Policies tab → New Policy
-- Create 4 policies per bucket:
--
-- ═══════════════════════════════════════════════════
-- BUCKET: payment-link-images (4 policies)
-- ═══════════════════════════════════════════════════
--
-- Policy 1: Public read payment-link-images
--   - Operation: SELECT
--   - Target roles: public
--   - USING expression: bucket_id = 'payment-link-images'
--
-- Policy 2: Authenticated insert payment-link-images
--   - Operation: INSERT
--   - Target roles: authenticated
--   - WITH CHECK expression: bucket_id = 'payment-link-images'
--
-- Policy 3: Authenticated update payment-link-images
--   - Operation: UPDATE
--   - Target roles: authenticated
--   - USING expression: bucket_id = 'payment-link-images'
--   - WITH CHECK expression: bucket_id = 'payment-link-images'
--
-- Policy 4: Authenticated delete payment-link-images
--   - Operation: DELETE
--   - Target roles: authenticated
--   - USING expression: bucket_id = 'payment-link-images'
--
-- ═══════════════════════════════════════════════════
-- BUCKET: checkout-images (4 policies)
-- ═══════════════════════════════════════════════════
-- (Same as above but replace 'payment-link-images' with 'checkout-images')
--
-- ═══════════════════════════════════════════════════
-- BUCKET: merchant-products (4 policies)
-- ═══════════════════════════════════════════════════
-- (Same pattern but replace with 'merchant-products')
--
-- ═══════════════════════════════════════════════════
-- BUCKET: payment-content (4 policies - ALL AUTHENTICATED)
-- ═══════════════════════════════════════════════════
-- Policy 1: Authenticated read payment-content
--   - Operation: SELECT
--   - Target roles: authenticated (NOT public)
--   - USING: bucket_id = 'payment-content'
-- (Repeat for INSERT, UPDATE, DELETE with authenticated role)
--
-- ═══════════════════════════════════════════════════
-- BUCKET: user-uploads (4 policies)
-- ═══════════════════════════════════════════════════
-- (Same as payment-link-images but replace with 'user-uploads')
--
-- TOTAL: 20 policies (4 per bucket × 5 buckets)
--
-- =====================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing storage policies (safe to rerun)
DROP POLICY IF EXISTS "Public read payment-link-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert payment-link-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update payment-link-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete payment-link-images" ON storage.objects;

DROP POLICY IF EXISTS "Public read checkout-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert checkout-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update checkout-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete checkout-images" ON storage.objects;

DROP POLICY IF EXISTS "Public read merchant-products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert merchant-products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update merchant-products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete merchant-products" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated read payment-content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert payment-content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update payment-content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete payment-content" ON storage.objects;

DROP POLICY IF EXISTS "Public read user-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert user-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update user-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete user-uploads" ON storage.objects;

-- Create all storage policies

-- PAYMENT-LINK-IMAGES (public bucket)
CREATE POLICY "Public read payment-link-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-link-images');

CREATE POLICY "Authenticated insert payment-link-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-link-images');

CREATE POLICY "Authenticated update payment-link-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-link-images')
WITH CHECK (bucket_id = 'payment-link-images');

CREATE POLICY "Authenticated delete payment-link-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-link-images');

-- CHECKOUT-IMAGES (public bucket)
CREATE POLICY "Public read checkout-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'checkout-images');

CREATE POLICY "Authenticated insert checkout-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checkout-images');

CREATE POLICY "Authenticated update checkout-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'checkout-images')
WITH CHECK (bucket_id = 'checkout-images');

CREATE POLICY "Authenticated delete checkout-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'checkout-images');

-- MERCHANT-PRODUCTS (public bucket)
CREATE POLICY "Public read merchant-products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'merchant-products');

CREATE POLICY "Authenticated insert merchant-products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-products');

CREATE POLICY "Authenticated update merchant-products"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'merchant-products')
WITH CHECK (bucket_id = 'merchant-products');

CREATE POLICY "Authenticated delete merchant-products"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'merchant-products');

-- PAYMENT-CONTENT (private bucket - authenticated only)
CREATE POLICY "Authenticated read payment-content"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-content');

CREATE POLICY "Authenticated insert payment-content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-content');

CREATE POLICY "Authenticated update payment-content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-content')
WITH CHECK (bucket_id = 'payment-content');

CREATE POLICY "Authenticated delete payment-content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-content');

-- USER-UPLOADS (public bucket)
CREATE POLICY "Public read user-uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-uploads');

CREATE POLICY "Authenticated insert user-uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Authenticated update user-uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-uploads')
WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Authenticated delete user-uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-uploads');

-- Verification query
SELECT 
  '✅ STORAGE POLICIES CREATED' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%payment-link-images%'
   OR policyname LIKE '%checkout-images%'
   OR policyname LIKE '%merchant-products%'
   OR policyname LIKE '%payment-content%'
   OR policyname LIKE '%user-uploads%';

-- Show all created policies
SELECT 
  policyname,
  roles::text,
  cmd::text as operation
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;