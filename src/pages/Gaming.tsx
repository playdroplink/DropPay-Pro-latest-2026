import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Gamepad2, Zap, Package, Trophy, Users, Coins, ArrowRight, Check } from 'lucide-react';

export default function Gaming() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">Gaming & NFTs</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Monetize Your <span className="text-gradient">Game</span> with Pi
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Monetize your game or sell digital collectibles. Perfect for in-game purchases, NFT marketplaces, virtual goods, and instant item delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Start Monetizing
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/demos/gaming">View Demo Checkout</Link>
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
              <h2 className="text-3xl font-bold mb-4">Power Your Gaming Economy</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built for game developers and NFT creators
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Package,
                  title: 'In-Game Purchases',
                  description: 'Sell virtual items, currency, power-ups, and cosmetics. Seamless checkout integrated directly into your game.',
                },
                {
                  icon: Coins,
                  title: 'NFT Payments',
                  description: 'Accept Pi for NFT sales and minting. Perfect for digital collectibles, art, and blockchain gaming assets.',
                },
                {
                  icon: Trophy,
                  title: 'Virtual Goods',
                  description: 'Monetize premium content, characters, weapons, skins, and special items with instant delivery.',
                },
                {
                  icon: Zap,
                  title: 'Instant Delivery',
                  description: 'Automatically deliver purchased items to player inventories via webhooks. Real-time verification and fulfillment.',
                },
                {
                  icon: Users,
                  title: 'Player Management',
                  description: 'Track purchase history, spending patterns, and player lifetime value. Build better monetization strategies.',
                },
                {
                  icon: Gamepad2,
                  title: 'Game-First Integration',
                  description: 'Simple APIs designed for game engines. Works with Unity, Unreal, Godot, and custom engines.',
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
              <h2 className="text-3xl font-bold mb-4">Integrate in Hours, Not Weeks</h2>
              <p className="text-muted-foreground">Simple setup for game developers</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  step: '1',
                  title: 'Add Payment SDK',
                  description: 'Install DropPay SDK for your game engine. Works with Unity, Unreal, and web-based games. Native Pi Browser support.',
                },
                {
                  step: '2',
                  title: 'Define Your Items',
                  description: 'Create payment links for each purchasable item - coins, skins, weapons, NFTs. Set up webhooks for instant delivery.',
                },
                {
                  step: '3',
                  title: 'Start Selling',
                  description: 'Players purchase with Pi cryptocurrency. Your game receives webhooks instantly and delivers items to player inventory.',
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
                { title: 'Mobile Games', items: ['Casual games', 'RPGs', 'Strategy games', 'Battle royale'] },
                { title: 'NFT Projects', items: ['Digital art', 'Collectibles', 'Gaming NFTs', 'Metaverse assets'] },
                { title: 'Web3 Gaming', items: ['Play-to-earn', 'Blockchain games', 'Virtual worlds', 'GameFi'] },
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
              <h2 className="text-3xl font-bold mb-4">Ready to Monetize Your Game?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join game developers already earning with DropPay
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
