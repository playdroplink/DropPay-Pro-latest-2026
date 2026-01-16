-- =====================================================
-- Supabase Complete Storage & Security Setup Script
-- Run this in SQL Editor: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql
-- Storage URL: https://xoofailhzhfyebzpzrfs.storage.supabase.co/storage/v1/s3
-- =====================================================

-- 1. Ensure payment_links has images column
ALTER TABLE public.payment_links
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];
with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('payment-link-images', 'payment-link-images', true, 52428800, 
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('checkout-images', 'checkout-images', true, 52428800, 
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('merchant-products', 'merchant-products', true, 104857600, 
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf']),
  ('payment-content', 'payment-content', false, 536870912, NULL),
  ('user-uploads', 'user-uploads', true, 52428800, 
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. CRITICAL: Run FIX_STORAGE_SECURITY.sql to create all storage policies
-- The RLS policies are required for file uploads to work
-- If you get "new row violates row level security policy" errors,
-- you MUST run the FIX_STORAGE_SECURITY.sql script in your SQL editor

-- 4. Verify setup and show bucket configuration
SELECT 
  'Database Setup' as category,
  'payment_links.images column' as item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_links' AND column_name = 'images'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
UNION ALL
SELECT 
  'Storage Buckets' as category,
  id as item,
  CASE 
    WHEN public THEN '✓ PUBLIC (' || ROUND(file_size_limit/1048576) || 'MB)'
    ELSE '✓ PRIVATE (' || ROUND(file_size_limit/1048576) || 'MB)'
  END as status
FROM storage.buckets 
WHERE id IN ('payment-link-images', 'checkout-images', 'merchant-products', 'payment-content', 'user-uploads')
ORDER BY category, item
UNION ALL
SELECT 
  'CRITICAL: MANUAL STORAGE SECURITY SETUP REQUIRED
-- =====================================================
-- The SQL above creates buckets with proper configurations, but you MUST
-- set up Row Level Security (RLS) policies manually via Supabase Dashboard
-- 
-- 🚨 WITHOUT THESE POLICIES, FILE UPLOADS WILL FAIL 🚨
-- 
-- STEP 1: Go to Supabase Dashboard Storage
-- https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/storage/buckets
-- 
-- STEP 2: Enable RLS on storage.objects table
-- Go to Database > Tables > storage > objects > Settings > Enable RLS
--
-- STEP 3: Create policies for each bucket (click bucket → Policies tab)
--
-- ================== BUCKET POLICIES REQUIRED ==================
-- 
-- 📁 BUCKET: payment-link-images (50MB, Public)
-- Purpose: Product thumbnails, payment link images
-- Policies needed:
--   ✓ SELECT: "Public read payment-link-images" 
--     - Target: public
--     - Policy: bucket_id = 'payment-link-images'
--   ✓ INSERT: "Authenticated insert payment-link-images"
--     - Target: authenticated  
--     - Policy: bucket_id = 'payment-link-images'
--   ✓ UPDATE: "Authenticated update payment-link-images"
--     - Target: authenticated
--     - Policy: bucket_id = 'payment-link-images'
--   ✓ DELETE: "Authenticated delete payment-link-images"
--     - Target: authenticated
--     - Policy: bucket_id = 'payment-link-images'
--
-- 📁 BUCKET: checkout-images (50MB, Public) 
-- Purpose: Checkout page header images
-- Policies needed:
--   ✓ SELECT: "Public read checkout-images"
--     - Target: public
--     - Policy: bucket_id = 'checkout-images'
--   ✓ INSERT: "Authenticated insert checkout-images"
--     - Target: authenticated
--     - Policy: bucket_id = 'checkout-images'
--   ✓ UPDATE: "Authenticated update checkout-images"
--     - Target: authenticated
--     - Policy: bucket_id = 'checkout-images'
--   ✓ DELETE: "Authenticated delete checkout-images"
--     - Target: authenticated
--     - Policy: bucket_id = 'checkout-images'
--
-- 📁 BUCKET: merchant-products (100MB, Public)
-- Purpose: Product galleries, merchant content
-- Policies needed:
--   ✓ SELECT: "Public read merchant-products"
--     - Target: public
--     - Policy: bucket_id = 'merchant-products'
--   ✓ INSERT: "Authenticated insert merchant-products"
--     - Target: authenticated
--     - Policy: bucket_id = 'merchant-products'
--   ✓ UPDATE: "Authenticated update merchant-products"
--     - Target: authenticated
--     - Policy: bucket_id = 'merchant-products'
--   ✓ DELETE: "Authenticated delete merchant-products"
--     - Target: authenticated
--     - Policy: bucket_id = 'merchant-products'
--
-- 📁 BUCKET: payment-content (512MB, Private)
-- Purpose: Downloadable files after payment (PDFs, videos, etc)
-- Policies needed:
--   ✓ SELECT: "Authenticated read payment-content"
--     - Target: authenticated
--     - Policy: bucket_id = 'payment-content'
--   ✓ INSERT: "Authenticated insert payment-content"
--     - Target: authenticated
--     - Policy: bucket_id = 'payment-content'
--   ✓ UPDATE: "Authenticated update payment-content"
--     - Target: authenticated
--     - Policy: bucket_id = 'payment-content'
--   ✓ DELETE: "Authenticated delete payment-content"
--     - Target: authenticated
--     - Policy: bucket_id = 'payment-content'
--
-- 📁 BUCKET: user-uploads (50MB, Public)
-- Purpose: Profile pictures, general user content
-- Policies needed:
--   ✓ SELECT: "Public read user-uploads"
--     - Target: public
--     - Policy: bucket_id = 'user-uploads'
--   ✓ INSERT: "Authenticated insert user-uploads"
--     - Target: authenticated
--     - Policy: bucket_id = 'user-uploads'
--   ✓ UPDATE: "Authenticated update user-uploads"
--     - Target: authenticated
--     - Policy: bucket_id = 'user-uploads'
--   ✓ DELETE: "Authenticated delete user-uploads"
--     - Target: authenticated
--     - Policy: bucket_id = 'user-uploads'
--
-- ================ POLICY CREATION TEMPLATE ================
-- For each bucket, create 4 policies using this pattern:
--
-- Policy Template (replace BUCKET_NAME with actual bucket):
-- 1. SELECT Policy:
--    Name: "Public read BUCKET_NAME" (or "Authenticated read" for private buckets)
--    Operation: SELECT
--    Target role: public (or authenticated for private buckets)
--    Policy definition: bucket_id = 'BUCKET_NAME'
--
-- 2. INSERT Policy:  
--    Name: "Authenticated insert BUCKET_NAME"
--    Operation: INSERT
--    Target role: authenticated
--    Policy definition: bucket_id = 'BUCKET_NAME'
--
-- 3. UPDATE Policy:
--    Name: "Authenticated update BUCKET_NAME"
--    Operation: UPDATE
--    Target role: authenticated
--    Policy definition: bucket_id = 'BUCKET_NAME'
--
-- 4. DELETE Policy:
--    Name: "Authenticated delete BUCKET_NAME"
--    Operation: DELETE
--    Target role: authenticated
--    Policy definition: bucket_id = 'BUCKET_NAME'
--
-- ================== TESTING YOUR SETUP ==================
-- After creating all policies, test in browser console:
--
-- // Test upload to payment-link-images bucket
-- const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
-- const { data, error } = await supabase.storage
--   .from('payment-link-images')
--   .upload('test/test-' + Date.now() + '.jpg', testFile);
-- console.log('Upload test:', { success: !error, data, error });
--
-- // Expected result: { success: true, data: {...}, error: null }
-- // If error: Check that RLS is enabled and policies are created correctly
--
-- ================== TROUBLESHOOTING ==================
-- Common issues:
-- 
-- ❌ Error: "new row violates row-level security policy"
-- ✅ Solution: RLS is enabled but policies missing. Create policies above.
--
-- ❌ Error: "permission denied for table objects"  
-- ✅ Solution: RLS not enabled. Go to Database > storage > objects > Enable RLS
--
-- ❌ Error: "Bucket does not exist"
-- ✅ Solution: Run the SQL script above to create buckets first
--
-- ❌ Upload succeeds but images don't display
-- ✅ Solution: Check bucket is public and SELECT policy exists for 'public' role
-- const { data, error } = await supabase.storage
--   .from('checkout-images')
--   .upload('test/test-' + Date.now() + '.jpg', testFile);
-- console.log('Checkout-images test:', { success: !error, data, error });
--
-- Expected: success: true, no error messages
-- =====================================================
