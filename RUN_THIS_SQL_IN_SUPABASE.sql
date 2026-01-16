-- Run this SQL in Supabase dashboard at: https://supabase.com/dashboard
-- Project ID: reyhsdlsvclpzsgecoyf
-- Go to: SQL Editor > New Query > Paste this entire file

-- Add advanced options columns to checkout_links table
ALTER TABLE checkout_links 
ADD COLUMN IF NOT EXISTS expire_access TEXT DEFAULT 'never' CHECK (expire_access IN ('never', '7days', '30days', '90days', '1year')),
ADD COLUMN IF NOT EXISTS stock INTEGER,
ADD COLUMN IF NOT EXISTS show_on_store_page BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS add_waitlist BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ask_questions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS internal_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS redirect_after_checkout TEXT DEFAULT '';

-- Create index for show_on_store_page since it's used in queries
CREATE INDEX IF NOT EXISTS idx_checkout_links_show_on_store_page ON checkout_links(show_on_store_page) WHERE show_on_store_page = true;
