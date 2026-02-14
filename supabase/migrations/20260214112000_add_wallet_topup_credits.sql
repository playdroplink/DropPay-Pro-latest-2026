-- Wallet top-up credits feature
-- 1 Pi = 1 Credit

BEGIN;

CREATE TABLE IF NOT EXISTS public.wallet_topups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  pi_username text NOT NULL,
  pi_user_id text NOT NULL,
  pi_payment_id text NOT NULL UNIQUE,
  txid text NOT NULL UNIQUE,
  amount numeric NOT NULL CHECK (amount >= 1),
  credits numeric NOT NULL CHECK (credits >= 1),
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_topups_merchant_created
  ON public.wallet_topups (merchant_id, created_at DESC);

ALTER TABLE public.wallet_topups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage wallet topups" ON public.wallet_topups;
CREATE POLICY "Service role can manage wallet topups"
ON public.wallet_topups
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.topup_wallet_credit(
  merchant_uuid uuid,
  pi_username_input text,
  pi_user_id_input text,
  topup_amount numeric,
  payment_id text,
  payment_txid text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  merchant_row public.merchants%ROWTYPE;
  existing_topup public.wallet_topups%ROWTYPE;
  normalized_username text;
  topup_id uuid;
BEGIN
  IF topup_amount IS NULL OR topup_amount < 1 THEN
    RAISE EXCEPTION 'Top up minimum is 1 Pi';
  END IF;

  IF coalesce(trim(payment_id), '') = '' OR coalesce(trim(payment_txid), '') = '' THEN
    RAISE EXCEPTION 'payment_id and txid are required';
  END IF;

  normalized_username := lower(trim(both '@' from coalesce(pi_username_input, '')));

  SELECT *
  INTO merchant_row
  FROM public.merchants
  WHERE id = merchant_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Merchant not found';
  END IF;

  IF lower(trim(both '@' from coalesce(merchant_row.pi_username, ''))) <> normalized_username THEN
    RAISE EXCEPTION 'Username mismatch';
  END IF;

  IF coalesce(merchant_row.pi_user_id, '') <> coalesce(pi_user_id_input, '') THEN
    RAISE EXCEPTION 'Pi user id mismatch';
  END IF;

  SELECT *
  INTO existing_topup
  FROM public.wallet_topups
  WHERE pi_payment_id = payment_id
     OR txid = payment_txid
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'idempotent', true,
      'topup_id', existing_topup.id,
      'amount', existing_topup.amount,
      'credits', existing_topup.credits
    );
  END IF;

  INSERT INTO public.wallet_topups (
    merchant_id,
    pi_username,
    pi_user_id,
    pi_payment_id,
    txid,
    amount,
    credits,
    status,
    created_at,
    completed_at
  )
  VALUES (
    merchant_row.id,
    merchant_row.pi_username,
    merchant_row.pi_user_id,
    payment_id,
    payment_txid,
    topup_amount,
    topup_amount,
    'completed',
    now(),
    now()
  )
  RETURNING id INTO topup_id;

  UPDATE public.merchants
  SET available_balance = coalesce(available_balance, 0) + topup_amount
  WHERE id = merchant_row.id;

  INSERT INTO public.notifications (merchant_id, title, message, type, is_read)
  VALUES (
    merchant_row.id,
    'Wallet Top Up Successful',
    format('Added %s credits to your wallet balance.', to_char(topup_amount, 'FM999999990.0000000')),
    'success',
    false
  );

  RETURN jsonb_build_object(
    'success', true,
    'idempotent', false,
    'topup_id', topup_id,
    'amount', topup_amount,
    'credits', topup_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.topup_wallet_credit(uuid, text, text, numeric, text, text) TO anon, authenticated, service_role;

COMMIT;
