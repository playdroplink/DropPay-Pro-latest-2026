-- Update active subscription plan link limits:
-- Free 2, Basic 10, Growth 25, Enterprise 100
-- Safe to run multiple times.

BEGIN;

UPDATE public.subscription_plans
SET link_limit = 2
WHERE lower(trim(name)) = 'free'
  AND is_active = true;

UPDATE public.subscription_plans
SET link_limit = 10
WHERE lower(trim(name)) = 'basic'
  AND is_active = true;

UPDATE public.subscription_plans
SET link_limit = 25
WHERE lower(trim(name)) = 'growth'
  AND is_active = true;

UPDATE public.subscription_plans
SET link_limit = 100
WHERE lower(trim(name)) = 'enterprise'
  AND is_active = true;

COMMIT;
