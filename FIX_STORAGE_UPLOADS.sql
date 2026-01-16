-- =========================================
-- FIX STORAGE UPLOADS - REMOVE ALL RESTRICTIONS
-- =========================================
-- This fixes "new row violates row-level security policy" errors
-- for file uploads in payment links, checkout links, etc.
-- =========================================

-- Step 1: Drop ALL storage policies (no restrictions)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.%I', pol.policyname, pol.tablename);
        RAISE NOTICE '✓ Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 2: Create public access policies (allow everyone)
-- These policies allow ANY operation without authentication

-- Allow anyone to INSERT files
CREATE POLICY "Public Access - Insert"
ON storage.objects FOR INSERT
WITH CHECK (true);

-- Allow anyone to SELECT files
CREATE POLICY "Public Access - Select"
ON storage.objects FOR SELECT
USING (true);

-- Allow anyone to UPDATE files
CREATE POLICY "Public Access - Update"
ON storage.objects FOR UPDATE
USING (true);

-- Allow anyone to DELETE files
CREATE POLICY "Public Access - Delete"
ON storage.objects FOR DELETE
USING (true);

-- Step 3: Ensure all buckets are public
UPDATE storage.buckets 
SET public = true 
WHERE id IN (
    'payment-content',
    'payment-link-images',
    'merchant-products',
    'user-uploads',
    'checkout-images',
    'content-files'
);

-- Step 4: Create any missing buckets with public access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('payment-content', 'payment-content', true, 104857600, NULL),
    ('payment-link-images', 'payment-link-images', true, 104857600, NULL),
    ('checkout-images', 'checkout-images', true, 104857600, NULL),
    ('user-uploads', 'user-uploads', true, 104857600, NULL)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 104857600,
    allowed_mime_types = NULL;

-- Step 5: Verify storage configuration
SELECT 
    '🔍 Storage Buckets Status' as info,
    id,
    public as is_public,
    CASE 
        WHEN public THEN '✅ Public'
        ELSE '❌ Private'
    END as access_status
FROM storage.buckets
ORDER BY id;

-- Step 6: Check storage policies
SELECT 
    '🔍 Storage Policies' as info,
    policyname,
    cmd as command,
    qual as condition,
    with_check as check_condition
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY policyname;

-- Step 7: Verify RLS status on storage.objects
SELECT 
    '🔍 RLS Status' as info,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '⚠️ ENABLED (may block uploads)'
        ELSE '✅ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'storage' 
    AND tablename = 'objects';

-- =========================================
-- SUCCESS VERIFICATION
-- =========================================
-- After running this script:
-- 1. All storage policies should allow public access
-- 2. All buckets should be marked as public
-- 3. File uploads should work without authentication
-- 4. No "row violates row-level security" errors
--
-- Test by uploading a file through your app
-- =========================================
