-- Fix wallet top-up validation and enforce per-payment max limit
-- Requires wallet_topups table from 20260214112000_add_wallet_topup_credits.sql

BEGIN;

ALTER TABLE public.wallet_topups
DROP CONSTRAINT IF EXISTS wallet_topups_amount_check;

ALTER TABLE public.wallet_topups
ADD CONSTRAINT wallet_topups_amount_check CHECK (amount >= 1 AND amount <= 1000000);

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
  matched_tx public.transactions%ROWTYPE;
  normalized_username text;
BEGIN
  IF topup_amount IS NULL OR topup_amount < 1 THEN
    RAISE EXCEPTION 'Top up minimum is 1 Pi';
  END IF;

  IF topup_amount > 1000000 THEN
    RAISE EXCEPTION 'Top up maximum per payment is 1000000 Pi';
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

  SELECT *
  INTO matched_tx
  FROM public.transactions
  WHERE merchant_id = merchant_row.id
    AND pi_payment_id = payment_id
    AND txid = payment_txid
    AND status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No completed payment found for this top up';
  END IF;

  IF abs(coalesce(matched_tx.amount, 0) - topup_amount) > 0.0000001 THEN
    RAISE EXCEPTION 'Top up amount does not match completed payment';
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
  );

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
    'amount', topup_amount,
    'credits', topup_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.topup_wallet_credit(uuid, text, text, numeric, text, text) TO anon, authenticated, service_role;

COMMIT;
