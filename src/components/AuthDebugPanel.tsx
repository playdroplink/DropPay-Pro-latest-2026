import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, User, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Enhanced debug component to show current authentication state and test functionality
 */
export function AuthDebugPanel() {
  const { 
    piUser, 
    merchant, 
    isLoading, 
    isAuthenticated, 
    isPiBrowser, 
    isSdkReady, 
    isAdSupported,
    login,
    logout 
  } = useAuth();
  
  const [testing, setTesting] = useState(false);

  const testAuth = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing authentication...');
      await login();
      toast.success('Authentication test successful!');
    } catch (error) {
      console.error('Auth test failed:', error);
      toast.error('Authentication test failed: ' + (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('pi_user');
    localStorage.removeItem('pi_access_token');
    logout();
    toast.info('Authentication data cleared');
    setTimeout(() => window.location.reload(), 1000);
  };

  const debugInfo = {
    'Pi Browser Detected': isPiBrowser,
    'SDK Ready': isSdkReady,
    'Is Authenticated': isAuthenticated,
    'Is Loading': isLoading,
    'Ad Support': isAdSupported,
    'Pi SDK Available': !!window.Pi,
    'User ID': piUser?.uid || 'None',
    'Username': piUser?.username || 'None',
    'Merchant ID': merchant?.id || 'None',
    'Has Wallet': !!piUser?.wallet_address,
    'Stored User': !!localStorage.getItem('pi_user'),
    'Stored Token': !!localStorage.getItem('pi_access_token'),
    'User Agent': navigator.userAgent.includes('pi') ? 'Pi Browser' : 'Regular Browser',
    'Domain': window.location.hostname
  };

  const logAuthState = () => {
    console.log('=== AUTH DEBUG STATE ===');
    console.log('piUser:', piUser);
    console.log('merchant:', merchant);
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isPiBrowser:', isPiBrowser);
    console.log('isSdkReady:', isSdkReady);
    console.log('isAdSupported:', isAdSupported);
    console.log('localStorage pi_user:', localStorage.getItem('pi_user'));
    console.log('localStorage pi_access_token:', localStorage.getItem('pi_access_token'));
    console.log('window.Pi:', !!window.Pi);
    console.log('========================');
  };

  return (
    <Card className="mb-4 border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="text-gray-600 flex items-center gap-2">
          🔧 Authentication Debug Panel
          <Badge variant="outline" className="text-xs">DEV ONLY</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Loading:</span>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            ) : (
              <XCircle className="w-4 h-4 text-green-500" />
            )}
            <span>{isLoading ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Authenticated:</span>
            {isAuthenticated ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span>{isAuthenticated ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Pi Browser:</span>
            {isPiBrowser ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-yellow-500" />
            )}
            <span>{isPiBrowser ? 'Yes (Real)' : 'No (Demo)'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>SDK Ready:</span>
            {isSdkReady ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span>{isSdkReady ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Ads Supported:</span>
            {isAdSupported ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-yellow-500" />
            )}
            <span>{isAdSupported ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>User:</span>
            <span className="text-xs">{piUser?.username || 'None'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Merchant:</span>
            <span className="text-xs">{merchant?.id ? `ID: ${merchant.id.slice(0, 8)}...` : 'None'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Local Storage:</span>
            <span className="text-xs">{localStorage.getItem('pi_user') ? 'Has Data' : 'Empty'}</span>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={logAuthState} variant="outline">
            Log State to Console
          </Button>
          
          {!isAuthenticated && (
            <Button size="sm" onClick={login} disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Test Login'}
            </Button>
          )}
          
          {isAuthenticated && (
            <Button size="sm" onClick={logout} variant="outline">
              Logout
            </Button>
          )}
          
          <Button size="sm" onClick={clearAuthData} variant="destructive">
            Clear Auth Data
          </Button>
        </div>
        
        {piUser && (
          <div className="p-2 bg-muted rounded text-xs">
            <strong>User Data:</strong><br />
            ID: {piUser.uid}<br />
            Username: {piUser.username}<br />
            Wallet: {piUser.wallet_address || 'Not provided'}
          </div>
        )}
        
        {merchant && (
          <div className="p-2 bg-muted rounded text-xs">
            <strong>Merchant Data:</strong><br />
            ID: {merchant.id}<br />
            Pi Username: {merchant.pi_username}<br />
            Admin: {merchant.is_admin ? 'Yes' : 'No'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}