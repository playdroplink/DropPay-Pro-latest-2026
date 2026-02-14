-- Revenue <-> Wallet pool transfer
-- Wallet balance uses merchants.available_balance
-- Revenue pool uses merchants.revenue_balance

BEGIN;

ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS revenue_balance numeric NOT NULL DEFAULT 0;

-- Initial migration strategy:
-- Existing available balance is treated as revenue pool so merchants can allocate to wallet explicitly.
UPDATE public.merchants
SET revenue_balance = COALESCE(available_balance, 0)
WHERE COALESCE(revenue_balance, 0) = 0
  AND COALESCE(available_balance, 0) > 0;

-- New completed sales credit revenue pool (not wallet pool directly).
CREATE OR REPLACE FUNCTION public.update_merchant_balance_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE merchants
    SET revenue_balance = COALESCE(revenue_balance, 0) + NEW.amount
    WHERE id = NEW.merchant_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_revenue_wallet_balance(
  merchant_uuid uuid,
  pi_username_input text,
  pi_user_id_input text,
  move_amount numeric,
  move_direction text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  merchant_row public.merchants%ROWTYPE;
  normalized_username text;
BEGIN
  IF move_amount IS NULL OR move_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  IF move_direction NOT IN ('revenue_to_wallet', 'wallet_to_revenue') THEN
    RAISE EXCEPTION 'Invalid move direction';
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

  IF move_direction = 'revenue_to_wallet' THEN
    IF coalesce(merchant_row.revenue_balance, 0) < move_amount THEN
      RAISE EXCEPTION 'Insufficient revenue balance';
    END IF;

    UPDATE public.merchants
    SET revenue_balance = coalesce(revenue_balance, 0) - move_amount,
        available_balance = coalesce(available_balance, 0) + move_amount
    WHERE id = merchant_row.id;

    INSERT INTO public.notifications (merchant_id, title, message, type, is_read)
    VALUES (
      merchant_row.id,
      'Revenue moved to Wallet',
      format('Moved %s Pi from Revenue to Wallet.', to_char(move_amount, 'FM999999990.0000000')),
      'success',
      false
    );
  ELSE
    IF coalesce(merchant_row.available_balance, 0) < move_amount THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    UPDATE public.merchants
    SET available_balance = coalesce(available_balance, 0) - move_amount,
        revenue_balance = coalesce(revenue_balance, 0) + move_amount
    WHERE id = merchant_row.id;

    INSERT INTO public.notifications (merchant_id, title, message, type, is_read)
    VALUES (
      merchant_row.id,
      'Wallet moved to Revenue',
      format('Moved %s Pi from Wallet to Revenue.', to_char(move_amount, 'FM999999990.0000000')),
      'info',
      false
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'direction', move_direction,
    'amount', move_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.move_revenue_wallet_balance(uuid, text, text, numeric, text) TO anon, authenticated, service_role;

COMMIT;
