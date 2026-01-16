import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, Check, ShoppingBag } from 'lucide-react';

interface PaymentLink {
  id: string;
  merchant_id: string;
  title: string;
  description: string | null;
  amount: number;
  product_images?: string[] | null;
  product_variants?: unknown;
  require_shipping?: boolean | null;
  shipping_fee?: number | null;
}

export default function MerchantCheckout() {
  const { code } = useParams();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: '', email: '', address: '', contact: '' });
  const [variantSelections, setVariantSelections] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchLink() {
      if (!code) {
        setError('Invalid product link');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('payment_links')
          .select('*')
          .eq('slug', code)
          .eq('is_active', true)
          .maybeSingle();

        if (fetchError) throw fetchError;
        
        if (!data) {
          setError('Product not found or no longer available.');
          setLoading(false);
          return;
        }

        setLink(data as unknown as PaymentLink);
        
        // Increment views
        await supabase.rpc('increment_views', { link_id: data.id });
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    }
    fetchLink();
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (name: string, value: string) => {
    setVariantSelections({ ...variantSelections, [name]: value });
  };

  const calculateTotal = () => {
    if (!link) return 0;
    let total = Number(link.amount);
    if (link.require_shipping && link.shipping_fee) {
      total += Number(link.shipping_fee);
    }
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    setSubmitting(true);
    setError(null);

    try {
      // Create transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          merchant_id: link.merchant_id,
          payment_link_id: link.id,
          amount: calculateTotal(),
          status: 'pending',
          pi_payment_id: `order_${Date.now()}`,
          payer_pi_username: customer.name,
          buyer_email: customer.email,
          memo: `Order: ${link.title}`,
          metadata: {
            type: 'product',
            variants: variantSelections,
            shipping_address: customer.address,
            contact: customer.contact,
          },
        });

      if (txError) throw txError;

      // Save checkout responses
      await supabase.from('checkout_responses').insert({
        payment_link_id: link.id,
        responses: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_address: customer.address,
          customer_contact: customer.contact,
          variants: variantSelections,
        },
      });

      // Increment conversions
      await supabase.rpc('increment_conversions', { link_id: link.id });

      setSuccess(true);
      toast.success('Order placed successfully!');
    } catch (err: any) {
      console.error('Order error:', err);
      setError(err.message || 'Failed to place order');
      toast.error(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading product...</div>
      </div>
    );
  }

  if (error && !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/50 to-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
            <p className="text-muted-foreground">
              Thank you for your order. You'll receive a confirmation email at {customer.email}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!link) return null;

  const variants = Array.isArray(link.product_variants) ? link.product_variants as Array<{name: string; options: string}> : [];
  const images = Array.isArray(link.product_images) ? link.product_images : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Product Checkout</p>
                <CardTitle className="text-white">Complete Your Order</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Product Images */}
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Product ${idx + 1}`} 
                    className="w-24 h-24 object-cover rounded-lg border flex-shrink-0" 
                  />
                ))}
              </div>
            )}

            {/* Product Info */}
            <div>
              <h3 className="text-xl font-bold mb-2">{link.title}</h3>
              {link.description && (
                <p className="text-muted-foreground mb-3">{link.description}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">In Stock</Badge>
              </div>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium mb-2">{v.name}</label>
                    <select
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                      value={variantSelections[v.name] || ''}
                      onChange={(e) => handleVariantChange(v.name, e.target.value)}
                    >
                      <option value="">Select {v.name}</option>
                      {v.options.split(',').map((opt) => (
                        <option key={opt.trim()} value={opt.trim()}>
                          {opt.trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Order Summary */}
            <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product Price</span>
                <span className="font-medium">π {Number(link.amount).toFixed(2)}</span>
              </div>
              {link.require_shipping && link.shipping_fee && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">π {Number(link.shipping_fee).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">π {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name *</label>
                <Input
                  name="name"
                  placeholder="Enter your name"
                  value={customer.name}
                  onChange={handleChange}
                  required
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
              {link.require_shipping && (
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Address *</label>
                  <Input
                    name="address"
                    placeholder="Enter your full address"
                    value={customer.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  name="contact"
                  placeholder="Your phone number"
                  value={customer.contact}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full h-14 text-lg bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
              >
                {submitting ? 'Processing...' : `Pay π ${calculateTotal().toFixed(2)}`}
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