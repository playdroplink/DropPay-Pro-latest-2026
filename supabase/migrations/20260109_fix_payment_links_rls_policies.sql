-- Migration: Fix RLS policies for payment_links INSERT operations
-- Fixes: "new row violates row-level security policy" errors for both checkout and subscription links

BEGIN;

-- Step 1: Drop ALL existing policies to ensure clean state
DROP POLICY IF EXISTS "Merchants can manage own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can insert their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can update their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can delete their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Payment links view policy" ON public.payment_links;
DROP POLICY IF EXISTS "Anyone can view active payment links" ON public.payment_links;

-- Step 2: Enable RLS on payment_links (should already be enabled, but ensure it)
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- Step 3: Create comprehensive INSERT policy that allows merchant to insert when authenticated
CREATE POLICY "Merchants can insert their own payment links"
ON public.payment_links
FOR INSERT
WITH CHECK (
    -- The merchant_id must belong to the authenticated user
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Step 4: Create comprehensive UPDATE policy
CREATE POLICY "Merchants can update their own payment links"
ON public.payment_links
FOR UPDATE
USING (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Step 5: Create comprehensive DELETE policy  
CREATE POLICY "Merchants can delete their own payment links"
ON public.payment_links
FOR DELETE
USING (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Step 6: Recreate SELECT policy to allow public viewing of active links plus merchant viewing of their own
CREATE POLICY "Payment links view policy"
ON public.payment_links
FOR SELECT
USING (
    is_active = true 
    OR merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

COMMIT;
