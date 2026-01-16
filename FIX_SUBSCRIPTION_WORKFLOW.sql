-- =========================================
-- SUBSCRIPTION WORKFLOW FIX & VERIFICATION
-- =========================================
-- Run this to verify subscription system is working properly

-- ====== STEP 1: VERIFY SUBSCRIPTION PLANS EXIST ======
SELECT 
    'Subscription Plans' as check_type,
    COUNT(*) as total_plans,
    STRING_AGG(name || ' (' || amount || ' Pi)', ', ') as plans
FROM subscription_plans
WHERE is_active = true;

-- Show all plan details
SELECT 
    id,
    name,
    amount,
    link_limit,
    platform_fee_percent,
    features,
    is_active,
    created_at
FROM subscription_plans
ORDER BY amount;

-- ====== STEP 2: VERIFY USER_SUBSCRIPTIONS TABLE ======
SELECT 
    'User Subscriptions' as check_type,
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired
FROM user_subscriptions;

-- Show current active subscriptions
SELECT 
    us.id,
    us.merchant_id,
    us.pi_username,
    sp.name as plan_name,
    sp.amount as plan_price,
    us.status,
    us.current_period_start,
    us.current_period_end,
    us.last_payment_at,
    m.business_name as merchant_business
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN merchants m ON us.merchant_id = m.id
WHERE us.status = 'active'
ORDER BY us.last_payment_at DESC;

-- ====== STEP 3: CHECK FOR ORPHANED SUBSCRIPTIONS ======
-- Subscriptions with invalid plan_id
SELECT 
    'Orphaned Subscriptions (Invalid Plan)' as issue_type,
    COUNT(*) as count
FROM user_subscriptions us
WHERE NOT EXISTS (
    SELECT 1 FROM subscription_plans sp WHERE sp.id = us.plan_id
);

-- Subscriptions with invalid merchant_id
SELECT 
    'Orphaned Subscriptions (Invalid Merchant)' as issue_type,
    COUNT(*) as count
FROM user_subscriptions us
WHERE NOT EXISTS (
    SELECT 1 FROM merchants m WHERE m.id = us.merchant_id
);

-- ====== STEP 4: VERIFY SUBSCRIPTION PAYMENT LINKS ======
-- Check for subscription payment links
SELECT 
    'Subscription Payment Links' as check_type,
    COUNT(*) as total_links,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_links
FROM payment_links
WHERE payment_type = 'recurring' 
   OR title LIKE '%Plan Subscription%'
   OR title LIKE '%DropPay%';

-- Show recent subscription payment links
SELECT 
    id,
    title,
    amount,
    slug,
    payment_type,
    is_active,
    created_at
FROM payment_links
WHERE payment_type = 'recurring' 
   OR title LIKE '%Plan Subscription%'
   OR title LIKE '%DropPay%'
ORDER BY created_at DESC
LIMIT 10;

-- ====== STEP 5: VERIFY SUBSCRIPTION TRANSACTIONS ======
-- Check transactions that should trigger subscription activation
SELECT 
    'Subscription Transactions' as check_type,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed,
    SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END) as total_revenue
FROM transactions t
JOIN payment_links pl ON t.payment_link_id = pl.id
WHERE pl.payment_type = 'recurring'
   OR pl.title LIKE '%Plan Subscription%';

-- Show recent subscription transactions
SELECT 
    t.id as transaction_id,
    t.payer_pi_username,
    t.amount,
    t.status,
    t.created_at as transaction_date,
    pl.title as payment_link_title,
    us.id as subscription_id,
    sp.name as activated_plan
FROM transactions t
JOIN payment_links pl ON t.payment_link_id = pl.id
LEFT JOIN user_subscriptions us ON t.merchant_id = us.merchant_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE (pl.payment_type = 'recurring' OR pl.title LIKE '%Plan Subscription%')
  AND t.status = 'completed'
ORDER BY t.created_at DESC
LIMIT 10;

-- ====== STEP 6: CHECK SUBSCRIPTION ACTIVATION WORKFLOW ======
-- Verify merchants with completed subscription payments have active subscriptions
SELECT 
    'Subscription Activation Check' as check_type,
    t.merchant_id,
    t.payer_pi_username,
    t.amount as paid_amount,
    t.created_at as payment_date,
    CASE 
        WHEN us.id IS NOT NULL THEN 'Subscription Activated ✅'
        ELSE 'Missing Subscription ❌'
    END as status,
    sp.name as plan_name
FROM transactions t
JOIN payment_links pl ON t.payment_link_id = pl.id
LEFT JOIN user_subscriptions us ON t.merchant_id = us.merchant_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE (pl.payment_type = 'recurring' OR pl.title LIKE '%Plan Subscription%')
  AND t.status = 'completed'
  AND t.created_at > NOW() - INTERVAL '7 days'
ORDER BY t.created_at DESC;

-- ====== STEP 7: ENSURE ALL DEFAULT PLANS EXIST ======
-- Create/update default plans if missing
INSERT INTO subscription_plans (id, name, description, amount, link_limit, platform_fee_percent, features, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Free', 'Free plan with basic features', 0, 1, 0, 
     '["Free payment type only", "Basic analytics", "No platform fee", "Community support"]'::jsonb, 
     true),
    ('00000000-0000-0000-0000-000000000002'::uuid, 'Basic', 'Essential features for growing businesses', 10, 5, 2, 
     '["Free + One-time payments", "Basic analytics", "2% platform fee", "Email support"]'::jsonb, 
     true),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'Pro', 'Advanced features for professionals', 20, 10, 2, 
     '["Free + One-time + Recurring payments", "Advanced analytics", "2% platform fee", "Priority support", "Custom branding", "Tracking links"]'::jsonb, 
     true),
    ('00000000-0000-0000-0000-000000000004'::uuid, 'Enterprise', 'Full feature suite for large businesses', 50, NULL, 2, 
     '["All payment types", "Full analytics suite", "2% platform fee", "24/7 Priority support", "Custom integrations", "Dedicated account manager"]'::jsonb, 
     true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    amount = EXCLUDED.amount,
    link_limit = EXCLUDED.link_limit,
    platform_fee_percent = EXCLUDED.platform_fee_percent,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

-- ====== STEP 8: HEALTH CHECK SUMMARY ======
SELECT 
    'Subscription System Health' as report_type,
    (SELECT COUNT(*) FROM subscription_plans WHERE is_active = true) as active_plans,
    (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM payment_links WHERE payment_type = 'recurring') as subscription_payment_links,
    (SELECT COUNT(*) FROM transactions t 
     JOIN payment_links pl ON t.payment_link_id = pl.id 
     WHERE pl.payment_type = 'recurring' AND t.status = 'completed') as completed_subscription_payments;

-- =========================================
-- COMPLETION SUMMARY
-- =========================================
-- ✓ Verified subscription plans exist
-- ✓ Checked user_subscriptions table
-- ✓ Verified subscription payment links
-- ✓ Checked subscription transactions
-- ✓ Verified activation workflow
-- ✓ Ensured default plans exist
-- 
-- SUBSCRIPTION WORKFLOW:
-- 1. User selects plan on Subscription page
-- 2. Frontend creates payment link OR processes free plan
-- 3. For paid plans: User makes Pi payment
-- 4. complete-payment edge function processes payment
-- 5. Subscription activated in user_subscriptions table
-- 6. Notification sent to merchant
-- 7. Dashboard reflects new plan
-- =========================================
