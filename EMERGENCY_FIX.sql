-- 🚨 EMERGENCY FIX: Critical RLS Policy Issues
-- Run this IMMEDIATELY to fix the errors shown in screenshots
-- Time: 2 minutes

-- ==================================================
-- FIX 1: Payment Links RLS (fixes "new row violates row-level security policy")
-- ==================================================

-- Drop and recreate payment_links policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "payment_links_select_policy" ON payment_links;
    DROP POLICY IF EXISTS "payment_links_insert_policy" ON payment_links;
    DROP POLICY IF EXISTS "Users can view payment links" ON payment_links;
    DROP POLICY IF EXISTS "Users can insert their own payment links" ON payment_links;
    DROP POLICY IF EXISTS "Anyone can view active payment links" ON payment_links;
    DROP POLICY IF EXISTS "Merchants can insert their own payment links" ON payment_links;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if policies don't exist
END $$;

-- Enable RLS
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Create new working policies
CREATE POLICY "payment_links_select_public" ON payment_links
FOR SELECT USING (is_active = true);

CREATE POLICY "payment_links_insert_auth" ON payment_links  
FOR INSERT WITH CHECK (auth.uid() = merchant_id::uuid);

-- ==================================================
-- FIX 2: Checkout Links RLS (fixes edge function access)
-- ==================================================

-- Drop and recreate checkout_links policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "checkout_links_select_policy" ON checkout_links;
    DROP POLICY IF EXISTS "Users can view checkout links" ON checkout_links;
    DROP POLICY IF EXISTS "Anyone can view active checkout links" ON checkout_links;
    DROP POLICY IF EXISTS "Merchants can view their checkout links" ON checkout_links;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if policies don't exist
END $$;

-- Enable RLS
ALTER TABLE checkout_links ENABLE ROW LEVEL SECURITY;

-- Create new working policies  
CREATE POLICY "checkout_links_select_public" ON checkout_links
FOR SELECT USING (is_active = true);

-- ==================================================  
-- FIX 3: User Subscriptions RLS (fixes edge function writes)
-- ==================================================

-- Drop and recreate user_subscriptions policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "user_subscriptions_select_policy" ON user_subscriptions;
    DROP POLICY IF EXISTS "user_subscriptions_insert_policy" ON user_subscriptions;
    DROP POLICY IF EXISTS "Merchants can manage own subscriptions" ON user_subscriptions;
    DROP POLICY IF EXISTS "Service can manage subscriptions" ON user_subscriptions;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if policies don't exist
END $$;

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create new working policies
CREATE POLICY "user_subscriptions_select_auth" ON user_subscriptions
FOR SELECT USING (auth.uid() = merchant_id::uuid);

CREATE POLICY "user_subscriptions_insert_service" ON user_subscriptions
FOR INSERT WITH CHECK (
    auth.uid() = merchant_id::uuid OR 
    auth.role() = 'service_role'
);

-- ==================================================
-- FIX 4: Storage Security (fixes upload errors)
-- ==================================================

-- Create checkout-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'checkout-images', 
    'checkout-images', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing storage policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "checkout_images_select" ON storage.objects;
    DROP POLICY IF EXISTS "checkout_images_insert" ON storage.objects;
    DROP POLICY IF EXISTS "checkout_images_update" ON storage.objects;
    DROP POLICY IF EXISTS "checkout_images_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if policies don't exist
END $$;

-- Create storage policies
CREATE POLICY "checkout_images_select" ON storage.objects
FOR SELECT USING (bucket_id = 'checkout-images');

CREATE POLICY "checkout_images_insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'checkout-images' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "checkout_images_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'checkout-images' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "checkout_images_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'checkout-images' AND
    auth.role() = 'authenticated'
);

-- ==================================================
-- SUCCESS MESSAGE
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ========================================';
    RAISE NOTICE '✅ EMERGENCY FIXES APPLIED SUCCESSFULLY!';
    RAISE NOTICE '🎉 ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Fixed Issues:';
    RAISE NOTICE '   ✅ Payment links RLS policy violations';
    RAISE NOTICE '   ✅ Checkout links edge function access';  
    RAISE NOTICE '   ✅ User subscriptions edge function writes';
    RAISE NOTICE '   ✅ Storage security configuration';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test Now:';
    RAISE NOTICE '   1. Create a payment link (should work)';
    RAISE NOTICE '   2. Upload an image (should work)';
    RAISE NOTICE '   3. Complete a Pi payment (should work)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Next: Check edge function secrets & redeploy';
    RAISE NOTICE '';
END $$;