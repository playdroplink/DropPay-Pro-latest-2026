import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Activity, Globe } from "lucide-react";
import { Map, MapMarker, MapPopup, MapControls } from "@/components/ui/map";
import { toast } from "sonner";

interface UserLocation {
  id: string;
  username: string;
  latitude: number;
  longitude: number;
  last_active: string;
  country?: string;
  city?: string;
  business_name?: string;
  wallet_address?: string;
  is_admin?: boolean;
}

interface UserStats {
  total_users: number;
  online_users: number;
  countries: number;
  active_today: number;
}

const DroppayMap = () => {
  const { piUser, isAuthenticated } = useAuth();
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_users: 0,
    online_users: 0,
    countries: 0,
    active_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);

  // Function to get geographical data based on timezone or estimated location
  const getEstimatedLocation = () => {
    // Use browser timezone to estimate user location
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const timezoneLocations: { [key: string]: { lat: number, lng: number, city: string, country: string } } = {
      "America/New_York": { lat: 40.7128, lng: -74.0060, city: "New York", country: "USA" },
      "America/Los_Angeles": { lat: 34.0522, lng: -118.2437, city: "Los Angeles", country: "USA" },
      "America/Chicago": { lat: 41.8781, lng: -87.6298, city: "Chicago", country: "USA" },
      "Europe/London": { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
      "Europe/Paris": { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France" },
      "Europe/Berlin": { lat: 52.5200, lng: 13.4050, city: "Berlin", country: "Germany" },
      "Asia/Tokyo": { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
      "Asia/Shanghai": { lat: 31.2304, lng: 121.4737, city: "Shanghai", country: "China" },
      "Asia/Singapore": { lat: 1.3521, lng: 103.8198, city: "Singapore", country: "Singapore" },
      "Australia/Sydney": { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" },
      "America/Sao_Paulo": { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brazil" },
      "Asia/Dubai": { lat: 25.2048, lng: 55.2708, city: "Dubai", country: "UAE" },
      "Africa/Lagos": { lat: 6.5244, lng: 3.3792, city: "Lagos", country: "Nigeria" },
      "Asia/Mumbai": { lat: 19.0760, lng: 72.8777, city: "Mumbai", country: "India" },
      "America/Mexico_City": { lat: 19.4326, lng: -99.1332, city: "Mexico City", country: "Mexico" },
      "Asia/Seoul": { lat: 37.5665, lng: 126.9780, city: "Seoul", country: "South Korea" },
      "Africa/Cairo": { lat: 30.0444, lng: 31.2357, city: "Cairo", country: "Egypt" }
    };

    return timezoneLocations[timezone] || 
           timezoneLocations["Europe/London"]; // Default fallback
  };

  // Function to fetch real Pi Network users from merchants table
  const fetchUserData = async () => {
    try {
      // Fetch all merchants (Pi Network users) from Supabase with location data
      const { data: merchants, error } = await supabase
        .from('merchants')
        .select('id, pi_username, business_name, created_at, updated_at, wallet_address, is_admin, latitude, longitude, country, city, timezone');

      if (error) {
        console.error('Error fetching merchants:', error);
        toast.error('Failed to load user data');
        return;
      }

      if (!merchants || merchants.length === 0) {
        console.log('No merchants found');
        setUserStats({ total_users: 0, online_users: 0, countries: 0, active_today: 0 });
        return;
      }

      // Fallback locations for users without stored location data
      const fallbackLocations = [
        { lat: 40.7128, lng: -74.0060, city: "New York", country: "USA" },
        { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
        { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
        { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France" },
        { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" },
        { lat: 43.6532, lng: -79.3832, city: "Toronto", country: "Canada" },
        { lat: 52.5200, lng: 13.4050, city: "Berlin", country: "Germany" },
        { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brazil" },
        { lat: 19.0760, lng: 72.8777, city: "Mumbai", country: "India" },
        { lat: 1.3521, lng: 103.8198, city: "Singapore", country: "Singapore" }
      ];

      // Transform merchants data into map-compatible format
      const userLocations: UserLocation[] = merchants.map((merchant, index) => {
        // Estimate last activity based on updated_at or created_at
        const lastActivity = merchant.updated_at || merchant.created_at || new Date().toISOString();
        
        // Use stored location if available, otherwise use fallback
        let latitude: number;
        let longitude: number;
        let city: string;
        let country: string;

        if (merchant.latitude && merchant.longitude) {
          // Use actual stored location
          latitude = Number(merchant.latitude);
          longitude = Number(merchant.longitude);
          city = merchant.city || "Unknown";
          country = merchant.country || "Unknown";
        } else {
          // Use fallback location with random offset
          const location = fallbackLocations[index % fallbackLocations.length];
          const randomOffset = 0.1;
          latitude = location.lat + (Math.random() - 0.5) * randomOffset;
          longitude = location.lng + (Math.random() - 0.5) * randomOffset;
          city = location.city;
          country = location.country;
        }
        
        return {
          id: merchant.id,
          username: merchant.pi_username || `User-${merchant.id.slice(0, 8)}`,
          latitude,
          longitude,
          last_active: lastActivity,
          city,
          country,
          business_name: merchant.business_name,
          wallet_address: merchant.wallet_address,
          is_admin: merchant.is_admin
        };
      });

      setUserLocations(userLocations);

      // Calculate stats based on real data
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const onlineUsers = userLocations.filter(user => 
        new Date(user.last_active) > oneHourAgo
      ).length;

      const activeToday = userLocations.filter(user => 
        new Date(user.last_active) > oneDayAgo
      ).length;

      const countries = new Set(userLocations.map(user => user.country)).size;

      setUserStats({
        total_users: userLocations.length,
        online_users: onlineUsers,
        countries: countries,
        active_today: activeToday
      });

      console.log(`Loaded ${userLocations.length} real Pi Network users`);

    } catch (error) {
      console.error("Error fetching real user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUserData();
    
    // Update data every 30 seconds
    const interval = setInterval(fetchUserData, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Check if user is online (active within last hour)
  const isUserOnline = (lastActive: string) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(lastActive) > oneHourAgo;
  };

  // Format last active time
  const formatLastActive = (lastActive: string) => {
    const now = new Date();
    const last = new Date(lastActive);
    const diffMinutes = Math.floor((now.getTime() - last.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Droppay Global Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please authenticate with Pi Network to access the global user map.
            </p>
            <Badge variant="outline">Authentication Required</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Globe className="h-8 w-8 text-primary" />
                Droppay Global Map
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time view of authenticated Pi Network users on Droppay
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                Live
              </Badge>
              {piUser && (
                <Badge variant="outline">
                  Welcome, {piUser.username}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : userStats.total_users.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Online Now</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? "..." : userStats.online_users.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Countries</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? "..." : userStats.countries}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? "..." : userStats.active_today.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card>
          <CardContent className="p-0">
            <div className="h-[600px] rounded-lg overflow-hidden">
              <Map
                center={[0, 20]}
                zoom={2}
                styles={{
                  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
                  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
                }}
              >
                <MapControls />

                {/* User Markers */}
                {userLocations.map((user) => (
                  <MapMarker
                    key={user.id}
                    latitude={user.latitude}
                    longitude={user.longitude}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="relative cursor-pointer">
                      <div className={`w-3 h-3 rounded-full ${
                        isUserOnline(user.last_active)
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`} />
                      {isUserOnline(user.last_active) && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />
                      )}
                    </div>
                  </MapMarker>
                ))}

                {/* User Popup */}
                {selectedUser && (
                  <MapPopup
                    latitude={selectedUser.latitude}
                    longitude={selectedUser.longitude}
                    onClose={() => setSelectedUser(null)}
                  >
                    <div className="p-3 min-w-[250px]">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {selectedUser.username}
                          </h3>
                          {selectedUser.business_name && (
                            <p className="text-sm text-muted-foreground">
                              {selectedUser.business_name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge
                            variant={isUserOnline(selectedUser.last_active) ? "default" : "secondary"}
                            className={isUserOnline(selectedUser.last_active) ? "bg-green-500" : ""}
                          >
                            {isUserOnline(selectedUser.last_active) ? "Online" : "Offline"}
                          </Badge>
                          {selectedUser.is_admin && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {selectedUser.city && selectedUser.country && (
                          <p className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {selectedUser.city}, {selectedUser.country}
                          </p>
                        )}
                        <p className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          Last active: {formatLastActive(selectedUser.last_active)}
                        </p>
                        {selectedUser.wallet_address && (
                          <p className="text-xs font-mono bg-gray-100 p-1 rounded">
                            {selectedUser.wallet_address.slice(0, 8)}...{selectedUser.wallet_address.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>
                  </MapPopup>
                )}
              </Map>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DroppayMap;