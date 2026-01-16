import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Store, Users, Coins, Shield, BarChart3, Settings, ArrowRight, Check } from 'lucide-react';

export default function Marketplaces() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">Marketplaces</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Build Multi-Vendor <span className="text-gradient">Marketplaces</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Build multi-vendor marketplaces with split payments. Manage seller payouts, platform fees (2% for maintenance & future features), and commission structures effortlessly with automated escrow support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Launch Marketplace
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/demos/marketplaces">View Demo Checkout</Link>
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
              <h2 className="text-3xl font-bold mb-4">Everything for Marketplaces</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete platform management with automated payments and payouts
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Coins,
                  title: 'Split Payments',
                  description: 'Automatically split each transaction between sellers and platform. Configure custom commission rates per seller or category.',
                },
                {
                  icon: Users,
                  title: 'Seller Dashboards',
                  description: 'Give each seller their own dashboard to track sales, manage products, and view earnings in real-time.',
                },
                {
                  icon: Settings,
                  title: 'Commission Management',
                  description: 'Set flexible commission structures - percentage-based, fixed fees, or tiered pricing based on seller volume.',
                },
                {
                  icon: Shield,
                  title: 'Escrow Support',
                  description: 'Hold payments in escrow until delivery is confirmed. Protect both buyers and sellers with secure transactions.',
                },
                {
                  icon: BarChart3,
                  title: 'Platform Analytics',
                  description: 'Track marketplace performance, top sellers, popular products, and revenue trends with detailed analytics.',
                },
                {
                  icon: Store,
                  title: 'Vendor Onboarding',
                  description: 'Streamlined onboarding process for new sellers with verification, agreement signing, and payout setup.',
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
              <h2 className="text-3xl font-bold mb-4">Launch Your Marketplace Fast</h2>
              <p className="text-muted-foreground">Three steps to a fully functional marketplace</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  step: '1',
                  title: 'Set Up Platform Rules',
                  description: 'Define commission rates, fee structures, and payout schedules. Configure escrow rules and dispute resolution policies.',
                },
                {
                  step: '2',
                  title: 'Onboard Sellers',
                  description: 'Invite vendors to join your marketplace. They get instant access to seller dashboards and payment setup.',
                },
                {
                  step: '3',
                  title: 'Automate Payouts',
                  description: 'Payments automatically split between sellers and platform. Schedule regular payouts or instant settlements.',
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
                { title: 'Product Marketplaces', items: ['Multi-vendor stores', 'Handmade goods', 'Digital products', 'Art & collectibles'] },
                { title: 'Service Platforms', items: ['Freelance services', 'Consulting', 'Local services', 'Gig economy'] },
                { title: 'Rental & Booking', items: ['Property rentals', 'Equipment hire', 'Event spaces', 'Vehicle sharing'] },
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
              <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Marketplace?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join successful marketplace platforms powered by DropPay
              </p>
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Get Started
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
