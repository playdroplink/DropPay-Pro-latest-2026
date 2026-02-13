-- Seed subscription plans with defaults if they don't exist

-- Check and insert Free plan
INSERT INTO public.subscription_plans (name, description, amount, "interval", link_limit, platform_fee_percent, features, is_active)
VALUES (
  'Free',
  'Perfect for getting started',
  0,
  'monthly',
  2,
  2,
  '["2 payment links", "Basic payment links", "1 week analytics retention", "Community support"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- Insert Basic plan
INSERT INTO public.subscription_plans (name, description, amount, "interval", link_limit, platform_fee_percent, features, is_active)
VALUES (
  'Basic',
  'For small businesses',
  10,
  'monthly',
  10,
  1.5,
  '["Up to 10 payment links", "30 days analytics", "Email support", "API access", "Custom branding"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- Insert Growth plan
INSERT INTO public.subscription_plans (name, description, amount, "interval", link_limit, platform_fee_percent, features, is_active)
VALUES (
  'Growth',
  'Best for growing businesses',
  20,
  'monthly',
  25,
  1,
  '["Up to 25 payment links", "Advanced analytics", "Priority support", "Advanced API", "Custom branding", "Tracking links"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- Insert Enterprise plan
INSERT INTO public.subscription_plans (name, description, amount, "interval", link_limit, platform_fee_percent, features, is_active)
VALUES (
  'Enterprise',
  'For large scale operations',
  100,
  'monthly',
  100,
  0.5,
  '["Up to 100 payment links", "Unlimited analytics retention", "Dedicated support", "Custom integrations", "White-label solution", "Advanced security", "SLA guarantee", "Custom features"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
