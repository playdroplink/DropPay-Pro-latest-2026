-- =========================================
-- DISABLE ALL ROW LEVEL SECURITY (RLS)
-- =========================================
-- This script disables RLS on all tables in the database
-- Reason: The app uses Pi Network authentication, not Supabase Auth
-- RLS policies with auth.uid() checks block legitimate operations
-- =========================================

-- Drop all existing RLS policies first (public schema)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', pol.policyname, pol.schemaname, pol.tablename;
    END LOOP;
END $$;

-- Drop all storage RLS policies (storage schema)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped storage policy: % on %.%', pol.policyname, pol.schemaname, pol.tablename;
    END LOOP;
END $$;

-- Disable RLS on all public tables
DO $$ 
DECLARE
    tbl record;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl.tablename);
        RAISE NOTICE 'Disabled RLS on: public.%', tbl.tablename;
    END LOOP;
END $$;

-- Explicitly disable RLS on key tables (to ensure they're covered)
ALTER TABLE IF EXISTS public.merchants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ad_rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checkout_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checkout_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tracking_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tracking_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.waitlist_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_presets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integration_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settlement_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.file_uploads DISABLE ROW LEVEL SECURITY;

-- Disable RLS on storage.objects (file uploads)
-- Note: This requires storage admin privileges
DO $$ 
BEGIN
    -- Try to disable RLS on storage.objects
    BEGIN
        ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✓ Disabled RLS on storage.objects';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE '⚠ Skipped storage.objects (requires storage admin privileges)';
    END;
    
    -- Try to disable RLS on storage.buckets
    BEGIN
        ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✓ Disabled RLS on storage.buckets';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE '⚠ Skipped storage.buckets (requires storage admin privileges)';
    END;
END $$;

-- Verify RLS is disabled on all public tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '❌ ENABLED'
        ELSE '✅ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- Count tables with RLS still enabled (should be 0)
SELECT 
    COUNT(*) as tables_with_rls_enabled,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ All RLS disabled successfully!'
        ELSE '⚠️ Some tables still have RLS enabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%';

-- Verify storage.objects RLS is disabled
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '❌ ENABLED'
        ELSE '✅ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'storage'
    AND tablename IN ('objects', 'buckets')
ORDER BY tablename;

-- Check for any remaining storage policies (should be 0)
SELECT 
    COUNT(*) as storage_policies_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ All storage policies removed!'
        ELSE '⚠️ Some storage policies still exist'
    END as status
FROM pg_policies 
WHERE schemaname = 'storage';

-- =========================================
-- WHAT THIS DOES:
-- =========================================
-- ✓ Drops all existing RLS policies (public schema)
-- ✓ Drops all storage RLS policies (storage.objects)
-- ✓ Disables RLS on all public tables dynamically
-- ✓ Disables RLS on storage.objects and storage.buckets
-- ✓ Explicitly disables RLS on all known tables
-- ✓ Verifies RLS is disabled
-- ✓ Shows summary of RLS status
--
-- After running:
-- 1. All database operations will work without RLS blocking
-- 2. Merchant creation will work
-- 3. Payment link creation will work
-- 4. Checkout link creation will work
-- 5. Admin withdrawals page will load
-- 6. File uploads will work without authentication errors
-- 7. Storage operations will succeed
-- 8. All CRUD operations will function properly
-- =========================================
