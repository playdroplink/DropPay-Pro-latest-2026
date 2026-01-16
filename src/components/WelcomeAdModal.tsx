import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Gift, Video, Zap, Coins, Loader2, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WelcomeAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeAdModal({ isOpen, onClose }: WelcomeAdModalProps) {
  const { piUser, merchant, isPiBrowser, isAdSupported } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);

  const handleWatchAd = async () => {
    if (!isPiBrowser || !isAdSupported || !window.Pi?.Ads) {
      toast.error('Ads not supported in current environment');
      return;
    }

    if (!piUser || !merchant) {
      toast.error('Authentication required');
      return;
    }

    setIsLoading(true);
    try {
      // Check if ad is ready
      let adReadyResponse = await window.Pi.Ads.isAdReady('rewarded');
      
      if (!adReadyResponse.ready) {
        console.log('Requesting new ad...');
        const requestResponse = await window.Pi.Ads.requestAd('rewarded');
        if (requestResponse.result !== 'AD_LOADED') {
          toast.error('Ad not available right now. Try again later.');
          setIsLoading(false);
          return;
        }
      }

      // Show the ad
      const showAdResponse = await window.Pi.Ads.showAd('rewarded');

      if (showAdResponse.result === 'AD_REWARDED' && showAdResponse.adId) {
        // Verify and grant reward through edge function
        const response = await supabase.functions.invoke('verify-ad-reward', {
          body: { 
            adId: showAdResponse.adId, 
            merchantId: merchant.id, 
            piUsername: piUser.username 
          },
        });

        if (response.data?.verified) {
          setAdCompleted(true);
          toast.success(`🎉 Welcome reward earned: ${response.data.reward_amount} Drop!`);
        } else {
          toast.info('Ad completed, but reward verification is pending');
        }
      } else if (showAdResponse.result === 'AD_CLOSED') {
        toast.info('Please watch the complete ad to earn rewards');
      } else {
        toast.info('Ad was not completed');
      }
    } catch (error) {
      console.error('Error watching welcome ad:', error);
      toast.error('An error occurred while showing the ad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleContinue = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-orange-500" />
              Welcome to DropPay!
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!adCompleted ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Get Your Welcome Reward!</h3>
                    <p className="text-sm text-muted-foreground">
                      Watch a quick ad to earn your first Drop tokens and support the Pi ecosystem.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border">
                <Coins className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">Earn π0.005 Drop</span>
                <Badge variant="secondary" className="ml-2">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant
                </Badge>
              </div>

              {isPiBrowser && isAdSupported ? (
                <div className="text-xs text-center text-muted-foreground">
                  <Video className="w-4 h-4 inline mr-1" />
                  Pi Network ads are available
                </div>
              ) : (
                <div className="text-xs text-center text-amber-600">
                  <Video className="w-4 h-4 inline mr-1" />
                  Demo mode - ads not available outside Pi Browser
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-green-700">Welcome Reward Earned!</h3>
                  <p className="text-sm text-muted-foreground">
                    You've successfully earned your first Drop tokens. Explore more features to earn additional rewards!
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Coins className="w-3 h-3 mr-1" />
                    π0.005 Drop Added
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {!adCompleted ? (
            <>
              <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
                Skip for now
              </Button>
              <Button 
                onClick={handleWatchAd} 
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Ad...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    {isPiBrowser ? 'Watch Ad' : 'Demo Watch Ad'}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}