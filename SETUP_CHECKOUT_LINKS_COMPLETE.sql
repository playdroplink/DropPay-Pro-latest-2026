-- ================================================================
-- COMPLETE CHECKOUT LINKS TABLE SETUP
-- Run this ENTIRE file in Supabase SQL Editor
-- ================================================================

-- First, check if merchants table exists, create if needed
-- (This is a lightweight check - adjust if your merchants table has different structure)
DO $$ 
BEGIN
  CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
EXCEPTION WHEN OTHERS THEN
  -- Table might already exist with different schema, that's ok
  NULL;
END $$;

-- ================================================================
-- 1. DROP AND RECREATE CHECKOUT_LINKS TABLE
-- ================================================================
-- Drop existing table and views that depend on it
DROP VIEW IF EXISTS checkout_links_analytics CASCADE;
DROP TABLE IF EXISTS checkout_links CASCADE;

-- Create the table with all columns from the start
CREATE TABLE checkout_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Link details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ecommerce', 'saas', 'marketplaces', 'donations', 'gaming', 'education')),
  slug TEXT NOT NULL UNIQUE,
  
  -- Pricing
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'Pi' CHECK (currency IN ('Pi', 'USD', 'EUR')),
  
  -- Features (stored as JSON array)
  features JSONB DEFAULT '[]'::jsonb,
  
  -- QR Code data (base64 encoded)
  qr_code_data TEXT,
  
  -- Advanced options (newly added)
  expire_access TEXT DEFAULT 'never' CHECK (expire_access IN ('never', '7days', '30days', '90days', '1year')),
  stock INTEGER,
  show_on_store_page BOOLEAN DEFAULT false,
  add_waitlist BOOLEAN DEFAULT false,
  ask_questions BOOLEAN DEFAULT false,
  internal_name TEXT DEFAULT '',
  redirect_after_checkout TEXT DEFAULT '',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for better query performance
  CONSTRAINT checkout_links_merchant_id_idx UNIQUE (merchant_id, slug)
);

-- ================================================================
-- 2. CREATE INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_checkout_links_merchant_id ON checkout_links(merchant_id);
CREATE INDEX IF NOT EXISTS idx_checkout_links_slug ON checkout_links(slug);
CREATE INDEX IF NOT EXISTS idx_checkout_links_category ON checkout_links(category);
CREATE INDEX IF NOT EXISTS idx_checkout_links_is_active ON checkout_links(is_active);
CREATE INDEX IF NOT EXISTS idx_checkout_links_created_at ON checkout_links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_links_show_on_store_page ON checkout_links(show_on_store_page) WHERE show_on_store_page = true;

-- ================================================================
-- 3. CREATE TRIGGER FOR UPDATED_AT
-- ================================================================
CREATE OR REPLACE FUNCTION update_checkout_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS checkout_links_updated_at_trigger ON checkout_links;
CREATE TRIGGER checkout_links_updated_at_trigger
BEFORE UPDATE ON checkout_links
FOR EACH ROW
EXECUTE FUNCTION update_checkout_links_updated_at();

-- ================================================================
-- 4. CREATE ANALYTICS VIEW
-- ================================================================
DROP VIEW IF EXISTS checkout_links_analytics CASCADE;
CREATE VIEW checkout_links_analytics AS
SELECT 
  cl.id,
  cl.merchant_id,
  cl.title,
  cl.category,
  cl.amount,
  cl.currency,
  cl.views,
  cl.conversions,
  CASE 
    WHEN cl.views = 0 THEN 0
    ELSE ROUND((cl.conversions::NUMERIC / cl.views::NUMERIC * 100)::NUMERIC, 2)
  END as conversion_rate,
  cl.created_at,
  cl.updated_at
FROM checkout_links cl
WHERE cl.is_active = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own checkout links" ON checkout_links;
DROP POLICY IF EXISTS "Users can insert their own checkout links" ON checkout_links;
DROP POLICY IF EXISTS "Users can update their own checkout links" ON checkout_links;
DROP POLICY IF EXISTS "Users can delete their own checkout links" ON checkout_links;
DROP POLICY IF EXISTS "Anyone can view checkout link by slug" ON checkout_links;

-- Enable RLS
ALTER TABLE checkout_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own checkout links"
  ON checkout_links FOR SELECT
  USING (auth.uid() IS NOT NULL AND merchant_id = auth.uid());

CREATE POLICY "Users can insert their own checkout links"
  ON checkout_links FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND merchant_id = auth.uid());

CREATE POLICY "Users can update their own checkout links"
  ON checkout_links FOR UPDATE
  USING (auth.uid() IS NOT NULL AND merchant_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND merchant_id = auth.uid());

CREATE POLICY "Users can delete their own checkout links"
  ON checkout_links FOR DELETE
  USING (auth.uid() IS NOT NULL AND merchant_id = auth.uid());

CREATE POLICY "Anyone can view checkout link by slug"
  ON checkout_links FOR SELECT
  USING (true);

-- ================================================================
-- SETUP COMPLETE
-- ================================================================
-- All tables, indexes, triggers, and policies have been created.
-- The checkout_links feature is now ready to use!
