import { Link } from 'react-router-dom';
import { Zap, Code, Webhook, CreditCard, Shield, ArrowLeft, Book, Terminal, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dropPayLogo from '@/assets/droppay-logo.png';

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={dropPayLogo} 
                alt="DropPay Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-xl font-bold text-foreground">DropPay</span>
              <span className="text-muted-foreground ml-2">Documentation</span>
            </Link>
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">API Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to integrate DropPay into your application
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Auth</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="checkout">Checkout</TabsTrigger>
              <TabsTrigger value="sdks">SDKs</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    DropPay provides a simple REST API for accepting Pi Network payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Base URL</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto">
                      {window.location.origin}/api/v1
                    </pre>
                    <p className="text-sm text-muted-foreground mt-2">
                      All API requests should be made to this base URL with appropriate endpoints appended.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Quick Start</h3>
                    <ol className="space-y-3 text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                        <span>Create an account and get your API key from the dashboard</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                        <span>Add your API key to the Authorization header</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                        <span>Create payment requests and handle webhooks</span>
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <Code className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">REST API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Simple HTTP endpoints for creating and managing payments programmatically
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CreditCard className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Checkout Widget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Embeddable checkout for websites with just a few lines of code
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Webhook className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Webhooks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Real-time notifications when payments are completed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Book className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Full Documentation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground text-sm">
                      Access the complete DropPay docs and the implementation quickstart from within the app.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button asChild variant="secondary">
                        <a href="/DROPPAY_COMPLETE_DOCUMENTATION.md" target="_blank" rel="noreferrer">
                          View Complete Docs
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <a href="/IMPLEMENTATION_GUIDE.md" target="_blank" rel="noreferrer">
                          Implementation Guide
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Authentication */}
            <TabsContent value="authentication" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>API Authentication</CardTitle>
                  <CardDescription>
                    All API requests require authentication using an API key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Authorization Header</h3>
                    <p className="text-muted-foreground mb-4">
                      Include your API key in the Authorization header with the Bearer prefix:
                    </p>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto">
{`Authorization: Bearer dp_live_your_api_key_here`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Example Request</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`curl -X GET https://api.droppay.io/v1/payments \\
  -H "Authorization: Bearer dp_live_abc123..." \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Keep your API key secure</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Never expose your API key in client-side code. Always make API requests from your backend server.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments */}
            <TabsContent value="payments" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Create Payment Link</CardTitle>
                  <CardDescription>POST /payment-links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Request Body</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`{
  "title": "Premium Subscription",
  "amount": 10.00,
  "description": "Monthly premium plan",
  "success_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel",
  "metadata": {
    "order_id": "ORD-12345",
    "customer_id": "CUST-789"
  }
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Response</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`{
  "id": "pl_abc123def456",
  "title": "Premium Subscription",
  "amount": 10.00,
  "status": "active",
  "payment_url": "${window.location.origin}/pay/abc123",
  "qr_code": "data:image/png;base64,...",
  "created_at": "2025-12-22T10:30:00Z"
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">cURL Example</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`curl -X POST ${window.location.origin}/api/v1/payment-links \\
  -H "Authorization: Bearer dp_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Premium Subscription",
    "amount": 10.00,
    "description": "Monthly premium plan"
  }'`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">JavaScript/Node.js Example</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`const response = await fetch('${window.location.origin}/api/v1/payment-links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer dp_live_your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Premium Subscription',
    amount: 10.00,
    description: 'Monthly premium plan',
    success_url: 'https://yoursite.com/success',
    metadata: { order_id: 'ORD-12345' }
  })
});

const paymentLink = await response.json();
console.log('Payment URL:', paymentLink.payment_url);`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Python Example</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`import requests

response = requests.post(
    '${window.location.origin}/api/v1/payment-links',
    headers={
        'Authorization': 'Bearer dp_live_your_api_key',
        'Content-Type': 'application/json'
    },
    json={
        'title': 'Premium Subscription',
        'amount': 10.00,
        'description': 'Monthly premium plan',
        'success_url': 'https://yoursite.com/success',
        'metadata': {'order_id': 'ORD-12345'}
    }
)

