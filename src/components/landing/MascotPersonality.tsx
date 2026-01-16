import { useState, useEffect } from 'react';
import { Brain, Zap, Heart, Shield, Smile, Sparkles } from 'lucide-react';

export function MascotPersonality() {
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

    const section = document.getElementById('mascot-personality-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const personalityTraits = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Super Smart",
      description: "Advanced AI that learns from every interaction to provide better assistance",
      gradient: "from-orange-500/20 to-orange-700/20",
      color: "orange"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Caring & Patient",
      description: "Always understanding, never rushes you, and celebrates your success",
      gradient: "from-orange-500/20 to-orange-700/20",
      color: "orange"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Instant responses and real-time assistance whenever you need help",
      gradient: "from-orange-500/20 to-orange-700/20",
      color: "orange"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trustworthy",
      description: "Keeps your data secure and always gives accurate, reliable information",
      gradient: "from-orange-500/20 to-orange-700/20",
      color: "orange"
    },
    {
      icon: <Smile className="w-8 h-8" />,
      title: "Cheerful Friend",
      description: "Brings positive energy to every interaction with humor and encouragement",
      gradient: "from-orange-500/20 to-orange-700/20",
      color: "orange"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "DropPay AI Support",
      description: "Your intelligent Pi payment assistant, ready to help with any questions",
      gradient: "from-orange-500/20 to-orange-700/20",
      color: "orange"
    }
  ];

  return (
    <section 
      id="mascot-personality-section" 
      className="relative py-24 overflow-hidden bg-gradient-to-br from-accent/5 via-background to-primary/5"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/6 w-72 h-72 bg-accent/12 rounded-full blur-2xl" />
        <div className="absolute top-2/3 left-2/3 w-56 h-56 bg-primary/6 rounded-full blur-xl" />
      </div>

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div 
            className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-6">
              <span>✨</span>
              <span>Mascot Personality</span>
            </div>
            
            {/* Mascot GIF */}
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                <img 
                  src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                  alt="DropPay AI Support Mascot"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg width='128' height='128' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23fb7517'/%3E%3Ctext x='50%25' y='50%25' font-size='30' text-anchor='middle' dy='.3em' fill='white'%3E🎧%3C/text%3E%3C/svg%3E";
                  }}
                />
                
                {/* Floating animation elements */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500/30 rounded-full animate-bounce" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-orange-600/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 -right-3 w-2 h-2 bg-orange-400/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Meet Your <span className="text-gradient">AI Friend</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our mascot isn't just a cute character - it's a sophisticated AI companion with a unique personality 
              designed to make your Pi payment experience extraordinary.
            </p>
          </div>
        </div>

        {/* Personality Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {personalityTraits.map((trait, index) => (
            <div
              key={index}
              className={`group transform transition-all duration-1000 ${
                isVisible 
                  ? 'translate-y-0 opacity-100 scale-100' 
                  : 'translate-y-12 opacity-0 scale-95'
              }`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className={`relative h-full bg-gradient-to-br ${trait.gradient} backdrop-blur-sm border border-border/50 rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group-hover:scale-105`}>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-${trait.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`text-${trait.color}-600`}>
                    {trait.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {trait.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {trait.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo Hint */}
        <div 
          className={`text-center mt-16 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '0.8s' }}
        >
          <div className="inline-flex items-center gap-4 px-8 py-6 bg-orange-500/10 rounded-2xl border border-orange-500/20">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <img 
                src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                alt="DropPay AI Support"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg width='48' height='48' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23fb7517'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='white'%3E🎧%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground text-lg">Ready to chat with DropPay AI Support?</div>
              <div className="text-sm text-muted-foreground">Your intelligent Pi payment assistant is ready to help!</div>
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}