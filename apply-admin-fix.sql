-- =========================================
-- DROPPAY ADMIN FIX - Apply This in Supabase SQL Editor
-- =========================================
-- This script:
-- 1. Adds is_admin column if it doesn't exist
-- 2. Sets @Wain2020 as admin
-- 3. Creates performance index
-- =========================================

-- Step 1: Add is_admin column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE merchants ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN merchants.is_admin IS 'Flag indicating if this merchant has admin privileges';
        RAISE NOTICE '✓ Added is_admin column to merchants table';
    ELSE
        RAISE NOTICE '✓ is_admin column already exists';
    END IF;
END $$;

-- Step 2: Set @Wain2020 as admin (case-insensitive)
UPDATE merchants 
SET is_admin = TRUE 
WHERE LOWER(REPLACE(pi_username, '@', '')) = 'wain2020';

-- Show result
SELECT 'Updated ' || COUNT(*) || ' merchant(s) to admin' as result
FROM merchants
WHERE is_admin = TRUE;

-- Step 3: Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_merchants_is_admin 
ON merchants(is_admin) 
WHERE is_admin = TRUE;

-- Step 4: Verify the result
SELECT 
    id,
    pi_username,
    is_admin,
    business_name,
    created_at
FROM merchants
WHERE is_admin = TRUE OR LOWER(REPLACE(pi_username, '@', '')) = 'wain2020'
ORDER BY created_at DESC;

-- =========================================
-- INSTRUCTIONS:
-- =========================================
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and click "RUN"
-- 4. Check the output to verify @Wain2020 is now admin
-- 5. Refresh your app and try accessing admin panel
-- =========================================
