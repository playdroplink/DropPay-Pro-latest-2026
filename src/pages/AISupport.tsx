import { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, HelpCircle, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AISupport() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there! I'm your DropPay AI Assistant! I'm here to help you with everything about Pi Network payments, setting up checkout links, troubleshooting, and making the most of our platform. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Predefined quick questions
  const quickQuestions = [
    "How do I create a checkout link?",
    "What is Pi Network?",
    "How do payments work?",
    "Setup my first payment",
    "Troubleshoot payment issues",
    "API documentation"
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // OpenRouter API integration
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'DropPay AI Support'
        },
        body: JSON.stringify({
          model: "xiaomi/mimo-v2-flash:free",
          messages: [
            {
              role: "system",
              content: `You are the DropPay AI Assistant, a comprehensive expert on the DropPay platform. DropPay is the leading Pi Network payment processing platform that enables businesses to accept Pi cryptocurrency payments seamlessly.

COMPLETE DROPPAY PLATFORM KNOWLEDGE:

🏢 PLATFORM OVERVIEW:
- DropPay is a comprehensive Pi Network payment gateway supporting businesses of all sizes
- Connects directly to Pi Network's official mainnet for secure, real transactions
- Supports both one-time payments and recurring subscriptions
- Integrated with Pi Network's authentication system and payment APIs
- Offers both hosted checkout pages and embedded payment widgets
- Real-time transaction processing with instant confirmations

💳 PAYMENT FEATURES:
- Payment Links: Create custom URLs for products, services, donations
- QR Codes: Auto-generated for contactless payments in physical stores
- Checkout Pages: Fully customizable branded payment experiences
- Shopping Cart: Multi-item purchase support with cart functionality
- Subscriptions: Recurring billing for SaaS, memberships, services
- Donations: Crowdfunding and charity payment collection
- File Downloads: Sell digital products with automatic delivery
- Custom Forms: Collect customer information during checkout

🛠️ TECHNICAL CAPABILITIES:
- REST API with comprehensive documentation
- Webhooks for real-time payment notifications
- SDKs for popular programming languages
- Embedded widgets for any website
- Mobile-responsive design for all devices
- SSL encryption and PCI compliance
- Real-time analytics and reporting
- CSV export functionality for all data

📊 DASHBOARD FEATURES:
- Real-time transaction monitoring
- Revenue analytics with charts and graphs
- Payment link management and editing
- Customer database and order history
- Payout tracking and withdrawal management
- API key management and usage statistics
- Webhook endpoint configuration
- Custom branding and theme settings

💼 BUSINESS SOLUTIONS:
- E-commerce Integration: Shopify, WooCommerce, custom stores
- SaaS Billing: Subscription management for software services
- Marketplace Support: Multi-vendor payment splitting
- Restaurant/Retail: QR code payments for physical locations
- Digital Services: Consulting, courses, digital downloads
- Gaming: In-game purchases and virtual goods
- Education: Course payments and tuition collection

🔧 SETUP & INTEGRATION:
1. Account Creation: Sign up with Pi Network authentication
2. Profile Setup: Business information and verification
3. Payment Links: Create first payment in under 2 minutes
4. Customization: Branding, logos, colors, custom domains
5. API Integration: Webhooks, API keys, developer tools
6. Go Live: Start accepting real Pi payments immediately

🛡️ SECURITY & COMPLIANCE:
- Direct Pi Network integration (no third-party risk)
- End-to-end encryption for all transactions
- PCI DSS compliant payment processing
- Multi-factor authentication for merchant accounts
- Real-time fraud detection and prevention
- GDPR and privacy law compliance
- Secure API with rate limiting and authentication

💰 PRICING & FEES:
- Free Plan: Basic features for individuals and startups
- Pro Plan: Advanced features for growing businesses  
- Enterprise: Custom solutions for large organizations
- Transaction fees: Competitive rates for Pi payments
- No setup fees, monthly minimums, or hidden charges
- Transparent pricing with detailed fee breakdown

🚨 COMMON ISSUES & TROUBLESHOOTING:
- Payment Failures: Usually Pi wallet connection or insufficient balance
- API Errors: Check API key permissions and request format
- Webhook Issues: Verify endpoint URL and SSL certificate
- Login Problems: Clear browser cache, check Pi app authentication
- Mobile Issues: Ensure Pi Browser/app is updated to latest version
- Timeout Errors: Pi Network congestion, retry after few minutes
- Integration Problems: Check CORS settings and API documentation

🌐 PI NETWORK INTEGRATION:
- Official Pi Network partner and verified developer
- Uses Pi Network's production mainnet (not testnet)
- Requires users to have Pi wallet with verified KYC
- Supports Pi Network's authentication and payment protocols
- Real Pi cryptocurrency transactions (not simulated)
- Integrates with Pi Network's horizon API for transaction verification

📱 MOBILE & BROWSER SUPPORT:
- Pi Browser: Native integration for seamless payments
- Mobile Apps: iOS and Android responsive design
- Desktop: Full functionality on all major browsers
- Cross-platform: Consistent experience across devices
- Offline Mode: Basic functionality when network limited

🎯 USE CASES BY INDUSTRY:
- Restaurants: QR menu payments, table ordering
- Retail Stores: Point-of-sale QR payments
- Online Stores: E-commerce checkout integration
- Digital Creators: Content, courses, digital downloads
- Service Providers: Consultations, appointments, bookings
- Non-profits: Donation collection and fundraising
- Gaming: Virtual goods and in-game purchases
- Education: Course fees and educational content

📞 SUPPORT CHANNELS:
- AI Chat Support: 24/7 intelligent assistance (this chat)
- Documentation: Comprehensive guides and API docs
- Community Forum: Peer support and discussions
- Email Support: Direct merchant support team
- Video Tutorials: Step-by-step setup guides
- Live Chat: Real-time human support during business hours

🔄 ADVANCED FEATURES:
- Multi-currency display (show Pi equivalent in USD/other currencies)
- Inventory management for physical/digital products
- Customer profiles and repeat customer tracking
- Promotional codes and discount systems
- Affiliate tracking and referral programs
- Multi-language support for international businesses
- Time-limited offers and flash sales
- Bulk operations for large catalogs

PERSONALITY GUIDELINES:
- Be enthusiastic about DropPay and Pi Network payments 🧡
- Always provide specific, actionable solutions
- Use step-by-step instructions when explaining processes
- Reference specific DropPay features and capabilities
- Be encouraging and supportive, especially for newcomers
- If you don't know something specific, acknowledge it and suggest contacting support
- Use the orange heart emoji 🧡 occasionally to match branding
- Celebrate user successes and milestones

RESPONSE STYLE:
- Provide clear, structured answers with bullet points when helpful
- Include relevant URLs like /dashboard, /docs, /pricing when applicable
- Offer to help with next steps after solving current issues
- Ask clarifying questions if the user's request is unclear
- Provide examples and real-world scenarios when explaining features`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: userMessage.content
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request. Please try again!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm experiencing some technical difficulties right now. Please try again in a moment, or contact our support team if the issue persists. 🟧",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Page Header - Mobile Optimized */}
      <div className="pt-20 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                DropPay AI Support
              </h1>
              <p className="text-muted-foreground">Your intelligent Pi payment assistant</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Mascot Introduction Banner - Mobile Enhanced */}
          <div className="mb-6 sm:mb-8 bg-white border-2 border-orange-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg shadow-orange-500/5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-center">
              
              {/* Mascot GIF */}
              <div className="flex justify-center lg:justify-start order-1 lg:order-1">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                  <img 
                    src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                    alt="DropPay AI Mascot"
                    className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg width='160' height='160' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23fb7517'/%3E%3Ctext x='50%25' y='50%25' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E✨%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  
                  {/* Floating animation elements - Smaller on mobile */}
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-6 sm:h-6 bg-orange-500/30 rounded-full animate-bounce" />
                  <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-orange-600/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 -right-2 sm:-right-4 w-2 h-2 sm:w-3 sm:h-3 bg-orange-400/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-2 text-center lg:text-left order-2 lg:order-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">Meet Your DropPay AI Assistant! 🟧</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  I'm your intelligent companion for everything DropPay! From creating your first checkout link to advanced API integrations, 
                  I'm here to provide instant, expert assistance 24/7. I know all about Pi Network payments and can guide you step by step through any challenge.
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center lg:justify-start">
                  <span className="px-2 sm:px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">🧠 AI-Powered</span>
                  <span className="px-2 sm:px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">⚡ Instant Responses</span>
                  <span className="px-2 sm:px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">🎯 DropPay Expert</span>
                  <span className="px-2 sm:px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">🌟 Always Learning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Questions - Mobile Enhanced */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground flex items-center gap-2 justify-center sm:justify-start">
              Quick Questions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => selectQuickQuestion(question)}
                  className="border-2 border-orange-200 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all text-xs sm:text-sm justify-start h-auto p-2 sm:p-3"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Interface - Mobile Enhanced */}
          <div className="bg-white border-2 border-orange-100 rounded-2xl sm:rounded-3xl shadow-xl shadow-orange-500/10 overflow-hidden">
            {/* Chat Header - Mobile Optimized */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden">
                  <img 
                    src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                    alt="DropPay Mascot"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='white' fill-opacity='0.2'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' dy='.3em' fill='white'%3E✨%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">DropPay AI Assistant</div>
                  <div className="text-orange-100 text-xs sm:text-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="hidden sm:inline">Online & Ready to Help • Powered by AI 🟧</span>
                    <span className="sm:hidden">Online • AI Powered 🟧</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages - Mobile Enhanced */}
            <ScrollArea ref={scrollAreaRef} className="h-[400px] sm:h-[500px] p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0 mr-1">
                        <img 
                          src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                          alt="AI Assistant"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg width='48' height='48' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23fb923c'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='white'%3E🎧%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                            : 'bg-muted/50 border border-orange-100 rounded-bl-md'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className={`text-xs text-muted-foreground mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-primary flex items-center justify-center shadow-md flex-shrink-0">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md">
                      <img 
                        src="https://i.ibb.co/wh4vDbn6/add-headphone-like-he-is-chat-support1-ezgif-com-video-to-gif-converter.gif"
                        alt="AI Assistant Typing"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23ea5e0a'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='white'%3E✨%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="bg-muted/50 border border-orange-100 rounded-2xl rounded-bl-md p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about DropPay..."
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6"
                >
                  Send
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                💡 Tip: Ask about creating payment links, Pi Network integration, or troubleshooting!
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-orange-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Instant Answers</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Get immediate help with any DropPay question</p>
            </div>
            
            <div className="bg-card border border-orange-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Step-by-Step Guides</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Detailed instructions for every task</p>
            </div>
            
            <div className="bg-card border border-orange-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Always Learning</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Improving responses based on your needs</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}