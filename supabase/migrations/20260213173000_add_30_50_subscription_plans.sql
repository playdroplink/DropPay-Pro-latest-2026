-- Add additional paid plans:
-- 30 Pi -> 35 links
-- 50 Pi -> 55 links
-- Safe to run multiple times.

BEGIN;

-- Ensure Pro (30 Pi / 35 links) exists and is active
INSERT INTO public.subscription_plans (
  name, description, amount, "interval", link_limit, platform_fee_percent, features, analytics_level, is_active
)
SELECT
  'Pro',
  'For scaling businesses',
  30,
  'monthly',
  35,
  1,
  '["Up to 35 payment links", "Advanced analytics", "Priority support", "Custom branding", "Tracking links"]'::jsonb,
  'advanced',
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_plans
  WHERE lower(trim(name)) = 'pro'
    AND is_active = true
);

-- Ensure Scale (50 Pi / 55 links) exists and is active
INSERT INTO public.subscription_plans (
  name, description, amount, "interval", link_limit, platform_fee_percent, features, analytics_level, is_active
)
SELECT
  'Scale',
  'For high-volume businesses',
  50,
  'monthly',
  55,
  0.75,
  '["Up to 55 payment links", "Advanced analytics", "Priority support", "Custom branding", "Tracking links"]'::jsonb,
  'advanced',
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_plans
  WHERE lower(trim(name)) = 'scale'
    AND is_active = true
);

-- Normalize values for active Pro / Scale rows
UPDATE public.subscription_plans
SET
  description = 'For scaling businesses',
  amount = 30,
  "interval" = 'monthly',
  link_limit = 35,
  platform_fee_percent = 1,
  features = '["Up to 35 payment links", "Advanced analytics", "Priority support", "Custom branding", "Tracking links"]'::jsonb,
  analytics_level = 'advanced'
WHERE lower(trim(name)) = 'pro'
  AND is_active = true;

UPDATE public.subscription_plans
SET
  description = 'For high-volume businesses',
  amount = 50,
  "interval" = 'monthly',
  link_limit = 55,
  platform_fee_percent = 0.75,
  features = '["Up to 55 payment links", "Advanced analytics", "Priority support", "Custom branding", "Tracking links"]'::jsonb,
  analytics_level = 'advanced'
WHERE lower(trim(name)) = 'scale'
  AND is_active = true;

COMMIT;
