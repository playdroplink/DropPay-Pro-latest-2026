import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DemoCheckoutLink } from '@/components/DemoCheckoutLink';
import { ShoppingCart, Package, Check, Zap, Truck, RefreshCw, ArrowRight } from 'lucide-react';

export default function ECommerceDemo() {
  const products = [
    {
      title: "Premium Product Bundle",
      description: "Complete package with instant delivery",
      amount: 25,
      features: ["Instant email delivery", "Automatic order confirmation", "Track order status", "30-day Pi-back guarantee"],
    },
    {
      title: "Pro Essentials Pack",
      description: "Everything you need to get started",
      amount: 49,
      features: ["Priority support", "Extended warranty", "Free upgrades", "Lifetime updates"],
    },
    {
      title: "Enterprise Solution",
      description: "Advanced features for growing businesses",
      amount: 199,
      features: ["Dedicated account manager", "24/7 support", "Custom integrations", "API access"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">Demo Checkout</Badge>
              <h1 className="text-4xl font-bold mb-4">E-Commerce Checkout Template</h1>
              <p className="text-muted-foreground mb-8">
                Preview how your customers will experience the checkout flow for online store products. 
                Generate shareable payment links and QR codes for testing.
              </p>
            </div>
          </div>
        </section>

        {/* Classic Checkout Preview */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8 text-center">Checkout Preview</h2>
            <div className="max-w-2xl mx-auto">
              {/* Checkout Card */}
              <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Store Checkout</p>
                      <p className="font-semibold">Your Store Name</p>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 border-b border-border">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0">
                      <Package className="w-10 h-10 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Premium Product Bundle</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Complete package with instant delivery
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">In Stock</Badge>
                        <Badge variant="outline">Digital Delivery</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6 bg-secondary/30 border-b border-border">
                  <h4 className="font-semibold mb-4">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Product Price</span>
                      <span className="font-medium">π 25.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing Fee</span>
                      <span className="font-medium">π 0.25</span>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between">
                      <span className="font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">π 25.25</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 border-b border-border">
                  <div className="space-y-3">
                    {[
                      'Instant email delivery',
                      'Automatic order confirmation',
                      'Track order status',
                      '30-day Pi-back guarantee'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Button */}
                <div className="p-6">
                  <Button className="w-full h-14 text-lg bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700">
                    Pay π 25.25 with Pi Browser
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    🔒 Secure checkout • Powered by DropPay
                  </p>
                </div>
              </Card>

              {/* Info Note */}
              <Card className="mt-6 p-4 border-orange-200 bg-orange-50">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a demo template. Your actual checkout will include your product images, 
                  branding, and custom messaging. All transactions are secured on the Pi blockchain.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Shareable Payment Links */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Create Shareable Checkout Links</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Generate payment links with QR codes for each product. Share via email, social media, or display on your website.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <DemoCheckoutLink
                    key={idx}
                    title={product.title}
                    description={product.description}
                    amount={product.amount}
                    category="ecommerce"
                    gradient="from-orange-400 to-orange-600"
                    icon={<ShoppingCart className="w-5 h-5" />}
                    features={product.features}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">Why Use Payment Links?</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Instant Setup",
                  description: "No coding required. Create payment links in seconds and start accepting payments immediately.",
                },
                {
                  icon: Truck,
                  title: "Easy Sharing",
                  description: "Share links via email, SMS, social media, or display QR codes for mobile checkout.",
                },
                {
                  icon: RefreshCw,
                  title: "Automatic Updates",
                  description: "Real-time order tracking and automatic customer notifications for every transaction.",
                },
              ].map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <Card key={idx} className="p-6 border-border hover:border-primary/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-orange-50 to-transparent">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Your Store?</h2>
              <p className="text-muted-foreground mb-8">
                Start accepting Pi payments in your online store today. No setup fees, just simple payment links.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <a href="/auth">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                  <a href="/demos/checkout-builder">Explore All Demos</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
