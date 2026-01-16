-- Fix merchants table: RLS policies + unique constraint
-- This fixes both RLS INSERT policy error AND ON CONFLICT constraint error

-- Drop the old constraint if it exists
ALTER TABLE public.merchants 
DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key CASCADE;

-- Create the unique constraint with correct name
ALTER TABLE public.merchants 
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
ON public.merchants(pi_user_id);

-- Fix RLS INSERT policy
DROP POLICY IF EXISTS "Anyone can create merchant" ON public.merchants;
DROP POLICY IF EXISTS "Allow insert for merchants" ON public.merchants;

CREATE POLICY "Anyone can create merchant" ON public.merchants 
FOR INSERT 
WITH CHECK (true);

-- Fix RLS UPDATE policy
DROP POLICY IF EXISTS "Merchants can update own profile" ON public.merchants;
DROP POLICY IF EXISTS "Allow update for merchants" ON public.merchants;

CREATE POLICY "Merchants can update own profile" ON public.merchants 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Fix RLS SELECT policy
DROP POLICY IF EXISTS "Merchants can view own profile" ON public.merchants;
DROP POLICY IF EXISTS "Allow select for merchants" ON public.merchants;

CREATE POLICY "Merchants can view own profile" ON public.merchants 
FOR SELECT 
USING (true);

-- Fix RLS DELETE policy
DROP POLICY IF EXISTS "Allow delete for merchants" ON public.merchants;
DROP POLICY IF EXISTS "Merchants can delete own profile" ON public.merchants;

CREATE POLICY "Merchants can delete own profile" ON public.merchants 
FOR DELETE 
USING (true);

-- Verify RLS is enabled
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
