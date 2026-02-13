-- Fix duplicate subscription plans and prevent future active duplicates by name
-- Safe to run multiple times.

BEGIN;

-- Keep only the newest active row per normalized plan name.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(trim(name))
      ORDER BY created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.subscription_plans
  WHERE is_active = true
)
UPDATE public.subscription_plans sp
SET is_active = false
FROM ranked r
WHERE sp.id = r.id
  AND r.rn > 1;

-- Prevent more than one active plan with the same name (case/space-insensitive).
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscription_plans_active_name
  ON public.subscription_plans ((lower(trim(name))))
  WHERE is_active = true;

COMMIT;
