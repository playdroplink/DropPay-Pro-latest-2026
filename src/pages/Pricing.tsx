import { useEffect, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Check, Zap, Loader2, Crown, Rocket, Shield, Gift, Star, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import dropPayLogo from '@/assets/droppay-logo.png';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  interval: string;
  features: string[];
  is_active: boolean;
}

type RawSubscriptionPlan = Omit<SubscriptionPlan, 'features'> & {
  features: SubscriptionPlan['features'] | string | null;
};

const planIcons: Record<string, ComponentType<{ className?: string }>> = {
  'Free': Gift,
  'Basic': Star,
  'Starter': Rocket,
  'Growth': Zap,
  'Enterprise': Crown,
};

// Hardcoded plans to display immediately
const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Free',
    description: 'Perfect for getting started (0.01 Pi minimum)',
    amount: 0.01,
    interval: 'monthly',
    features: ['1 Payment Link', 'Free payment type only', 'Basic analytics', 'No platform fee', 'Community support'],
    is_active: true,
  },
  {
    id: '2',
    name: 'Basic',
    description: 'For small businesses',
    amount: 10,
    interval: 'monthly',
    features: ['5 Payment Links', 'Free + One-time payments', 'Basic analytics', '2% platform fee (for maintenance & future features)', 'Email support'],
    is_active: true,
  },
  {
    id: '3',
    name: 'Growth',
    description: 'Best for growing businesses',
    amount: 20,
    interval: 'monthly',
    features: ['200 Payment Links', 'Advanced analytics', '1% platform fee (for maintenance & future features)', 'Priority support', 'Custom branding', 'Tracking links'],
    is_active: true,
  },
  {
    id: '4',
    name: 'Enterprise',
    description: 'For large scale operations',
    amount: 50,
    interval: 'monthly',
    features: ['Unlimited Payment Links', 'All payment types (Free + One-time + Recurring + Donations)', 'Full analytics suite', '2% platform fee (for maintenance & future features)', '24/7 Priority support', 'Custom integrations', 'Dedicated account manager'],
    is_active: true,
  },
];

