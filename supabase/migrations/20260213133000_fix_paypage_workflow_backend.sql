-- Fix PayPage workflow backend access and performance
-- Safe to run multiple times.

BEGIN;

-- 1) Ensure public can read active payment links (required by /pay/{slug})
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PayPage can read active payment links" ON public.payment_links;
CREATE POLICY "PayPage can read active payment links"
ON public.payment_links
FOR SELECT
USING (is_active = true);

-- 1b) Ensure public can read active checkout links (required by /pay/{slug} for checkout mode)
ALTER TABLE public.checkout_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PayPage can read active checkout links" ON public.checkout_links;
CREATE POLICY "PayPage can read active checkout links"
ON public.checkout_links
FOR SELECT
USING (is_active = true);

-- 2) Allow public reads needed for plan-limit checks on PayPage
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PayPage can read active subscription plans" ON public.subscription_plans;
CREATE POLICY "PayPage can read active subscription plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PayPage can read active subscriptions by merchant" ON public.user_subscriptions;
CREATE POLICY "PayPage can read active subscriptions by merchant"
ON public.user_subscriptions
FOR SELECT
USING (status = 'active');

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PayPage can read completed transaction counts" ON public.transactions;
CREATE POLICY "PayPage can read completed transaction counts"
ON public.transactions
FOR SELECT
USING (status = 'completed');

-- 3) Keep public merchant profile reads for pay page branding/wallet data
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PayPage can read merchant profiles" ON public.merchants;
CREATE POLICY "PayPage can read merchant profiles"
ON public.merchants
FOR SELECT
USING (true);

-- 4) Improve completion-query performance and idempotency lookup path
CREATE INDEX IF NOT EXISTS idx_transactions_pi_payment_id
  ON public.transactions (pi_payment_id);

CREATE INDEX IF NOT EXISTS idx_transactions_payment_link_status
  ON public.transactions (payment_link_id, status);

-- Checkout-link transaction lookups are currently tracked in transactions.metadata
-- by complete-payment edge function:
-- metadata.source_link_table = 'checkout_links'
-- metadata.source_link_id = checkout_links.id
CREATE INDEX IF NOT EXISTS idx_transactions_checkout_metadata_status
  ON public.transactions (
    (metadata->>'source_link_table'),
    (metadata->>'source_link_id'),
    status
  );

COMMIT;
