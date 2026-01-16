-- =========================================
-- DROPPAY DEBUG DIAGNOSTIC
-- =========================================
-- Run this to see why button is still disabled

-- STEP 1: Check if RLS is actually disabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('merchants', 'payment_links', 'withdrawals', 'transactions', 'ad_rewards')
ORDER BY tablename;

-- STEP 2: Check if your merchant exists
SELECT 
    id,
    pi_user_id,
    pi_username,
    business_name,
    is_admin,
    available_balance,
    created_at
FROM merchants
WHERE pi_username LIKE '%Wain%' OR pi_username LIKE '%@Wain%'
ORDER BY created_at DESC
LIMIT 5;

-- STEP 3: Count all merchants
SELECT COUNT(*) as total_merchants FROM merchants;

-- STEP 4: Check if columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'merchants'
ORDER BY ordinal_position;

-- STEP 5: Check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'merchants'
ORDER BY constraint_name;

-- STEP 6: Check if unique constraint on pi_user_id exists
SELECT 
    constraint_name
FROM information_schema.key_column_usage
WHERE table_name = 'merchants' AND column_name = 'pi_user_id'
ORDER BY constraint_name;

-- =========================================
-- IF YOU SEE THIS:
-- =========================================
-- rowsecurity = true → RLS is STILL ENABLED (bad)
-- rowsecurity = false → RLS is DISABLED (good)
--
-- IF merchants table is EMPTY → Merchant not created yet
-- IF merchant exists → Check if App can fetch it
--
-- NEXT ACTION:
-- If RLS is still true, run COMPLETE_FEATURE_FIX.sql again
-- If merchant doesn't exist, log in again after running SQL
-- =========================================
