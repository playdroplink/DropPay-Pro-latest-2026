import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Check, Loader2, Zap, TrendingUp, Shield, Sparkles, Star, AlertCircle, LogIn, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  link_limit: number | null;
  platform_fee_percent: number;
  features: any;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Free',
    amount: 0,
    link_limit: 1,
    platform_fee_percent: 1,
    features: ['1 payment link', 'Basic features', '1% platform fee'],
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

const planIcons: Record<string, any> = {
  Free: Zap,
  Basic: Star,
  Pro: TrendingUp,
  Enterprise: Crown,
};

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    // Use hardcoded plans immediately
    setPlans(DEFAULT_PLANS);
    setPlansLoading(false);
    console.log('Using hardcoded plans:', DEFAULT_PLANS);
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1">
            Choose the perfect plan for your business
          </p>
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
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;
            const isDowngrade = currentPlan && plan.amount < currentPlan.amount;
            const features = Array.isArray(plan.features) ? plan.features : [];

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
                    {plan.name === 'Free' && <Zap className="w-5 h-5 text-orange-500" />}
                    {plan.name === 'Basic' && <Star className="w-5 h-5 text-blue-500" />}
                    {plan.name === 'Pro' && <TrendingUp className="w-5 h-5 text-primary" />}
                    {plan.name === 'Enterprise' && <Shield className="w-5 h-5 text-purple-500" />}
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
                      <span>{plan.platform_fee_percent}% platform fee</span>
                    </div>
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {isCurrent ? (
                    <Button className="w-full" disabled variant="secondary">
                      Current Plan
                    </Button>
                  ) : isDowngrade ? (
                    <Button className="w-full" disabled variant="outline">
                      Downgrade Not Available
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.name === 'Pro'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                          : ''
                      }`}
                      onClick={() => handleUpgrade(plan)}
                      disabled={isProcessing || (!isPiBrowser && plan.amount > 0)}
                    >
                      {isProcessing && loadingPlanId === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {plan.amount === 0 ? 'Switch to Free' : `Upgrade to ${plan.name}`}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

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
