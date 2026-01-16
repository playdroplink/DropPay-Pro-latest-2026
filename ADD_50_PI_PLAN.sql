-- Add 50 PI Premium Plan
-- This plan is positioned between Basic (10 PI) and Pro (30 PI)

INSERT INTO public.subscription_plans (name, description, amount, "interval", link_limit, platform_fee_percent, features, is_active)
VALUES (
  'Premium',
  'Premium features for professionals',
  50,
  'monthly',
  200,
  0.8,
  '["Up to 200 payment links", "90 days analytics retention", "Priority email support", "Full API access", "Custom branding", "Advanced webhooks", "Priority processing"]'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  amount = EXCLUDED.amount,
  "interval" = EXCLUDED.interval,
  link_limit = EXCLUDED.link_limit,
  platform_fee_percent = EXCLUDED.platform_fee_percent,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- Verify the plan was added
SELECT id, name, description, amount, link_limit, platform_fee_percent, is_active
FROM public.subscription_plans
WHERE name = 'Premium';
