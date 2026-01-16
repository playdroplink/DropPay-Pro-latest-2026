-- ============================================
-- FIX: Checkout Links RLS Issue
-- ============================================
-- Problem: checkout_links table has RLS enabled with auth.uid() checks
-- but the app uses Pi Network authentication, not Supabase Auth
-- Solution: Disable RLS like other tables (payment_links, merchants, etc.)
-- ============================================

-- Step 1: Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can insert their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can update their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can delete their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Anyone can view checkout link by slug" ON public.checkout_links;

-- Step 2: Disable RLS on checkout_links table
ALTER TABLE public.checkout_links DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify the change
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'checkout_links' AND schemaname = 'public';

-- Expected result: rowsecurity should be 'false' or 'f'
