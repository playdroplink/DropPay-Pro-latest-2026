import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Laptop, RefreshCw, TrendingUp, Users, Bell, CreditCard, ArrowRight, Check } from 'lucide-react';

export default function SaaS() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">SaaS & Subscriptions</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Automate Your <span className="text-gradient">Subscription Billing</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Ideal for subscription-based services. Automate recurring billing, trial periods, upgrade flows, and dunning management with Pi cryptocurrency payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/demos/saas">View Demo Checkout</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/docs">View API Docs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Built for Recurring Revenue</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage subscriptions at scale
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: RefreshCw,
                  title: 'Recurring Payments',
                  description: 'Automatic billing on your schedule - monthly, quarterly, or annual. Set it up once and forget it.',
                },
                {
                  icon: TrendingUp,
                  title: 'Usage-Based Billing',
                  description: 'Charge customers based on their actual usage. Perfect for metered services and pay-as-you-grow models.',
                },
                {
                  icon: Users,
                  title: 'Plan Management',
                  description: 'Create unlimited pricing tiers. Allow customers to upgrade, downgrade, or cancel anytime.',
                },
                {
                  icon: Bell,
                  title: 'Dunning Automation',
                  description: 'Automatically retry failed payments and send smart reminders to reduce involuntary churn.',
                },
                {
                  icon: CreditCard,
                  title: 'Trial Periods',
                  description: 'Offer free trials to new customers. Automatically convert to paid subscriptions after trial ends.',
                },
                {
                  icon: Laptop,
                  title: 'Customer Portal',
                  description: 'Give customers self-service access to manage their subscriptions, update billing, and view invoices.',
                },
              ].map((feature, idx) => (
                <Card key={idx} className="border-border hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Launch Subscriptions in Minutes</h2>
              <p className="text-muted-foreground">Simple setup, powerful automation</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  step: '1',
                  title: 'Define Your Plans',
                  description: 'Create pricing tiers with different features and limits. Set up monthly, quarterly, or annual billing cycles.',
                },
                {
                  step: '2',
                  title: 'Generate Subscription Links',
                  description: 'Create payment links for each plan. Embed checkout on your site or share links directly with customers.',
                },
                {
                  step: '3',
                  title: 'Automate Everything',
                  description: 'Sit back as DropPay handles recurring billing, failed payment retries, and customer notifications automatically.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-xl">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Perfect For</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { title: 'Software as a Service', items: ['Project management', 'Analytics tools', 'CRM platforms', 'Marketing automation'] },
                { title: 'Membership Sites', items: ['Online communities', 'Premium content', 'Exclusive forums', 'Member perks'] },
                { title: 'Digital Services', items: ['Cloud storage', 'API access', 'Web hosting', 'Email services'] },
              ].map((category, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Revenue?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join SaaS companies already scaling with DropPay subscriptions
              </p>
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
