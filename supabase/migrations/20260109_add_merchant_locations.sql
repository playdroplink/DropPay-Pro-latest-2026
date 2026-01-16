-- Add location tracking columns to merchants table
-- This allows tracking real user locations on the DroppayMap

-- Add location columns
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

-- Add comment for documentation
COMMENT ON COLUMN public.merchants.latitude IS 'User latitude coordinate for map display';
COMMENT ON COLUMN public.merchants.longitude IS 'User longitude coordinate for map display';
COMMENT ON COLUMN public.merchants.country IS 'User country name';
COMMENT ON COLUMN public.merchants.city IS 'User city name';
COMMENT ON COLUMN public.merchants.timezone IS 'User browser timezone';
COMMENT ON COLUMN public.merchants.ip_address IS 'User IP address for location estimation';
