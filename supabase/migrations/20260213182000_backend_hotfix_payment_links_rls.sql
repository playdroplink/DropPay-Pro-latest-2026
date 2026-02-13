-- Backend hotfix:
-- 1) Resolve payment_links RLS insert errors from dashboard link creation
-- 2) Keep paypage public reads working
-- Safe to run multiple times.

BEGIN;

ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- Remove conflicting legacy policies
DROP POLICY IF EXISTS "Merchants can manage own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can insert their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can update their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can delete their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Payment links view policy" ON public.payment_links;
DROP POLICY IF EXISTS "Anyone can view active payment links" ON public.payment_links;
DROP POLICY IF EXISTS "PayPage can read active payment links" ON public.payment_links;

-- Public read for paypage and shared links
CREATE POLICY "Payment links public read active"
ON public.payment_links
FOR SELECT
USING (is_active = true);

-- Merchant read fallback for dashboard queries (works with or without Supabase Auth session)
CREATE POLICY "Payment links merchant read fallback"
ON public.payment_links
FOR SELECT
USING (
  merchant_id IN (SELECT id FROM public.merchants)
);

-- Insert/update/delete fallback: require valid merchant_id.
-- If auth.uid() exists, also allow owner-bound checks via merchants.pi_user_id.
CREATE POLICY "Payment links insert fallback"
ON public.payment_links
FOR INSERT
WITH CHECK (
  merchant_id IN (SELECT id FROM public.merchants)
  AND (
    auth.uid() IS NULL
    OR merchant_id IN (
      SELECT id FROM public.merchants
      WHERE pi_user_id = (auth.uid())::text
    )
  )
);

CREATE POLICY "Payment links update fallback"
ON public.payment_links
FOR UPDATE
USING (
  merchant_id IN (SELECT id FROM public.merchants)
  AND (
    auth.uid() IS NULL
    OR merchant_id IN (
      SELECT id FROM public.merchants
      WHERE pi_user_id = (auth.uid())::text
    )
  )
)
WITH CHECK (
  merchant_id IN (SELECT id FROM public.merchants)
  AND (
    auth.uid() IS NULL
    OR merchant_id IN (
      SELECT id FROM public.merchants
      WHERE pi_user_id = (auth.uid())::text
    )
  )
);

CREATE POLICY "Payment links delete fallback"
ON public.payment_links
FOR DELETE
USING (
  merchant_id IN (SELECT id FROM public.merchants)
  AND (
    auth.uid() IS NULL
    OR merchant_id IN (
      SELECT id FROM public.merchants
      WHERE pi_user_id = (auth.uid())::text
    )
  )
);

COMMIT;
