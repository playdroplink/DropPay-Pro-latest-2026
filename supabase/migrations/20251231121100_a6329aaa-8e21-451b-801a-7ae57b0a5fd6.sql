-- Add template_type column for checkout templates
ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS template_type text DEFAULT 'standard';

-- Add product metadata columns for e-commerce templates
ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS product_images text[] DEFAULT '{}';

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS product_variants jsonb DEFAULT '[]';

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS product_sku text DEFAULT NULL;

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS require_shipping boolean DEFAULT false;

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0;

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0;

-- Add subscription/SaaS specific fields
ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS billing_interval text DEFAULT 'monthly';

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS trial_days integer DEFAULT 0;

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS plan_features jsonb DEFAULT '[]';

-- Add donation specific fields
ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS fundraising_goal numeric DEFAULT NULL;

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS current_raised numeric DEFAULT 0;

ALTER TABLE public.payment_links
ADD COLUMN IF NOT EXISTS donor_count integer DEFAULT 0;

-- Create storage bucket for payment link images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-link-images', 'payment-link-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view payment link images" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can upload payment link images" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can update their payment link images" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can delete their payment link images" ON storage.objects;

-- Storage policies for payment-link-images bucket
CREATE POLICY "Anyone can view payment link images"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-link-images');

CREATE POLICY "Merchants can upload payment link images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-link-images');

CREATE POLICY "Merchants can update their payment link images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'payment-link-images');

CREATE POLICY "Merchants can delete their payment link images"
ON storage.objects FOR DELETE
USING (bucket_id = 'payment-link-images');