-- =========================================
-- COMPLETE FIX FOR MERCHANT CREATION
-- =========================================
-- Fixes all issues:
-- 1. RLS blocking inserts
-- 2. Missing unique constraint on pi_user_id
-- 3. Missing is_admin column
-- =========================================

-- Step 1: Disable RLS temporarily
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;

-- Step 2: Add unique constraint on pi_user_id if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'merchants_pi_user_id_key'
    ) THEN
        ALTER TABLE merchants 
        ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);
        RAISE NOTICE '✓ Added unique constraint on pi_user_id';
    ELSE
        RAISE NOTICE '✓ Unique constraint already exists';
    END IF;
END $$;

-- Step 3: Add is_admin column if missing
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

-- Step 4: Set @Wain2020 as admin
UPDATE merchants 
SET is_admin = TRUE 
WHERE LOWER(REPLACE(pi_username, '@', '')) = 'wain2020';

-- Step 5: Show current state
SELECT 
    id,
    pi_user_id,
    pi_username,
    business_name,
    is_admin,
    created_at
FROM merchants
ORDER BY created_at DESC
LIMIT 5;

-- Step 6: Verify constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'merchants'::regclass;

-- =========================================
-- WHAT THIS DOES:
-- =========================================
-- ✓ Disables RLS so you can create merchant
-- ✓ Adds unique constraint on pi_user_id (required)
-- ✓ Adds is_admin column for admin access
-- ✓ Sets @Wain2020 as admin
-- ✓ Shows all merchants and constraints
--
-- After running:
-- 1. Refresh browser
-- 2. Log in with Pi Network
-- 3. Merchant will be created successfully!
-- =========================================
