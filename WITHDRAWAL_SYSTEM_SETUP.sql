-- =========================================
-- WITHDRAWAL SYSTEM COMPLETE SETUP
-- =========================================
-- This SQL handles:
-- 1. Withdrawal table structure & status
-- 2. Admin withdrawal approval system
-- 3. Platform fees calculation
-- 4. Balance tracking
-- 5. Transaction management
-- =========================================

-- ====== STEP 1: ENSURE WITHDRAWAL TABLE STRUCTURE ======

-- Add missing columns to withdrawals if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawals' 
        AND column_name = 'withdrawal_type'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN withdrawal_type VARCHAR DEFAULT 'manual';
        RAISE NOTICE '✓ Added withdrawal_type column';
    ELSE
        RAISE NOTICE '✓ withdrawal_type column already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawals' 
        AND column_name = 'pi_username'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN pi_username VARCHAR;
        RAISE NOTICE '✓ Added pi_username column';
    ELSE
        RAISE NOTICE '✓ pi_username column already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawals' 
        AND column_name = 'wallet_address'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN wallet_address VARCHAR;
        RAISE NOTICE '✓ Added wallet_address column';
    ELSE
        RAISE NOTICE '✓ wallet_address column already exists';
    END IF;
END $$;

-- ====== STEP 2: ENSURE PLATFORM_FEES TABLE STRUCTURE ======

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'platform_fees' 
        AND column_name = 'fee_type'
    ) THEN
        ALTER TABLE platform_fees ADD COLUMN fee_type VARCHAR DEFAULT 'general';
        RAISE NOTICE '✓ Added fee_type column to platform_fees';
    ELSE
        RAISE NOTICE '✓ fee_type column already exists in platform_fees';
    END IF;
END $$;

-- ====== STEP 3: CREATE WITHDRAWAL APPROVAL FUNCTION ======

