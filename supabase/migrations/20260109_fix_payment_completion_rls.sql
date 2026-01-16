-- Migration: Fix RLS policies for payment completion
-- Fixes: "Payment Failed" error on successful Pi payment
-- Issue: Edge function can't read/update checkout_links and user_subscriptions tables

BEGIN;

-- Drop all existing checkout_links policies
DROP POLICY IF EXISTS "Users can view their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can insert their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can update their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can delete their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Anyone can view checkout link by slug" ON public.checkout_links;
DROP POLICY IF EXISTS "Merchants can manage their checkout links" ON public.checkout_links;

-- Enable RLS
ALTER TABLE public.checkout_links ENABLE ROW LEVEL SECURITY;

-- Create corrected SELECT policy - allow viewing active links publicly
CREATE POLICY "Anyone can view active checkout links"
ON public.checkout_links
FOR SELECT
USING (is_active = true);

-- Create INSERT policy with proper merchant validation
CREATE POLICY "Merchants can insert their own checkout links"
ON public.checkout_links
FOR INSERT
WITH CHECK (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Create UPDATE policy
CREATE POLICY "Merchants can update their own checkout links"
ON public.checkout_links
FOR UPDATE
USING (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
)
WITH CHECK (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Create DELETE policy
CREATE POLICY "Merchants can delete their own checkout links"
ON public.checkout_links
FOR DELETE
USING (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Fix user_subscriptions RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can manage own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view subscriptions" ON public.user_subscriptions;

-- Create open policies for subscription management (edge functions need access)
CREATE POLICY "Anyone can view subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (true);

CREATE POLICY "Service can manage subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING (true);

COMMIT;
