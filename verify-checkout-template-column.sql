-- ================================================================
-- VERIFY CHECKOUT_TEMPLATE COLUMN EXISTS
-- Run this in your Supabase SQL Editor first to check
-- ================================================================

-- Check if the column exists
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'payment_links' 
    AND column_name = 'checkout_template';

-- If the above query returns 0 rows, the column doesn't exist yet
-- If it returns 1 row, the column exists and you can see its configuration

-- ================================================================
-- If column DOESN'T EXIST, run this:
-- ================================================================

ALTER TABLE payment_links
ADD COLUMN IF NOT EXISTS checkout_template TEXT DEFAULT 'default';

COMMENT ON COLUMN payment_links.checkout_template IS 'Checkout page design template: default, modern, minimal, or gradient';

CREATE INDEX IF NOT EXISTS idx_payment_links_checkout_template ON payment_links(checkout_template);

-- ================================================================
-- DONE! Now refresh your browser/app
-- ================================================================