CREATE OR REPLACE FUNCTION approve_withdrawal(
    withdrawal_id UUID,
    transaction_id VARCHAR DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    w RECORD;
    m RECORD;
    fee_amount NUMERIC;
    net_amount NUMERIC;
    result JSON;
BEGIN
    -- Get withdrawal details
    SELECT * INTO w FROM withdrawals WHERE id = withdrawal_id;
    IF w IS NULL THEN
        RETURN json_build_object('error', 'Withdrawal not found', 'success', FALSE);
    END IF;

    -- Get merchant details
    SELECT * INTO m FROM merchants WHERE id = w.merchant_id;
    IF m IS NULL THEN
        RETURN json_build_object('error', 'Merchant not found', 'success', FALSE);
    END IF;

    -- Calculate 2% platform fee
    fee_amount := w.amount * 0.02;
    net_amount := w.amount - fee_amount;

    -- Update withdrawal status
    UPDATE withdrawals 
    SET 
        status = 'approved',
        txid = COALESCE(transaction_id, txid),
        completed_at = NOW()
    WHERE id = withdrawal_id;

    -- Record platform fee
    INSERT INTO platform_fees (merchant_id, amount, fee_type, status, created_at)
    VALUES (w.merchant_id, fee_amount, 'withdrawal', 'completed', NOW())
    ON CONFLICT DO NOTHING;

    -- Update merchant balance (deduct withdrawal from available)
    UPDATE merchants 
    SET 
        available_balance = GREATEST(0, available_balance - w.amount),
        total_withdrawn = total_withdrawn + net_amount
    WHERE id = w.merchant_id;

    result := json_build_object(
        'success', TRUE,
        'withdrawal_id', withdrawal_id,
        'amount', w.amount,
        'fee', fee_amount,
        'net_amount', net_amount,
        'status', 'approved',
        'message', 'Withdrawal approved successfully'
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====== STEP 4: CREATE WITHDRAWAL REJECTION FUNCTION ======

CREATE OR REPLACE FUNCTION reject_withdrawal(
    withdrawal_id UUID,
    reason VARCHAR DEFAULT 'Rejected by admin'
)
RETURNS JSON AS $$
DECLARE
    w RECORD;
    m RECORD;
    result JSON;
BEGIN
    -- Get withdrawal details
    SELECT * INTO w FROM withdrawals WHERE id = withdrawal_id;
    IF w IS NULL THEN
        RETURN json_build_object('error', 'Withdrawal not found', 'success', FALSE);
    END IF;

    -- Get merchant details
    SELECT * INTO m FROM merchants WHERE id = w.merchant_id;
    IF m IS NULL THEN
        RETURN json_build_object('error', 'Merchant not found', 'success', FALSE);
    END IF;

    -- Update withdrawal status to rejected
    UPDATE withdrawals 
    SET 
        status = 'rejected',
        completed_at = NOW()
    WHERE id = withdrawal_id;

    -- Restore funds to available balance
    UPDATE merchants 
    SET available_balance = available_balance + w.amount
    WHERE id = w.merchant_id;

    result := json_build_object(
        'success', TRUE,
        'withdrawal_id', withdrawal_id,
        'amount', w.amount,
        'status', 'rejected',
        'reason', reason,
        'message', 'Withdrawal rejected and funds restored'
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====== STEP 5: CREATE WITHDRAWAL REQUEST FUNCTION ======

CREATE OR REPLACE FUNCTION request_withdrawal(
    merchant_id UUID,
    amount NUMERIC,
    wallet_address VARCHAR DEFAULT NULL,
    pi_username VARCHAR DEFAULT NULL,
    withdrawal_type VARCHAR DEFAULT 'manual'
)
RETURNS JSON AS $$
DECLARE
    m RECORD;
    new_withdrawal_id UUID;
    available NUMERIC;
    result JSON;
BEGIN
    -- Get merchant and check balance
    SELECT * INTO m FROM merchants WHERE id = merchant_id;
    IF m IS NULL THEN
        RETURN json_build_object('error', 'Merchant not found', 'success', FALSE);
    END IF;

    available := COALESCE(m.available_balance, 0);

    -- Validate amount
    IF amount <= 0 THEN
        RETURN json_build_object('error', 'Amount must be greater than 0', 'success', FALSE);
    END IF;

    IF amount > available THEN
        RETURN json_build_object(
            'error', 'Insufficient balance',
            'available', available,
            'requested', amount,
            'success', FALSE
        );
    END IF;

    -- Create withdrawal request
    INSERT INTO withdrawals (
        merchant_id,
        amount,
        status,
        wallet_address,
        pi_username,
        withdrawal_type,
        created_at
    ) VALUES (
        merchant_id,
        amount,
        'pending',
        wallet_address,
        pi_username,
        withdrawal_type,
        NOW()
    )
    RETURNING id INTO new_withdrawal_id;

    -- Deduct from available balance (reserved for withdrawal)
    UPDATE merchants 
    SET available_balance = available_balance - amount
    WHERE id = merchant_id;

    result := json_build_object(
        'success', TRUE,
        'withdrawal_id', new_withdrawal_id,
        'amount', amount,
        'status', 'pending',
        'message', 'Withdrawal request created successfully',
        'new_available_balance', available - amount
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====== STEP 6: CREATE ADMIN STATS VIEW ======

CREATE OR REPLACE VIEW admin_withdrawal_stats AS
SELECT 
    (SELECT COUNT(*) FROM withdrawals WHERE status = 'pending') as pending_count,
    (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE status = 'pending') as pending_amount,
    (SELECT COUNT(*) FROM withdrawals WHERE status = 'approved' OR status = 'completed') as approved_count,
    (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE status = 'approved' OR status = 'completed') as approved_amount,
    (SELECT COUNT(*) FROM platform_fees WHERE fee_type = 'withdrawal' AND status = 'completed') as total_fees_count,
    (SELECT COALESCE(SUM(amount), 0) FROM platform_fees WHERE fee_type = 'withdrawal' AND status = 'completed') as total_fees_amount;

-- ====== STEP 7: CREATE WITHDRAWAL TRACKING FUNCTION ======

CREATE OR REPLACE FUNCTION get_withdrawal_status(withdrawal_id UUID)
RETURNS JSON AS $$
DECLARE
    w RECORD;
    result JSON;
BEGIN
    SELECT * INTO w FROM withdrawals WHERE id = withdrawal_id;
    IF w IS NULL THEN
        RETURN json_build_object('error', 'Withdrawal not found', 'success', FALSE);
    END IF;

    result := json_build_object(
        'success', TRUE,
        'id', w.id,
        'amount', w.amount,
        'status', w.status,
        'created_at', w.created_at,
        'completed_at', w.completed_at,
        'wallet_address', w.wallet_address,
        'pi_username', w.pi_username,
        'withdrawal_type', COALESCE(w.withdrawal_type, 'manual'),
        'txid', w.txid
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====== STEP 8: CREATE INDEXES FOR PERFORMANCE ======

CREATE INDEX IF NOT EXISTS idx_withdrawals_merchant_status ON withdrawals(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status_date ON withdrawals(status, created_at);
CREATE INDEX IF NOT EXISTS idx_platform_fees_type_status ON platform_fees(fee_type, status);
CREATE INDEX IF NOT EXISTS idx_platform_fees_merchant ON platform_fees(merchant_id);

-- ====== STEP 9: VERIFY EXISTING DATA ======

-- Count current withdrawals by status
SELECT 
    status,
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total_amount
FROM withdrawals
GROUP BY status
ORDER BY status;

-- Show withdrawal stats
SELECT * FROM admin_withdrawal_stats;

-- Show merchants with pending withdrawals
SELECT 
    m.id,
    m.pi_username,
    m.business_name,
    m.available_balance,
    m.total_withdrawn,
    COUNT(w.id) as pending_withdrawals,
    COALESCE(SUM(w.amount), 0) as pending_amount
FROM merchants m
LEFT JOIN withdrawals w ON m.id = w.merchant_id AND w.status = 'pending'
GROUP BY m.id, m.pi_username, m.business_name, m.available_balance, m.total_withdrawn
HAVING COUNT(w.id) > 0
ORDER BY pending_amount DESC;

-- =========================================
-- SUMMARY OF WITHDRAWAL SYSTEM
-- =========================================
-- ✓ Withdrawal table structure verified
-- ✓ Platform fees table structure verified
-- ✓ Approval function created (approve_withdrawal)
-- ✓ Rejection function created (reject_withdrawal)
-- ✓ Request function created (request_withdrawal)
-- ✓ Status tracking function created (get_withdrawal_status)
-- ✓ Admin stats view created
-- ✓ Performance indexes created
--
-- WITHDRAWAL FLOW:
-- 1. User calls request_withdrawal() with amount
-- 2. System deducts from available_balance (reserves funds)
-- 3. Admin reviews pending withdrawals
-- 4. Admin calls approve_withdrawal() with transaction ID
-- 5. System calculates 2% fee, updates balances
-- 6. Or admin calls reject_withdrawal() to refund
--
-- USAGE EXAMPLES:
-- SELECT approve_withdrawal('withdrawal-uuid', 'pi-tx-id');
-- SELECT reject_withdrawal('withdrawal-uuid', 'Insufficient docs');
-- SELECT request_withdrawal(merchant_id, 100, null, '@Wain2020', 'manual');
-- =========================================
