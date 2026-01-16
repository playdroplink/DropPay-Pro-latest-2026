import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, QrCode, Zap, Heart, Home, Users, Cake, Hand, MessageCircle, Facebook, Linkedin, Twitter, Send, Mail, PinIcon, Globe, Link as LinkIcon, Plug, Store, Code, ExternalLink, Megaphone, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UseCaseDemo {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  amount: string;
  linkExample: string;
}

const useCaseDemos: UseCaseDemo[] = [
  {
    title: 'Rent Payment',
    description: 'Share rent payment link with roommates or tenants',
    icon: <Home className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    amount: '500 π',
    linkExample: 'droppay.space/pay/rent-monthly-2026'
  },
  {
    title: 'Family Budget',
    description: 'Collect Pi for family expenses from everyone',
    icon: <Users className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    amount: '100 π',
    linkExample: 'droppay.space/pay/family-budget-split'
  },
  {
    title: 'Birthday Gifts',
    description: 'Create a wishlist and let friends contribute',
    icon: <Cake className="w-6 h-6" />,
    color: 'from-pink-500 to-pink-600',
    amount: '50 π',
    linkExample: 'droppay.space/pay/birthday-gift-2026'
  },
  {
    title: 'Tips & Donations',
    description: 'Accept tips or donations for your work',
    icon: <Hand className="w-6 h-6" />,
    color: 'from-yellow-500 to-yellow-600',
    amount: 'Custom amount',
    linkExample: 'droppay.space/pay/support-me'
  },
  {
    title: 'Group Events',
    description: 'Split costs for parties, trips, and events',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    amount: '75 π',
    linkExample: 'droppay.space/pay/event-cost-share'
  },
  {
    title: 'Service Payments',
    description: 'Get paid for your services or products',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-red-500 to-red-600',
    amount: '200 π',
    linkExample: 'droppay.space/pay/service-payment'
  }
];

const socialMediaPlatforms = [
  { name: 'WhatsApp', iconComponent: MessageCircle, color: 'text-green-500 hover:text-green-600' },
  { name: 'Facebook', iconComponent: Facebook, color: 'text-blue-600 hover:text-blue-700' },
  { name: 'Twitter', iconComponent: Twitter, color: 'text-blue-400 hover:text-blue-500' },
  { name: 'LinkedIn', iconComponent: Linkedin, color: 'text-blue-700 hover:text-blue-800' },
  { name: 'Telegram', iconComponent: Send, color: 'text-blue-500 hover:text-blue-600' },
  { name: 'Email', iconComponent: Mail, color: 'text-gray-600 hover:text-gray-700' },
  { name: 'Pinterest', iconComponent: PinIcon, color: 'text-red-600 hover:text-red-700' },
  { name: 'TikTok', iconComponent: Share2, color: 'text-black hover:text-gray-800' },
];

