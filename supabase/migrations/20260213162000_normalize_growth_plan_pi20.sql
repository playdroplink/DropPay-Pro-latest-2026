-- Normalize subscription tiers to:
-- Free (2 links), Basic (10 links), Growth (20 Pi / 25 links), Enterprise (100 links)
-- and deactivate legacy Pro plans to avoid duplicate mid-tier options.
-- Safe to run multiple times.

BEGIN;

-- 1) Ensure Growth plan exists as active at 20 Pi/month
WITH existing_growth AS (
  SELECT id
  FROM public.subscription_plans
  WHERE lower(trim(name)) = 'growth'
    AND is_active = true
  ORDER BY created_at DESC NULLS LAST, id DESC
  LIMIT 1
)
INSERT INTO public.subscription_plans (
  name, description, amount, "interval", link_limit, platform_fee_percent, features, analytics_level, is_active
)
SELECT
  'Growth',
  'Best for growing businesses',
  20,
  'monthly',
  25,
  1,
  '["25 payment links", "Advanced analytics", "Priority support", "Custom branding", "Tracking links"]'::jsonb,
  'advanced',
  true
WHERE NOT EXISTS (SELECT 1 FROM existing_growth);

-- 2) Normalize the active Growth row values (keep newest active Growth only)
WITH active_growth AS (
  SELECT id
  FROM public.subscription_plans
  WHERE lower(trim(name)) = 'growth'
    AND is_active = true
  ORDER BY created_at DESC NULLS LAST, id DESC
  LIMIT 1
)
UPDATE public.subscription_plans sp
SET
  description = 'Best for growing businesses',
  amount = 20,
  "interval" = 'monthly',
  link_limit = 25,
  platform_fee_percent = 1,
  features = '["25 payment links", "Advanced analytics", "Priority support", "Custom branding", "Tracking links"]'::jsonb,
  analytics_level = 'advanced',
  is_active = true
FROM active_growth g
WHERE sp.id = g.id;

-- 2b) Normalize active Free/Basic/Enterprise link limits
UPDATE public.subscription_plans
SET link_limit = 2
WHERE lower(trim(name)) = 'free'
  AND is_active = true;

UPDATE public.subscription_plans
SET link_limit = 10
WHERE lower(trim(name)) = 'basic'
  AND is_active = true;

UPDATE public.subscription_plans
SET link_limit = 100
WHERE lower(trim(name)) = 'enterprise'
  AND is_active = true;

-- 3) Move subscriptions from active Pro plan(s) to active Growth plan
WITH growth_plan AS (
  SELECT id
  FROM public.subscription_plans
  WHERE lower(trim(name)) = 'growth'
    AND is_active = true
  ORDER BY created_at DESC NULLS LAST, id DESC
  LIMIT 1
),
pro_plans AS (
  SELECT id
  FROM public.subscription_plans
  WHERE lower(trim(name)) = 'pro'
)
UPDATE public.user_subscriptions us
SET plan_id = g.id
FROM growth_plan g
WHERE us.plan_id IN (SELECT id FROM pro_plans);

-- 4) Deactivate all Pro plans so UI shows one mid-tier only
UPDATE public.subscription_plans
SET is_active = false
WHERE lower(trim(name)) = 'pro'
  AND is_active = true;

COMMIT;
