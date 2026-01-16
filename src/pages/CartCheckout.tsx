import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart, Check } from 'lucide-react';

function parseCartQuery(search: string) {
  const params = new URLSearchParams(search);
  const items = [];
  let i = 1;
  while (params.get(`item${i}`)) {
    items.push({
      name: params.get(`item${i}`) || '',
      price: params.get(`price${i}`) || '',
    });
    i++;
  }
  return {
    items,
    merchantId: params.get('merchant') || '',
    linkId: params.get('link') || '',
  };
}

export default function CartCheckout() {
  const { search } = useLocation();
  const { items, merchantId, linkId } = parseCartQuery(search);
  const [customer, setCustomer] = useState({ name: '', email: '', address: '', contact: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = items.reduce((sum, item) => sum + parseFloat(item.price || '0'), 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantId) {
      toast.error('Invalid checkout link');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create a transaction record using the existing transactions table
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          merchant_id: merchantId,
          payment_link_id: linkId || null,
          amount: total,
          status: 'pending',
          pi_payment_id: `cart_${Date.now()}`,
          payer_pi_username: customer.name,
          buyer_email: customer.email,
          memo: `Cart order: ${items.map(i => i.name).join(', ')}`,
          metadata: {
            type: 'cart',
            items,
            customer,
          },
        });

      if (txError) throw txError;

      // Store checkout responses if needed
      if (linkId) {
        await supabase.from('checkout_responses').insert({
          payment_link_id: linkId,
          responses: {
            customer_name: customer.name,
            customer_email: customer.email,
            customer_address: customer.address,
            customer_contact: customer.contact,
            items,
          },
        });
      }

      setSuccess(true);
      toast.success('Order placed successfully!');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to process order');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
            <p className="text-muted-foreground">Thank you for your purchase. You will receive a confirmation shortly.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Shopping Cart</p>
                <CardTitle className="text-white">Checkout</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Cart Items */}
            <div className="space-y-3">
              <h3 className="font-semibold">Your Items</h3>
              {items.length === 0 ? (
                <p className="text-muted-foreground">No items in cart</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                      <span>{item.name}</span>
                      <span className="font-semibold">π {item.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 border-t border-border mt-2 pt-4">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">π {total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  name="name"
                  placeholder="Enter your name"
                  value={customer.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={customer.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Shipping Address</label>
                <Input
                  name="address"
                  placeholder="Enter your address"
                  value={customer.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  name="contact"
                  placeholder="Your phone number"
                  value={customer.contact}
                  onChange={handleChange}
                />
              </div>
              <Button 
                type="submit" 
                disabled={submitting || items.length === 0}
                className="w-full h-14 text-lg bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
              >
                {submitting ? 'Processing...' : `Pay π ${total.toFixed(2)}`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                🔒 Secure checkout • Powered by DropPay
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}