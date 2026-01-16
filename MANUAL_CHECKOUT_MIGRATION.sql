-- MANUAL MIGRATION: Run this in your Supabase SQL Editor
-- This will safely add missing columns to the checkout_links table

-- Add missing columns to checkout_links table (if they don't already exist)
DO $$ 
BEGIN
    -- Add expire_access column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='expire_access') THEN
        ALTER TABLE checkout_links ADD COLUMN expire_access TEXT DEFAULT 'never';
        RAISE NOTICE 'Added expire_access column';
    ELSE
        RAISE NOTICE 'expire_access column already exists';
    END IF;
    
    -- Add stock column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='stock') THEN
        ALTER TABLE checkout_links ADD COLUMN stock INTEGER;
        RAISE NOTICE 'Added stock column';
    ELSE
        RAISE NOTICE 'stock column already exists';
    END IF;
    
    -- Add show_on_store_page column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='show_on_store_page') THEN
        ALTER TABLE checkout_links ADD COLUMN show_on_store_page BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added show_on_store_page column';
    ELSE
        RAISE NOTICE 'show_on_store_page column already exists';
    END IF;
    
    -- Add add_waitlist column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='add_waitlist') THEN
        ALTER TABLE checkout_links ADD COLUMN add_waitlist BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added add_waitlist column';
    ELSE
        RAISE NOTICE 'add_waitlist column already exists';
    END IF;
    
    -- Add ask_questions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='ask_questions') THEN
        ALTER TABLE checkout_links ADD COLUMN ask_questions BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added ask_questions column';
    ELSE
        RAISE NOTICE 'ask_questions column already exists';
    END IF;
    
    -- Add internal_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='internal_name') THEN
        ALTER TABLE checkout_links ADD COLUMN internal_name TEXT DEFAULT '';
        RAISE NOTICE 'Added internal_name column';
    ELSE
        RAISE NOTICE 'internal_name column already exists';
    END IF;
    
    -- Add redirect_after_checkout column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='redirect_after_checkout') THEN
        ALTER TABLE checkout_links ADD COLUMN redirect_after_checkout TEXT DEFAULT '';
        RAISE NOTICE 'Added redirect_after_checkout column';
    ELSE
        RAISE NOTICE 'redirect_after_checkout column already exists';
    END IF;
END $$;

-- Add check constraint for expire_access values (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                   WHERE constraint_name = 'checkout_links_expire_access_check') THEN
        ALTER TABLE checkout_links 
        ADD CONSTRAINT checkout_links_expire_access_check 
        CHECK (expire_access IN ('never', '7days', '30days', '90days', '1year'));
        RAISE NOTICE 'Added expire_access check constraint';
    ELSE
        RAISE NOTICE 'expire_access check constraint already exists';
    END IF;
END $$;

-- Create RPC function to increment views
CREATE OR REPLACE FUNCTION increment_checkout_views(checkout_link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE checkout_links 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = checkout_link_id;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to increment conversions
CREATE OR REPLACE FUNCTION increment_checkout_conversions(checkout_link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE checkout_links 
  SET conversions = COALESCE(conversions, 0) + 1 
  WHERE id = checkout_link_id;
END;
$$ LANGUAGE plpgsql;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'checkout_links' 
ORDER BY ordinal_position;

-- SUBSCRIPTION PLANS FOREIGN KEY CONSTRAINT HANDLING
-- Handle foreign key constraint violations for subscription_plans

-- Check for orphaned user_subscriptions references
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM user_subscriptions us
    LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE sp.id IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % orphaned user_subscriptions records', orphaned_count;
        
        -- Option 1: Delete orphaned subscriptions (uncomment if desired)
        -- DELETE FROM user_subscriptions 
        -- WHERE plan_id NOT IN (SELECT id FROM subscription_plans);
        -- RAISE NOTICE 'Deleted % orphaned user_subscriptions', orphaned_count;
        
        -- Option 2: Show orphaned records for manual review
        RAISE NOTICE 'Orphaned user_subscriptions found - manual review recommended';
    ELSE
        RAISE NOTICE 'No orphaned user_subscriptions found';
    END IF;
END $$;

-- Function to safely delete a subscription plan
CREATE OR REPLACE FUNCTION safe_delete_subscription_plan(plan_id_to_delete UUID)
RETURNS TEXT AS $$
DECLARE
    subscription_count INTEGER;
    result_message TEXT;
BEGIN
    -- Check how many active subscriptions reference this plan
    SELECT COUNT(*) INTO subscription_count
    FROM user_subscriptions
    WHERE plan_id = plan_id_to_delete;
    
    IF subscription_count > 0 THEN
        result_message := 'Cannot delete plan - ' || subscription_count || ' active subscriptions found. Transfer or cancel subscriptions first.';
        RAISE NOTICE '%', result_message;
        RETURN result_message;
    ELSE
        -- Safe to delete
        DELETE FROM subscription_plans WHERE id = plan_id_to_delete;
        result_message := 'Plan deleted successfully';
        RAISE NOTICE '%', result_message;
        RETURN result_message;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to transfer subscriptions from one plan to another
CREATE OR REPLACE FUNCTION transfer_subscriptions_to_plan(
    old_plan_id UUID, 
    new_plan_id UUID
)
RETURNS TEXT AS $$
DECLARE
    transferred_count INTEGER;
    result_message TEXT;
BEGIN
    -- Verify new plan exists
    IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE id = new_plan_id) THEN
        result_message := 'Error: Target plan does not exist';
        RAISE NOTICE '%', result_message;
        RETURN result_message;
    END IF;
    
    -- Count subscriptions to transfer
    SELECT COUNT(*) INTO transferred_count
    FROM user_subscriptions
    WHERE plan_id = old_plan_id;
    
    -- Transfer subscriptions
    UPDATE user_subscriptions 
    SET plan_id = new_plan_id,
        updated_at = NOW()
    WHERE plan_id = old_plan_id;
    
    result_message := 'Transferred ' || transferred_count || ' subscriptions from old plan to new plan';
    RAISE NOTICE '%', result_message;
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Show current subscription plan usage
SELECT 
    sp.id,
    sp.name,
    COUNT(us.id) as active_subscriptions
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON sp.id = us.plan_id
GROUP BY sp.id, sp.name
ORDER BY active_subscriptions DESC;

-- USAGE EXAMPLES:
-- To safely delete a plan: SELECT safe_delete_subscription_plan('33f5dfb1-7ac5-4df8-b8db-d28ce6a4359b');
-- To transfer subscriptions: SELECT transfer_subscriptions_to_plan('old-plan-id', 'new-plan-id');
-- To see plan usage: Run the SELECT query above