export default function Pricing() {
  const { isAuthenticated, piUser, login } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);

  useEffect(() => {
    // Use hardcoded plans immediately
    setPlans(DEFAULT_PLANS);
    setIsLoading(false);
  }, []);

  const fetchPlans = async () => {
    // Plans are now hardcoded and loaded immediately
    console.log('Using hardcoded plans:', DEFAULT_PLANS);
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      toast.error('Please authenticate with Pi Network first');
      navigate('/auth');
      return;
    }

    try {
      const isPiBrowser = typeof window !== 'undefined' && (window as any).Pi;

      if (isPiBrowser) {
        const Pi = (window as any).Pi;
        setSubscribingPlanId(plan.id);

        const paymentData = {
          amount: plan.amount,
          memo: `Subscription: ${plan.name} Plan - DropPay`,
          metadata: {
            planId: plan.id,
            planName: plan.name,
            isSubscription: true,
            payerUsername: piUser?.username,
          },
        };

        console.log('💳 Creating payment:', paymentData);

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              console.log('⏳ Payment ready for approval:', paymentId);
              const response = await supabase.functions.invoke('approve-payment', {
                body: { paymentId, planId: plan.id },
              });
              if (response.error) throw response.error;
              console.log('✅ Payment approved successfully');
            } catch (error) {
              console.error('❌ Error approving subscription payment:', error);
              setSubscribingPlanId(null);
              toast.error('Payment approval failed');
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              console.log('🔄 Payment ready for completion:', { paymentId, txid });
              const response = await supabase.functions.invoke('complete-payment', {
                body: { 
                  paymentId, 
                  txid,
                  planId: plan.id,
                  payerUsername: piUser?.username,
                },
              });
              
              if (response.error) throw response.error;

              console.log('💾 Creating subscription record...');
              // Create subscription record with proper user identification
              const expiresAt = new Date();
              expiresAt.setMonth(expiresAt.getMonth() + 1);

              const { error: insertError } = await supabase
                .from('user_subscriptions')
                .insert({
                  pi_username: piUser?.username || 'unknown',
                  plan_id: plan.id,
                  status: 'active',
                  started_at: new Date().toISOString(),
                  expires_at: expiresAt.toISOString(),
                  last_payment_at: new Date().toISOString(),
                });

              if (insertError) throw insertError;

              console.log('✅ Subscription created successfully for plan:', plan.name);
              toast.success(`Successfully subscribed to ${plan.name}! 🎉`);
              
              // Redirect to dashboard after 1 second
              setTimeout(() => {
                navigate('/dashboard');
              }, 1000);
            } catch (error) {
              console.error('❌ Error completing subscription:', error);
              toast.error('Subscription failed. Please try again.');
            } finally {
              setSubscribingPlanId(null);
            }
          },
          onCancel: () => {
            console.log('❌ Payment cancelled by user');
            setSubscribingPlanId(null);
            toast.error('Subscription cancelled');
          },
          onError: (error: any) => {
            console.error('❌ Payment error:', error);
            setSubscribingPlanId(null);
            toast.error('Payment failed: ' + (error?.message || 'Unknown error'));
          },
        };

        await Pi.createPayment(paymentData, callbacks);
      } else {
        // Demo mode for non-Pi Browser
        console.log('🔧 Demo mode: Processing subscription');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            merchant_id: piUser?.uid || null,
            pi_username: piUser?.username || 'demo_user',
            plan_id: plan.id,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            last_payment_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        // Insert notification for demo activation
        await (supabase as any)
          .from('notifications')
          .insert({
            merchant_id: piUser?.uid || null,
            title: '🎉 Subscription Activated!',
            message: `Your ${plan.name} plan is now active. Enjoy ${plan.link_limit ?? 'unlimited'} payment links!`,
            type: 'success',
            is_read: false,
          });

        toast.success(`Demo: Subscribed to ${plan.name}! 🎉`);
        setSubscribingPlanId(null);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Subscription error:', error);
      toast.error('Failed to process subscription');
      setSubscribingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img 
              src={dropPayLogo} 
              alt="DropPay Logo" 
              className="w-12 h-12 rounded-xl object-cover"
            />
            <span className="text-2xl font-bold text-foreground">DropPay</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Choose the plan that fits your business. All plans include Pi Network integration.
          </p>
          <div className="flex justify-center">
            <PlatformFeeModal>
              <Button variant="outline" className="text-sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Compare Platform Fees with Competitors
              </Button>
            </PlatformFeeModal>
          </div>
        </div>

        {/* Pricing Grid - Responsive, No Horizontal Scroll */}
        {plans.length === 0 ? (
          <div className="py-12 text-center">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            ) : (
              <div>
                <p className="text-lg text-muted-foreground mb-4">No pricing plans available at the moment.</p>
                <Button onClick={fetchPlans} variant="outline">
                  Refresh Plans
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {plans.map((plan, index) => {
                const Icon = planIcons[plan.name] || Zap;
                const isPopular = plan.name === 'Growth';
                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col h-full ${isPopular ? 'border-primary shadow-lg lg:scale-105' : ''}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${isPopular ? 'bg-primary' : 'bg-secondary'}`}>
                        <Icon className={`w-6 h-6 ${isPopular ? 'text-primary-foreground' : 'text-foreground'}`} />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description || (isPopular ? 'Unlock all features, advanced analytics, and priority support.' : '')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="text-center mb-6">
                        <span className="text-4xl font-bold text-foreground">π {plan.amount}</span>
                        <span className="text-muted-foreground">/{plan.interval}</span>
                      </div>
                      <ul className="space-y-3">
                        {Array.isArray(plan.features) && plan.features.length > 0 ? (
                          plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{String(feature)}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-muted-foreground italic">Basic features included</li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleSubscribe(plan)}
                        disabled={subscribingPlanId === plan.id}
                        className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={isPopular ? 'default' : 'outline'}
                      >
                        {subscribingPlanId === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          isPopular 
                            ? `Upgrade to Growth for π${plan.amount}/${plan.interval}` 
                            : `Subscribe for π${plan.amount}/${plan.interval}`
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 flex-wrap text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm">Instant Activation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
