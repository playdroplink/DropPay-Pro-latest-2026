import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Heart, Users, TrendingUp, FileText, Bell, Target, ArrowRight, Check } from 'lucide-react';

export default function Donations() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-blue-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">Donations & Crowdfunding</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Accept <span className="text-gradient">Donations</span> with Pi
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Accept donations for your cause or crowdfund your project. Track donors, send automated thank-you messages, and build a community around your mission.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Start Campaign
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/demos/donations">View Demo Checkout</Link>
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
              <h2 className="text-3xl font-bold mb-4">Fundraising Made Simple</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to run successful donation campaigns
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Heart,
                  title: 'One-Time & Recurring',
                  description: 'Accept both one-time donations and recurring monthly contributions. Let supporters choose their preferred giving style.',
                },
                {
                  icon: Users,
                  title: 'Donor Management',
                  description: 'Build and maintain your donor database. Track contribution history, send updates, and recognize top supporters.',
                },
                {
                  icon: Target,
                  title: 'Campaign Tracking',
                  description: 'Set fundraising goals and display progress bars. Create urgency with time-limited campaigns and milestones.',
                },
                {
                  icon: FileText,
                  title: 'Tax Receipts',
                  description: 'Automatically generate and send tax-deductible receipts to donors. Customize templates with your organization details.',
                },
                {
                  icon: Bell,
                  title: 'Thank You Automation',
                  description: 'Send personalized thank-you messages automatically. Build donor relationships with timely acknowledgments.',
                },
                {
                  icon: TrendingUp,
                  title: 'Impact Reporting',
                  description: 'Share impact stories and updates with donors. Show how their contributions are making a difference.',
                },
              ].map((feature, idx) => (
                <Card key={idx} className="border-border hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
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
              <h2 className="text-3xl font-bold mb-4">Launch Your Campaign Today</h2>
              <p className="text-muted-foreground">Three simple steps to start accepting donations</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  step: '1',
                  title: 'Create Your Campaign',
                  description: 'Set up your cause with compelling story, images, and fundraising goals. Choose suggested donation amounts or let donors decide.',
                },
                {
                  step: '2',
                  title: 'Share Donation Links',
                  description: 'Get shareable links and embeddable buttons for your website, social media, and email campaigns.',
                },
                {
                  step: '3',
                  title: 'Engage Donors',
                  description: 'Receive instant notifications when donations arrive. Send automated thank-you messages and impact updates.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-xl">
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
                { title: 'Nonprofits', items: ['Charities', 'NGOs', 'Foundations', 'Community groups'] },
                { title: 'Personal Causes', items: ['Medical expenses', 'Emergency relief', 'Education funds', 'Memorial funds'] },
                { title: 'Creative Projects', items: ['Art projects', 'Film production', 'Music albums', 'Book publishing'] },
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
        <section className="py-20 bg-gradient-to-br from-blue-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Fundraising?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join nonprofits and creators already raising funds with DropPay
              </p>
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Launch Campaign
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
