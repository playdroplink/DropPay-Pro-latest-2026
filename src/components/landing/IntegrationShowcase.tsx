import { ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IntegrationShowcase() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Seamless Integration with Mrwain Ecosystem
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            DropPay works perfectly with Droplink and Dropstore, creating a complete business solution
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Droplink Integration */}
          <div className="group relative overflow-hidden rounded-3xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-32 -mt-32"></div>
            
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">DL</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Droplink</h3>
                      <p className="text-sm text-primary">Link Management Platform</p>
                    </div>
                  </div>
                </div>
                <a 
                  href="https://droplink.space/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Monetize your shortened links with Pi payments. Create payment gates, track clicks, 
                and earn from your shared content - all integrated with DropPay.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Monetize shortened links with Pi</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Payment-gated content access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Real-time analytics & earnings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Automatic payment processing</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" 
                  asChild
                >
                  <a href="https://droplink.space/" target="_blank" rel="noopener noreferrer">
                    Visit Droplink
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>

              {/* Integration Badge */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="font-medium">Fully Integrated with DropPay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dropstore Integration */}
          <div className="group relative overflow-hidden rounded-3xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-32 -mt-32"></div>
            
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">DS</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Dropstore</h3>
                      <p className="text-sm text-primary">E-Commerce Platform</p>
                    </div>
                  </div>
                </div>
                <a 
                  href="https://dropshops.space/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Build your online store and accept Pi payments seamlessly. Sell digital and physical products 
                with automatic order fulfillment powered by DropPay.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Complete e-commerce solution</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Inventory & order management</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Secure Pi payment checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Multi-vendor marketplace support</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" 
                  asChild
                >
                  <a href="https://dropshops.space/" target="_blank" rel="noopener noreferrer">
                    Visit Dropstore
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>

              {/* Integration Badge */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="font-medium">Fully Integrated with DropPay</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ecosystem Overview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                The Complete Mrwain Ecosystem
              </h3>
              <p className="text-muted-foreground">
                Three powerful platforms working together to grow your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-xl font-bold text-white">DL</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Droplink</h4>
                <p className="text-sm text-muted-foreground">Link monetization & management</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-xl font-bold text-white">DP</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">DropPay</h4>
                <p className="text-sm text-muted-foreground">Payment processing infrastructure</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-xl font-bold text-white">DS</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Dropstore</h4>
                <p className="text-sm text-muted-foreground">E-commerce & marketplace platform</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-primary">Mrwain Organization</span> • Building the future of Pi Network commerce
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
