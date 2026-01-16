import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Target, Check, Users } from 'lucide-react';

export default function DonationsDemo() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="py-12 bg-gradient-to-b from-blue-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">Demo Checkout</Badge>
              <h1 className="text-4xl font-bold mb-4">Donation Checkout Template</h1>
              <p className="text-muted-foreground mb-8">
                Preview how donors will contribute to your cause with one-time or recurring donations.
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
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Support</p>
                      <p className="font-semibold">Ocean Conservation Project</p>
                    </div>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold mb-3">Help Save Our Oceans</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your donation helps fund research, beach cleanup initiatives, and marine life protection programs.
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">Campaign Progress</span>
                      <span className="text-muted-foreground">π 7,540 of π 10,000</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: '75.4%' }}></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>1,234 donors</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        75% funded
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Donation Amount */}
                <div className="p-6 bg-secondary/30 border-b border-border">
                  <h4 className="font-semibold mb-4">Choose Your Donation Amount</h4>
                  
                  {/* Suggested Amounts */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[10, 25, 50].map((amount) => (
                      <button
                        key={amount}
                        className="p-3 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                      >
                        <div className="font-bold text-primary">π {amount}</div>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">π</span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      className="w-full pl-8 pr-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Donation Type */}
                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 border-primary bg-primary/5 rounded-lg cursor-pointer">
                      <input type="radio" name="donation-type" className="w-4 h-4" defaultChecked />
                      <span className="font-medium">One-time donation</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 border-border rounded-lg cursor-pointer hover:border-primary">
                      <input type="radio" name="donation-type" className="w-4 h-4" />
                      <span className="font-medium">Monthly recurring</span>
                    </label>
                  </div>
                </div>

                {/* Impact */}
                <div className="p-6 border-b border-border">
                  <h4 className="font-semibold mb-3">Your Impact</h4>
                  <div className="space-y-2">
                    {[
                      'Fund 1 month of ocean research',
                      'Clean 100 meters of beach',
                      'Protect 5 endangered species',
                      'Receive impact reports & updates'
                    ].map((impact) => (
                      <div key={impact} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">{impact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Button */}
                <div className="p-6">
                  <Button className="w-full h-14 text-lg bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700">
                    <Heart className="w-5 h-5 mr-2" />
                    Donate Now
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    🔒 Secure donation • Tax receipt provided • Powered by DropPay
                  </p>
                </div>
              </Card>

              {/* Info Note */}
              <Card className="mt-6 p-4 border-orange-200 bg-orange-50">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This template supports one-time and recurring donations. Automatically generates 
                  tax receipts and thank-you messages for donors.
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
