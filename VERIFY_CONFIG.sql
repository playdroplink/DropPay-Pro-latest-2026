-- ========================================
-- VERIFICATION QUERIES FOR PI NETWORK SETUP
-- Run these queries to verify your configuration
-- ========================================

-- 1. Check Subscription Plans (Should show 5 plans including 50 PI Premium)
SELECT 
  name,
  amount as "Price (PI)",
  link_limit as "Link Limit",
  platform_fee_percent as "Platform Fee %",
  is_active as "Active"
FROM subscription_plans
WHERE is_active = true
ORDER BY amount;

-- Expected Output:
-- Free: 0 PI, 5 links, 2% fee
-- Basic: 10 PI, 50 links, 1.5% fee
-- Pro: 30 PI, unlimited, 1% fee
-- Premium: 50 PI, 200 links, 0.8% fee ⭐
-- Enterprise: 100 PI, unlimited, 0.5% fee

-- 2. Check if Premium (50 PI) plan exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM subscription_plans WHERE amount = 50 AND is_active = true)
    THEN '✅ 50 PI Premium Plan: CONFIGURED'
    ELSE '❌ 50 PI Premium Plan: MISSING - Run ADD_50_PI_PLAN.sql'
  END as status;

-- 3. Check Active Merchants
SELECT 
  COUNT(*) as total_merchants,
  COUNT(CASE WHEN pi_username IS NOT NULL THEN 1 END) as with_pi_username,
  COUNT(CASE WHEN wallet_address IS NOT NULL THEN 1 END) as with_wallet
FROM merchants;

-- 4. Check Payment Links Statistics
SELECT 
  payment_type,
  COUNT(*) as count,
  AVG(amount) as avg_amount
FROM payment_links
GROUP BY payment_type;

-- 5. Check Ad Rewards Statistics
SELECT 
  status,
  COUNT(*) as count,
  SUM(reward_amount) as total_rewards
FROM ad_rewards
GROUP BY status;

-- 6. Check Recent Transactions (Last 10)
SELECT 
  txid,
  amount,
  status,
  created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 10;

-- 7. Verify RLS Policies are Active
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('merchants', 'payment_links', 'transactions', 'ad_rewards', 'subscription_plans')
ORDER BY tablename, policyname;

-- 8. Check Edge Functions (via Supabase CLI)
-- Run in terminal: supabase functions list
-- Expected functions:
-- - approve-payment
-- - complete-payment
-- - create-merchant-profile
-- - delete-account
-- - process-withdrawal
-- - send-download-email
-- - send-withdrawal-email
-- - verify-ad-reward ⭐
-- - verify-payment ⭐

-- 9. Check Supabase Secrets (via CLI)
-- Run in terminal: supabase secrets list
-- Expected secrets:
-- - ALLOW_ORIGIN
-- - PI_API_KEY ⭐
-- - PI_VALIDATION_KEY ⭐
-- - RESEND_API_KEY
-- - SUPABASE_SERVICE_ROLE_KEY
-- - SUPABASE_URL

-- 10. Test Payment Link Creation
-- This should succeed for authenticated merchant
-- INSERT INTO payment_links (
--   merchant_id,
--   title,
--   description,
--   amount,
--   payment_type,
--   slug
-- ) VALUES (
--   'YOUR_MERCHANT_ID',
--   'Test Product',
--   'Test Description',
--   50.00,
--   'one_time',
--   'test-' || gen_random_uuid()::text
-- ) RETURNING id, slug, amount;

-- ========================================
-- HEALTH CHECK SUMMARY
-- ========================================

DO $$
DECLARE
  plan_count INT;
  premium_exists BOOLEAN;
  merchant_count INT;
  link_count INT;
BEGIN
  -- Count plans
  SELECT COUNT(*) INTO plan_count FROM subscription_plans WHERE is_active = true;
  
  -- Check premium plan
  SELECT EXISTS(SELECT 1 FROM subscription_plans WHERE amount = 50 AND is_active = true) INTO premium_exists;
  
  -- Count merchants
  SELECT COUNT(*) INTO merchant_count FROM merchants;
  
  -- Count payment links
  SELECT COUNT(*) INTO link_count FROM payment_links;
  
  -- Display results
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DROPPAY HEALTH CHECK';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Active Plans: %', plan_count;
  RAISE NOTICE '50 PI Premium Plan: %', CASE WHEN premium_exists THEN '✅ Configured' ELSE '❌ Missing' END;
  RAISE NOTICE 'Total Merchants: %', merchant_count;
  RAISE NOTICE 'Total Payment Links: %', link_count;
  RAISE NOTICE '========================================';
  
  IF plan_count < 5 THEN
    RAISE WARNING 'Expected 5 subscription plans, found %', plan_count;
  END IF;
  
  IF NOT premium_exists THEN
    RAISE WARNING 'Run ADD_50_PI_PLAN.sql to add the 50 PI Premium plan';
  END IF;
END $$;
