import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PiDebug() {
  const [sdkStatus, setSdkStatus] = useState<any>({});
  const [authStatus, setAuthStatus] = useState<string>('Not tested');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const checkSDK = async () => {
      addLog('🔍 Checking Pi SDK availability...');
      
      const status = {
        windowPi: typeof window.Pi !== 'undefined',
        sdkUrl: (document.querySelector('script[src*="pi-sdk"]') as HTMLScriptElement)?.src,
        userAgent: navigator.userAgent.substring(0, 50),
        hostname: window.location.hostname,
        timestamp: new Date().toISOString()
      };

      setSdkStatus(status);
      addLog(`✅ SDK Check: ${JSON.stringify(status)}`);

      if (window.Pi) {
        addLog('📍 window.Pi is available');
        addLog(`📍 Methods: authenticate=${!!window.Pi.authenticate}, createPayment=${!!window.Pi.createPayment}`);
      } else {
        addLog('❌ window.Pi is NOT available');
      }
    };

    checkSDK();
  }, []);

  const testSDKInit = async () => {
    try {
      addLog('🔧 Testing Pi.init()...');
      const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
      addLog(`📝 Sandbox mode from env: ${sandboxMode}`);

      if (!window.Pi) {
        addLog('❌ window.Pi not available');
        return;
      }

      addLog(`🔧 Initializing Pi SDK with sandbox: ${sandboxMode}`);
      window.Pi.init({ 
        version: '2.0', 
        sandbox: sandboxMode 
      });
      
      addLog('✅ Pi.init() called successfully');
      
      // Check features
      try {
        const features = await window.Pi.nativeFeaturesList?.();
        addLog(`✅ Native features: ${features?.join(', ')}`);
      } catch (e) {
        addLog(`⚠️ Could not get native features: ${e}`);
      }
    } catch (error) {
      addLog(`❌ Pi.init() error: ${error}`);
    }
  };

  const testAuthenticate = async () => {
    try {
      addLog('🔐 Testing Pi.authenticate()...');
      
      if (!window.Pi?.authenticate) {
        addLog('❌ Pi.authenticate not available');
        return;
      }

      const scopes = ['username', 'payments', 'wallet_address'];
      addLog(`📋 Requesting scopes: ${scopes.join(', ')}`);

      const result = await Promise.race([
        window.Pi.authenticate(scopes, (payment) => {
          addLog(`⚠️ Incomplete payment callback: ${payment?.identifier}`);
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout after 30s')), 30000)
        )
      ]);

      addLog(`✅ Authentication successful`);
      addLog(`✅ User: ${(result as any).user?.username}`);
      addLog(`✅ UID: ${(result as any).user?.uid}`);
      addLog(`✅ Has wallet: ${!!(result as any).user?.wallet_address}`);
      addLog(`✅ Has token: ${!!(result as any).accessToken}`);
      
      setAuthStatus('✅ Success');
    } catch (error: any) {
      addLog(`❌ Authentication error: ${error?.message || error}`);
      setAuthStatus(`❌ Failed: ${error?.message}`);
    }
  };

  const testPaymentCreation = async () => {
    try {
      addLog('💰 Testing Pi.createPayment()...');
      
      if (!window.Pi?.createPayment) {
        addLog('❌ Pi.createPayment not available');
        return;
      }

      let paymentReceived = false;

      window.Pi.createPayment({
        amount: 0.1,
        memo: 'Debug payment test',
        metadata: { test: true }
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          addLog(`✅ Payment ready for approval: ${paymentId}`);
          paymentReceived = true;
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          addLog(`✅ Payment ready for completion: ${paymentId}, txid: ${txid}`);
        },
        onCancel: (paymentId: string) => {
          addLog(`❌ Payment cancelled: ${paymentId}`);
        },
        onError: (error: Error, payment?: any) => {
          addLog(`❌ Payment error: ${error?.message}`);
        }
      });

      addLog('✅ Pi.createPayment() called');
      
      // Wait a bit to see if we get the onReadyForServerApproval callback
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (!paymentReceived) {
        addLog('⚠️ No payment approval callback received after 3 seconds');
      }
    } catch (error: any) {
      addLog(`❌ Payment creation error: ${error?.message || error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Pi SDK Debug</h1>

        {/* SDK Status */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">SDK Status</h2>
          <div className="space-y-2 text-sm font-mono text-slate-300">
            <div>window.Pi available: <span className={sdkStatus.windowPi ? 'text-green-400' : 'text-red-400'}>{sdkStatus.windowPi ? '✅ Yes' : '❌ No'}</span></div>
            <div>Environment: {import.meta.env.VITE_PI_SANDBOX_MODE === 'true' ? '🧪 Sandbox' : '🌐 Mainnet'}</div>
            <div>Hostname: {sdkStatus.hostname}</div>
            <div>User Agent: {sdkStatus.userAgent}...</div>
          </div>
        </Card>

        {/* Auth Status */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Authentication Status</h2>
          <div className="text-sm font-mono p-4 bg-slate-900 rounded border border-slate-700 text-slate-300 mb-4">
            {authStatus}
          </div>
          <Button 
            onClick={testAuthenticate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            🔐 Test Authenticate
          </Button>
        </Card>

        {/* Test Buttons */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">SDK Tests</h2>
          <div className="space-y-3">
            <Button 
              onClick={testSDKInit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              🔧 Test Pi.init()
            </Button>
            <Button 
              onClick={testPaymentCreation}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              💰 Test Payment Creation
            </Button>
            <Button 
              onClick={() => {
                setLogs([]);
                setSdkStatus({});
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              🗑️ Clear Logs
            </Button>
          </div>
        </Card>

        {/* Logs */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Logs</h2>
          <div className="h-64 overflow-y-auto bg-slate-900 rounded border border-slate-700 p-4 font-mono text-xs text-slate-300 space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-500">No logs yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap break-words">
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Info */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Info</h2>
          <div className="text-sm text-slate-300 space-y-2">
            <p><strong>Sandbox Mode:</strong> {import.meta.env.VITE_PI_SANDBOX_MODE === 'true' ? '✅ Enabled' : '❌ Disabled'}</p>
            <p><strong>Network:</strong> {import.meta.env.VITE_PI_NETWORK}</p>
            <p><strong>For sandbox testing:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-slate-400">
              <li>Use Pi Browser or sandbox.minepi.com</li>
              <li>Configure your dev URL in Developer Portal</li>
              <li>Check console for detailed logs</li>
              <li>Ensure window.Pi is available before auth</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
