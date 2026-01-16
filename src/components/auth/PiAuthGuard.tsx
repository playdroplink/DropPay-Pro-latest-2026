import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface PiAuthGuardProps {
  children: React.ReactNode;
  requireMerchant?: boolean;
}

export function PiAuthGuard({ children, requireMerchant = false }: PiAuthGuardProps) {
  const { piUser, merchant, isAuthenticated, isLoading, login, isPiBrowser } = useAuth();

  useEffect(() => {
    console.log('🔐 PiAuthGuard state:', {
      piUser: piUser?.username,
      merchant: merchant?.id,
      isAuthenticated,
      isLoading,
      requireMerchant,
      timestamp: new Date().toISOString()
    });
  }, [isLoading, isAuthenticated, piUser, merchant, requireMerchant]);

  const handlePiAuth = async () => {
    try {
      await login();
      toast.success('Successfully authenticated with Pi Network!');
    } catch (error: any) {
      console.error('Pi Authentication failed:', error);
      toast.error(error?.message || 'Authentication failed');
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show authentication prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">Authentication Required</CardTitle>
              <CardDescription className="mt-2">
                Sign in with your Pi Network account to access the dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Secure Pi Network Authentication
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                      Your data is protected with Pi Network's built-in security
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                      Instant Access
                    </h4>
                    <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                      One-click authentication with your Pi account
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePiAuth}
              className="w-full gradient-primary"
              size="lg"
            >
              <Shield className="w-4 h-4 mr-2" />
              Sign In with Pi Network
            </Button>

            {!isPiBrowser && (
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  Best experience in Pi Browser
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated users proceed without merchant requirement
  return <>{children}</>;
}