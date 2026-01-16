import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { PiNetworkValidator } from '@/lib/piNetworkValidator';
import { getLocationFromTimezone } from '@/lib/locationUtils';

export interface PiUser {
  uid: string;
  username: string;
  wallet_address?: string;
}

export type Merchant = Database['public']['Tables']['merchants']['Row'];

export interface AuthContextType {
  piUser: PiUser | null;
  merchant: Merchant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPiBrowser: boolean;
  isSdkReady: boolean;
  isAdSupported: boolean;
  login: () => Promise<void>;
  logout: () => void;
  triggerWelcomeAd: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Type definitions for Pi SDK
declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<{
        user: { uid: string; username: string; wallet_address?: string };
        accessToken: string;
      }>;
      createPayment: (config: any, callbacks: any) => void;
      nativeFeaturesList: () => Promise<string[]>;
      Ads?: {
        isAdReady: (adType: string) => Promise<{ ready: boolean }>;
        requestAd: (adType: string) => Promise<{ result: string }>;
        showAd: (adType: string) => Promise<{ result: string; adId?: string }>;
      };
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [isAdSupported, setIsAdSupported] = useState(false);

  // Initialize Pi SDK
  useEffect(() => {
    const initializePiSdk = async () => {
      try {
        console.log('🔧 Initializing DropPay Mainnet Pi SDK...');
        
        // Check environment configuration first
        const envCheck = PiNetworkValidator.checkEnvironmentConfig();
        if (!envCheck.valid) {
          console.warn('⚠️ Environment configuration issues:', envCheck.issues);
        }

        // Better Pi Browser detection
        const userAgent = navigator.userAgent.toLowerCase();
        const isPiDetected = (
          window.Pi !== undefined || 
          userAgent.includes('pi browser') || 
          userAgent.includes('pi network') ||
          window.location.hostname === 'droppay.space'
        );

        if (window.Pi && isPiDetected) {
          // Initialize Pi SDK with sandbox mode from environment configuration
          const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
          const currentMode = sandboxMode ? 'sandbox/testnet' : 'mainnet';
          console.log('🔧 Pi SDK initialization:', { sandbox: sandboxMode, mode: currentMode });
          
          window.Pi.init({ 
            version: '2.0', 
            sandbox: sandboxMode // Use environment config
          });
          
          setIsSdkReady(true);
          setIsPiBrowser(true);
          
          // Check for ads support using Pi platform features
          try {
            const features = await window.Pi.nativeFeaturesList();
            const adSupported = features.includes('ad_network');
            setIsAdSupported(adSupported);
            console.log('✅ Pi SDK initialized successfully', { 
              sandbox: sandboxMode, 
              mode: currentMode,
              adsSupported: adSupported,
              features: features,
              apiKey: import.meta.env.VITE_PI_API_KEY ? 'configured' : 'missing',
              validationKey: import.meta.env.VITE_PI_VALIDATION_KEY ? 'configured' : 'missing',
              userAgent: userAgent.substring(0, 50)
            });
          } catch (error) {
            console.log('Could not check ad support:', error);
            setIsAdSupported(false);
          }
        } else {
          console.log('⚠️ Pi SDK not available - not running in Pi Browser');
          setIsPiBrowser(false);
          setIsSdkReady(true); // Mark as ready even without SDK for demo mode
          setIsAdSupported(false);
        }
      } catch (error) {
        console.error('❌ Error initializing Pi SDK:', error);
        setIsPiBrowser(false);
        setIsSdkReady(true);
        setIsAdSupported(false);
      }
    };

    // Wait for SDK to load
    if (window.Pi) {
      initializePiSdk();
    } else {
      // SDK might still be loading, wait a bit
      const timeout = setTimeout(() => {
        initializePiSdk();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  // Check for existing session with improved handling
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = localStorage.getItem('pi_user');
        const storedToken = localStorage.getItem('pi_access_token');
        
        console.log('🔍 Checking for stored auth session:', {
          hasUser: !!storedUser,
          hasToken: !!storedToken,
          timestamp: new Date().toISOString()
        });
        
        if (storedUser && storedToken) {
          try {
            const user = JSON.parse(storedUser);
            console.log('✅ Found stored user session:', user.username);
            
            // Validate user object structure
            if (user.uid && user.username) {
              setPiUser(user);
              
              // Fetch or create merchant profile
              console.log('🔍 Fetching merchant profile for:', user.uid);
              const { data: merchantData, error: merchantError } = await supabase
                .from('merchants')
                .select('*')
                .eq('id', user.uid)
                .maybeSingle();

              if (merchantError) {
                console.error('❌ Error fetching merchant:', merchantError);
              } else if (merchantData) {
                console.log('✅ Merchant profile found:', merchantData);
                setMerchant(merchantData);
              } else {
                // Auto-create merchant profile if not exists
                console.log('📝 Creating new merchant profile...');
                
                // Capture user location data
                const locationData = getLocationFromTimezone();
                console.log('📍 Location data:', locationData);
                
                const { data: newMerchant, error: createError } = await supabase
                  .from('merchants')
                  .insert({
                    id: user.uid,
                    pi_username: user.username,
                    wallet_address: user.wallet_address,
                    email: null,
                    total_earnings: 0,
                    total_transactions: 0,
                    subscription_tier: 'free',
                    is_active: true,
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    country: locationData.country,
                    city: locationData.city,
                    timezone: locationData.timezone
                  })
                  .select()
                  .single();

                if (createError) {
                  console.error('❌ Error creating merchant:', createError);
                } else {
                  console.log('✅ Merchant profile created:', newMerchant);
                  setMerchant(newMerchant);
                }
              }
              
              setIsLoading(false);
            } else {
              throw new Error('Invalid user data structure');
            }
          } catch (parseError) {
            console.error('❌ Error parsing stored session:', parseError);
            // Clear corrupted session
            localStorage.removeItem('pi_user');
            localStorage.removeItem('pi_access_token');
            localStorage.removeItem('pi_session_timestamp');
            setIsLoading(false);
          }
        } else {
          console.log('ℹ️ No stored authentication session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Session restoration error:', error);
        setIsLoading(false);
      }
    };
    
    // Wait for SDK to be ready before checking session
    if (isSdkReady) {
      restoreSession();
    }
  }, [isSdkReady]);


  const triggerWelcomeAd = async () => {
    // Auto-watch ads after Pi authentication with proper verification
    if (!isPiBrowser || !isAdSupported || !window.Pi?.Ads) {
      console.log('⚠️ Ads not supported or not in Pi Browser');
      return;
    }

    if (!piUser || !merchant) {
      console.log('⚠️ User or merchant not available for ad watching');
      return;
    }

    try {
      console.log('🎯 Starting welcome ad flow...');
      
      // Check if ad is ready
      const adReadyResponse = typeof window.Pi.Ads.isAdReady === 'function'
        ? await window.Pi.Ads.isAdReady('rewarded')
        : { ready: false };
      console.log('📊 Ad ready status:', adReadyResponse);
      
      if (!adReadyResponse.ready) {
        console.log('📲 Requesting new ad...');
        const requestResponse = await window.Pi.Ads.requestAd('rewarded');
        console.log('📲 Request ad response:', requestResponse);
        
        if (requestResponse?.result === 'ADS_NOT_SUPPORTED') {
          toast.error('Please update Pi Browser to view ads.');
          return;
        }
        if (!requestResponse || requestResponse.result !== 'AD_LOADED') {
          console.log('⚠️ Ad not available right now');
          return;
        }
      }

      // Show the ad
      console.log('🎬 Showing welcome ad...');
      const showAdResponse = await window.Pi.Ads.showAd('rewarded');
      console.log('🎬 Show ad response:', showAdResponse);

      if (showAdResponse?.result === 'ADS_NOT_SUPPORTED') {
        toast.error('Please update Pi Browser to view ads.');
        return;
      }

      if (showAdResponse.result === 'AD_REWARDED' && showAdResponse.adId) {
        console.log('✅ Ad completed with ID:', showAdResponse.adId);
        
        // Verify and grant reward through edge function
        console.log('🔍 Verifying ad reward...');
        const response = await supabase.functions.invoke('verify-ad-reward', {
          body: { 
            adId: showAdResponse.adId, 
            merchantId: merchant.id, 
            piUsername: piUser.username 
          },
        });

        if (response.data?.verified) {
          toast.success(`🎉 Welcome reward earned: ${response.data.reward_amount} Drop!`);
          console.log('✅ Welcome ad reward verified and granted:', response.data);
        } else {
          toast.info('Ad completed, but reward verification is pending');
          console.log('⏳ Welcome ad completed, reward pending verification');
        }
      } else if (showAdResponse.result === 'AD_CLOSED') {
        console.log('❌ Ad was closed before completion');
        toast.info('Please watch the complete ad to earn rewards');
      } else {
        console.log('❌ Ad was not completed:', showAdResponse.result);
      }
    } catch (error) {
      console.error('❌ Error with welcome ad:', error);
      toast.error('An error occurred while showing the welcome ad');
    }
  };

  const onIncompletePaymentFound = useCallback((payment: any) => {
    console.log('Incomplete payment found:', payment);
    // Handle incomplete payment - could redirect to payment completion
  }, []);

  const login = async () => {
    console.log('🔐 Starting Pi Network authentication...');
    setIsLoading(true);
    
    try {
      // Enhanced Pi Browser detection based on official patterns
      const userAgent = navigator.userAgent || '';
      const hostname = window.location.hostname;
      const isPiEnvironment = (
        typeof window.Pi !== 'undefined' ||
        userAgent.includes('PiBrowser') ||
        userAgent.includes('Pi/') ||
        hostname.includes('pi.app') ||
        hostname.includes('pi-apps.github.io') ||
        hostname.includes('droppay.space')
      );

      console.log('🔍 Environment Detection:', {
        windowPi: !!window.Pi,
        userAgent: userAgent.substring(0, 50),
        hostname,
        isPiEnvironment,
        sdkReady: isSdkReady
      });

      if (!isPiEnvironment || !window.Pi) {
        // Demo mode for development - following official guidance
        console.log('⚠️ Not in Pi Browser environment');
        const confirmDemo = window.confirm(
          'You are not in Pi Browser. Would you like to use demo mode for testing?\n\n' +
          'This will create a test user for development purposes only.'
        );
        
        if (confirmDemo) {
          console.log('🧪 Using demo mode');
          const demoUser: PiUser = {
            uid: 'demo-user-' + Date.now(),
            username: 'DemoUser' + Math.floor(Math.random() * 1000),
            wallet_address: 'demo-wallet-address'
          };
          
          localStorage.setItem('pi_user', JSON.stringify(demoUser));
          localStorage.setItem('pi_access_token', 'demo-token-' + Date.now());
          setPiUser(demoUser);
          
          toast.success('Demo authentication successful');
          console.log('✅ Demo user created:', demoUser);
          setIsLoading(false);
          return;
        } else {
          toast.error('Pi Browser is required for authentication');
          setIsLoading(false);
          return;
        }
      }

      // Official Pi SDK Authentication with enhanced error handling
      console.log('🔐 Starting official Pi Network authentication...');
      
      // Ensure SDK is properly initialized with retry mechanism
      if (!isSdkReady || !window.Pi.authenticate) {
        console.log('⏳ Reinitializing Pi SDK due to missing methods...');
        try {
          const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
          const mode = sandboxMode ? 'sandbox/testnet' : 'mainnet';
          console.log('🔧 Re-initializing Pi SDK:', { sandbox: sandboxMode, mode });
          await window.Pi.init({
            version: "2.0",
            sandbox: sandboxMode
          });
          
          // Wait a bit for initialization to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (!window.Pi.authenticate) {
            throw new Error('Pi SDK failed to initialize authenticate method');
          }
          
          setIsSdkReady(true);
          console.log('✅ Pi SDK reinitialized successfully with mode:', mode);
        } catch (initError) {
          console.error('❌ SDK initialization failed:', initError);
          throw new Error('Failed to initialize Pi SDK. Please refresh the page and try again.');
        }
      }
      
      // Define scopes according to official documentation
      // wallet_address is required for Pi payments
      const scopes = ['username', 'payments', 'wallet_address'];
      console.log('📋 Requesting official scopes:', scopes);
      
      // Define incomplete payment handler as per official documentation
      const onIncompletePaymentFound = (payment: any) => {
        console.log('⚠️ Incomplete payment found:', payment);
        // Handle incomplete payment according to your app's logic
      };
      
      // Call authenticate with official format from Pi SDK docs
      console.log('🔑 Calling Pi.authenticate() with timeout protection...');
      
      // Create a timeout wrapper to prevent hanging
      const authPromise = window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Authentication timeout after 30 seconds. Pi Browser may not be responding properly.'));
        }, 30000);
      });
      
      console.log('⏰ Starting authentication with 30-second timeout...');
      const authResult = await Promise.race([authPromise, timeoutPromise]) as any;
      
      console.log('✅ Pi Authentication successful:', {
        hasUser: !!authResult.user,
        hasAccessToken: !!authResult.accessToken,
        uid: authResult.user?.uid,
        username: authResult.user?.username,
        scope: 'official'
      });
      
      // Extract user info according to official response format
      const { user, accessToken } = authResult;
      
      if (!user || !user.uid) {
        throw new Error('Invalid authentication response from Pi Network');
      }

      // Create PiUser object following official user structure
      const piUser: PiUser = {
        uid: user.uid,
        username: user.username || `Pioneer-${user.uid.slice(0, 8)}`,
        wallet_address: user.wallet_address
      };

      // Store session data securely
      localStorage.setItem('pi_user', JSON.stringify(piUser));
      localStorage.setItem('pi_access_token', accessToken);
      localStorage.setItem('pi_session_timestamp', Date.now().toString());
      
      setPiUser(piUser);
      console.log('💾 Session stored following official patterns');

      // Fetch or create merchant profile
      console.log('🔍 Fetching/creating merchant profile...');
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', piUser.uid)
        .maybeSingle();

      if (merchantError) {
        console.error('❌ Error fetching merchant:', merchantError);
      } else if (merchantData) {
        console.log('✅ Merchant profile found:', merchantData);
        setMerchant(merchantData);
        toast.success(`🎉 Welcome back, ${piUser.username}!`);
      } else {
        // Auto-create merchant profile if not exists
        console.log('📝 Creating new merchant profile...');
        
        // Capture user location data
        const locationData = getLocationFromTimezone();
        console.log('📍 Location data:', locationData);
        
        const { data: newMerchant, error: createError } = await supabase
          .from('merchants')
          .insert({
            id: piUser.uid,
            pi_username: piUser.username,
            wallet_address: piUser.wallet_address,
            email: null,
            total_earnings: 0,
            total_transactions: 0,
            subscription_tier: 'free',
            is_active: true,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            country: locationData.country,
            city: locationData.city,
            timezone: locationData.timezone
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating merchant:', createError);
          toast.error('Failed to create merchant profile');
        } else {
          console.log('✅ Merchant profile created:', newMerchant);
          setMerchant(newMerchant);
          toast.success(`🎉 Welcome, ${piUser.username}!`);
        }
      }
      
      console.log('✅ Authentication completed with merchant profile');
      
      // Trigger ad after successful authentication (non-blocking, per Pi Ads docs)
      const showLoginAd = async () => {
        if (!window.Pi?.Ads || typeof window.Pi.Ads.showAd !== 'function') {
          console.warn('⚠️ Pi Ads SDK not available');
          return;
        }
        try {
          const ready = typeof window.Pi.Ads.isAdReady === 'function' ? await window.Pi.Ads.isAdReady('rewarded') : null;
          if (ready && ready.ready === false && typeof window.Pi.Ads.requestAd === 'function') {
            const req = await window.Pi.Ads.requestAd('rewarded');
            if (req?.result === 'ADS_NOT_SUPPORTED') {
              toast.error('Please update Pi Browser to view ads.');
              return;
            }
            if (!req || req.result !== 'AD_LOADED') {
              console.warn('⚠️ Ad not available right now:', req);
              return;
            }
          }

          const showResp = await window.Pi.Ads.showAd('rewarded');
          if (showResp?.result === 'AD_REWARDED') {
            console.log('✅ Ad watched successfully:', showResp.adId);
            toast.success('Thanks for watching!');
          } else if (showResp?.result === 'ADS_NOT_SUPPORTED') {
            toast.error('Please update Pi Browser to view ads.');
          } else {
            console.log('ℹ️ Ad closed or not rewarded:', showResp);
          }
        } catch (adError) {
          console.warn('⚠️ Ad display error (non-critical):', adError);
        }
      };
      showLoginAd();
      
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      // Enhanced error logging for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      // Better error messages for specific error types
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      if (errorMessage.includes('timeout')) {
        toast.error('Authentication timed out. Please try again or restart Pi Browser.');
        console.log('🔄 Consider using demo mode if this persists');
      } else if (errorMessage.includes('postMessage') || errorMessage.includes('origin')) {
        toast.error('Communication error with Pi Browser. Please ensure you\'re using the official Pi Browser.');
      } else if (errorMessage.includes('Messaging promise')) {
        toast.error('Pi Network connection timeout. Please check your internet connection and try again.');
      } else if (errorMessage.includes('user_cancelled')) {
        toast.info('Authentication was cancelled');
      } else if (errorMessage.includes('network')) {
        toast.error('Network error - please check your connection');
      } else if (errorMessage.includes('pi_not_available')) {
        toast.error('Pi Network not available - please try again later');
      } else {
        toast.error(`Authentication failed: ${errorMessage}`);
      }
      
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pi_user');
    localStorage.removeItem('pi_access_token');
    setPiUser(null);
    setMerchant(null);
  };

  // Debug auth state changes
  useEffect(() => {
    console.log('Auth state changed:', {
      piUser: piUser?.username,
      merchant: merchant?.id,
      isLoading,
      isAuthenticated: !!piUser,
      isPiBrowser,
      isSdkReady
    });
  }, [piUser, merchant, isLoading, isPiBrowser, isSdkReady]);

  return (
    <AuthContext.Provider
      value={{
        piUser,
        merchant,
        isLoading,
        isAuthenticated: !!piUser,
        isPiBrowser,
        isSdkReady,
        isAdSupported,
        login,
        logout,
        triggerWelcomeAd,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
