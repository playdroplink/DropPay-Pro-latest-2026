-- Add checkout_template column to payment_links table
ALTER TABLE payment_links 
ADD COLUMN IF NOT EXISTS checkout_template TEXT DEFAULT 'default';

-- Add comment to document the column
COMMENT ON COLUMN payment_links.checkout_template IS 'Checkout page design template: default, modern, minimal, or gradient';

-- Create an index for faster template queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_payment_links_checkout_template ON payment_links(checkout_template);
