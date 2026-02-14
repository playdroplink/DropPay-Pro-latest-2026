-- eWallet transfer feature (PayPal-style username send/receive)
-- Safe to run multiple times where possible.

BEGIN;

CREATE TABLE IF NOT EXISTS public.ewallet_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  receiver_merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  sender_pi_username text NOT NULL,
  receiver_pi_username text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  note text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ewallet_transfers_sender_created
  ON public.ewallet_transfers (sender_merchant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ewallet_transfers_receiver_created
  ON public.ewallet_transfers (receiver_merchant_id, created_at DESC);

ALTER TABLE public.ewallet_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage ewallet transfers" ON public.ewallet_transfers;
CREATE POLICY "Service role can manage ewallet transfers"
ON public.ewallet_transfers
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.transfer_ewallet_by_username(
  sender_merchant_uuid uuid,
  sender_pi_username_input text,
  sender_pi_user_id_input text,
  receiver_pi_username_input text,
  transfer_amount numeric,
  transfer_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_row public.merchants%ROWTYPE;
  receiver_row public.merchants%ROWTYPE;
  transfer_row_id uuid;
  normalized_sender_username text;
  normalized_receiver_username text;
BEGIN
  IF transfer_amount IS NULL OR transfer_amount <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be greater than zero';
  END IF;

  normalized_sender_username := lower(trim(both '@' from coalesce(sender_pi_username_input, '')));
  normalized_receiver_username := lower(trim(both '@' from coalesce(receiver_pi_username_input, '')));

  IF normalized_sender_username = '' OR normalized_receiver_username = '' THEN
    RAISE EXCEPTION 'Both sender and receiver usernames are required';
  END IF;

  IF normalized_sender_username = normalized_receiver_username THEN
    RAISE EXCEPTION 'Cannot transfer to your own username';
  END IF;

  SELECT *
  INTO sender_row
  FROM public.merchants
  WHERE id = sender_merchant_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sender merchant not found';
  END IF;

  IF lower(trim(both '@' from coalesce(sender_row.pi_username, ''))) <> normalized_sender_username THEN
    RAISE EXCEPTION 'Sender username does not match merchant account';
  END IF;

  IF coalesce(sender_row.pi_user_id, '') <> coalesce(sender_pi_user_id_input, '') THEN
    RAISE EXCEPTION 'Sender Pi user id does not match merchant account';
  END IF;

  SELECT *
  INTO receiver_row
  FROM public.merchants
  WHERE lower(trim(both '@' from coalesce(pi_username, ''))) = normalized_receiver_username
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Receiver username not found';
  END IF;

  IF coalesce(sender_row.available_balance, 0) < transfer_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.merchants
  SET available_balance = coalesce(available_balance, 0) - transfer_amount
  WHERE id = sender_row.id;

  UPDATE public.merchants
  SET available_balance = coalesce(available_balance, 0) + transfer_amount
  WHERE id = receiver_row.id;

  INSERT INTO public.ewallet_transfers (
    sender_merchant_id,
    receiver_merchant_id,
    sender_pi_username,
    receiver_pi_username,
    amount,
    note,
    status,
    created_at,
    completed_at
  )
  VALUES (
    sender_row.id,
    receiver_row.id,
    sender_row.pi_username,
    receiver_row.pi_username,
    transfer_amount,
    transfer_note,
    'completed',
    now(),
    now()
  )
  RETURNING id INTO transfer_row_id;

  INSERT INTO public.notifications (merchant_id, title, message, type, is_read)
  VALUES
    (
      sender_row.id,
      'Transfer Sent',
      format('You sent %s Pi to @%s', to_char(transfer_amount, 'FM999999990.0000000'), receiver_row.pi_username),
      'info',
      false
    ),
    (
      receiver_row.id,
      'Transfer Received',
      format('You received %s Pi from @%s', to_char(transfer_amount, 'FM999999990.0000000'), sender_row.pi_username),
      'success',
      false
    );

  RETURN jsonb_build_object(
    'success', true,
    'transfer_id', transfer_row_id,
    'sender_merchant_id', sender_row.id,
    'receiver_merchant_id', receiver_row.id,
    'receiver_pi_username', receiver_row.pi_username,
    'amount', transfer_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.transfer_ewallet_by_username(uuid, text, text, text, numeric, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_ewallet_transfers_for_merchant(
  merchant_uuid uuid,
  pi_username_input text,
  pi_user_id_input text,
  limit_rows integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  sender_merchant_id uuid,
  receiver_merchant_id uuid,
  sender_pi_username text,
  receiver_pi_username text,
  amount numeric,
  note text,
  status text,
  created_at timestamptz,
  completed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  merchant_row public.merchants%ROWTYPE;
  normalized_username text;
BEGIN
  normalized_username := lower(trim(both '@' from coalesce(pi_username_input, '')));

  SELECT *
  INTO merchant_row
  FROM public.merchants
  WHERE id = merchant_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Merchant not found';
  END IF;

  IF lower(trim(both '@' from coalesce(merchant_row.pi_username, ''))) <> normalized_username THEN
    RAISE EXCEPTION 'Username mismatch';
  END IF;

  IF coalesce(merchant_row.pi_user_id, '') <> coalesce(pi_user_id_input, '') THEN
    RAISE EXCEPTION 'Pi user id mismatch';
  END IF;

  RETURN QUERY
  SELECT
    t.id,
    t.sender_merchant_id,
    t.receiver_merchant_id,
    t.sender_pi_username,
    t.receiver_pi_username,
    t.amount,
    t.note,
    t.status,
    t.created_at,
    t.completed_at
  FROM public.ewallet_transfers t
  WHERE t.sender_merchant_id = merchant_uuid OR t.receiver_merchant_id = merchant_uuid
  ORDER BY t.created_at DESC
  LIMIT GREATEST(1, LEAST(limit_rows, 200));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ewallet_transfers_for_merchant(uuid, text, text, integer) TO anon, authenticated, service_role;

COMMIT;
