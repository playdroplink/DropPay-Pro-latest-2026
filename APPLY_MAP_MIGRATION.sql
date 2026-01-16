-- Quick SQL script to apply location tracking migration
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql)

-- Add location columns to merchants table
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add index for geographic queries
CREATE INDEX IF NOT EXISTS idx_merchants_location 
ON public.merchants(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index for country-based queries
CREATE INDEX IF NOT EXISTS idx_merchants_country 
ON public.merchants(country) 
WHERE country IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.merchants.latitude IS 'User latitude coordinate for map display';
COMMENT ON COLUMN public.merchants.longitude IS 'User longitude coordinate for map display';
COMMENT ON COLUMN public.merchants.country IS 'User country name';
COMMENT ON COLUMN public.merchants.city IS 'User city name';
COMMENT ON COLUMN public.merchants.timezone IS 'User browser timezone';
COMMENT ON COLUMN public.merchants.ip_address IS 'User IP address for location estimation';

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'merchants' 
  AND column_name IN ('latitude', 'longitude', 'country', 'city', 'timezone', 'ip_address')
ORDER BY column_name;
