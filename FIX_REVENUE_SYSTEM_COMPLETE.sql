-- =========================================
-- COMPLETE REVENUE SYSTEM FIX
-- =========================================
-- This SQL ensures accurate revenue tracking across:
-- 1. Merchant balance calculations (deducting platform fees)
-- 2. Platform fee collection 
-- 3. Withdrawal system accuracy
-- 4. Admin revenue tracking
-- =========================================

-- ====== STEP 1: UPDATE MERCHANT BALANCE CALCULATION FUNCTION ======

CREATE OR REPLACE FUNCTION public.update_merchant_balance_on_payment() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    platform_fee NUMERIC := 0;
    merchant_amount NUMERIC := 0;
    payment_link RECORD;
BEGIN
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        -- Get payment link details to determine fee structure
        SELECT pricing_type INTO payment_link
        FROM payment_links 
        WHERE id = NEW.payment_link_id;
        
        -- Calculate platform fee based on payment type
        IF payment_link.pricing_type = 'donation' THEN
            -- For donations: 2% platform fee 
            platform_fee := NEW.amount * 0.02;
            merchant_amount := NEW.amount - platform_fee;
        ELSE
            -- For paid links: Amount already includes platform fee, so merchant gets full amount
            -- Platform fee is handled separately during payment creation
            merchant_amount := NEW.amount;
            platform_fee := 0; -- Already included in payment amount
        END IF;
        
        -- Update merchant available balance with net amount
        UPDATE merchants
        SET available_balance = COALESCE(available_balance, 0) + merchant_amount,
            total_revenue = COALESCE(total_revenue, 0) + NEW.amount
        WHERE id = NEW.merchant_id;
        
        -- Record platform fee if applicable
        IF platform_fee > 0 THEN
            INSERT INTO platform_fees (
                merchant_id,
                payment_link_id,
                transaction_id,
                amount,
                fee_type,
                status
            ) VALUES (
                NEW.merchant_id,
                NEW.payment_link_id,
                NEW.id,
                platform_fee,
                'payment',
                'completed'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- ====== STEP 2: ENSURE MERCHANTS TABLE STRUCTURE ======

-- Add missing columns to merchants table
DO $$ 
BEGIN
    -- Check for total_revenue column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'total_revenue'
    ) THEN
        ALTER TABLE merchants ADD COLUMN total_revenue NUMERIC DEFAULT 0;
        RAISE NOTICE '✓ Added total_revenue column to merchants';
    ELSE
        RAISE NOTICE '✓ total_revenue column already exists in merchants';
    END IF;
    
    -- Check for total_withdrawn column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'total_withdrawn'
    ) THEN
        ALTER TABLE merchants ADD COLUMN total_withdrawn NUMERIC DEFAULT 0;
        RAISE NOTICE '✓ Added total_withdrawn column to merchants';
    ELSE
        RAISE NOTICE '✓ total_withdrawn column already exists in merchants';
    END IF;
    
    -- Check for available_balance column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'available_balance'
    ) THEN
        ALTER TABLE merchants ADD COLUMN available_balance NUMERIC DEFAULT 0;
        RAISE NOTICE '✓ Added available_balance column to merchants';
    ELSE
        RAISE NOTICE '✓ available_balance column already exists in merchants';
    END IF;
END $$;

-- ====== STEP 3: ENSURE PLATFORM FEES TABLE STRUCTURE ======

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Check for fee_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'platform_fees' 
        AND column_name = 'fee_type'
    ) THEN
        ALTER TABLE platform_fees ADD COLUMN fee_type VARCHAR DEFAULT 'payment';
        RAISE NOTICE '✓ Added fee_type column to platform_fees';
    ELSE
        RAISE NOTICE '✓ fee_type column already exists in platform_fees';
    END IF;
    
    -- Check for transaction_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'platform_fees' 
        AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE platform_fees ADD COLUMN transaction_id UUID;
        RAISE NOTICE '✓ Added transaction_id column to platform_fees';
    ELSE
        RAISE NOTICE '✓ transaction_id column already exists in platform_fees';
    END IF;
    
    -- Check for status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'platform_fees' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE platform_fees ADD COLUMN status VARCHAR DEFAULT 'completed';
        RAISE NOTICE '✓ Added status column to platform_fees';
    ELSE
        RAISE NOTICE '✓ status column already exists in platform_fees';
    END IF;
END $$;

