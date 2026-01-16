import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Play, Coins, Eye, Globe } from 'lucide-react';
import { PiNetworkValidator, piValidator } from '@/lib/piNetworkValidator';
import { toast } from 'sonner';

export function PiNetworkDebugPanel() {
  const { piUser, isPiBrowser, isSdkReady, isAdSupported, isAuthenticated } = useAuth();
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const results = await piValidator.runFullValidation();
      setValidationResults(results);
      
      if (results.overall) {
        toast.success('✅ All Pi Network integrations validated!');
      } else {
        toast.warning('⚠️ Some Pi Network features need attention');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('❌ Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const testPayment = async () => {
    if (!isPiBrowser || !window.Pi) {
      toast.error('Pi Browser required for payment testing');
      return;
    }

    try {
      toast.info('💳 Initiating test payment...');
      
      const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
      // Never log sandbox mode value for security
      await window.Pi.init({ version: '2.0', sandbox: sandboxMode });
      
      const paymentData = {
        amount: 0.01,
        memo: 'DropPay Integration Test',
        metadata: {
          test: true,
          platform: 'DropPay',
          timestamp: Date.now()
        }
      };

      const callbacks = {
        onReadyForServerApproval: (paymentId: string) => {
          toast.success(`✅ Payment approved: ${paymentId}`);
        },
        onCancel: () => {
          toast.info('Payment cancelled');
        },
        onError: (error: any) => {
          toast.error(`Payment error: ${error.message}`);
        }
      };

      await window.Pi.createPayment(paymentData, callbacks);
    } catch (error) {
      console.error('Payment test error:', error);
      toast.error('Payment test failed');
    }
  };

  const testAd = async () => {
    if (!isAdSupported || !window.Pi?.Ads) {
      toast.error('Ad Network not supported');
      return;
    }

    try {
      toast.info('🎯 Testing ad network...');
      
      const adReady = await window.Pi.Ads.isAdReady('rewarded');
      
      if (!adReady.ready) {
        const request = await window.Pi.Ads.requestAd('rewarded');
        if (request.result !== 'AD_LOADED') {
          toast.warning('No ad available right now');
          return;
        }
      }

      const adResult = await window.Pi.Ads.showAd('rewarded');
      
      if (adResult.result === 'AD_REWARDED') {
        toast.success(`✅ Ad completed! ID: ${adResult.adId}`);
      } else {
        toast.info(`Ad result: ${adResult.result}`);
      }
    } catch (error) {
      console.error('Ad test error:', error);
      toast.error('Ad test failed');
    }
  };

  const StatusIcon = ({ success }: { success: boolean | undefined }) => {
    if (success === undefined) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return success ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const envConfig = PiNetworkValidator.checkEnvironmentConfig();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Pi Network Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <StatusIcon success={isPiBrowser} />
              <p className="text-sm mt-2">Pi Browser</p>
              <Badge variant={isPiBrowser ? "default" : "secondary"}>
                {isPiBrowser ? 'Connected' : 'Not Detected'}
              </Badge>
            </div>
            
            <div className="text-center">
              <StatusIcon success={isSdkReady} />
              <p className="text-sm mt-2">SDK Ready</p>
              <Badge variant={isSdkReady ? "default" : "secondary"}>
                {isSdkReady ? 'Ready' : 'Loading'}
              </Badge>
            </div>
            
            <div className="text-center">
              <StatusIcon success={isAuthenticated} />
              <p className="text-sm mt-2">Authentication</p>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
            </div>
            
            <div className="text-center">
              <StatusIcon success={isAdSupported} />
              <p className="text-sm mt-2">Ad Network</p>
              <Badge variant={isAdSupported ? "default" : "secondary"}>
                {isAdSupported ? 'Supported' : 'Not Available'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="ads">Ad Network</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Environment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <StatusIcon success={envConfig.valid} />
                <AlertDescription>
                  {envConfig.valid ? 
                    'All configurations properly set for mainnet production' : 
                    `Configuration issues found: ${envConfig.issues.join(', ')}`
                  }
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">API Key</p>
                  <Badge variant={envConfig.config.apiKey ? "default" : "destructive"}>
                    {envConfig.config.apiKey ? 'Configured' : 'Missing'}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold">Validation Key</p>
                  <Badge variant={envConfig.config.validationKey ? "default" : "destructive"}>
                    {envConfig.config.validationKey ? 'Configured' : 'Missing'}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold">Network Mode</p>
                  <Badge variant={envConfig.config.mainnetMode ? "default" : "destructive"}>
                    {envConfig.config.mainnetMode ? 'Mainnet' : 'Not Mainnet'}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold">Sandbox Mode</p>
                  <Badge variant={!envConfig.config.sandboxMode ? "default" : "destructive"}>
                    {!envConfig.config.sandboxMode ? 'Disabled' : 'Enabled'}
                  </Badge>
                </div>
              </div>

              <Button onClick={runValidation} disabled={isValidating}>
                <Play className="w-4 h-4 mr-2" />
                {isValidating ? 'Validating...' : 'Run Full Validation'}
              </Button>

              {validationResults && (
                <Alert>
                  <StatusIcon success={validationResults.overall} />
                  <AlertDescription>
                    Validation completed. Overall status: {validationResults.overall ? 'PASSED' : 'FAILED'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthenticated && piUser ? (
                <div className="space-y-2">
                  <p><strong>User ID:</strong> {piUser.uid}</p>
                  <p><strong>Username:</strong> {piUser.username}</p>
                  <p><strong>Wallet:</strong> {piUser.wallet_address ? 'Connected' : 'Not Connected'}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Not authenticated</p>
              )}

              {validationResults?.authentication && (
                <Alert>
                  <StatusIcon success={validationResults.authentication.success} />
                  <AlertDescription>
                    Authentication test: {validationResults.authentication.success ? 'PASSED' : 'FAILED'}
                    {validationResults.authentication.error && ` - ${validationResults.authentication.error}`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testPayment} disabled={!isPiBrowser}>
                <Coins className="w-4 h-4 mr-2" />
                Test Payment (0.01 PI)
              </Button>

              {!isPiBrowser && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Payment testing requires Pi Browser. Copy this URL and open in Pi Browser to test.
                  </AlertDescription>
                </Alert>
              )}

              {validationResults?.payments && (
                <Alert>
                  <StatusIcon success={validationResults.payments.success} />
                  <AlertDescription>
                    Payment test: {validationResults.payments.success ? 'PASSED' : 'FAILED'}
                    {validationResults.payments.error && ` - ${validationResults.payments.error}`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>Ad Network Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testAd} disabled={!isAdSupported}>
                <Eye className="w-4 h-4 mr-2" />
                Test Rewarded Ad
              </Button>

              {!isAdSupported && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Ad Network not supported on this device or Pi Browser version.
                  </AlertDescription>
                </Alert>
              )}

              {validationResults?.adNetwork && (
                <Alert>
                  <StatusIcon success={validationResults.adNetwork.success} />
                  <AlertDescription>
                    Ad Network test: {validationResults.adNetwork.success ? 'PASSED' : 'FAILED'}
                    {validationResults.adNetwork.error && ` - ${validationResults.adNetwork.error}`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PiNetworkDebugPanel;