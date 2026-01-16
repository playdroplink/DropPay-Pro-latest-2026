-- =====================================================
-- STORAGE SECURITY POLICY FIX
-- =====================================================
-- This script fixes "new row violates row level security policy" errors
-- Run this in Supabase SQL Editor with elevated permissions

-- Step 1: Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing conflicting policies
DO $$
BEGIN
  -- Drop all existing storage policies to start fresh
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- Step 3: Create comprehensive storage policies for all buckets

-- PAYMENT-LINK-IMAGES bucket policies
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

-- CHECKOUT-IMAGES bucket policies
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

-- MERCHANT-PRODUCTS bucket policies
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

-- PAYMENT-CONTENT bucket policies (private bucket)
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

-- USER-UPLOADS bucket policies
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

-- Step 4: Verify all policies are created
SELECT 
  'Storage Policies Verification' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Step 5: Verify buckets exist
SELECT 
  'Storage Buckets Verification' as check_type,
  id as bucket_name,
  public,
  file_size_limit,
  ARRAY_LENGTH(allowed_mime_types, 1) as mime_types_count
FROM storage.buckets
WHERE id IN ('payment-link-images', 'checkout-images', 'merchant-products', 'payment-content', 'user-uploads')
ORDER BY id;

-- =====================================================
-- TROUBLESHOOTING NOTES
-- =====================================================
-- 
-- If you still get RLS errors after running this script:
--
-- 1. Check if you're authenticated in your app:
--    - User must be logged in for 'authenticated' role
--    - Check browser console: await supabase.auth.getUser()
--
-- 2. Verify bucket names match exactly in your code:
--    - payment-link-images
--    - checkout-images  
--    - merchant-products
--    - payment-content
--    - user-uploads
--
-- 3. Test upload permissions in browser console:
--    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
--    const { data, error } = await supabase.storage
--      .from('payment-link-images')
--      .upload('test/test-' + Date.now() + '.jpg', testFile);
--    console.log({ data, error });
--
-- 4. If policies still fail, run with service_role key:
--    - Go to Supabase Dashboard > Settings > API
--    - Use service_role key instead of anon key for admin operations
--
-- =====================================================