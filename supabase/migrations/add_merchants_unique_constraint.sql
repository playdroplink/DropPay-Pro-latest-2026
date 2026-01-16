-- Add unique constraint on merchants.pi_user_id if it doesn't exist
-- This fixes the "there is no unique or exclusion constraint matching the ON CONFLICT specification" error

-- Drop the old constraint if it exists
ALTER TABLE public.merchants 
DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key CASCADE;

-- Create the unique constraint
ALTER TABLE public.merchants 
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
ON public.merchants(pi_user_id);
