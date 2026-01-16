import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Zap, Check, Star } from 'lucide-react';

export default function GamingDemo() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="py-12 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">Demo Checkout</Badge>
              <h1 className="text-4xl font-bold mb-4">Gaming Checkout Template</h1>
              <p className="text-muted-foreground mb-8">
                Preview how gamers will purchase in-game items, currency, and NFTs with instant delivery.
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
                <div className="bg-gradient-to-br from-purple-600 via-orange-500 to-pink-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">In-Game Store</p>
                      <p className="font-semibold">Epic Quest Adventures</p>
                    </div>
                  </div>
                </div>

                {/* Item Preview */}
                <div className="p-6 border-b border-border bg-gradient-to-br from-purple-50 to-orange-50">
                  <div className="flex gap-4">
                    <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                      <Star className="w-12 h-12 text-white relative z-10" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold">Legendary Weapon Pack</h3>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                          <Star className="w-3 h-3 mr-1" />
                          Epic
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Unlock 5 powerful legendary weapons with unique abilities
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Instant Delivery</Badge>
                        <Badge variant="outline">Limited Time</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Contents */}
                <div className="p-6 border-b border-border">
                  <h4 className="font-semibold mb-4">Package Contents</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Dragon Slayer Sword', rarity: 'Legendary' },
                      { name: 'Phoenix Staff', rarity: 'Legendary' },
                      { name: 'Thunder Bow', rarity: 'Epic' },
                      { name: 'Shadow Daggers', rarity: 'Epic' },
                      { name: 'Mystic Shield', rarity: 'Rare' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <span className="text-sm font-medium">{item.name}</span>
                        <Badge variant="outline" className="text-xs">{item.rarity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Details */}
                <div className="p-6 bg-secondary/30 border-b border-border">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Regular Price</span>
                      <span className="line-through">π 79.99</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sale Discount</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">-30%</Badge>
                      </div>
                      <span className="text-green-600 font-medium">-π 24.00</span>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between items-center">
                      <span className="font-semibold">Final Price</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">π 55.99</div>
                        <div className="text-xs text-green-600">Save 30%!</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 border-b border-border">
                  <div className="space-y-2">
                    {[
                      'Instant delivery to game inventory',
                      'Works on all platforms',
                      'Lifetime ownership',
                      'Exclusive weapon effects'
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
                  <Button className="w-full h-14 text-lg bg-gradient-to-br from-purple-600 via-orange-500 to-pink-600 hover:opacity-90">
                    <Zap className="w-5 h-5 mr-2" />
                    Purchase π 55.99
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    ⚡ Instant delivery • Pi Browser required • Powered by DropPay
                  </p>
                </div>
              </Card>

              {/* Info Note */}
              <Card className="mt-6 p-4 border-orange-200 bg-orange-50">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This template delivers items instantly via webhooks to your game. 
                  Perfect for in-game currency, weapons, skins, and NFTs.
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
