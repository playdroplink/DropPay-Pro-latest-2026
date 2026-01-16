-- Fix 1: Add missing columns to payment_links table
ALTER TABLE payment_links 
ADD COLUMN IF NOT EXISTS min_amount numeric,
ADD COLUMN IF NOT EXISTS suggested_amounts numeric[];

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_links_pricing_type ON payment_links(pricing_type);

-- Add comments for documentation
COMMENT ON COLUMN payment_links.min_amount IS 'Minimum donation amount (for donation pricing type)';
COMMENT ON COLUMN payment_links.suggested_amounts IS 'Suggested donation amounts array (for donation pricing type)';

-- Fix 2: Ensure merchant_id column exists in user_subscriptions
-- (it should already exist, but adding IF NOT EXISTS for safety)
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS merchant_id uuid REFERENCES merchants(id);

-- Fix 3: Create index on merchant_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_merchant_id ON user_subscriptions(merchant_id);

-- Fix 4: Create trigger to auto-create Free subscription for new merchants
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Get the Free plan ID
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE name = 'Free' 
  LIMIT 1;
  
  -- Create default subscription if Free plan exists
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (
      merchant_id,
      plan_id,
      status,
      current_period_start,
      current_period_end
    ) VALUES (
      NEW.id,
      free_plan_id,
      'active',
      NOW(),
      NOW() + INTERVAL '100 years' -- Free plan never expires
    )
    ON CONFLICT (merchant_id, plan_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_default_subscription ON merchants;

-- Create trigger
CREATE TRIGGER trigger_create_default_subscription
  AFTER INSERT ON merchants
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Fix 5: Backfill existing merchants without subscriptions
DO $$
DECLARE
  free_plan_id uuid;
  merchant_record RECORD;
BEGIN
  -- Get the Free plan ID
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE name = 'Free' 
  LIMIT 1;
  
  -- Only proceed if Free plan exists
  IF free_plan_id IS NOT NULL THEN
    -- Loop through all merchants without an active subscription
    FOR merchant_record IN 
      SELECT m.id 
      FROM merchants m
      LEFT JOIN user_subscriptions us ON us.merchant_id = m.id AND us.status = 'active'
      WHERE us.id IS NULL
    LOOP
      INSERT INTO user_subscriptions (
        merchant_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
      ) VALUES (
        merchant_record.id,
        free_plan_id,
        'active',
        NOW(),
        NOW() + INTERVAL '100 years'
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;
