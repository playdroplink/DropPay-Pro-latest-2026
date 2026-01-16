import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Play, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import dropPayLogo from '@/assets/droppay-logo.png';

export function PaymentDemo() {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const codeExample = `// Create a payment in seconds
const payment = await droppay.paymentLinks.create({
  amount: 25.00,
  title: 'Premium Subscription',
  description: 'Annual plan with all features',
  successUrl: 'https://yoursite.com/success',
  metadata: {
    userId: 'user_123',
    plan: 'premium'
  }
});

// Payment URL ready to share
console.log(payment.payment_url);
// https://droppay.space/pay/abc123xyz`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
    toast.success('Demo payment created!');
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            See DropPay in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how easy it is to create and accept Pi payments
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Code Editor */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/30 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-lg">
                {/* Editor Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Code2 className="w-4 h-4" />
                    <span>payment.js</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Code Content */}
                <div className="p-6 overflow-x-auto bg-white">
                  <pre className="text-sm leading-relaxed">
                    <code className="text-gray-800">
                      <span className="text-gray-500">// Create a payment in seconds</span>
                      {'\n'}
                      <span className="text-purple-600">const</span> <span className="text-blue-600">payment</span> = <span className="text-purple-600">await</span> <span className="text-blue-600">droppay</span>.<span className="text-yellow-600">paymentLinks</span>.<span className="text-green-600">create</span>{'({'}
                      {'\n  '}
                      <span className="text-blue-600">amount</span>: <span className="text-orange-600">25.00</span>,
                      {'\n  '}
                      <span className="text-blue-600">title</span>: <span className="text-green-600">'Premium Subscription'</span>,
                      {'\n  '}
                      <span className="text-blue-600">description</span>: <span className="text-green-600">'Annual plan'</span>,
                      {'\n  '}
                      <span className="text-blue-600">successUrl</span>: <span className="text-green-600">'https://yoursite.com'</span>,
                      {'\n  '}
                      <span className="text-blue-600">metadata</span>: {'{'}
                      {'\n    '}
                      <span className="text-blue-600">userId</span>: <span className="text-green-600">'user_123'</span>
                      {'\n  }'}
                      {'\n});'}
                      {'\n\n'}
                      <span className="text-gray-500">// Payment URL ready to share</span>
                      {'\n'}
                      <span className="text-blue-600">console</span>.<span className="text-yellow-600">log</span>(<span className="text-blue-600">payment</span>.<span className="text-yellow-600">payment_url</span>);
                      {'\n'}
                      <span className="text-gray-500">// https://droppay.space/pay/abc123</span>
                    </code>
                  </pre>
                </div>

                {/* Run Button */}
                <div className="px-6 pb-6">
                  <Button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="w-full"
                  >
                    {isPlaying ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Demo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Result Preview */}
            <div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded bg-background border border-border text-xs text-muted-foreground">
                    <span>🔒</span>
                    <span>droppay.space/pay/demo</span>
                  </div>
                </div>

                {/* Checkout Preview */}
                <div className="p-8 bg-gradient-to-br from-background to-secondary/20">
                  <div className="max-w-sm mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <img 
                          src={dropPayLogo} 
                          alt="DropPay" 
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Premium Subscription</h3>
                      <p className="text-muted-foreground">Annual plan with all features</p>
                    </div>

                    <div className="bg-background rounded-xl p-6 border border-border mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="text-3xl font-bold text-primary">π 25.00</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Platform</span>
                          <span>Pi Network</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Status</span>
                          <span className="text-green-500">• Active</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                      Pay with Pi
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Secured by DropPay • Blockchain Verified
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">&lt;100ms</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
