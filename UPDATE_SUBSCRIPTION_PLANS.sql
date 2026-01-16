-- Update subscription plans with proper link limits
-- Run this in Supabase SQL Editor

-- First, clear existing plans and insert the correct ones
DELETE FROM subscription_plans;

-- Insert the correct subscription plans matching the hardcoded plans in Pricing.tsx
INSERT INTO subscription_plans (id, name, description, amount, interval_type, link_limit, analytics_level, platform_fee_percent, features, is_active) VALUES
('1', 'Free', 'Perfect for getting started (0.01 Pi minimum)', 0.01, 'monthly', 1, 'basic', 0, 
 '["1 Payment Link", "Free payment type only", "Basic analytics", "No platform fee", "Community support"]', true),

('2', 'Basic', 'For small businesses', 10, 'monthly', 5, 'basic', 2, 
 '["5 Payment Links", "Free + One-time payments", "Basic analytics", "2% platform fee (for maintenance & future features)", "Email support"]', true),

('3', 'Pro', 'Best for growing businesses', 20, 'monthly', 10, 'advanced', 2, 
 '["10 Payment Links", "Free + One-time + Recurring payments", "Advanced analytics", "2% platform fee (for maintenance & future features)", "Priority support", "Custom branding", "Tracking links"]', true),

('4', 'Enterprise', 'For large scale operations', 50, 'monthly', NULL, 'full', 2, 
 '["Unlimited Payment Links", "All payment types (Free + One-time + Recurring + Donations)", "Full analytics suite", "2% platform fee (for maintenance & future features)", "24/7 Priority support", "Custom integrations", "Dedicated account manager"]', true);

-- Verify the plans were inserted
SELECT 
    id, 
    name, 
    description, 
    amount, 
    link_limit, 
    analytics_level, 
    platform_fee_percent,
    is_active
FROM subscription_plans 
ORDER BY amount;