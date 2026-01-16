-- ================================================================
-- ADD CHECKOUT TEMPLATE COLUMN TO PAYMENT_LINKS
-- Run this SQL in your Supabase SQL Editor
-- ================================================================

-- Add checkout_template column to payment_links table
ALTER TABLE payment_links 
ADD COLUMN IF NOT EXISTS checkout_template TEXT DEFAULT 'default';

-- Update comment
COMMENT ON COLUMN payment_links.checkout_template IS 'Checkout page design template: default, modern, minimal, or gradient';

-- ================================================================
-- DONE! The checkout_template column has been added.
-- Merchants can now choose different checkout page designs.
-- ================================================================
