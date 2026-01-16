-- Ensure merchants.pi_user_id can be used with ON CONFLICT/upsert
ALTER TABLE public.merchants
DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key CASCADE;

ALTER TABLE public.merchants
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
ON public.merchants(pi_user_id);
