-- =============================================
-- IMMEDIATE FIX: Set @Wain2020 as Admin
-- =============================================
-- Run this in Supabase SQL Editor NOW
-- https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql

-- Step 1: Add is_admin column if missing (safe to run multiple times)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE merchants ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✓ Added is_admin column';
    ELSE
        RAISE NOTICE '✓ is_admin column already exists';
    END IF;
END $$;

-- Step 2: Update ALL merchants with username Wain2020 to be admin
UPDATE merchants 
SET is_admin = TRUE 
WHERE LOWER(REPLACE(pi_username, '@', '')) = 'wain2020';

-- Step 3: Show results
SELECT 
    'Updated ' || COUNT(*) || ' merchant(s) to admin status' as message
FROM merchants
WHERE is_admin = TRUE;

-- Step 4: Verify Wain2020 is admin
SELECT 
    id,
    pi_user_id,
    pi_username,
    business_name,
    is_admin,
    created_at
FROM merchants
WHERE LOWER(REPLACE(pi_username, '@', '')) = 'wain2020'
   OR is_admin = TRUE
ORDER BY created_at DESC;

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_merchants_is_admin 
ON merchants(is_admin) 
WHERE is_admin = TRUE;

-- =============================================
-- If you see NO RESULTS in Step 4:
-- =============================================
-- It means @Wain2020 hasn't logged in yet.
-- After running this SQL:
-- 1. Clear browser: localStorage.clear(); location.reload()
-- 2. Log in with Pi as @Wain2020
-- 3. Check console for "Merchant created successfully"
-- 4. Admin menu should appear!
-- =============================================
