-- ================================================================
-- MINIMAL CHECKOUT LINKS SETUP (Alternative)
-- Use this if SETUP_CHECKOUT_LINKS_COMPLETE.sql fails
-- ================================================================

-- STEP 1: Remove old objects
DROP VIEW IF EXISTS checkout_links_analytics CASCADE;
DROP TRIGGER IF EXISTS checkout_links_updated_at_trigger ON checkout_links;
DROP FUNCTION IF EXISTS update_checkout_links_updated_at();
DROP TABLE IF EXISTS checkout_links;

-- STEP 2: Create the table fresh
CREATE TABLE checkout_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'Pi',
  features JSONB DEFAULT '[]'::jsonb,
  qr_code_data TEXT,
  expire_access TEXT DEFAULT 'never',
  stock INTEGER,
  show_on_store_page BOOLEAN DEFAULT false,
  add_waitlist BOOLEAN DEFAULT false,
  ask_questions BOOLEAN DEFAULT false,
  internal_name TEXT DEFAULT '',
  redirect_after_checkout TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create indexes
CREATE INDEX idx_checkout_links_merchant_id ON checkout_links(merchant_id);
CREATE INDEX idx_checkout_links_slug ON checkout_links(slug);
CREATE INDEX idx_checkout_links_category ON checkout_links(category);
CREATE INDEX idx_checkout_links_is_active ON checkout_links(is_active);
CREATE INDEX idx_checkout_links_created_at ON checkout_links(created_at DESC);
CREATE INDEX idx_checkout_links_show_on_store_page ON checkout_links(show_on_store_page) WHERE show_on_store_page = true;

-- STEP 4: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_checkout_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkout_links_updated_at_trigger
BEFORE UPDATE ON checkout_links
FOR EACH ROW
EXECUTE FUNCTION update_checkout_links_updated_at();

-- STEP 5: Create analytics view
CREATE OR REPLACE VIEW checkout_links_analytics AS
SELECT 
  id,
  merchant_id,
  title,
  category,
  amount,
  currency,
  views,
  conversions,
  CASE WHEN views = 0 THEN 0 ELSE ROUND((conversions::NUMERIC / views::NUMERIC * 100)::NUMERIC, 2) END as conversion_rate,
  created_at,
  updated_at
FROM checkout_links
WHERE is_active = true;

-- STEP 6: Enable RLS
ALTER TABLE checkout_links ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Users can view their own checkout links"
  ON checkout_links FOR SELECT
  USING (merchant_id = auth.uid() OR true);

CREATE POLICY "Users can insert their own checkout links"
  ON checkout_links FOR INSERT
  WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Users can update their own checkout links"
  ON checkout_links FOR UPDATE
  USING (merchant_id = auth.uid())
  WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Users can delete their own checkout links"
  ON checkout_links FOR DELETE
  USING (merchant_id = auth.uid());

-- ================================================================
-- DONE!
-- The checkout_links table is now ready to use.
-- ================================================================
