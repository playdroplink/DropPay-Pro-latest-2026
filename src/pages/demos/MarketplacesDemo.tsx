import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Users, Check, Shield } from 'lucide-react';

export default function MarketplacesDemo() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="py-12 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">Demo Checkout</Badge>
              <h1 className="text-4xl font-bold mb-4">Marketplace Checkout Template</h1>
              <p className="text-muted-foreground mb-8">
                Preview how split payments work between sellers and platform fees (2% for maintenance & future features) in marketplaces.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              {/* Checkout Card */}
              <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Marketplace</p>
                      <p className="font-semibold">Your Marketplace Name</p>
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="p-6 border-b border-border bg-secondary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sold by</p>
                      <p className="font-semibold">Creative Seller Studio</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">Verified</Badge>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold mb-2">Handcrafted Digital Asset Pack</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Premium collection of design resources
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Digital Download</Badge>
                    <Badge variant="outline">Instant Access</Badge>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="p-6 bg-secondary/30 border-b border-border">
                  <h4 className="font-semibold mb-4">Payment Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Item Price</span>
                      <span className="font-medium">π 100.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Platform Fee (for maintenance & features)</span>
                        <Badge variant="secondary" className="text-xs">10%</Badge>
                      </div>
                      <span className="font-medium">π 10.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seller Receives</span>
                      <span className="font-medium text-green-600">π 90.00</span>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between">
                      <span className="font-semibold">You Pay</span>
                      <span className="text-2xl font-bold text-primary">π 100.00</span>
                    </div>
                  </div>
                </div>

                {/* Protection */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-blue-900 mb-1">Buyer Protection</p>
                      <p className="text-xs text-blue-700">
                        Your payment is held in escrow until delivery is confirmed. Get refund if item not as described.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 border-b border-border">
                  <div className="space-y-2">
                    {[
                      'Automatic split payment to seller',
                      'Buyer protection included',
                      'Instant download after payment',
                      'Seller rating & reviews'
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
                    Complete Purchase π 100.00
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    🔒 Escrow protected • Powered by DropPay
                  </p>
                </div>
              </Card>

              {/* Info Note */}
              <Card className="mt-6 p-4 border-orange-200 bg-orange-50">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This template automatically splits payments between sellers and your platform. 
                  Set custom commission rates per seller or category.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
