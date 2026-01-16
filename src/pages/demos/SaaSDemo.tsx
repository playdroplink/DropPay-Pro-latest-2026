import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DemoCheckoutLink } from '@/components/DemoCheckoutLink';
import { Laptop, Check, Crown, Zap, Shield, RotateCw, ArrowRight } from 'lucide-react';

export default function SaaSDemo() {
  const subscriptions = [
    {
      title: "Starter Plan - Monthly",
      description: "Perfect for getting started",
      amount: 29,
      features: [
        "Up to 5 projects",
        "Basic analytics",
        "Email support",
        "1GB storage",
      ],
    },
    {
      title: "Pro Plan - Monthly",
      description: "Best for growing teams",
      amount: 99,
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "50GB storage",
      ],
    },
    {
      title: "Enterprise Annual",
      description: "Full-featured solution",
      amount: 1200,
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "Unlimited storage",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-b from-blue-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">SaaS Demo</Badge>
              <h1 className="text-4xl font-bold mb-4">SaaS Subscription Checkout</h1>
              <p className="text-muted-foreground mb-8">
                See how your customers subscribe to your SaaS plans. 
                Generate payment links for plans and manage recurring payments seamlessly.
              </p>
            </div>
          </div>
        </section>

        {/* Classic Checkout Preview */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8 text-center">Subscription Checkout Preview</h2>
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Subscribe to</p>
                      <p className="font-semibold">Your SaaS Platform</p>
                    </div>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold">Pro Plan</h3>
                        <Badge className="bg-gradient-to-r from-blue-400 to-blue-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">Perfect for growing teams</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">π 99</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 bg-secondary/30 border-b border-border">
                  <h4 className="font-semibold mb-4">What's included</h4>
                  <div className="space-y-3">
                    {[
                      'Unlimited projects',
                      'Advanced analytics & reporting',
                      'Priority support (24/7)',
                      'Custom branding',
                      'API access',
                      'Team collaboration tools',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Info */}
                <div className="p-6 border-b border-border">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Billing Cycle</span>
                      <span className="font-medium">Monthly recurring</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">First Payment</span>
                      <span className="font-medium">π 99.00</span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <Badge variant="secondary" className="w-full justify-center py-2">
                        ✨ 14-day free trial included
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="p-6">
                  <Button className="w-full h-14 text-lg bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700">
                    Start Free Trial
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Cancel anytime • No commitments • Secured by Pi Network
                  </p>
                </div>
              </Card>

              {/* Info Note */}
              <Card className="mt-6 p-4 border-blue-200 bg-blue-50">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a demo template. Your subscription checkout will automatically handle 
                  recurring billing, trial periods, and plan upgrades/downgrades.
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
                <h2 className="text-3xl font-bold mb-4">Create Subscription Payment Links</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Generate unique payment links for each subscription plan. Track signups and manage recurring payments automatically.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub, idx) => (
                  <DemoCheckoutLink
                    key={idx}
                    title={sub.title}
                    description={sub.description}
                    amount={sub.amount}
                    category="saas"
                    gradient="from-blue-400 to-blue-600"
                    icon={<Laptop className="w-5 h-5" />}
                    features={sub.features}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">Why Choose DropPay for SaaS?</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Instant Setup",
                  description: "Create subscription plans and payment links in minutes. No coding required.",
                },
                {
                  icon: Shield,
                  title: "Secure Payments",
                  description: "All transactions secured on the Pi blockchain with automatic verification.",
                },
                {
                  icon: RotateCw,
                  title: "Easy Management",
                  description: "Handle refunds, downgrades, and cancellations with a few clicks.",
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
        <section className="py-16 bg-gradient-to-r from-orange-50 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Monetize Your SaaS Today</h2>
              <p className="text-muted-foreground mb-8">
                Accept Pi payments for your software subscriptions. No payment processor fees, just instant Pi transfers.
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
