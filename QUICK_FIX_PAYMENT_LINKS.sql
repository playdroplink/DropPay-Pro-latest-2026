-- =========================================
-- QUICK FIX: Drop all policies and recreate them
-- Run this immediately in Supabase SQL Editor
-- =========================================

-- Step 1: Drop ALL existing payment_links policies
DROP POLICY IF EXISTS "Merchants can manage own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can insert their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can update their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can delete their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Payment links view policy" ON public.payment_links;
DROP POLICY IF EXISTS "Anyone can view active payment links" ON public.payment_links;

-- Step 2: Verify RLS is enabled
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- Step 3: Create INSERT policy
CREATE POLICY "Merchants can insert their own payment links"
ON public.payment_links
FOR INSERT
WITH CHECK (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Step 4: Create UPDATE policy
CREATE POLICY "Merchants can update their own payment links"
ON public.payment_links
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

-- Step 5: Create DELETE policy
CREATE POLICY "Merchants can delete their own payment links"
ON public.payment_links
FOR DELETE
USING (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Step 6: Create SELECT policy
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

-- Verification query - run this to confirm
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'payment_links' 
ORDER BY policyname;
