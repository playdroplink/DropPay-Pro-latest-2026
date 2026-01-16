import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 animate-fade-in">
            <Shield className="w-4 h-4" />
            <span>Secure Pi Network Payments</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Accept <span className="text-gradient">Pi Payments</span>
            <br />Everywhere
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The simplest way to accept Pi cryptocurrency in your apps and websites. Create payment links, embed checkout widgets, and manage transactions seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">
                Start Accepting Pi
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link to="/docs">
                View API Docs
              </Link>
            </Button>
          </div>

        </div>

        {/* Feature icons */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Instant Setup</div>
              <div className="text-sm text-muted-foreground">Start in minutes</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Secure</div>
              <div className="text-sm text-muted-foreground">Enterprise-grade security</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Global</div>
              <div className="text-sm text-muted-foreground">Accept Pi worldwide</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}