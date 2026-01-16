-- ============================================
-- Add Cancel Redirect and Image Features to Payment Links
-- ============================================
-- New Features:
-- 1. cancel_redirect_url - Redirect users when payment is not successful
-- 2. checkout_image - Optional image to show on payment/checkout page
-- ============================================

-- Add cancel_redirect_url column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payment_links' AND column_name='cancel_redirect_url') THEN
        ALTER TABLE payment_links ADD COLUMN cancel_redirect_url TEXT DEFAULT '';
        RAISE NOTICE 'Added cancel_redirect_url column';
    ELSE
        RAISE NOTICE 'cancel_redirect_url column already exists';
    END IF;
END $$;

-- Add checkout_image column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payment_links' AND column_name='checkout_image') THEN
        ALTER TABLE payment_links ADD COLUMN checkout_image TEXT DEFAULT NULL;
        RAISE NOTICE 'Added checkout_image column';
    ELSE
        RAISE NOTICE 'checkout_image column already exists';
    END IF;
END $$;

-- Verify the new columns
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_links' 
  AND column_name IN ('cancel_redirect_url', 'checkout_image')
ORDER BY column_name;

-- Expected result:
-- cancel_redirect_url | text | ''    | YES
-- checkout_image      | text | NULL  | YES
