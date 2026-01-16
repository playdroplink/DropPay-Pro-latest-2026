import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Heart, Check } from 'lucide-react';

function parseDonateQuery(search: string) {
  const params = new URLSearchParams(search);
  return {
    purpose: params.get('purpose') || 'Support Our Cause',
    amount: params.get('amount') || '',
    recurring: params.get('recurring') === '1',
    merchantId: params.get('merchant') || '',
    linkId: params.get('link') || '',
    goal: params.get('goal') || '',
    raised: params.get('raised') || '0',
  };
}

export default function DonateCheckout() {
  const { search } = useLocation();
  const { purpose, amount: suggestedAmount, recurring, merchantId, linkId, goal, raised } = parseDonateQuery(search);
  const [customer, setCustomer] = useState({ name: '', email: '', message: '' });
  const [amount, setAmount] = useState(suggestedAmount);
  const [isRecurring, setIsRecurring] = useState(recurring);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const suggestedAmounts = ['5', '10', '25', '50', '100'];
  const goalAmount = parseFloat(goal) || 0;
  const raisedAmount = parseFloat(raised) || 0;
  const progressPercent = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a donation amount');
      return;
    }
    if (!merchantId) {
      toast.error('Invalid donation link');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create a transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          merchant_id: merchantId,
          payment_link_id: linkId || null,
          amount: parseFloat(amount),
          status: 'pending',
          pi_payment_id: `donation_${Date.now()}`,
          payer_pi_username: customer.name,
          buyer_email: customer.email,
          memo: `Donation: ${purpose}`,
          metadata: {
            type: 'donation',
            purpose,
            recurring: isRecurring,
            message: customer.message,
          },
        });

      if (txError) throw txError;

      // Update fundraising progress if this is linked to a payment link
      if (linkId) {
        await supabase
          .from('payment_links')
          .update({
            current_raised: raisedAmount + parseFloat(amount),
            donor_count: (parseInt(raised) || 0) + 1,
          })
          .eq('id', linkId);
      }

      setSuccess(true);
      toast.success('Thank you for your donation!');
    } catch (error: any) {
      console.error('Donation error:', error);
      toast.error(error.message || 'Failed to process donation');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">Your generous donation of π {amount} helps make a difference.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Card className="border-2 border-pink-200 shadow-xl">
          <CardHeader className="bg-gradient-to-br from-pink-400 to-pink-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Support</p>
                <CardTitle className="text-white">{purpose}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Fundraising Progress */}
            {goalAmount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">π {raisedAmount.toFixed(2)} raised</span>
                  <span className="text-muted-foreground">of π {goalAmount.toFixed(2)} goal</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Amount Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Choose Amount</label>
              <div className="grid grid-cols-5 gap-2">
                {suggestedAmounts.map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={amount === amt ? 'default' : 'outline'}
                    onClick={() => setAmount(amt)}
                    className={amount === amt ? 'bg-pink-500 hover:bg-pink-600' : ''}
                  >
                    π {amt}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">π</span>
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            {/* Recurring Toggle */}
            <label className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 text-pink-600 rounded"
              />
              <div>
                <p className="font-medium">Make this a monthly donation</p>
                <p className="text-sm text-muted-foreground">Support us every month with π {amount || '0'}</p>
              </div>
            </label>

            {/* Donor Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name (optional)</label>
                <Input
                  name="name"
                  placeholder="Enter your name"
                  value={customer.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email (for receipt)</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={customer.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Leave a message (optional)</label>
                <Input
                  name="message"
                  placeholder="Your message of support..."
                  value={customer.message}
                  onChange={handleChange}
                />
              </div>
              <Button 
                type="submit" 
                disabled={submitting || !amount || parseFloat(amount) <= 0}
                className="w-full h-14 text-lg bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700"
              >
                {submitting ? 'Processing...' : `Donate π ${amount || '0'}`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ❤️ 100% goes to the cause • Powered by DropPay
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}