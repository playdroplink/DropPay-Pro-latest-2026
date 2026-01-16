import { Check, Code2, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How DropPay Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start accepting Pi payments in three simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Sign Up & Get Your API Key</h3>
              </div>
              <p className="text-muted-foreground text-lg mb-6">
                Create your free account in seconds. Get instant access to your dashboard and API credentials. 
                No credit card required to start.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Instant account activation</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Secure API key generation</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Full dashboard access</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                <pre className="text-sm text-foreground overflow-x-auto">
{`// Install DropPay SDK
npm install @droppay/node

// Initialize with your API key
const droppay = require('@droppay/node');
droppay.apiKey = 'dp_live_xxx';`}
                </pre>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
            <div className="order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Create Payment Links</h3>
              </div>
              <p className="text-muted-foreground text-lg mb-6">
                Generate payment links through our dashboard or API. Customize the amount, description, 
                and success URL. Share anywhere - social media, email, or embed in your app.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Create links via dashboard or API</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Customizable checkout pages</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>QR codes for easy sharing</span>
                </li>
              </ul>
            </div>
            <div className="order-1">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                <pre className="text-sm text-foreground overflow-x-auto">
{`// Create a payment link
const payment = await droppay
  .paymentLinks.create({
    amount: 10.00,
    title: 'Premium Plan',
    description: 'Monthly subscription',
    successUrl: 'https://yoursite.com/success'
  });

console.log(payment.payment_url);
// https://droppay.space/pay/abc123`}
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Get Paid Instantly</h3>
              </div>
              <p className="text-muted-foreground text-lg mb-6">
                When customers pay, you're notified instantly via webhooks. Funds are verified on the 
                Pi blockchain and credited to your wallet. Track everything in real-time from your dashboard.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Real-time webhook notifications</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Blockchain verification</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Automatic withdrawal to Pi wallet</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                <pre className="text-sm text-foreground overflow-x-auto">
{`// Webhook notification
{
  "event": "payment.completed",
  "data": {
    "payment_id": "pay_abc123",
    "amount": 10.00,
    "status": "completed",
    "payer": "john_pi",
    "txid": "0x1234..."
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">
                Start Building Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
