import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import dropPayLogo from '@/assets/droppay-logo.png';

const AUTHORIZED_ADMIN_USERNAME = 'Wain2020';

export default function AdminAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPiBrowserAvailable, setIsPiBrowserAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    // Check if Pi Browser SDK is available
    setIsPiBrowserAvailable(!!window.Pi);
  }, []);

  const checkAdminAuth = () => {
    try {
      const storedUser = localStorage.getItem('pi_user');
      if (storedUser) {
        const piUser = JSON.parse(storedUser);
        
        if (piUser.username === AUTHORIZED_ADMIN_USERNAME) {
          navigate('/admin/withdrawals');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handlePiLogin = async () => {
    if (!window.Pi) {
      toast.error('Pi Network SDK not available. Please open in Pi Browser.');
      return;
    }

    setIsLoading(true);
    try {
      const auth = await window.Pi.authenticate(
        ['username', 'payments', 'wallet_address'],
        (payment: any) => console.log('Incomplete payment found:', payment)
      );

      // Verify admin access - only allow specific authorized admin username
      if (auth.user.username !== AUTHORIZED_ADMIN_USERNAME) {
        toast.error(`Access denied. Only @${AUTHORIZED_ADMIN_USERNAME} can access the admin panel.`);
        setIsLoading(false);
        return;
      }

      // Store Pi user in localStorage
      localStorage.setItem('pi_user', JSON.stringify(auth.user));
      localStorage.setItem('pi_access_token', auth.accessToken);

      // Check/create merchant record with admin privileges
      try {
        const { data: existingMerchant, error: fetchError } = await supabase
          .from('merchants')
          .select('*')
          .eq('pi_user_id', auth.user.uid)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching merchant:', fetchError);
          throw new Error(`Failed to fetch merchant profile: ${fetchError.message}`);
        }

        if (existingMerchant) {
          // Update is_admin flag if needed
          if (!existingMerchant.is_admin) {
            const { error: updateError } = await supabase
              .from('merchants')
              .update({ is_admin: true })
              .eq('id', existingMerchant.id);
            
            if (updateError) {
              console.error('Error updating admin flag:', updateError);
              throw new Error(`Failed to set admin privileges: ${updateError.message}`);
            }
          }
          
          localStorage.setItem('merchant', JSON.stringify({ ...existingMerchant, is_admin: true }));
          console.log('✅ Admin merchant profile updated:', existingMerchant.id);
        } else {
          // Create new merchant as admin
          const { data: newMerchant, error: insertError } = await supabase
            .from('merchants')
            .insert({
              pi_user_id: auth.user.uid,
              pi_username: auth.user.username,
              is_admin: true,
              business_name: `${auth.user.username}'s Admin Account`,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating admin merchant:', insertError);
            
            // Handle specific database errors
            if (insertError.code === '42P10') {
              throw new Error('Database configuration error. Migration required.');
            } else if (insertError.code === '23505') {
              // Duplicate - try to fetch again
              const { data: retryMerchant } = await supabase
                .from('merchants')
                .select('*')
                .eq('pi_user_id', auth.user.uid)
                .maybeSingle();
              
              if (retryMerchant) {
                localStorage.setItem('merchant', JSON.stringify({ ...retryMerchant, is_admin: true }));
              } else {
                throw new Error('Failed to create or fetch admin profile');
              }
            } else {
              throw new Error(`Failed to create admin profile: ${insertError.message}`);
            }
          } else {
            localStorage.setItem('merchant', JSON.stringify(newMerchant));
            console.log('✅ New admin merchant created:', newMerchant.id);
          }
        }

        toast.success(`Welcome, Admin @${auth.user.username}!`);
        navigate('/admin/withdrawals');
      } catch (merchantError) {
        console.error('Merchant profile error:', merchantError);
        toast.error(
          merchantError instanceof Error 
            ? `Profile setup failed: ${merchantError.message}` 
            : 'Failed to set up admin profile. Please contact support.'
        );
      }
    } catch (error: any) {
      console.error('Pi authentication error:', error);
      toast.error(error.message || 'Failed to authenticate with Pi Network');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 overflow-x-hidden">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <img 
              src={dropPayLogo}
              alt="DropPay Admin Logo" 
              className="w-16 h-16 rounded-2xl object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-3xl">Admin Portal</CardTitle>
            <CardDescription className="mt-2">
              Sign in with your Pi Network account to access the admin dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isPiBrowserAvailable ? (
            <Button
              onClick={handlePiLogin}
              className="w-full gradient-primary"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In with Pi Network
                </>
              )}
            </Button>
          ) : (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                Pi Browser Required
              </h4>
              <p className="text-xs text-red-800 dark:text-red-200 mb-3">
                This page must be accessed through the Pi Browser to authenticate with your Pi Network account.
              </p>
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  const piAppUrl = 'pi://app.droppay.com/admin/auth';
                  window.location.href = piAppUrl;
                }}
              >
                Open in Pi Browser
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => navigate('/')}
              className="text-sm"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}