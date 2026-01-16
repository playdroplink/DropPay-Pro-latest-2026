import { useState, useEffect } from 'react';

export function MascotSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('mascot-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  return (
    <section 
      id="mascot-section" 
      className="relative py-20 bg-background"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-primary/15 rounded-full blur-xl" />
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Mascot GIF Container */}
            <div className="flex justify-center lg:justify-start order-1 lg:order-2">
              <div 
                className={`relative transform transition-all duration-1000 ${
                  isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
                }`}
              >
                {/* Mascot Image/GIF Placeholder */}
                <div className="relative w-80 h-80 mx-auto">
                  {/* DropPay Mascot GIF */}
                  <img 
                    src="https://s12.gifyu.com/images/bhczW.gif"
                    alt="DropPay Mascot"
                    className="w-full h-full object-contain rounded-2xl"
                    onError={(e) => {
                      // Fallback if gif doesn't load - shows a placeholder
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg width='320' height='320' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%236b7280'%3EMascot GIF Here%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  
                  {/* Floating animation elements around mascot */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-orange-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 -right-8 w-6 h-6 bg-orange-600/15 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div 
                className={`transform transition-all duration-1000 ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                }`}
                style={{ transitionDelay: '0.2s' }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-6">
                  <span>👋</span>
                  <span>Meet Our Mascot</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                  Your Trusted Pi Payment
                  <br />
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Guide & Companion</span>
                </h2>

                <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                  Meet our intelligent AI-powered mascot, designed specifically to simplify your Pi Network payment experience. 
                  Whether you're setting up your first payment link, managing complex transactions, or exploring advanced features, 
                  our companion provides step-by-step guidance, instant support, and makes every interaction delightful and intuitive.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-lg shadow-primary/10">
                    <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
                      <span className="text-orange-300 font-bold">✓</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm text-foreground">Expert Assistance Always</div>
                      <div className="text-xs text-muted-foreground">Round-the-clock intelligent support & real-time guidance</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-lg shadow-primary/10">
                    <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
                      <span className="text-orange-300 font-bold">🚀</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm text-foreground">Delightful Journey</div>
                      <div className="text-xs text-muted-foreground">Interactive learning with gamified payment experiences</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}