payment_link = response.json()
print(f"Payment URL: {payment_link['payment_url']}")`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Get Payment Status</CardTitle>
                  <CardDescription>GET /payment-links/:id</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Response</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`{
  "id": "pl_abc123def456",
  "title": "Premium Subscription",
  "amount": 10.00,
  "status": "completed",
  "transaction": {
    "id": "tx_xyz789",
    "payer_username": "john_pi",
    "amount": 10.00,
    "txid": "0x1234567890abcdef...",
    "completed_at": "2025-12-22T10:35:00Z"
  },
  "created_at": "2025-12-22T10:30:00Z"
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">cURL Example</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`curl -X GET ${window.location.origin}/api/v1/payment-links/pl_abc123 \\
  -H "Authorization: Bearer dp_live_your_api_key"`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>List All Payment Links</CardTitle>
                  <CardDescription>GET /payment-links</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="font-semibold text-foreground mb-3">Query Parameters</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-4">
                        <code className="text-primary">status</code>
                        <span className="text-muted-foreground">Filter by status: active, completed, expired</span>
                      </div>
                      <div className="flex gap-4">
                        <code className="text-primary">limit</code>
                        <span className="text-muted-foreground">Results per page (default: 20, max: 100)</span>
                      </div>
                      <div className="flex gap-4">
                        <code className="text-primary">offset</code>
                        <span className="text-muted-foreground">Pagination offset</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3 mt-6">Example</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`curl -X GET "${window.location.origin}/api/v1/payment-links?status=completed&limit=10" \\
  -H "Authorization: Bearer dp_live_your_api_key"`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Get Transaction Details</CardTitle>
                  <CardDescription>GET /transactions/:id</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`{
  "id": "tx_xyz789",
  "payment_link_id": "pl_abc123",
  "payer_username": "john_pi",
  "amount": 10.00,
  "status": "completed",
  "txid": "0x1234567890abcdef...",
  "blockchain_verified": true,
  "metadata": {
    "order_id": "ORD-12345"
  },
  "completed_at": "2025-12-22T10:35:00Z",
  "created_at": "2025-12-22T10:30:00Z"
}`}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Webhooks */}
            <TabsContent value="webhooks" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Setup</CardTitle>
                  <CardDescription>
                    Configure webhooks in your dashboard to receive real-time payment notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Event Types</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <code className="text-primary font-medium">payment.completed</code>
                        <p className="text-sm text-muted-foreground mt-1">
                          Triggered when a payment is successfully completed on the blockchain
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <code className="text-primary font-medium">payment.cancelled</code>
                        <p className="text-sm text-muted-foreground mt-1">
                          Triggered when a payment is cancelled by the user
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <code className="text-primary font-medium">payment.expired</code>
                        <p className="text-sm text-muted-foreground mt-1">
                          Triggered when a payment link expires
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Webhook Payload</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`{
  "event": "payment.completed",
  "timestamp": "2025-12-22T10:35:00Z",
  "data": {
    "payment_link_id": "pl_abc123def456",
    "transaction_id": "tx_xyz789",
    "amount": 10.00,
    "payer_username": "john_pi",
    "txid": "0x1234567890abcdef...",
    "blockchain_verified": true,
    "metadata": {
      "order_id": "ORD-12345",
      "customer_id": "CUST-789"
    },
    "completed_at": "2025-12-22T10:35:00Z"
  }
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Signature Verification</h3>
                    <p className="text-muted-foreground mb-4">
                      All webhook requests include an <code className="text-primary">X-DropPay-Signature</code> header for verification:
                    </p>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`// Node.js
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac)
  );
}

// Express middleware example
app.post('/webhooks/droppay', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-droppay-signature'];
  const payload = req.body;
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  // Handle the event
  switch (event.event) {
    case 'payment.completed':
      // Fulfill the order
      console.log('Payment completed:', event.data);
      break;
    case 'payment.cancelled':
      // Handle cancellation
      console.log('Payment cancelled:', event.data);
      break;
  }
  
  res.json({ received: true });
});`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Python Example</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhooks/droppay', methods=['POST'])
def droppay_webhook():
    signature = request.headers.get('X-DropPay-Signature')
    payload = request.get_data()
    
    # Verify signature
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected):
        return 'Invalid signature', 401
    
    event = request.json
    
    if event['event'] == 'payment.completed':
        # Fulfill the order
        print(f"Payment completed: {event['data']}")
    
    return jsonify({'received': True})`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Testing Webhooks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Use tools like <a href="https://ngrok.com" target="_blank" rel="noopener" className="text-primary hover:underline">ngrok</a> to test webhooks locally:
                  </p>
                  <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`# Start your local server
npm start

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in your webhook settings
https://abc123.ngrok.io/webhooks/droppay`}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Checkout Widget */}
            <TabsContent value="checkout" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Embeddable Checkout</CardTitle>
                  <CardDescription>
                    Add Pi Network payments to your website with just a few lines of code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Basic Integration</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`<!-- Add the DropPay script -->
<script src="${window.location.origin}/widget.js"></script>

<!-- Add a payment button -->
<button id="droppay-button">Pay with Pi</button>

<script>
  // Initialize DropPay
  const droppay = DropPay('dp_live_your_api_key');
  
  // Create checkout session
  document.getElementById('droppay-button').addEventListener('click', async () => {
    const session = await droppay.createCheckout({
      amount: 10.00,
      title: 'Premium Subscription',
      description: 'Monthly premium plan',
      successUrl: '${window.location.origin}/success',
      cancelUrl: '${window.location.origin}/cancel'
    });
    
    // Redirect to checkout
    window.location.href = session.payment_url;
  });
</script>`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">React Integration</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`import { useState } from 'react';

function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('${window.location.origin}/api/v1/payment-links', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.REACT_APP_DROPPAY_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Premium Subscription',
          amount: 10.00,
          success_url: window.location.origin + '/success',
          cancel_url: window.location.origin + '/cancel'
        })
      });
      
      const data = await response.json();
      window.location.href = data.payment_url;
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleCheckout}
      disabled={loading}
      className="bg-primary text-white px-6 py-3 rounded-lg"
    >
      {loading ? 'Processing...' : 'Pay with Pi'}
    </button>
  );
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Hosted Checkout Page</h3>
                    <p className="text-muted-foreground mb-4">
                      After creating a payment link via API, redirect users to the hosted checkout page. No additional frontend code required.
                    </p>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`// Server-side: Create payment link
const paymentLink = await createPaymentLink({
  title: 'Product Purchase',
  amount: 25.00
});

// Redirect user to checkout
res.redirect(paymentLink.payment_url);
// Example: ${window.location.origin}/pay/abc123`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SDKs */}
            <TabsContent value="sdks" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Official SDKs</CardTitle>
                  <CardDescription>
                    Use our official libraries to integrate DropPay in your preferred language
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Node.js / JavaScript
                      </h4>
                      <pre className="text-sm text-muted-foreground">npm install @droppay/node</pre>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Python
                      </h4>
                      <pre className="text-sm text-muted-foreground">pip install droppay</pre>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        PHP
                      </h4>
                      <pre className="text-sm text-muted-foreground">composer require droppay/droppay-php</pre>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Ruby
                      </h4>
                      <pre className="text-sm text-muted-foreground">gem install droppay</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Node.js SDK Example</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`const DropPay = require('@droppay/node');

// Initialize with your API key
const droppay = new DropPay('dp_live_your_api_key');

// Create a payment link
const paymentLink = await droppay.paymentLinks.create({
  title: 'Premium Plan',
  amount: 10.00,
  description: 'Monthly subscription',
  successUrl: 'https://yoursite.com/success',
  metadata: {
    customerId: 'cust_123',
    planId: 'premium'
  }
});

console.log('Payment URL:', paymentLink.payment_url);

// Retrieve payment status
const status = await droppay.paymentLinks.retrieve('pl_abc123');
console.log('Status:', status.status);

// List all payment links
const links = await droppay.paymentLinks.list({
  status: 'completed',
  limit: 10
});`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Python SDK Example</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`import droppay

# Initialize with your API key
droppay.api_key = 'dp_live_your_api_key'

# Create a payment link
payment_link = droppay.PaymentLink.create(
    title='Premium Plan',
    amount=10.00,
    description='Monthly subscription',
    success_url='https://yoursite.com/success',
    metadata={
        'customer_id': 'cust_123',
        'plan_id': 'premium'
    }
)

print(f"Payment URL: {payment_link.payment_url}")

# Retrieve payment status
status = droppay.PaymentLink.retrieve('pl_abc123')
print(f"Status: {status.status}")

# List all payment links
links = droppay.PaymentLink.list(
    status='completed',
    limit=10
)`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">REST API (Any Language)</h3>
                    <p className="text-muted-foreground mb-4">
                      Don't see your language? Use our REST API directly with any HTTP client.
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/docs">View REST API Docs</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Handling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">HTTP Status Codes</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-4">
                        <code className="text-green-500">200</code>
                        <span className="text-muted-foreground">Success</span>
                      </div>
                      <div className="flex gap-4">
                        <code className="text-red-500">400</code>
                        <span className="text-muted-foreground">Bad Request - Invalid parameters</span>
                      </div>
                      <div className="flex gap-4">
                        <code className="text-red-500">401</code>
                        <span className="text-muted-foreground">Unauthorized - Invalid API key</span>
                      </div>
                      <div className="flex gap-4">
                        <code className="text-red-500">404</code>
                        <span className="text-muted-foreground">Not Found - Resource doesn't exist</span>
                      </div>
                      <div className="flex gap-4">
                        <code className="text-red-500">429</code>
                        <span className="text-muted-foreground">Too Many Requests - Rate limit exceeded</span>
                      </div>
                      <div className="flex gap-4">
                        <code className="text-red-500">500</code>
                        <span className="text-muted-foreground">Internal Server Error</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3 mt-6">Error Response Format</h3>
                    <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground overflow-x-auto text-sm">
{`{
  "error": {
    "code": "invalid_request",
    "message": "Amount must be a positive number",
    "param": "amount"
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}