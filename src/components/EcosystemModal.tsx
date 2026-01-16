import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Link as LinkIcon } from 'lucide-react';

export function EcosystemModal() {
  const handleGetStarted = () => {
    window.open('https://droplink.space/auth', '_blank');
  };
  
  const handleLearnMore = () => {
    window.open('https://dropshops.space/', '_blank');
  };

  const handleDroplink = () => {
    window.open('https://droplink.space/', '_blank');
  };

  const handleDropStore = () => {
    window.open('https://dropshops.space/', '_blank');
  };

  const handleDropPay = () => {
    window.location.href = '/auth';
  };

  const ecosystemItems = [
    {
      icon: LinkIcon,
      title: 'Droplink',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      description: 'Droplink connects your DropStore storefront to the masses, driving traffic, visibility, and real buyers to your products through one powerful link.',
      link: handleDroplink
    },
    {
      icon: '🛒',
      title: 'DropStore',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      description: 'Your complete storefront, designed to display and sell physical products, digital products, and online services. All in one Pi-powered marketplace.',
      items: ['Physical products', 'Digital products', 'Online services'],
      link: handleDropStore
    },
    {
      icon: '💳',
      title: 'DropPay',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      description: 'Handles payments and payouts seamlessly.',
      items: [
        'Accept Pi payments for your products',
        'Create checkout links for everything',
        'Embed Pi payments on your website',
        'Automatically receive earnings',
        'Manage merchant payouts'
      ]
    }
  ];

  const usageItems = [
    { role: 'Creators & Influencers', action: 'Use Droplink to grow reach', icon: '📢' },
    { role: 'Sellers & Merchants', action: 'Use DropStore to showcase and sell', icon: '🏪' },
    { role: 'Businesses', action: 'Use DropPay for secure Pi payments & earnings', icon: '💼' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-base py-5 rounded-lg shadow-md hover:shadow-lg transition-all">
          <Zap className="w-5 h-5 mr-2" />
          The Drop Ecosystem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-full">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            The Drop Ecosystem
          </DialogTitle>
          <DialogDescription className="text-lg text-foreground">
            For Business & Creators — Build. Sell. Get Paid. All in Pi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6 w-full">
          {/* Three Main Products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {ecosystemItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.link}
                className="text-left transition-all hover:scale-105 w-full"
              >
                <Card className={`${item.bgColor} border-0 shadow-md hover:shadow-xl transition-shadow h-full cursor-pointer`}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-5xl hover:scale-110 transition-transform">
                      {typeof item.icon === 'string' ? (
                        item.icon
                      ) : (
                        <item.icon className={`w-12 h-12 ${item.color}`} />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${item.color} mb-2`}>{item.title}</h3>
                      <p className="text-sm text-foreground leading-relaxed break-words">
                        {item.description}
                      </p>
                    </div>
                    {item.items && (
                      <ul className="space-y-2">
                        {item.items.map((subitem, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="text-primary mt-1 flex-shrink-0">•</span>
                            <span className="break-words">{subitem}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="pt-2">
                      <span className="inline-block text-primary text-sm font-semibold flex items-center gap-1">
                        Visit <ArrowRight className="w-3 h-3 flex-shrink-0" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {/* Connected Ecosystem Flow */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800 w-full">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl flex-shrink-0">🔁</span>
                <h3 className="text-lg font-bold text-foreground break-words">One Connected Ecosystem</h3>
              </div>
              <p className="text-sm text-foreground mb-4">
                These three Pi apps are fully connected, creating a complete business flow:
              </p>
              <div className="flex flex-col md:flex-row items-center justify-between text-center text-sm font-semibold gap-2 overflow-hidden">
                <div className="flex-1 p-3 rounded-lg bg-white/50 dark:bg-black/20 min-w-0 w-full md:w-auto">Exposure</div>
                <ArrowRight className="w-5 h-5 text-primary hidden md:block flex-shrink-0" />
                <div className="md:hidden w-full text-center">↓</div>
                <div className="flex-1 p-3 rounded-lg bg-white/50 dark:bg-black/20 min-w-0 w-full md:w-auto">Selling</div>
                <ArrowRight className="w-5 h-5 text-primary hidden md:block flex-shrink-0" />
                <div className="md:hidden w-full text-center">↓</div>
                <div className="flex-1 p-3 rounded-lg bg-white/50 dark:bg-black/20 min-w-0 w-full md:w-auto">Payment</div>
                <ArrowRight className="w-5 h-5 text-primary hidden md:block flex-shrink-0" />
                <div className="md:hidden w-full text-center">↓</div>
                <div className="flex-1 p-3 rounded-lg bg-white/50 dark:bg-black/20 min-w-0 w-full md:w-auto">Payout</div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Usage */}
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2">
              <span className="text-2xl flex-shrink-0">✅</span>
              <h3 className="text-lg font-bold text-foreground">Recommended Usage</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              {usageItems.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="font-semibold text-sm text-foreground mb-1 break-words">{item.role}</p>
                  <p className="text-xs text-muted-foreground break-words">{item.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Flexible Usage */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 w-full">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl flex-shrink-0">💡</span>
                <h3 className="text-lg font-bold text-foreground break-words">Flexible for Your Needs</h3>
              </div>
              <p className="text-sm text-foreground">
                Use one, two, or all three — depending on your business or creator goals. Mix and match to create the perfect ecosystem for your success.
              </p>
              <div className="flex gap-2 flex-wrap mt-3">
                <Badge variant="outline" className="text-xs flex-shrink-0">Solo Creator</Badge>
                <Badge variant="outline" className="text-xs flex-shrink-0">Small Business</Badge>
                <Badge variant="outline" className="text-xs flex-shrink-0">Enterprise</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="space-y-4 pt-4 border-t w-full">
          <div className="text-center space-y-2">
            <p className="text-xl font-bold text-foreground">Build. Sell. Get Paid. All in Pi.</p>
            <p className="text-sm text-muted-foreground">Join thousands of creators and businesses using the Pi ecosystem</p>
          </div>
          
          <DialogFooter className="flex gap-2 justify-center sm:justify-center flex-wrap">
            <Button 
              variant="outline" 
              onClick={handleLearnMore}
              className="flex-1 sm:flex-none min-w-max"
            >
              Learn More
            </Button>
            <Button 
              onClick={handleGetStarted}
              className="flex-1 sm:flex-none min-w-max bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
