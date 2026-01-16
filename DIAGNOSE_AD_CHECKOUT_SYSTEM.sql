-- =========================================
-- PI AD NETWORK & CHECKOUT LINKS DIAGNOSTIC
-- =========================================
-- This SQL verifies both systems are working correctly

-- ====== SECTION 1: CHECK AD REWARDS SYSTEM ======

-- 1.1: Verify ad_rewards table exists and has data
SELECT 
    'ad_rewards table status' as check_name,
    COUNT(*) as total_rewards,
    COUNT(CASE WHEN status = 'granted' THEN 1 END) as granted_rewards,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_rewards
FROM ad_rewards;

-- 1.2: Check for any errors in ad reward tracking
SELECT 
    'Recent ad rewards (last 10)' as check_name,
    id,
    pi_username,
    reward_amount,
    status,
    created_at
FROM ad_rewards
ORDER BY created_at DESC
LIMIT 10;

-- 1.3: Check merchant ad revenue
SELECT 
    m.pi_username,
    COUNT(ar.id) as total_ads_watched,
    SUM(ar.reward_amount) as total_ad_earnings,
    COUNT(CASE WHEN ar.status = 'granted' THEN 1 END) as granted_ads,
    COUNT(CASE WHEN ar.status = 'pending' THEN 1 END) as pending_ads
FROM merchants m
LEFT JOIN ad_rewards ar ON m.id = ar.merchant_id
GROUP BY m.id, m.pi_username
HAVING COUNT(ar.id) > 0
ORDER BY total_ad_earnings DESC;

-- ====== SECTION 2: CHECK CHECKOUT LINKS SYSTEM ======

-- 2.1: Verify checkout_links table exists and has data
SELECT 
    'checkout_links table status' as check_name,
    COUNT(*) as total_links,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_links,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_links
FROM checkout_links;

-- 2.2: Check checkout links by merchant
SELECT 
    m.pi_username,
    COUNT(cl.id) as total_checkout_links,
    SUM(cl.views) as total_views,
    SUM(cl.conversions) as total_conversions,
    STRING_AGG(cl.title, ', ') as link_titles
FROM merchants m
LEFT JOIN checkout_links cl ON m.id = cl.merchant_id
GROUP BY m.id, m.pi_username
HAVING COUNT(cl.id) > 0
ORDER BY COUNT(cl.id) DESC;

-- 2.3: Check recent checkout links
SELECT 
    'Recent checkout links (last 10)' as check_name,
    cl.title,
    cl.category,
    cl.amount,
    cl.currency,
    cl.is_active,
    cl.views,
    cl.conversions,
    cl.created_at,
    m.pi_username as merchant
FROM checkout_links cl
LEFT JOIN merchants m ON cl.merchant_id = m.id
ORDER BY cl.created_at DESC
LIMIT 10;

-- 2.4: Check checkout link schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'checkout_links'
ORDER BY ordinal_position;

-- ====== SECTION 3: INTEGRATION CHECK ======

-- 3.1: Check if merchants have both systems active
SELECT 
    m.pi_username,
    m.business_name,
    COUNT(DISTINCT cl.id) as checkout_links,
    COUNT(DISTINCT ar.id) as ads_watched,
    SUM(ar.reward_amount) as ad_earnings,
    SUM(cl.conversions) as checkout_conversions
FROM merchants m
LEFT JOIN checkout_links cl ON m.id = cl.merchant_id AND cl.is_active = true
LEFT JOIN ad_rewards ar ON m.id = ar.merchant_id AND ar.status = 'granted'
WHERE m.available_balance > 0 OR m.total_revenue > 0
GROUP BY m.id, m.pi_username, m.business_name
ORDER BY m.created_at DESC;

-- ====== SECTION 4: POTENTIAL ISSUES ======

-- 4.1: Check for orphaned records (shouldn't happen)
SELECT 'Orphaned checkout links (missing merchant)' as issue,
       COUNT(*) as count
FROM checkout_links
WHERE merchant_id NOT IN (SELECT id FROM merchants)
UNION ALL
SELECT 'Orphaned ad rewards (missing merchant)',
       COUNT(*)
FROM ad_rewards
WHERE merchant_id NOT IN (SELECT id FROM merchants);

-- ====== SECTION 5: SUMMARY ======

-- 5.1: Overall platform status
SELECT 
    'PLATFORM SUMMARY' as metric,
    (SELECT COUNT(*) FROM merchants) as total_merchants,
    (SELECT COUNT(*) FROM checkout_links WHERE is_active = true) as active_checkout_links,
    (SELECT COUNT(*) FROM ad_rewards WHERE status = 'granted') as granted_ad_rewards,
    (SELECT SUM(reward_amount) FROM ad_rewards WHERE status = 'granted') as total_ad_earnings,
    (SELECT SUM(conversions) FROM checkout_links WHERE is_active = true) as total_checkout_conversions;