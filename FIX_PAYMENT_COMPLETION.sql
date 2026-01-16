-- =========================================
-- COMPLETE FIX: Payment Completion Issues
-- Fixes: "Payment Failed" error on successful Pi payment
-- =========================================

-- The issue: complete-payment edge function can't read/update checkout_links due to RLS
-- Solution: Fix checkout_links RLS policies to work correctly

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES FIRST
-- ============================================

-- Drop ALL checkout_links policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own checkout links" ON public.checkout_links;
    DROP POLICY IF EXISTS "Users can insert their own checkout links" ON public.checkout_links;
    DROP POLICY IF EXISTS "Users can update their own checkout links" ON public.checkout_links;
    DROP POLICY IF EXISTS "Users can delete their own checkout links" ON public.checkout_links;
    DROP POLICY IF EXISTS "Anyone can view checkout link by slug" ON public.checkout_links;
    DROP POLICY IF EXISTS "Merchants can manage their checkout links" ON public.checkout_links;
    DROP POLICY IF EXISTS "Anyone can view active checkout links" ON public.checkout_links;
    DROP POLICY IF EXISTS "Merchants can insert their own checkout links" ON public.checkout_links;
    DROP POLICY IF EXISTS "Merchants can update their own checkout links" ON public.checkout_links;
    DROP POLICY IF EXISTS "Merchants can delete their own checkout links" ON public.checkout_links;
    
    RAISE NOTICE '✓ Dropped checkout_links policies';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop some checkout_links policies (may not exist)';
END $$;

-- Drop ALL user_subscriptions policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Merchants can manage own subscriptions" ON public.user_subscriptions;
    DROP POLICY IF EXISTS "Users can view subscriptions" ON public.user_subscriptions;
    DROP POLICY IF EXISTS "Anyone can view active subscriptions" ON public.user_subscriptions;
    DROP POLICY IF EXISTS "Service can manage subscriptions" ON public.user_subscriptions;
    DROP POLICY IF EXISTS "Service can update subscriptions" ON public.user_subscriptions;
    DROP POLICY IF EXISTS "Anyone can view subscriptions" ON public.user_subscriptions;
    
    RAISE NOTICE '✓ Dropped user_subscriptions policies';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop some user_subscriptions policies (may not exist)';
END $$;

-- ============================================
-- STEP 2: ENABLE RLS ON TABLES
-- ============================================

ALTER TABLE public.checkout_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE CHECKOUT_LINKS POLICIES
-- ============================================

-- Create proper SELECT policy - allow viewing active links publicly (for payment page)
CREATE POLICY "Anyone can view active checkout links"
ON public.checkout_links
FOR SELECT
USING (is_active = true);

-- Step 4: Create INSERT policy for merchants
CREATE POLICY "Merchants can insert their own checkout links"
ON public.checkout_links
FOR INSERT
WITH CHECK (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Step 5: Create UPDATE policy for merchants
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

-- Step 6: Create DELETE policy for merchants
CREATE POLICY "Merchants can delete their own checkout links"
ON public.checkout_links
FOR DELETE
USING (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- ============================================
-- STEP 4: CREATE USER_SUBSCRIPTIONS POLICIES
-- ============================================

CREATE POLICY "Anyone can view active subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (status = 'active');

CREATE POLICY "Service can manage subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING (true);

-- ============================================
-- STEP 5: VERIFY THE FIX
-- ============================================

DO $$
DECLARE
    v_payment_links_count INTEGER;
    v_checkout_links_count INTEGER;
    v_transactions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_payment_links_count
    FROM pg_policies
    WHERE tablename = 'payment_links';
    
    SELECT COUNT(*) INTO v_checkout_links_count
    FROM pg_policies
    WHERE tablename = 'checkout_links';
    
    SELECT COUNT(*) INTO v_transactions_count
    FROM pg_policies
    WHERE tablename = 'transactions';
    
    RAISE NOTICE '✓ Payment links policies: %', v_payment_links_count;
    RAISE NOTICE '✓ Checkout links policies: %', v_checkout_links_count;
    RAISE NOTICE '✓ Transactions policies: %', v_transactions_count;
END $$;
