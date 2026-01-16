-- ========================================
-- CREATE TRANSACTION NOTIFICATION TRIGGER
-- This trigger automatically creates a notification
-- whenever a new transaction is created
-- ========================================

-- 1. Create or replace the trigger function
CREATE OR REPLACE FUNCTION create_transaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  payer_name TEXT;
  merchant_business_name TEXT;
BEGIN
  -- Get payer username if available
  payer_name := COALESCE(NEW.payer_pi_username, 'a buyer');
  
  -- Try to get merchant business name
  SELECT business_name INTO merchant_business_name
  FROM merchants
  WHERE id = NEW.merchant_id
  LIMIT 1;
  
  -- Insert notification for the merchant
  INSERT INTO notifications (
    merchant_id,
    title,
    message,
    type,
    related_type,
    related_id,
    is_read,
    created_at
  ) VALUES (
    NEW.merchant_id,
    '💰 Payment Received!',
    'You received ' || NEW.amount || ' PI from ' || payer_name,
    'success',
    'transaction',
    NEW.id,
    FALSE,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS transaction_notification_trigger ON transactions;

-- 3. Create the trigger
CREATE TRIGGER transaction_notification_trigger
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION create_transaction_notification();

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this to verify the trigger is active:
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_name = 'transaction_notification_trigger';

-- ========================================
-- TEST QUERY
-- Run this to test the notification system:
-- INSERT INTO transactions (merchant_id, pi_payment_id, amount, status, txid)
-- VALUES ('test-merchant-id', 'test-payment-123', 10.5, 'completed', 'test-tx-456')
-- RETURNING id;
-- Then check the notifications table for a new entry

-- ========================================
-- TROUBLESHOOTING
-- ========================================
-- If the trigger doesn't work:
-- 1. Check if the notifications table exists:
--    SELECT * FROM information_schema.tables WHERE table_name='notifications';
-- 2. Check trigger logs:
--    SELECT * FROM pg_stat_user_functions WHERE funcname = 'create_transaction_notification';
-- 3. Manually test a transaction insert and check if notification was created
