import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, RefreshCw, Bell, BarChart3, Wallet, ArrowRight, Check } from 'lucide-react';

export default function ECommerce() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">E-Commerce</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Accept Pi Payments in Your <span className="text-gradient">Online Store</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Perfect for online stores selling digital or physical products. Accept Pi payments seamlessly with automatic order fulfillment, inventory management, and customer notifications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Start Selling
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/demos/ecommerce">View Demo Checkout</Link>
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
              <h2 className="text-3xl font-bold mb-4">Everything Your Store Needs</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built-in features designed specifically for e-commerce businesses
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Package,
                  title: 'Automatic Inventory Sync',
                  description: 'Real-time stock tracking with automatic updates. Never oversell products with intelligent inventory management.',
                },
                {
                  icon: RefreshCw,
                  title: 'Order Management',
                  description: 'Complete order lifecycle from checkout to fulfillment. Track orders, manage returns, and handle refunds effortlessly.',
                },
                {
                  icon: Bell,
                  title: 'Customer Notifications',
                  description: 'Automated email notifications for order confirmations, shipping updates, and delivery tracking.',
                },
                {
                  icon: Wallet,
                  title: 'Refund Handling',
                  description: 'Simple refund process with automatic Pi transfers back to customers. Full or partial refunds supported.',
                },
                {
                  icon: BarChart3,
                  title: 'Sales Analytics',
                  description: 'Detailed insights into your sales performance, best-selling products, and customer behavior.',
                },
                {
                  icon: ShoppingCart,
                  title: 'Shopping Cart Integration',
                  description: 'Embed our cart widget directly on your site or use payment links for quick checkouts.',
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
              <h2 className="text-3xl font-bold mb-4">Get Started in Minutes</h2>
              <p className="text-muted-foreground">Three simple steps to start accepting Pi payments</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  step: '1',
                  title: 'Create Your Store',
                  description: 'Sign up and add your products with pricing, images, and descriptions. Set up inventory tracking and stock levels.',
                },
                {
                  step: '2',
                  title: 'Add Payment Links',
                  description: 'Generate payment links or embed our shopping cart widget. Each product gets a unique checkout flow.',
                },
                {
                  step: '3',
                  title: 'Start Selling',
                  description: 'Share your links or embed checkout on your site. Receive instant notifications when customers purchase.',
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
                { title: 'Digital Products', items: ['Software', 'eBooks', 'Templates', 'Music & Audio'] },
                { title: 'Physical Goods', items: ['Merchandise', 'Clothing', 'Accessories', 'Art & Prints'] },
                { title: 'Services', items: ['Consulting', 'Design Work', 'Coaching', 'Workshops'] },
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
              <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of merchants already using DropPay for their e-commerce stores
              </p>
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Create Your Store
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
