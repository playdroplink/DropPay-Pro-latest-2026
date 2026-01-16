-- =====================================================
-- MINIMAL STORAGE SETUP (No Permissions Required)
-- =====================================================
-- This script only creates buckets - policies must be done via Dashboard
-- Run this in Supabase SQL Editor (works with limited permissions)

-- Create payment_links images column if missing
ALTER TABLE public.payment_links
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];

-- Create all required storage buckets with proper configuration
-- This should work even with limited permissions
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

-- Verify bucket creation
SELECT 
  'Storage Buckets Created' as status,
  id as bucket_name,
  CASE 
    WHEN public THEN '✓ PUBLIC (' || ROUND(file_size_limit/1048576) || 'MB)'
    ELSE '✓ PRIVATE (' || ROUND(file_size_limit/1048576) || 'MB)'
  END as configuration,
  ARRAY_LENGTH(allowed_mime_types, 1) as mime_types_allowed
FROM storage.buckets 
WHERE id IN ('payment-link-images', 'checkout-images', 'merchant-products', 'payment-content', 'user-uploads')
ORDER BY id;

-- =====================================================
-- NEXT STEPS (CRITICAL):
-- =====================================================
-- 
-- 1. ✅ Buckets are now created
-- 2. 🚨 You MUST create storage policies via Dashboard
-- 3. 📖 Follow: STORAGE_POLICY_DASHBOARD_SETUP.md
-- 4. 🧪 Test uploads after policy setup
--
-- ⚠️  WITHOUT POLICIES, UPLOADS WILL STILL FAIL
-- ⚠️  THE DASHBOARD METHOD IS REQUIRED FOR SECURITY
-- 
-- =====================================================