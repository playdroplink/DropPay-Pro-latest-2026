import { useEffect, useState, type ComponentType } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Check, Loader2, Zap, TrendingUp, Shield, Sparkles, Star, HelpCircle, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  link_limit: number | null;
  platform_fee_percent: number;
  features: string[];
}

type RawSubscriptionPlan = Omit<SubscriptionPlan, 'features'> & {
  features: SubscriptionPlan['features'] | string | null;
};

const planIcons: Record<string, ComponentType<{ className?: string }>> = {
  Free: Zap,
  Basic: Star,
  Pro: TrendingUp,
  Enterprise: Shield,
};

// Hardcoded plans to display immediately
const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Free',
    amount: 0,
    link_limit: 1,
    platform_fee_percent: 0,
    features: ['Free payment type only', 'Basic analytics', 'No platform fee', 'Community support'],
  },
  {
    id: '2',
    name: 'Basic',
    amount: 10,
    link_limit: 5,
    platform_fee_percent: 2,
    features: ['Free + One-time payments', 'Basic analytics', '2% platform fee (for maintenance & future features)', 'Email support'],
  },
  {
    id: '3',
    name: 'Pro',
    amount: 20,
    link_limit: 10,
    platform_fee_percent: 2,
    features: ['Free + One-time + Recurring payments', 'Advanced analytics', '2% platform fee (for maintenance & future features)', 'Priority support', 'Custom branding', 'Tracking links'],
  },
  {
    id: '4',
    name: 'Enterprise',
    amount: 50,
    link_limit: null,
    platform_fee_percent: 2,
    features: ['All payment types (Free + One-time + Recurring + Donations)', 'Full analytics suite', '2% platform fee (for maintenance & future features)', '24/7 Priority support', 'Custom integrations', 'Dedicated account manager'],
  },
];

