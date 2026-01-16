import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Crown, Check, Zap } from 'lucide-react';

function parseSubscribeQuery(search: string) {
  const params = new URLSearchParams(search);
  return {
    plan: params.get('plan') || 'Pro Plan',
    amount: params.get('amount') || '49',
    interval: params.get('interval') || 'monthly',
    merchantId: params.get('merchant') || '',
    linkId: params.get('link') || '',
    features: params.get('features')?.split(',') || [],
    trial: params.get('trial') || '0',
  };
}

export default function SubscribeCheckout() {
  const { search } = useLocation();
  const { plan, amount, interval, merchantId, linkId, features, trial } = parseSubscribeQuery(search);
  const [customer, setCustomer] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const trialDays = parseInt(trial) || 0;
  const intervalLabel = interval === 'yearly' ? 'year' : interval === 'weekly' ? 'week' : 'month';

  const defaultFeatures = features.length > 0 ? features : [
    'Full access to all features',
    'Priority customer support',
    'Regular updates & improvements',
    'Cancel anytime',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.email) {
      toast.error('Please enter your email');
      return;
    }
    if (!merchantId) {
      toast.error('Invalid subscription link');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Calculate subscription dates
      const now = new Date();
      const periodEnd = new Date(now);
      if (interval === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else if (interval === 'weekly') {
        periodEnd.setDate(periodEnd.getDate() + 7);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Create subscription record
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          merchant_id: merchantId,
          payment_link_id: linkId || null,
          pi_username: customer.name || customer.email,
          status: trialDays > 0 ? 'trialing' : 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          expires_at: periodEnd.toISOString(),
        });

      if (subError) throw subError;

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          merchant_id: merchantId,
          payment_link_id: linkId || null,
          amount: trialDays > 0 ? 0 : parseFloat(amount),
          status: 'completed',
          pi_payment_id: `sub_${Date.now()}`,
          payer_pi_username: customer.name,
          buyer_email: customer.email,
          memo: `Subscription: ${plan} (${interval})`,
          metadata: {
            type: 'subscription',
            plan,
            interval,
            trial_days: trialDays,
          },
        });

      if (txError) throw txError;

      setSuccess(true);
      toast.success(trialDays > 0 ? 'Free trial started!' : 'Subscription activated!');
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to start subscription');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {trialDays > 0 ? 'Trial Started!' : 'Welcome Aboard!'}
            </h2>
            <p className="text-muted-foreground">
              {trialDays > 0 
                ? `Enjoy your ${trialDays}-day free trial of ${plan}. We'll send details to ${customer.email}.`
                : `Your ${plan} subscription is now active. Check your email for details.`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Card className="border-2 border-purple-200 shadow-xl">
          <CardHeader className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Subscribe to</p>
                <CardTitle className="text-white">{plan}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Plan Details */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{plan}</h3>
                  {trialDays > 0 && (
                    <Badge className="bg-gradient-to-r from-purple-400 to-purple-600">
                      {trialDays}-day trial
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {trialDays > 0 ? `Then π ${amount}/${intervalLabel}` : `Billed ${interval}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {trialDays > 0 ? 'Free' : `π ${amount}`}
                </div>
                <div className="text-sm text-muted-foreground">per {intervalLabel}</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-semibold">What's included:</h4>
              {defaultFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Billing Info */}
            <div className="space-y-2 p-4 bg-secondary/20 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="font-medium capitalize">{interval}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {trialDays > 0 ? 'First charge after trial' : 'First Payment'}
                </span>
                <span className="font-medium">π {amount}</span>
              </div>
              {trialDays > 0 && (
                <div className="pt-2">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    ✨ {trialDays}-day free trial included
                  </Badge>
                </div>
              )}
            </div>

            {/* Subscribe Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  name="name"
                  placeholder="Enter your name"
                  value={customer.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={customer.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full h-14 text-lg bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
              >
                {submitting ? 'Processing...' : trialDays > 0 ? 'Start Free Trial' : `Subscribe for π ${amount}/${intervalLabel}`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime • No commitments • Secured by Pi Network
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}