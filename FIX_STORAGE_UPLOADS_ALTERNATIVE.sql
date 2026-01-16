-- =========================================
-- ALTERNATIVE FIX: DISABLE RLS ON STORAGE
-- =========================================
-- If the policy approach doesn't work, this completely
-- disables RLS on storage.objects (requires superuser)
-- =========================================

-- Drop all storage policies first
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE schemaname = 'storage'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON storage.%I', pol.policyname, pol.tablename);
            RAISE NOTICE '✓ Dropped: %', pol.policyname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠ Could not drop: %', pol.policyname;
        END;
    END LOOP;
END $$;

-- Try to disable RLS completely (may require superuser)
DO $$ 
BEGIN
    ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS disabled on storage.objects';
EXCEPTION 
    WHEN insufficient_privilege THEN
        RAISE NOTICE '⚠️ Insufficient privileges - you may need to contact Supabase support';
        RAISE NOTICE 'Alternative: Use the policy-based approach in FIX_STORAGE_UPLOADS.sql';
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error: %', SQLERRM;
END $$;

-- Ensure buckets are public
UPDATE storage.buckets SET public = true;

-- Verify
SELECT 
    'Storage Objects RLS' as table_name,
    CASE 
        WHEN rowsecurity THEN '❌ ENABLED'
        ELSE '✅ DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