export default function Subscription() {
  const { isAuthenticated, isLoading, merchant, piUser, isPiBrowser, login } = useAuth();
  const { plan: currentPlan, isFreePlan, refetch: refetchSubscription } = useSubscription();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Don't automatically redirect - show auth prompt instead
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     navigate('/auth');
  //   }
  // }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const parseFeatures = (value: RawSubscriptionPlan['features']): string[] => {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const resolvePlanByName = async (planName: string): Promise<SubscriptionPlan | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from('subscription_plans')
        .select('id, name, amount, link_limit, platform_fee_percent, features')
        .eq('name', planName)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      const typed = data as RawSubscriptionPlan;
      return {
        id: typed.id,
        name: typed.name,
        amount: Number(typed.amount),
        link_limit: typed.link_limit,
        platform_fee_percent: Number(typed.platform_fee_percent),
        features: parseFeatures(typed.features),
      };
    } catch {
      return null;
    }
  };

  const resolveMerchantId = async (): Promise<string | null> => {
    if (merchant?.id) return merchant.id;

    let uid: string | undefined = piUser?.uid;
    let username: string | undefined = piUser?.username;
    const storedUser = localStorage.getItem('pi_user');

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        uid = uid || parsed?.uid;
        username = username || parsed?.username;
      } catch (error) {
        console.error('Failed to parse stored pi_user:', error);
      }
    }

    try {
      if (uid) {
        const { data } = await supabase
          .from('merchants')
          .select('id')
          .eq('pi_user_id', uid)
          .maybeSingle();
        if (data?.id) return data.id;
      }

      if (username) {
        const { data } = await supabase
          .from('merchants')
          .select('id')
          .eq('pi_username', username)
          .maybeSingle();
        if (data?.id) return data.id;
      }
    } catch (error) {
      console.error('Error resolving merchant ID:', error);
    }

    return null;
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    setPlansError(null);

    try {
      const { data, error } = await (supabase as any)
        .from('subscription_plans')
        .select('id, name, amount, link_limit, platform_fee_percent, features')
        .eq('is_active', true)
        .order('amount', { ascending: true });

      if (error) {
        throw error;
      }

      if (Array.isArray(data) && data.length > 0) {
        const mappedPlans = (data as RawSubscriptionPlan[]).map((plan) => ({
          id: plan.id,
          name: plan.name,
          amount: Number(plan.amount),
          link_limit: plan.link_limit,
          platform_fee_percent: Number(plan.platform_fee_percent),
          features: parseFeatures(plan.features),
        }));
        setPlans(mappedPlans);
        return;
      }

      setPlans(DEFAULT_PLANS);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setPlansError('Using fallback plans. Database plans could not be loaded.');
      setPlans(DEFAULT_PLANS);
    } finally {
      setPlansLoading(false);
    }
  };

  const handlePiAuth = async () => {
    if (!isPiBrowser) {
      toast.error('Please open in Pi Browser to authenticate');
      return;
    }

    setIsAuthenticating(true);
    try {
      await login();
      toast.success('Successfully authenticated with Pi Network!');
    } catch (error: any) {
      console.error('Pi authentication error:', error);
      toast.error(error?.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const createSubscriptionPaymentLink = async (selectedPlan: SubscriptionPlan) => {
    const merchantId = await resolveMerchantId();

    if (!merchantId) {
      toast.error('No merchant profile found. Please sign in again.');
      return null;
    }
    
    console.log('💳 Creating subscription payment link for merchant:', merchantId);

    try {
      // Create a payment link for this subscription plan
      const insertData = {
        merchant_id: merchantId,
        title: `${selectedPlan.name} Plan Subscription - DropPay`,
        description: `Monthly subscription to DropPay ${selectedPlan.name} plan with ${selectedPlan.link_limit ? `${selectedPlan.link_limit} payment links` : 'unlimited payment links'} and all premium features.`,
        amount: selectedPlan.amount,
        slug: `droppay-${selectedPlan.name.toLowerCase()}-plan-${Date.now()}`,
        is_active: true,
        payment_type: 'recurring',
        pricing_type: 'recurring',
        redirect_url: window.location.origin + '/dashboard/subscription?upgraded=' + selectedPlan.name,
        cancel_redirect_url: window.location.origin + '/dashboard/subscription?cancelled=true',
        checkout_image: null,
        content_file: null,
        access_type: 'instant',
        expire_access: 'never',
        stock: null,
        is_unlimited_stock: true,
        show_on_store: false,
        free_trial: false,
        enable_waitlist: false,
        ask_questions: false,
        checkout_questions: [],
        internal_name: `DropPay ${selectedPlan.name} Subscription`,
      };

      const { data, error } = await supabase
        .from('payment_links')
        .insert([insertData])
        .select('slug')
        .single();

      if (error) {
        console.error('Error creating subscription payment link:', error);
        throw error;
      }

      return data.slug;
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      toast.error('Failed to create subscription link');
      return null;
    }
  };

  const handleUpgradeWithDropPay = async (selectedPlan: SubscriptionPlan) => {
    // Check authentication status - use piUser or localStorage fallback
    const storedUser = localStorage.getItem('pi_user');
    const hasPiUser = piUser || storedUser;
    const hasMerchant = !!merchant;
    
    console.log('🔐 Auth check:', { 
      isAuthenticated, 
      hasPiUser: !!hasPiUser, 
      hasMerchant: !!hasMerchant,
      piUser,
      merchant 
    });
    
    if (!hasPiUser) {
      console.log('❌ Not authenticated, triggering Pi auth...');
      toast.error('Please sign in with Pi Network first');
      if (isPiBrowser) {
        await handlePiAuth();
      }
      return;
    }

    // For paid plans, create a payment link and redirect to it
    setIsProcessing(true);
    setLoadingPlanId(selectedPlan.id);
    
    try {
      const resolvedPlan = await resolvePlanByName(selectedPlan.name);
      if (!resolvedPlan) {
        throw new Error(`Could not load "${selectedPlan.name}" plan from database`);
      }

      toast.info('Creating subscription payment link...');
      
      const paymentSlug = await createSubscriptionPaymentLink(resolvedPlan);
      
      if (!paymentSlug) {
        throw new Error('Failed to create payment link');
      }

      toast.success('Redirecting to payment page...');
      
      // Redirect to the payment page
      window.location.href = `/pay/${paymentSlug}`;
    } catch (error: any) {
      console.error('Error creating subscription payment:', error);
      toast.error(error.message || 'Failed to create subscription payment');
      setIsProcessing(false);
      setLoadingPlanId(null);
    }
  };

  const handleUpgrade = async (selectedPlan: SubscriptionPlan) => {
    // Check authentication status - use piUser or localStorage fallback
    let currentPiUser = piUser;
    let currentMerchant = merchant;
    
    // Fallback to localStorage if context not available
    if (!currentPiUser) {
      const storedUser = localStorage.getItem('pi_user');
      if (storedUser) {
        try {
          currentPiUser = JSON.parse(storedUser);
          console.log('✅ Using piUser from localStorage:', currentPiUser);
        } catch (e) {
          console.error('Failed to parse stored pi_user:', e);
        }
      }
    }
    
    console.log('🔐 Auth check for Pi payment:', { 
      isAuthenticated, 
      hasPiUser: !!currentPiUser, 
      hasMerchant: !!currentMerchant,
      piUserUsername: currentPiUser?.username,
      merchantId: currentMerchant?.id || currentPiUser?.uid
    });
    
    if (!currentPiUser) {
      console.log('❌ Not authenticated, triggering Pi auth...');
      toast.error('Please sign in with Pi Network first');
      if (isPiBrowser) {
        await handlePiAuth();
      }
      return;
    }

    // Use merchant or fallback to piUser uid
    const merchantId = await resolveMerchantId();
    const piUsername = currentPiUser.username;
    const resolvedPlan = await resolvePlanByName(selectedPlan.name);
    if (!merchantId) {
      toast.error('No merchant profile found. Please sign in again.');
      return;
    }
    if (!resolvedPlan) {
      toast.error(`Could not load "${selectedPlan.name}" plan from database`);
      return;
    }
    const actionPlan = resolvedPlan;
    
    console.log('🔐 User authenticated:', {
      username: piUsername,
      merchantId: merchantId,
      plan: actionPlan.name
    });

    // Free plan - just create/update subscription directly
    if (actionPlan.amount === 0) {
      try {
        setIsProcessing(true);
        setLoadingPlanId(actionPlan.id);

        console.log('💳 Creating free subscription:', { merchantId, piUsername, plan: actionPlan.name });

        // Upsert subscription record for Free plan
        console.log('📦 Activating free subscription:', {
          merchantId,
          piUsername,
          planId: actionPlan.id,
          planName: actionPlan.name
        });
        
        const { error: upsertError } = await (supabase as any)
          .from('user_subscriptions')
          .upsert({
            merchant_id: merchantId,
            pi_username: piUsername,
            plan_id: actionPlan.id,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years for free plan
            last_payment_at: new Date().toISOString(),
          }, {
            onConflict: 'merchant_id',
          });

        if (upsertError) {
          console.error('❌ Free subscription activation error:', upsertError);
          throw upsertError;
        }

        console.log('✅ Free subscription activated successfully');
        toast.success(`Successfully switched to ${actionPlan.name} plan!`);
        await refetchSubscription();
      } catch (error: any) {
        console.error('Error updating subscription:', error);
        toast.error(error.message || 'Failed to update subscription');
      } finally {
        setIsProcessing(false);
        setLoadingPlanId(null);
      }
      return;
    }

    if (!isPiBrowser) {
      toast.error('Please open this page in Pi Browser to upgrade');
      return;
    }

    setIsProcessing(true);
    setLoadingPlanId(actionPlan.id);

    try {
      // Re-authenticate with Pi Network for payment with required scopes
      const Pi = (window as any).Pi;
      const scopes = ['username', 'payments', 'wallet_address'];
      
      console.log('🔐 Authenticating with Pi Network for payment...');
      console.log('⏳ Scopes requested:', scopes);
      
      toast.info('Authenticating with Pi Network...');
      
      const authResult = await Pi.authenticate(scopes, (payment: any) => {
        console.log('💳 Payment callback received:', payment);
      });

      console.log('✅ Authentication result:', authResult);

      if (!authResult || !authResult.user) {
        toast.error('Pi Network authentication failed. Please try again.');
        setIsProcessing(false);
        setLoadingPlanId(null);
        return;
      }

      toast.success(`Authenticated as @${authResult.user.username}`);

      // Create payment for subscription
      const paymentData = {
        amount: actionPlan.amount,
        memo: `Upgrade to ${actionPlan.name} Plan - DropPay Subscription`,
        metadata: {
          plan_id: actionPlan.id,
          merchant_id: merchantId,
          pi_username: piUsername,
          type: 'subscription_upgrade',
        },
      };

      console.log('Creating payment:', paymentData);
      
      // Ensure Pi SDK is initialized for production mainnet
      console.log('🔧 Initializing Pi SDK for mainnet payment...');
      const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
      console.log('🔧 Initializing Pi SDK with sandbox:', sandboxMode);
      await Pi.init({ version: '2.0', sandbox: sandboxMode });

      await Pi.createPayment(paymentData, {
          onReadyForServerApproval: async (paymentId: string) => {
          console.log('Payment ready for approval:', paymentId);
          
          try {
            // Call backend to approve payment
            const approvalResult = await supabase.functions.invoke('approve-payment', {
                body: { paymentId, isSubscription: true },
            });

            if (approvalResult.error) throw approvalResult.error;
            console.log('✅ Payment approved:', approvalResult.data);
          } catch (error) {
            console.error('❌ Approval error:', error);
            throw error;
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('Payment ready for completion:', paymentId, txid);
          
          try {
            // Complete payment and update subscription
            const completionResult = await supabase.functions.invoke('complete-payment', {
              body: {
                paymentId,
                txid,
                isSubscription: true,
                payerUsername: piUsername,
                merchantId: merchantId,
                planId: actionPlan.id,
                paymentType: `Subscription: ${actionPlan.name}`,
                amount: actionPlan.amount,
              },
            });

            if (completionResult.error) throw completionResult.error;
            
            console.log('✅ Payment completed:', completionResult.data);

            console.log('✅ Subscription activation handled by backend:', actionPlan.name);
            toast.success(`Successfully upgraded to ${actionPlan.name} plan! 🎉`);
            
            // Refetch subscription data to update dashboard
            await refetchSubscription();
            
            // Reset state and close modal
            setIsProcessing(false);
            setLoadingPlanId(null);
            
            // Reload dashboard after brief delay
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (error) {
            console.error('❌ Completion error:', error);
            throw error;
          }
        },
        onCancel: () => {
          console.log('Payment cancelled');
          toast.info('Payment cancelled');
          setIsProcessing(false);
          setLoadingPlanId(null);
        },
        onError: (error: any) => {
          console.error('❌ Payment error:', error);
          setIsProcessing(false);
          setLoadingPlanId(null);
          toast.error('Payment failed: ' + (error?.message || 'Unknown error'));
        },
      });

    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to upgrade plan');
    } finally {
      setIsProcessing(false);
      setLoadingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show authentication prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
            <p className="text-muted-foreground mt-1">
              Choose the perfect plan for your business
            </p>
          </div>

          {!isPiBrowser && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please open this page in Pi Browser to authenticate and access subscription plans.
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Authentication Required</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Sign in with Pi Network to view and purchase subscription plans
              </p>
              <Button 
                onClick={handlePiAuth} 
                disabled={isAuthenticating || !isPiBrowser} 
                className="bg-primary"
                size="lg"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In with Pi Network
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Show plan preview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 opacity-50 pointer-events-none">
            {DEFAULT_PLANS.map((plan) => {
              const Icon = planIcons[plan.name] || Crown;
              return (
                <Card key={plan.id} className="border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">
                        {plan.amount === 0 ? 'Free' : `π ${plan.amount}`}
                      </span>
                      {plan.amount > 0 && (
                        <span className="text-muted-foreground text-sm">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
            <p className="text-muted-foreground mt-1">
              Choose the perfect plan for your business
            </p>
          </div>
          <PlatformFeeModal>
            <Button variant="outline" className="text-sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Platform Fee Breakdown
            </Button>
          </PlatformFeeModal>
        </div>

        {/* Current Plan */}
        {currentPlan && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Current Plan: {currentPlan.name}</CardTitle>
                    <CardDescription>
                      {currentPlan.amount > 0 
                        ? `π ${currentPlan.amount}/month` 
                        : 'Free forever'}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={isFreePlan ? 'secondary' : 'default'} className="text-sm">
                  {isFreePlan ? 'Free' : 'Active'}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Pi Browser Warning */}
        {!isPiBrowser && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-600 mb-1">Open in Pi Browser</p>
                  <p className="text-sm text-amber-600/80">
                    To upgrade your subscription, please open this page in the Pi Browser app to process payments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : plansError ? (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-600 mb-1">Unable to Load Plans</p>
                  <p className="text-sm text-red-600/80 mb-4">{plansError}</p>
                  <Button onClick={fetchPlans} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : plans.length === 0 ? (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-600 mb-1">No Plans Available</p>
                  <p className="text-sm text-amber-600/80">
                    Subscription plans are not currently available. Please check back later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlan?.id === plan.id;
              const isDowngrade = currentPlan && plan.amount < currentPlan.amount;
              const features = Array.isArray(plan.features) ? plan.features : [];
              const Icon = planIcons[plan.name] || Crown;

              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.name === 'Pro'
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-border'
                  }`}
                >
                  {plan.name === 'Pro' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.amount === 0 ? 'Free' : `π ${plan.amount}`}
                      </span>
                      {plan.amount > 0 && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                    
                    <CardDescription className="mt-2">
                      {plan.name === 'Free' && 'Perfect for getting started'}
                      {plan.name === 'Basic' && 'For small businesses'}
                      {plan.name === 'Pro' && 'Best for growing businesses'}
                      {plan.name === 'Enterprise' && 'For large scale operations'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>
                          {plan.link_limit === null 
                            ? 'Unlimited payment links' 
                            : `${plan.link_limit} payment link${plan.link_limit !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>
                          {plan.platform_fee_percent === 0 
                            ? 'No platform fee' 
                            : `${plan.platform_fee_percent}% platform fee (for maintenance & future features)`}
                        </span>
                      </div>
                      {Array.isArray(features) && features.length > 0 ? (
                        features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>{String(feature)}</span>
                          </div>
                        ))
                      ) : null}
                    </div>

                    {isCurrent ? (
                      <Button className="w-full" disabled variant="secondary">
                        Current Plan
                      </Button>
                    ) : isDowngrade ? (
                      <Button className="w-full" disabled variant="outline">
                        Downgrade Not Available
                      </Button>
                    ) : plan.amount === 0 ? (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(plan)}
                        disabled={isProcessing}
                      >
                        {isProcessing && loadingPlanId === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Switch to Free
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {/* Pi Network Payment Button */}
                        <Button
                          className="w-full bg-gray-400 hover:bg-gray-500"
                          onClick={() => handleUpgrade(plan)}
                          disabled={isProcessing || !isPiBrowser}
                        >
                          {isProcessing && loadingPlanId === plan.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Subscribe with Pi Network
                            </>
                          )}
                        </Button>
                        
                        {/* DropPay Payment Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                          onClick={() => handleUpgradeWithDropPay(plan)}
                          disabled={isProcessing}
                        >
                          {isProcessing && loadingPlanId === plan.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating Payment Link...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Subscribe with DropPay
                            </>
                          )}
                        </Button>
                        
                        {!isPiBrowser && (
                          <p className="text-xs text-muted-foreground text-center">
                            Pi Network payment requires Pi Browser. DropPay works in any browser.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade your plan at any time. Downgrades will take effect at the end of your current billing period.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                All subscriptions are paid with Pi cryptocurrency through the Pi Network.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Is there a free trial?</h4>
              <p className="text-sm text-muted-foreground">
                The Free plan is available forever with basic features. You can upgrade anytime to unlock more features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
