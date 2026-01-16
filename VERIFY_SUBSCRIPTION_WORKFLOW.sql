-- =====================================================
-- VERIFY SUBSCRIPTION TABLES AND DATA
-- =====================================================

-- 1. Check if subscription_plans table exists and has data
SELECT 'Subscription Plans' as check_type, * FROM subscription_plans ORDER BY amount;

-- 2. Check if user_subscriptions table exists
SELECT 'User Subscriptions' as check_type, 
       merchant_id, 
       pi_username, 
       plan_id, 
       status, 
       current_period_start, 
       current_period_end 
FROM user_subscriptions 
LIMIT 10;

-- 3. Verify merchant profile exists for test user
SELECT 'Merchant Profile' as check_type,
       id,
       username,
       pi_username,
       subscription_tier,
       is_active
FROM merchants 
WHERE pi_username ILIKE '%wain2020%' OR username ILIKE '%wain2020%';

-- 4. Check payment_links for subscription patterns
SELECT 'Subscription Payment Links' as check_type,
       id,
       slug,
       title,
       amount,
       payment_type,
       pricing_type,
       merchant_id
FROM payment_links
WHERE title ILIKE '%subscription%' OR payment_type = 'recurring'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check transactions for subscription payments
SELECT 'Subscription Transactions' as check_type,
       id,
       payment_link_id,
       amount,
       status,
       payer_pi_username,
       created_at
FROM transactions
WHERE payment_link_id IN (
  SELECT id FROM payment_links 
  WHERE title ILIKE '%subscription%' OR payment_type = 'recurring'
)
ORDER BY created_at DESC
LIMIT 5;

-- 6. Verify RLS policies allow merchant operations
SELECT 'Merchant RLS Policies' as check_type,
       policyname,
       cmd,
       roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'merchants';

-- 7. Verify payment_links RLS policies
SELECT 'Payment Links RLS Policies' as check_type,
       policyname,
       cmd,
       roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'payment_links';
