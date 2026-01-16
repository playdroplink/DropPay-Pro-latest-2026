import { useState, useEffect } from 'react';
import { MessageCircle, HelpCircle, Lightbulb, Target, Gift, Users } from 'lucide-react';

export function MascotInteractions() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('mascot-interactions-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveScenario(prev => (prev + 1) % scenarios.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const scenarios = [
    {
      id: 1,
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Getting Started",
      userMessage: "Hi! I'm new to Pi payments. Can you help me?",
      mascotResponse: "Welcome! 🎉 I'm excited to help you create your first payment link. Let's start with something simple - would you like to make a donation link or a product purchase link?",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600"
    },
    {
      id: 2,
      icon: <HelpCircle className="w-6 h-6" />,
      title: "Problem Solving",
      userMessage: "My payment isn't working. What should I do?",
      mascotResponse: "No worries! 🔧 Let me check that for you. I can see the issue - your Pi wallet needs to be connected. Shall I walk you through the connection process step by step?",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-600"
    },
    {
      id: 3,
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Smart Suggestions",
      userMessage: "How can I increase my sales?",
      mascotResponse: "Great question! 💡 Based on your data, I recommend adding QR codes to your store, offering Pi payment discounts, and creating urgency with limited-time offers. Want me to set these up for you?",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600"
    },
    {
      id: 4,
      icon: <Target className="w-6 h-6" />,
      title: "Goal Achievement",
      userMessage: "I want to reach 100 Pi in sales this month.",
      mascotResponse: "Awesome goal! 🎯 You're at 67 Pi so far. At your current rate, you'll reach 95 Pi. Let me suggest some strategies to boost those last 5 Pi - promotional campaigns work great!",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600"
    },
    {
      id: 5,
      icon: <Gift className="w-6 h-6" />,
      title: "Celebrations",
      userMessage: "I just made my first 10 Pi sale!",
      mascotResponse: "🎉 CONGRATULATIONS! That's amazing! Your first 10 Pi is a huge milestone. I'm so proud of you! Want me to help you celebrate by setting up a special thank-you message for your customers?",
      bgColor: "bg-pink-500/10",
      iconColor: "text-pink-600"
    },
    {
      id: 6,
      icon: <Users className="w-6 h-6" />,
      title: "Community Tips",
      userMessage: "Any tips for Pi Network beginners?",
      mascotResponse: "Absolutely! 🌟 Start small, be patient with the network, always verify transactions, and join the DropPay community. I've prepared a beginner's guide just for you - would you like me to share it?",
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <section 
      id="mascot-interactions-section" 
      className="relative py-24 overflow-hidden bg-gradient-to-r from-background via-primary/3 to-background"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div 
            className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span>💬</span>
              <span>Live Interactions</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Chat With Your <span className="text-gradient">AI Assistant</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how our mascot responds to real user questions and scenarios. 
              Every conversation is personalized, helpful, and designed to move you forward.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Scenario Tabs */}
            <div className="lg:col-span-1">
              <div className="space-y-3">
                {scenarios.map((scenario, index) => (
                  <button
                    key={scenario.id}
                    onClick={() => setActiveScenario(index)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                      activeScenario === index 
                        ? `${scenario.bgColor} border-primary/30 shadow-lg` 
                        : 'bg-card border-border hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${activeScenario === index ? scenario.bgColor : 'bg-muted'} flex items-center justify-center`}>
                        <div className={activeScenario === index ? scenario.iconColor : 'text-muted-foreground'}>
                          {scenario.icon}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{scenario.title}</div>
                        <div className="text-xs text-muted-foreground">Real conversation example</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div 
                className={`transform transition-all duration-1000 ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                }`}
              >
                <div className="bg-card border border-border rounded-3xl p-6 shadow-xl">
                  <div className="space-y-4">
                    
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                        <img 
                          src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                          alt="DropPay AI Assistant"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg width='48' height='48' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23fb7517'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='white'%3E🎧%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">DropPay Assistant</div>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Online & Ready to Help
                        </div>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-md p-4">
                        <p className="text-sm">{scenarios[activeScenario].userMessage}</p>
                        <div className="text-xs opacity-70 mt-2">Just now</div>
                      </div>
                    </div>

                    {/* Typing Indicator (shows briefly) */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <img 
                          src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                          alt="AI Typing"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23fb7517'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='white'%3E🎧%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-md p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Mascot Response */}
                    <div className="flex">
                      <div className="max-w-[80%]">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center mt-1">
                            <img 
                              src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                              alt="DropPay AI Assistant"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23fb7517'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='white'%3E🎧%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <div className="bg-muted rounded-2xl rounded-bl-md p-4">
                            <p className="text-sm text-foreground leading-relaxed">{scenarios[activeScenario].mascotResponse}</p>
                            <div className="text-xs text-muted-foreground mt-2">Just now</div>
                          </div>
                        </div>
                      </div>
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