-- Add missing columns to checkout_links table (if they don't already exist)
DO $$ 
BEGIN
    -- Add expire_access column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='expire_access') THEN
        ALTER TABLE checkout_links ADD COLUMN expire_access TEXT DEFAULT 'never';
    END IF;
    
    -- Add stock column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='stock') THEN
        ALTER TABLE checkout_links ADD COLUMN stock INTEGER;
    END IF;
    
    -- Add show_on_store_page column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='show_on_store_page') THEN
        ALTER TABLE checkout_links ADD COLUMN show_on_store_page BOOLEAN DEFAULT false;
    END IF;
    
    -- Add add_waitlist column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='add_waitlist') THEN
        ALTER TABLE checkout_links ADD COLUMN add_waitlist BOOLEAN DEFAULT false;
    END IF;
    
    -- Add ask_questions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='ask_questions') THEN
        ALTER TABLE checkout_links ADD COLUMN ask_questions BOOLEAN DEFAULT false;
    END IF;
    
    -- Add internal_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='internal_name') THEN
        ALTER TABLE checkout_links ADD COLUMN internal_name TEXT DEFAULT '';
    END IF;
    
    -- Add redirect_after_checkout column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='redirect_after_checkout') THEN
        ALTER TABLE checkout_links ADD COLUMN redirect_after_checkout TEXT DEFAULT '';
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