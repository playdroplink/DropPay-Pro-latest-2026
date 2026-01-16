-- Create checkout_links table for user-created customizable checkout links
CREATE TABLE IF NOT EXISTS checkout_links (
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

-- Create indexes
CREATE INDEX idx_checkout_links_merchant_id ON checkout_links(merchant_id);
CREATE INDEX idx_checkout_links_slug ON checkout_links(slug);
CREATE INDEX idx_checkout_links_category ON checkout_links(category);
CREATE INDEX idx_checkout_links_is_active ON checkout_links(is_active);
CREATE INDEX idx_checkout_links_created_at ON checkout_links(created_at DESC);

-- Create trigger to update updated_at timestamp
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

-- Create view for checkout links analytics
CREATE OR REPLACE VIEW checkout_links_analytics AS
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

-- Add RLS policies if RLS is enabled
ALTER TABLE checkout_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checkout links"
  ON checkout_links FOR SELECT
  USING (merchant_id = auth.uid());

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

-- Create public policy for viewing checkout links via slug (for payment page)
CREATE POLICY "Anyone can view checkout link by slug"
  ON checkout_links FOR SELECT
  USING (true);
