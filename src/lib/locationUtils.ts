// Location utilities for tracking user geographic data

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  city: string | null;
  timezone: string;
  ip_address: string | null;
}

// Timezone to approximate location mapping
const TIMEZONE_LOCATIONS: Record<string, { lat: number; lng: number; city: string; country: string }> = {
  "America/New_York": { lat: 40.7128, lng: -74.0060, city: "New York", country: "USA" },
  "America/Los_Angeles": { lat: 34.0522, lng: -118.2437, city: "Los Angeles", country: "USA" },
  "America/Chicago": { lat: 41.8781, lng: -87.6298, city: "Chicago", country: "USA" },
  "America/Denver": { lat: 39.7392, lng: -104.9903, city: "Denver", country: "USA" },
  "America/Phoenix": { lat: 33.4484, lng: -112.0740, city: "Phoenix", country: "USA" },
  "America/Toronto": { lat: 43.6532, lng: -79.3832, city: "Toronto", country: "Canada" },
  "America/Vancouver": { lat: 49.2827, lng: -123.1207, city: "Vancouver", country: "Canada" },
  "America/Sao_Paulo": { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brazil" },
  "America/Mexico_City": { lat: 19.4326, lng: -99.1332, city: "Mexico City", country: "Mexico" },
  "America/Buenos_Aires": { lat: -34.6037, lng: -58.3816, city: "Buenos Aires", country: "Argentina" },
  "Europe/London": { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
  "Europe/Paris": { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France" },
  "Europe/Berlin": { lat: 52.5200, lng: 13.4050, city: "Berlin", country: "Germany" },
  "Europe/Madrid": { lat: 40.4168, lng: -3.7038, city: "Madrid", country: "Spain" },
  "Europe/Rome": { lat: 41.9028, lng: 12.4964, city: "Rome", country: "Italy" },
  "Europe/Moscow": { lat: 55.7558, lng: 37.6173, city: "Moscow", country: "Russia" },
  "Europe/Istanbul": { lat: 41.0082, lng: 28.9784, city: "Istanbul", country: "Turkey" },
  "Asia/Tokyo": { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
  "Asia/Shanghai": { lat: 31.2304, lng: 121.4737, city: "Shanghai", country: "China" },
  "Asia/Hong_Kong": { lat: 22.3193, lng: 114.1694, city: "Hong Kong", country: "Hong Kong" },
  "Asia/Singapore": { lat: 1.3521, lng: 103.8198, city: "Singapore", country: "Singapore" },
  "Asia/Seoul": { lat: 37.5665, lng: 126.9780, city: "Seoul", country: "South Korea" },
  "Asia/Bangkok": { lat: 13.7563, lng: 100.5018, city: "Bangkok", country: "Thailand" },
  "Asia/Dubai": { lat: 25.2048, lng: 55.2708, city: "Dubai", country: "UAE" },
  "Asia/Mumbai": { lat: 19.0760, lng: 72.8777, city: "Mumbai", country: "India" },
  "Asia/Kolkata": { lat: 22.5726, lng: 88.3639, city: "Kolkata", country: "India" },
  "Asia/Delhi": { lat: 28.7041, lng: 77.1025, city: "Delhi", country: "India" },
  "Asia/Jakarta": { lat: -6.2088, lng: 106.8456, city: "Jakarta", country: "Indonesia" },
  "Asia/Manila": { lat: 14.5995, lng: 120.9842, city: "Manila", country: "Philippines" },
  "Australia/Sydney": { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" },
  "Australia/Melbourne": { lat: -37.8136, lng: 144.9631, city: "Melbourne", country: "Australia" },
  "Pacific/Auckland": { lat: -36.8485, lng: 174.7633, city: "Auckland", country: "New Zealand" },
  "Africa/Cairo": { lat: 30.0444, lng: 31.2357, city: "Cairo", country: "Egypt" },
  "Africa/Lagos": { lat: 6.5244, lng: 3.3792, city: "Lagos", country: "Nigeria" },
  "Africa/Johannesburg": { lat: -26.2041, lng: 28.0473, city: "Johannesburg", country: "South Africa" },
  "Africa/Nairobi": { lat: -1.2864, lng: 36.8172, city: "Nairobi", country: "Kenya" },
};

/**
 * Capture user's geographic location data
 * Uses browser Geolocation API as primary method, falls back to timezone estimation
 */
export async function captureUserLocation(): Promise<LocationData> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Try to get precise location via Geolocation API (requires user permission)
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      // Request location with timeout
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { timeout: 5000, enableHighAccuracy: false }
      );
    });

    console.log('✅ Precise location captured via Geolocation API');
    
    // Use reverse geocoding to get city/country from coordinates
    // For now, we'll estimate based on timezone and store the precise coords
    const tzLocation = TIMEZONE_LOCATIONS[timezone];
    
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      country: tzLocation?.country || null,
      city: tzLocation?.city || null,
      timezone,
      ip_address: null // Would need backend service to get IP
    };
  } catch (geoError) {
    console.log('⚠️ Geolocation not available, using timezone estimation:', geoError);
    
    // Fallback: estimate location from timezone
    const tzLocation = TIMEZONE_LOCATIONS[timezone];
    
    if (tzLocation) {
      console.log('✅ Location estimated from timezone:', timezone);
      return {
        latitude: tzLocation.lat,
        longitude: tzLocation.lng,
        country: tzLocation.country,
        city: tzLocation.city,
        timezone,
        ip_address: null
      };
    }
    
    // Final fallback: return timezone only
    console.log('⚠️ Could not determine location, timezone only');
    return {
      latitude: null,
      longitude: null,
      country: null,
      city: null,
      timezone,
      ip_address: null
    };
  }
}

/**
 * Get estimated location from timezone (synchronous)
 * Use when you don't want to prompt for geolocation permission
 */
export function getLocationFromTimezone(): LocationData {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzLocation = TIMEZONE_LOCATIONS[timezone];
  
  if (tzLocation) {
    return {
      latitude: tzLocation.lat,
      longitude: tzLocation.lng,
      country: tzLocation.country,
      city: tzLocation.city,
      timezone,
      ip_address: null
    };
  }
  
  return {
    latitude: null,
    longitude: null,
    country: null,
    city: null,
    timezone,
    ip_address: null
  };
}
