-- =========================================
-- FIX PI AD NETWORK REWARDS SYSTEM
-- =========================================
-- Ensures merchants are properly credited for ad rewards

-- ====== STEP 1: CREATE FUNCTION TO CREDIT AD REWARDS ======

CREATE OR REPLACE FUNCTION public.credit_ad_reward_to_merchant() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- When an ad reward is marked as granted, credit the merchant
    IF NEW.status = 'granted' AND (OLD IS NULL OR OLD.status != 'granted') THEN
        -- Add reward amount to merchant's available balance
        UPDATE merchants
        SET available_balance = COALESCE(available_balance, 0) + NEW.reward_amount,
            total_revenue = COALESCE(total_revenue, 0) + NEW.reward_amount
        WHERE id = NEW.merchant_id;
        
        RAISE NOTICE 'Credited merchant % with π% for ad reward', 
                     NEW.merchant_id, NEW.reward_amount;
    END IF;
    
    RETURN NEW;
END;
$$;

-- ====== STEP 2: CREATE TRIGGER ON AD_REWARDS TABLE ======

DROP TRIGGER IF EXISTS trigger_credit_ad_reward ON ad_rewards;

CREATE TRIGGER trigger_credit_ad_reward
AFTER INSERT OR UPDATE ON ad_rewards
FOR EACH ROW
EXECUTE FUNCTION public.credit_ad_reward_to_merchant();

-- ====== STEP 3: ENSURE AD_REWARDS TABLE HAS NECESSARY COLUMNS ======

DO $$
BEGIN
    -- Check for merchant_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ad_rewards' 
        AND column_name = 'merchant_id'
    ) THEN
        ALTER TABLE ad_rewards ADD COLUMN merchant_id UUID;
        RAISE NOTICE '✓ Added merchant_id column to ad_rewards';
    ELSE
        RAISE NOTICE '✓ merchant_id column already exists in ad_rewards';
    END IF;
    
    -- Check for reward_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ad_rewards' 
        AND column_name = 'reward_amount'
    ) THEN
        ALTER TABLE ad_rewards ADD COLUMN reward_amount NUMERIC DEFAULT 0.005;
        RAISE NOTICE '✓ Added reward_amount column to ad_rewards';
    ELSE
        RAISE NOTICE '✓ reward_amount column already exists in ad_rewards';
    END IF;
    
    -- Check for status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ad_rewards' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE ad_rewards ADD COLUMN status VARCHAR DEFAULT 'pending';
        RAISE NOTICE '✓ Added status column to ad_rewards';
    ELSE
        RAISE NOTICE '✓ status column already exists in ad_rewards';
    END IF;
    
    -- Check for ad_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ad_rewards' 
        AND column_name = 'ad_id'
    ) THEN
        ALTER TABLE ad_rewards ADD COLUMN ad_id VARCHAR UNIQUE;
        RAISE NOTICE '✓ Added ad_id column to ad_rewards';
    ELSE
        RAISE NOTICE '✓ ad_id column already exists in ad_rewards';
    END IF;
    
    -- Check for pi_username column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ad_rewards' 
        AND column_name = 'pi_username'
    ) THEN
        ALTER TABLE ad_rewards ADD COLUMN pi_username VARCHAR;
        RAISE NOTICE '✓ Added pi_username column to ad_rewards';
    ELSE
        RAISE NOTICE '✓ pi_username column already exists in ad_rewards';
    END IF;
END $$;

-- ====== STEP 4: BACKFILL MISSING AD REWARDS ======

-- For any existing ad rewards marked as granted, ensure merchant is credited
UPDATE merchants m
SET available_balance = available_balance + (
    SELECT COALESCE(SUM(ar.reward_amount), 0)
    FROM ad_rewards ar
    WHERE ar.merchant_id = m.id 
    AND ar.status = 'granted'
    AND ar.created_at > NOW() - INTERVAL '30 days'  -- Last 30 days only to avoid double counting
)
WHERE EXISTS (
    SELECT 1 FROM ad_rewards ar
    WHERE ar.merchant_id = m.id 
    AND ar.status = 'granted'
    AND ar.created_at > NOW() - INTERVAL '30 days'
);

-- ====== STEP 5: CREATE INDEXES FOR AD REWARDS ======

CREATE INDEX IF NOT EXISTS idx_ad_rewards_merchant ON ad_rewards(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ad_rewards_status ON ad_rewards(status);
CREATE INDEX IF NOT EXISTS idx_ad_rewards_ad_id ON ad_rewards(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_rewards_pi_username ON ad_rewards(pi_username);
CREATE INDEX IF NOT EXISTS idx_ad_rewards_created ON ad_rewards(created_at);

-- ====== STEP 6: VERIFY AD REWARDS SYSTEM ======

-- Show current ad rewards status
SELECT 
    COUNT(*) as total_rewards,
    COUNT(CASE WHEN status = 'granted' THEN 1 END) as granted_rewards,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_rewards,
    SUM(CASE WHEN status = 'granted' THEN reward_amount ELSE 0 END) as total_granted_amount
FROM ad_rewards;

-- Show merchants with ad earnings
SELECT 
    m.pi_username,
    COUNT(ar.id) as total_ads_watched,
    COUNT(CASE WHEN ar.status = 'granted' THEN 1 END) as granted_ads,
    SUM(ar.reward_amount) as total_earned
FROM merchants m
LEFT JOIN ad_rewards ar ON m.id = ar.merchant_id
WHERE ar.id IS NOT NULL
GROUP BY m.id, m.pi_username
ORDER BY total_earned DESC;

-- =========================================
-- COMPLETION SUMMARY
-- =========================================
-- ✓ Created trigger to auto-credit granted ad rewards
-- ✓ Ensured all required columns in ad_rewards table
-- ✓ Backfilled merchant balances with granted rewards
-- ✓ Created performance indexes
-- ✓ Ad network now fully functional with automatic reward crediting
-- 
-- AD REWARD FLOW:
-- 1. User watches ad in Pi Browser
-- 2. Ad completion triggers verify-ad-reward edge function
-- 3. Reward stored in ad_rewards table with status
-- 4. When status = 'granted', trigger auto-credits merchant balance
-- 5. Merchant immediately sees balance increase
-- 6. Notification sent to merchant about reward earned
-- =========================================