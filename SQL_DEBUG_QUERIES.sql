-- QUICK SQL REFERENCE FOR DROPPAY
-- Use these commands to verify and debug

-- ====== CHECK MERCHANTS TABLE ======
SELECT 
    id,
    pi_user_id,
    pi_username,
    business_name,
    is_admin,
    available_balance,
    created_at
FROM merchants
ORDER BY created_at DESC;

-- ====== CHECK IF @WAIN2020 IS ADMIN ======
SELECT pi_username, is_admin FROM merchants 
WHERE LOWER(REPLACE(pi_username, '@', '')) = 'wain2020';

-- ====== CHECK PAYMENT LINKS COUNT ======
SELECT COUNT(*) as total_links FROM payment_links;

-- ====== CHECK WITHDRAWALS ======
SELECT 
    id,
    merchant_id,
    amount,
    status,
    created_at
FROM withdrawals
ORDER BY created_at DESC
LIMIT 10;

-- ====== CHECK RLS STATUS ======
SELECT relname, relrowsecurity FROM pg_class WHERE relname IN (
    'merchants', 'payment_links', 'withdrawals', 'transactions'
);

-- ====== CHECK CONSTRAINTS ======
SELECT conname, contype FROM pg_constraint 
WHERE conrelid = 'merchants'::regclass;

-- ====== CHECK INDEXES ======
SELECT indexname FROM pg_indexes 
WHERE tablename = 'merchants' 
ORDER BY indexname;

-- ====== VERIFY ALL COLUMNS EXIST ======
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'merchants'
ORDER BY ordinal_position;

-- ====== COUNT ALL RECORDS ======
SELECT 
    (SELECT COUNT(*) FROM merchants) as merchants,
    (SELECT COUNT(*) FROM payment_links) as payment_links,
    (SELECT COUNT(*) FROM transactions) as transactions,
    (SELECT COUNT(*) FROM withdrawals) as withdrawals,
    (SELECT COUNT(*) FROM ad_rewards) as ad_rewards;

-- ====== IF YOU NEED TO RE-RUN THE FIX ======
-- Just copy and run COMPLETE_FEATURE_FIX.sql again
-- It's idempotent - safe to run multiple times
