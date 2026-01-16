import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { MascotSection } from '@/components/landing/MascotSection';
import { MascotPersonality } from '@/components/landing/MascotPersonality';
import { MascotInteractions } from '@/components/landing/MascotInteractions';
import { PaymentDemo } from '@/components/landing/PaymentDemo';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { AdvancedFeatures } from '@/components/landing/AdvancedFeatures';
import { IntegrationShowcase } from '@/components/landing/IntegrationShowcase';
import { EmbeddableWidgetsShowcase } from '@/components/landing/EmbeddableWidgetsShowcase';
import { ShareablePaymentLinks } from '@/components/landing/ShareablePaymentLinks';
import { UseCases } from '@/components/landing/UseCases';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { BuilderShowcase } from '@/components/landing/BuilderShowcase';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useState } from 'react';
import { X, Megaphone, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      {/* Add top padding to prevent content overlap */}
      <div className="pt-20">
      
      {/* DropPay Announcement Notification */}
      {showAnnouncement && (
        <div className="relative bg-orange-500 text-white shadow-lg">
          <div className="relative container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 animate-pulse" />
                <Sparkles className="w-4 h-4" />
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs font-bold">
                  🎉 LIVE NOW
                </Badge>
              </div>
              <div className="flex-1">
                <span className="text-sm sm:text-base font-medium">
                  🎉 NEW FEATURE: Advanced widget customization tools now available! Create stunning payment experiences in minutes. Try Now!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-200 text-xs sm:text-sm"
                  onClick={() => {
                    const widgetSection = document.querySelector('#embeddable-widgets');
                    if (widgetSection) {
                      widgetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <ArrowRight className="w-3 h-3 mr-1" />
                  Try Now
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1"
                  onClick={() => setShowAnnouncement(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="overflow-x-hidden">
        <Hero />
        <MascotSection />
        <MascotPersonality />
        <MascotInteractions />
        <PaymentDemo />
        <BuilderShowcase />
        <EmbeddableWidgetsShowcase />
        <ShareablePaymentLinks />
        <Features />
        <HowItWorks />
        <AdvancedFeatures />
        <IntegrationShowcase />
        <UseCases />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
      <ScrollToTop />
      </div>
    </div>
  );
};

export default Index;