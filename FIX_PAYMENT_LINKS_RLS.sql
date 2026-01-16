-- =========================================
-- FIX: RLS Policies for Payment Links
-- Issues Fixed:
-- 1. "new row violates row-level security policy for table 'payment_links'" - Checkout link creation
-- 2. "Failed to create subscription link" - Subscription link creation
-- =========================================

-- Step 1: Drop ALL existing policies to ensure clean state
DROP POLICY IF EXISTS "Merchants can manage own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can insert their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can update their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can delete their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Payment links view policy" ON public.payment_links;
DROP POLICY IF EXISTS "Anyone can view active payment links" ON public.payment_links;

-- Step 2: Enable RLS on payment_links if not already enabled
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- Step 3: Create proper INSERT policy that allows merchants to insert
-- This checks that the merchant_id matches the authenticated user's merchant ID
CREATE POLICY "Merchants can insert their own payment links"
ON public.payment_links
FOR INSERT
WITH CHECK (
    -- Allow if merchant_id belongs to current user
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Step 4: Create proper UPDATE policy
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

-- Step 5: Create proper DELETE policy
CREATE POLICY "Merchants can delete their own payment links"
ON public.payment_links
FOR DELETE
USING (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Step 6: Keep the SELECT policy for public access to active links
CREATE POLICY "Payment links view policy"
ON public.payment_links
FOR SELECT
USING (is_active = true OR (
    -- Or merchants can view their own
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
));

-- Step 7: Ensure merchants table has proper RLS policies
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- Drop old overly permissive policies
DROP POLICY IF EXISTS "Merchants can insert own merchant info" ON public.merchants;
DROP POLICY IF EXISTS "Users can insert their own merchant profile" ON public.merchants;
DROP POLICY IF EXISTS "Merchants can update own profile" ON public.merchants;

-- Create proper INSERT policy for merchants
CREATE POLICY "Users can insert their own merchant profile"
ON public.merchants
FOR INSERT
WITH CHECK (
    pi_user_id = (auth.uid())::text
);

-- Create proper UPDATE policy for merchants
CREATE POLICY "Merchants can update own profile"
ON public.merchants
FOR UPDATE
USING (
    pi_user_id = (auth.uid())::text
)
WITH CHECK (
    pi_user_id = (auth.uid())::text
);

-- Step 8: Verify the fix with a test view
DO $$ 
DECLARE
    v_policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE tablename = 'payment_links'
    AND policyname LIKE '%insert%';
    
    RAISE NOTICE '✓ Payment links INSERT policies: %', v_policy_count;
END $$;
