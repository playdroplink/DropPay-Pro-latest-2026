import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Video, Gift, AlertCircle, CheckCircle2, Loader2, Zap, TrendingUp, LogIn, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface AdReward {
  id: string;
  ad_type: string;
  ad_id: string;
  reward_amount: number;
  status: string;
  created_at: string;
}

export default function WatchAds() {
  const { piUser, merchant, isPiBrowser, isAuthenticated, login } = useAuth();
  const [isAdSupported, setIsAdSupported] = useState(false);
  const [isCheckingSupport, setIsCheckingSupport] = useState(true);
  const [isAdReady, setIsAdReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [rewardHistory, setRewardHistory] = useState<AdReward[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [localPiUser, setLocalPiUser] = useState<{ uid: string; username: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('pi_user');
    if (storedUser) {
      try {
        setLocalPiUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored pi_user:', e);
      }
    }

    if (isPiBrowser) {
      initPiSdk();
    } else {
      setIsCheckingSupport(false);
    }
  }, [isPiBrowser]);

  useEffect(() => {
    if (merchant) {
      fetchRewardHistory();
    }
  }, [merchant]);

  const initPiSdk = async () => {
    setIsCheckingSupport(true);
    try {
      const Pi = (window as any).Pi;
      if (Pi) {
        await Pi.init({ version: '2.0', sandbox: false });
        const features = await Pi.nativeFeaturesList();
        const supported = features.includes('ad_network');
        setIsAdSupported(supported);
        if (supported) checkIfAdReady();
      }
    } catch (error) {
      console.error('Error initializing Pi SDK:', error);
    } finally {
      setIsCheckingSupport(false);
    }
  };

  const checkIfAdReady = async () => {
    try {
      const Pi = (window as any).Pi;
      if (Pi?.Ads) {
        const response = await Pi.Ads.isAdReady('rewarded');
        setIsAdReady(response.ready);
      }
    } catch (error) {
      console.error('Error checking ad readiness:', error);
    }
  };

  const fetchRewardHistory = async () => {
    if (!merchant) return;
    try {
      const { data, error } = await supabase
        .from('ad_rewards')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRewardHistory(data || []);
      const total = data?.reduce((sum: number, reward: AdReward) => {
        return reward.status === 'granted' ? sum + reward.reward_amount : sum;
      }, 0) || 0;
      setTotalEarned(total);
    } catch (error) {
      console.error('Error fetching reward history:', error);
    }
  };

  const handlePiAuth = async () => {
    if (!isPiBrowser) {
      toast.error('Please open in Pi Browser');
      return;
    }

    setIsAuthenticating(true);
    try {
      await login();
      const Pi = (window as any).Pi;
      const features = await Pi?.nativeFeaturesList?.();
      const supported = Array.isArray(features) && features.includes('ad_network');
      setIsAdSupported(!!supported);
      if (supported) checkIfAdReady();
      const storedUser = localStorage.getItem('pi_user');
      if (storedUser) {
        setLocalPiUser(JSON.parse(storedUser));
      }
      toast.success('Authenticated with Pi');
    } catch (error: any) {
      console.error('Pi authentication error:', error);
      toast.error(error?.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleWatchAd = async () => {
    const currentUser = piUser || localPiUser;
    if (!currentUser) {
      toast.error('Please authenticate first');
      return;
    }
    
    if (!merchant) {
      toast.error('Merchant profile not found. Please refresh and try again.');
      return;
    }

    const Pi = (window as any).Pi;
    if (!Pi?.Ads) {
      toast.error('Ads are not available');
      return;
    }

    setIsLoading(true);
    try {
      let adReadyResponse = await Pi.Ads.isAdReady('rewarded');
      
      if (!adReadyResponse.ready) {
        toast.info('Loading ad... Please wait');
        const requestResponse = await Pi.Ads.requestAd('rewarded');
        if (requestResponse.result !== 'AD_LOADED') {
          toast.error('Ad unavailable. Try again later');
          return;
        }
      }

      const showAdResponse = await Pi.Ads.showAd('rewarded');

      if (showAdResponse.result === 'AD_REWARDED' && showAdResponse.adId) {
        const response = await supabase.functions.invoke('verify-ad-reward', {
          body: { adId: showAdResponse.adId, merchantId: merchant.id, piUsername: currentUser.username },
        });
        if (response.data?.verified) {
          toast.success(`🎉 You earned ${response.data.reward_amount} Drop!`);
          fetchRewardHistory();
        }
      } else if (showAdResponse.result === 'AD_CLOSED') {
        toast.info('Watch the complete ad to earn rewards');
      }
    } catch (error) {
      console.error('Error watching ad:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
      checkIfAdReady();
    }
  };

  const isUserAuthenticated = isAuthenticated || localPiUser;

  if (isCheckingSupport) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Watch Ads & Earn Drop</h1>
            <p className="text-muted-foreground mt-1">Watch video ads to earn Drop rewards</p>
          </div>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                  <p className="text-4xl font-bold text-primary">{totalEarned.toFixed(4)} Drop</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!isPiBrowser && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Open in Pi Browser to watch ads.
              <a href="https://minepi.com/Wain2020" target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                Download Pi Browser <ExternalLink className="w-3 h-3 inline" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        {isPiBrowser && !isUserAuthenticated && (
          <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
            <CardContent className="pt-6 text-center">
              <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Authenticate with Pi Network to watch ads.</p>
              <Button onClick={handlePiAuth} disabled={isAuthenticating} className="bg-primary">
                {isAuthenticating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogIn className="w-4 h-4 mr-2" />}
                {isAuthenticating ? 'Authenticating...' : 'Authenticate with Pi'}
              </Button>
            </CardContent>
          </Card>
        )}

        {isPiBrowser && isUserAuthenticated && isAdSupported && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Watch Rewarded Ad</CardTitle>
                  <CardDescription>Earn Drop by watching short video ads</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {localPiUser && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Logged in as @{localPiUser.username}
                </div>
              )}
              <Button onClick={handleWatchAd} disabled={isLoading || !isAdReady} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 h-12 text-lg">
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Video className="w-5 h-5 mr-2" />}
                {isLoading ? 'Loading...' : isAdReady ? 'Watch Ad & Earn Drop' : 'Loading ad...'}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
            <CardDescription>Your reward history from watching ads</CardDescription>
          </CardHeader>
          <CardContent>
            {rewardHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No earnings yet. Start watching ads!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewardHistory.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      {reward.status === 'granted' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
                      <div>
                        <p className="font-medium text-foreground">Rewarded Ad</p>
                        <p className="text-xs text-muted-foreground">{new Date(reward.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">+{reward.reward_amount.toFixed(4)} Drop</p>
                      <Badge variant={reward.status === 'granted' ? 'default' : 'secondary'} className="text-xs">{reward.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