export function ShareablePaymentLinks() {
  const [selectedUseCase, setSelectedUseCase] = useState(0);
  const [demoLink, setDemoLink] = useState(useCaseDemos[0].linkExample);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const shareToSocial = (platform: string) => {
    const message = `Join me on DropPay! I'm accepting Pi payments using this secure link. You can easily send Pi to me: ${demoLink}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedLink = encodeURIComponent(demoLink);

    const shareUrls: Record<string, string> = {
      WhatsApp: `https://wa.me/?text=${encodedMessage}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`,
      Twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
      Telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodedMessage}`,
      Email: `mailto:?subject=Join%20me%20on%20DropPay&body=${encodedMessage}`,
      Pinterest: `https://pinterest.com/pin/create/button/?url=${encodedLink}&description=${encodedMessage}`,
      TikTok: `https://www.tiktok.com/share?url=${encodedLink}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      toast.success(`Sharing to ${platform}...`);
    }
  };

  const currentUseCase = useCaseDemos[selectedUseCase];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-orange-500/20 text-orange-700 border-orange-300 mb-4">
            Share & Earn
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Shareable Payment Links & QR Codes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create payment links in seconds and share them on any social media, email, or messaging app. Your customers can pay you directly with Pi Network.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Demo Section */}
          <div className="space-y-6">
            {/* Active Demo Card */}
            <Card className="border-2 border-orange-200 bg-white">
              <CardHeader>
                <CardTitle className="text-orange-600">Demo: {currentUseCase.title}</CardTitle>
                <CardDescription>{currentUseCase.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Display */}
                <div className="p-4 rounded-lg bg-white border-2 border-orange-200">
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-3xl font-bold text-orange-600">{currentUseCase.amount}</p>
                </div>

                {/* Payment Link */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Your Payment Link</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={demoLink}
                      readOnly 
                      className="font-mono text-sm bg-white border-orange-200 focus:border-orange-500"
                      onChange={(e) => setDemoLink(e.target.value)}
                    />
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(demoLink)}
                      className="border-orange-200 hover:bg-orange-50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link with your customers - they can pay you directly!
                  </p>
                </div>

                {/* QR Code Button */}
                <Button 
                  onClick={() => setShowQR(!showQR)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  variant={showQR ? "default" : "outline"}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQR ? 'Hide' : 'Show'} QR Code
                </Button>

                {/* QR Code Demo */}
                {showQR && (
                  <div className="p-4 rounded-lg bg-white border-2 border-orange-200 flex flex-col items-center">
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-orange-300">
                      <div className="text-center">
                        <QrCode className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">QR Code Preview</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Customers can scan this QR code to pay you instantly
                    </p>
                  </div>
                )}

                {/* Social Share Section */}
                <div className="space-y-3 pt-4 border-t border-orange-200">
                  <p className="text-sm font-medium text-foreground">Share on Social Media</p>
                  <div className="grid grid-cols-4 gap-2">
                    {socialMediaPlatforms.slice(0, 4).map((platform) => {
                      const IconComponent = platform.iconComponent;
                      return (
                        <Button
                          key={platform.name}
                          variant="outline"
                          size="sm"
                          onClick={() => shareToSocial(platform.name)}
                          className={`border-orange-200 hover:bg-orange-50 h-10 transition-colors ${platform.color}`}
                          title={`Share on ${platform.name}`}
                        >
                          <IconComponent size={20} />
                        </Button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {socialMediaPlatforms.slice(4).map((platform) => {
                      const IconComponent = platform.iconComponent;
                      return (
                        <Button
                          key={platform.name}
                          variant="outline"
                          size="sm"
                          onClick={() => shareToSocial(platform.name)}
                          className={`border-orange-200 hover:bg-orange-50 h-10 transition-colors ${platform.color}`}
                          title={`Share on ${platform.name}`}
                        >
                          <IconComponent size={20} />
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases Grid */}
          <div className="space-y-4">
            {/* 3 Easy Steps */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-foreground mb-4">3 Easy Steps</h3>
              <p className="text-muted-foreground mb-6">Start fast: connect, send, and request Pi payments.</p>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Step 1: Social Connect & Gifts */}
                <Card className="border-2 border-orange-200 bg-white">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <img
                        src="https://i.ibb.co/TD4yxvYL/media-91.gif"
                        alt="Social connect & gifts"
                        className="w-40 h-40 mx-auto rounded-lg border-2 border-orange-200 object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-foreground text-center mb-1">Social Connect & Gifts</h4>
                    <p className="text-sm text-muted-foreground text-center">Share with family, friends, and customers across social apps.</p>
                  </CardContent>
                </Card>

                {/* Step 2: Send Your Link */}
                <Card className="border-2 border-orange-200 bg-white">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <img
                        src="https://i.ibb.co/qYBfSZcn/media-87.gif"
                        alt="Send your payment link"
                        className="w-40 h-40 mx-auto rounded-lg border-2 border-orange-200 object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-foreground text-center mb-1">Send Your Link</h4>
                    <p className="text-sm text-muted-foreground text-center">Copy your DropPay link or QR and share anywhere.</p>
                  </CardContent>
                </Card>

                {/* Step 3: Request a Payment */}
                <Card className="border-2 border-orange-200 bg-white">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <img
                        src="https://i.ibb.co/v6nzrGMr/media-86.gif"
                        alt="Request a payment"
                        className="w-40 h-40 mx-auto rounded-lg border-2 border-orange-200 object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-foreground text-center mb-1">Request a Payment</h4>
                    <p className="text-sm text-muted-foreground text-center">Get Pi payments instantly—DropPay updates your dashboard in real-time.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-6">Popular Use Cases</h3>
            <div className="grid gap-4">
              {useCaseDemos.map((useCase, index) => (
                <Card
                  key={index}
                  onClick={() => {
                    setSelectedUseCase(index);
                    setDemoLink(useCase.linkExample);
                    setShowQR(false);
                  }}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    selectedUseCase === index
                      ? 'border-orange-600 bg-orange-50 shadow-lg'
                      : 'border-border hover:border-orange-300 hover:bg-orange-50/30'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-orange-600 text-white`}>
                        {useCase.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{useCase.title}</h4>
                        <p className="text-sm text-muted-foreground">{useCase.description}</p>
                      </div>
                      {selectedUseCase === index && (
                        <Badge className="bg-orange-600 text-white">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Drive Mass Adoption */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-3">Drive Mass Adoption of Pi Payments</h3>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            Turn any audience into payers. Share links, display QR codes, and embed simple checkout flows so customers pay in seconds via Pi Browser.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-orange-600 mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Frictionless for Customers</h4>
                <p className="text-sm text-muted-foreground">No complex signup. Open in Pi Browser and pay — that’s it.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <Megaphone className="w-8 h-8 text-orange-600 mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Share at Scale</h4>
                <p className="text-sm text-muted-foreground">Broadcast links across social, SMS, and email. Track results.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <Globe className="w-8 h-8 text-orange-600 mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Scale Globally</h4>
                <p className="text-sm text-muted-foreground">Pi payments work across borders with blockchain verification.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <BarChart3 className="w-8 h-8 text-orange-600 mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Business-Ready Analytics</h4>
                <p className="text-sm text-muted-foreground">Understand volume, conversion, and top links directly in dashboard.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <Card className="border-orange-200 bg-white">
            <CardContent className="pt-6">
              <Share2 className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="font-semibold text-foreground mb-2">Share Anywhere</h4>
              <p className="text-sm text-muted-foreground">
                Share your payment links on WhatsApp, Facebook, Twitter, email, and more
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-white">
            <CardContent className="pt-6">
              <QrCode className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="font-semibold text-foreground mb-2">QR Codes</h4>
              <p className="text-sm text-muted-foreground">
                Generate scannable QR codes for in-person payments instantly
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-white">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="font-semibold text-foreground mb-2">Real-Time Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Track all payments in real-time on your DropPay dashboard
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-white">
            <CardContent className="pt-6">
              <Heart className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="font-semibold text-foreground mb-2">Easy & Secure</h4>
              <p className="text-sm text-muted-foreground">
                All Pi payments are verified on blockchain for maximum security
              </p>
            </CardContent>
          </Card>
        </div>

        {/* External Website Integration */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-3">Integrate DropPay on Any External Website</h3>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            DropPay is an open network for Pi payments. Connect your live store or site and start accepting Pi instantly — no heavy backend required. Works with custom websites, blogs, storefronts, and real-world businesses.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-foreground">Any Site, Any Stack</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Works with Shopify, WordPress, Wix, custom React/Vue/Next.js sites — or plain HTML pages. Just add your DropPay link or embed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Plug className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-foreground">Plug-and-Play Setup</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Create a payment link</li>
                  <li>• Paste the link or QR on your site</li>
                  <li>• Customers pay via Pi Browser — you get instant updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Store className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-foreground">Real-World Ready</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Link and QR flows make in-person and online payments easy for shops, services, events, and deliveries. Track everything in your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <LinkIcon className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-foreground">Deep Links for Pi</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Seamless deep links open directly in Pi Browser for secure auth and blockchain-verified payments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Code className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-foreground">API Optional</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use simple links/QRs with no backend, or integrate fully with our Edge Functions for advanced workflows.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white">
              <CardContent className="pt-6 text-center">
                <ExternalLink className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">Ready to connect your business?</p>
                <Button asChild className="bg-orange-600 text-white hover:bg-orange-700">
                  <a href="/auth">Connect DropPay to Your Site</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="mt-16 border-2 border-orange-500 bg-orange-600 text-white">
          <CardContent className="pt-8 text-center">
            <h3 className="text-3xl font-bold mb-3">Start Creating Shareable Payment Links Today</h3>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Set up your first payment link in seconds. Share it with your customers, family, and friends. Get paid instantly in Pi Network.
            </p>
            <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              <a href="/auth">Create Your First Payment Link</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Simple Label component if not imported
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium text-foreground ${className}`}>{children}</label>;
}
