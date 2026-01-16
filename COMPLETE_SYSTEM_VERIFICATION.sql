# ======================================
# COMPLETE SYSTEM VERIFICATION SQL
# ======================================
# Run this in Supabase SQL Editor to verify all features
# https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql/new

-- ======================================
-- 1. VERIFY TABLES EXIST
-- ======================================
SELECT 
    'Tables Check' as check_type,
    COUNT(*) as total_tables,
    STRING_AGG(table_name, ', ') as tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'merchants',
    'payment_links',
    'checkout_links',
    'transactions',
    'ad_rewards',
    'notifications',
    'user_subscriptions',
    'subscription_plans',
    'withdrawals'
  );

-- ======================================
-- 2. VERIFY MERCHANTS TABLE
-- ======================================
SELECT 
    'Merchants' as table_name,
    COUNT(*) as total_merchants,
    COUNT(CASE WHEN available_balance > 0 THEN 1 END) as merchants_with_balance,
    COUNT(CASE WHEN total_revenue > 0 THEN 1 END) as merchants_with_revenue,
    SUM(available_balance) as total_available_balance,
    SUM(total_revenue) as total_platform_revenue
FROM merchants;

-- ======================================
-- 3. VERIFY PAYMENT LINKS
-- ======================================
SELECT 
    'Payment Links' as table_name,
    COUNT(*) as total_links,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_links,
    SUM(views) as total_views,
    SUM(conversions) as total_conversions
FROM payment_links;

-- ======================================
-- 4. VERIFY CHECKOUT LINKS
-- ======================================
SELECT 
    'Checkout Links' as table_name,
    COUNT(*) as total_links,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_links,
    SUM(views) as total_views,
    SUM(conversions) as total_conversions
FROM checkout_links;

-- ======================================
-- 5. VERIFY TRANSACTIONS
-- ======================================
SELECT 
    'Transactions' as table_name,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_transaction_volume
FROM transactions;

-- ======================================
-- 6. VERIFY AD REWARDS SYSTEM
-- ======================================
SELECT 
    'Ad Rewards' as table_name,
    COUNT(*) as total_rewards,
    COUNT(CASE WHEN status = 'granted' THEN 1 END) as granted_rewards,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_rewards,
    SUM(CASE WHEN status = 'granted' THEN reward_amount ELSE 0 END) as total_rewards_paid
FROM ad_rewards;

-- ======================================
-- 7. VERIFY AD REWARDS TRIGGER EXISTS
-- ======================================
SELECT 
    'Triggers' as check_type,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_credit_ad_reward';

-- ======================================
-- 8. VERIFY RLS POLICIES
-- ======================================
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ======================================
-- 9. VERIFY STORAGE BUCKETS
-- ======================================
SELECT 
    'Storage Buckets' as check_type,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets;

-- ======================================
-- 10. VERIFY SUBSCRIPTIONS
-- ======================================
SELECT 
    'Subscriptions' as table_name,
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired
FROM user_subscriptions;

-- ======================================
-- 11. CHECK FOR CRITICAL COLUMNS
-- ======================================
SELECT 
    'Critical Columns Check' as check_type,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'merchants' AND column_name IN ('available_balance', 'total_revenue', 'pi_username', 'wallet_address'))
    OR (table_name = 'payment_links' AND column_name IN ('slug', 'amount', 'is_active', 'merchant_id'))
    OR (table_name = 'checkout_links' AND column_name IN ('slug', 'amount', 'is_active', 'merchant_id'))
    OR (table_name = 'ad_rewards' AND column_name IN ('merchant_id', 'reward_amount', 'status', 'ad_id'))
    OR (table_name = 'transactions' AND column_name IN ('pi_payment_id', 'status', 'amount', 'merchant_id'))
  )
ORDER BY table_name, column_name;

-- ======================================
-- 12. VERIFY FUNCTIONS/PROCEDURES
-- ======================================
SELECT 
    'Database Functions' as check_type,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'credit_ad_reward_to_merchant',
    'increment_views',
    'increment_conversions'
  );

-- ======================================
-- 13. RECENT ACTIVITY CHECK
-- ======================================
-- Last 5 transactions
SELECT 
    'Recent Transactions' as activity_type,
    t.id,
    t.payer_pi_username,
    t.amount,
    t.status,
    t.created_at,
    pl.title as payment_link_title
FROM transactions t
LEFT JOIN payment_links pl ON t.payment_link_id = pl.id
ORDER BY t.created_at DESC
LIMIT 5;

-- Last 5 ad rewards
SELECT 
    'Recent Ad Rewards' as activity_type,
    ar.id,
    ar.pi_username,
    ar.reward_amount,
    ar.status,
    ar.created_at,
    m.pi_username as merchant_username
FROM ad_rewards ar
LEFT JOIN merchants m ON ar.merchant_id = m.id
ORDER BY ar.created_at DESC
LIMIT 5;

-- ======================================
-- 14. HEALTH CHECK SUMMARY
-- ======================================
SELECT 
    'System Health Summary' as report_type,
    (SELECT COUNT(*) FROM merchants) as total_merchants,
    (SELECT COUNT(*) FROM payment_links WHERE is_active = true) as active_payment_links,
    (SELECT COUNT(*) FROM checkout_links WHERE is_active = true) as active_checkout_links,
    (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as completed_transactions,
    (SELECT COUNT(*) FROM ad_rewards WHERE status = 'granted') as granted_ad_rewards,
    (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_rls_policies,
    (SELECT COUNT(*) FROM storage.buckets) as storage_buckets,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%credit%') as active_triggers;

-- ======================================
-- 15. POTENTIAL ISSUES CHECK
-- ======================================
-- Check for merchants with missing wallet addresses
SELECT 
    'Potential Issues' as issue_type,
    'Merchants without wallet address' as issue,
    COUNT(*) as count
FROM merchants
WHERE wallet_address IS NULL OR wallet_address = ''
UNION ALL
-- Check for inactive payment links with conversions
SELECT 
    'Potential Issues',
    'Inactive links with conversions',
    COUNT(*)
FROM payment_links
WHERE is_active = false AND conversions > 0
UNION ALL
-- Check for pending transactions older than 1 hour
SELECT 
    'Potential Issues',
    'Old pending transactions',
    COUNT(*)
FROM transactions
WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 hour'
UNION ALL
-- Check for ad rewards without merchant
SELECT 
    'Potential Issues',
    'Ad rewards without merchant',
    COUNT(*)
FROM ad_rewards
WHERE merchant_id IS NULL;

-- ======================================
-- VERIFICATION COMPLETE
-- ======================================
-- Review all results above to verify:
-- ✓ All tables exist
-- ✓ Data is present and valid
-- ✓ Triggers are active
-- ✓ RLS policies configured
-- ✓ Storage buckets created
-- ✓ No critical issues found
-- ======================================
