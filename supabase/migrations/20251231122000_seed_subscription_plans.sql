-- Seed subscription plans with defaults if they don't exist

-- Check and insert Free plan
INSERT INTO public.subscription_plans (name, description, amount, "interval", link_limit, platform_fee_percent, features, is_active)
VALUES (
  'Free',
  'Perfect for getting started',
  0,
  'monthly',
  5,
  2,
  '["Basic payment links", "1 week analytics retention", "Community support"]'::jsonb,
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
  50,
  1.5,
  '["Up to 50 payment links", "30 days analytics", "Email support", "API access", "Custom branding"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- Insert Pro plan
INSERT INTO public.subscription_plans (name, description, amount, "interval", link_limit, platform_fee_percent, features, is_active)
VALUES (
  'Pro',
  'Best for growing businesses',
  30,
  'monthly',
  null,
  1,
  '["Unlimited payment links", "1 year analytics retention", "Priority support", "Advanced API", "Custom domain", "Webhooks", "Subscription management", "Split payments"]'::jsonb,
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
  null,
  0.5,
  '["Unlimited everything", "Unlimited analytics retention", "Dedicated support", "Custom integrations", "White-label solution", "Advanced security", "SLA guarantee", "Custom features"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