-- ====== STEP 4: CREATE ACCURATE REVENUE CALCULATION FUNCTION ======

CREATE OR REPLACE FUNCTION get_merchant_accurate_balance(merchant_uuid UUID)
RETURNS TABLE (
    available_balance NUMERIC,
    total_revenue NUMERIC,
    total_fees_paid NUMERIC,
    total_withdrawn NUMERIC,
    pending_withdrawals NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(m.available_balance, 0) as available_balance,
        COALESCE(m.total_revenue, 0) as total_revenue,
        COALESCE(
            (SELECT SUM(pf.amount) 
             FROM platform_fees pf 
             WHERE pf.merchant_id = m.id 
             AND pf.status = 'completed'), 0
        ) as total_fees_paid,
        COALESCE(m.total_withdrawn, 0) as total_withdrawn,
        COALESCE(
            (SELECT SUM(w.amount) 
             FROM withdrawals w 
             WHERE w.merchant_id = m.id 
             AND w.status = 'pending'), 0
        ) as pending_withdrawals
    FROM merchants m
    WHERE m.id = merchant_uuid;
END;
$$ LANGUAGE plpgsql;

-- ====== STEP 5: CREATE ADMIN REVENUE STATS FUNCTION ======

CREATE OR REPLACE FUNCTION get_admin_revenue_stats()
RETURNS TABLE (
    total_transactions INTEGER,
    total_gross_revenue NUMERIC,
    total_platform_fees NUMERIC,
    total_merchant_payouts NUMERIC,
    pending_withdrawals_count INTEGER,
    pending_withdrawals_amount NUMERIC,
    completed_withdrawals_count INTEGER,
    completed_withdrawals_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Total completed transactions
        (SELECT COUNT(*)::INTEGER 
         FROM transactions 
         WHERE status = 'completed') as total_transactions,
        
        -- Total gross revenue (all completed payments)
        COALESCE(
            (SELECT SUM(amount) 
             FROM transactions 
             WHERE status = 'completed'), 0
        ) as total_gross_revenue,
        
        -- Total platform fees collected
        COALESCE(
            (SELECT SUM(amount) 
             FROM platform_fees 
             WHERE status = 'completed'), 0
        ) as total_platform_fees,
        
        -- Total merchant payouts (completed withdrawals net amount)
        COALESCE(
            (SELECT SUM(amount * 0.98) -- 98% after 2% withdrawal fee
             FROM withdrawals 
             WHERE status = 'completed'), 0
        ) as total_merchant_payouts,
        
        -- Pending withdrawals
        (SELECT COUNT(*)::INTEGER 
         FROM withdrawals 
         WHERE status = 'pending') as pending_withdrawals_count,
        
        COALESCE(
            (SELECT SUM(amount) 
             FROM withdrawals 
             WHERE status = 'pending'), 0
        ) as pending_withdrawals_amount,
        
        -- Completed withdrawals
        (SELECT COUNT(*)::INTEGER 
         FROM withdrawals 
         WHERE status = 'completed') as completed_withdrawals_count,
        
        COALESCE(
            (SELECT SUM(amount) 
             FROM withdrawals 
             WHERE status = 'completed'), 0
        ) as completed_withdrawals_amount;
END;
$$ LANGUAGE plpgsql;

-- ====== STEP 6: FIX EXISTING MERCHANT BALANCES (RECALCULATE) ======

-- WARNING: This will recalculate all merchant balances from scratch
-- based on their completed transactions
DO $$
DECLARE
    merchant_record RECORD;
    total_earned NUMERIC;
    total_fees NUMERIC;
    total_withdrawn NUMERIC;
    net_balance NUMERIC;
BEGIN
    FOR merchant_record IN SELECT id FROM merchants LOOP
        -- Calculate total earned from completed transactions
        SELECT COALESCE(SUM(amount), 0) INTO total_earned
        FROM transactions 
        WHERE merchant_id = merchant_record.id 
        AND status = 'completed';
        
        -- Calculate total platform fees paid
        SELECT COALESCE(SUM(amount), 0) INTO total_fees
        FROM platform_fees 
        WHERE merchant_id = merchant_record.id 
        AND status = 'completed';
        
        -- Calculate total withdrawn (completed withdrawals)
        SELECT COALESCE(SUM(amount), 0) INTO total_withdrawn
        FROM withdrawals 
        WHERE merchant_id = merchant_record.id 
        AND status = 'completed';
        
        -- Net available balance = earned - fees paid - withdrawn
        net_balance := total_earned - total_fees - total_withdrawn;
        
        -- Update merchant record
        UPDATE merchants 
        SET 
            available_balance = GREATEST(net_balance, 0),  -- Never negative
            total_revenue = total_earned,
            total_withdrawn = total_withdrawn
        WHERE id = merchant_record.id;
        
        RAISE NOTICE 'Updated merchant %: earned=%, fees=%, withdrawn=%, balance=%', 
                     merchant_record.id, total_earned, total_fees, total_withdrawn, GREATEST(net_balance, 0);
    END LOOP;
END $$;

-- ====== STEP 7: CREATE INDEXES FOR PERFORMANCE ======

CREATE INDEX IF NOT EXISTS idx_platform_fees_merchant_type ON platform_fees(merchant_id, fee_type);
CREATE INDEX IF NOT EXISTS idx_platform_fees_transaction ON platform_fees(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_status ON transactions(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_merchant_status ON withdrawals(merchant_id, status);

-- ====== STEP 8: CREATE REVENUE AUDIT VIEW ======

CREATE OR REPLACE VIEW revenue_audit AS
SELECT 
    m.pi_username,
    m.business_name,
    -- Current balances
    m.available_balance,
    m.total_revenue,
    m.total_withdrawn,
    
    -- Calculated totals
    COALESCE(tx_stats.total_transactions, 0) as calculated_transactions,
    COALESCE(tx_stats.total_earned, 0) as calculated_earned,
    COALESCE(fee_stats.total_fees_paid, 0) as calculated_fees_paid,
    COALESCE(wd_stats.total_withdrawn_completed, 0) as calculated_withdrawn,
    COALESCE(wd_stats.pending_withdrawals, 0) as pending_withdrawals,
    
    -- Balance verification
    (m.available_balance = 
     COALESCE(tx_stats.total_earned, 0) - 
     COALESCE(fee_stats.total_fees_paid, 0) - 
     COALESCE(wd_stats.total_withdrawn_completed, 0)
    ) as balance_accurate
    
FROM merchants m

LEFT JOIN (
    SELECT 
        merchant_id,
        COUNT(*) as total_transactions,
        SUM(amount) as total_earned
    FROM transactions 
    WHERE status = 'completed'
    GROUP BY merchant_id
) tx_stats ON m.id = tx_stats.merchant_id

LEFT JOIN (
    SELECT 
        merchant_id,
        SUM(amount) as total_fees_paid
    FROM platform_fees 
    WHERE status = 'completed'
    GROUP BY merchant_id
) fee_stats ON m.id = fee_stats.merchant_id

LEFT JOIN (
    SELECT 
        merchant_id,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_withdrawn_completed,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_withdrawals
    FROM withdrawals 
    GROUP BY merchant_id
) wd_stats ON m.id = wd_stats.merchant_id

ORDER BY m.created_at DESC;

-- ====== STEP 9: VERIFICATION QUERIES ======

-- Show current revenue audit
SELECT 
    pi_username,
    available_balance,
    total_revenue,
    calculated_earned,
    calculated_fees_paid,
    calculated_withdrawn,
    balance_accurate
FROM revenue_audit
WHERE total_revenue > 0 OR available_balance > 0
ORDER BY total_revenue DESC;

-- Show admin revenue stats
SELECT * FROM get_admin_revenue_stats();

-- Show platform fee summary
SELECT 
    fee_type,
    status,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM platform_fees
GROUP BY fee_type, status
ORDER BY fee_type, status;

-- =========================================
-- COMPLETION SUMMARY
-- =========================================
-- ✓ Fixed merchant balance calculation (deducts platform fees)
-- ✓ Updated platform fees table structure
-- ✓ Created accurate balance calculation function
-- ✓ Created admin revenue stats function
-- ✓ Recalculated all existing merchant balances
-- ✓ Added performance indexes
-- ✓ Created revenue audit view for verification
-- ✓ Added verification queries
--
-- REVENUE FLOW NOW:
-- 1. Payment completed → Platform fee calculated
-- 2. Merchant gets net amount (payment - platform fee)
-- 3. Platform fee recorded in platform_fees table
-- 4. Withdrawal requested → Deducted from available balance
-- 5. Withdrawal approved → Additional 2% fee on withdrawal amount
-- 6. All revenue tracking is now accurate
-- =========================================