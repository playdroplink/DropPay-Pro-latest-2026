import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  X,
  LayoutDashboard,
  Link2,
  History,
  Wallet,
  Crown,
  MapPin,
  Play,
  Code2,
  Code,
  MessageCircle,
  BookOpen,
  Settings,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string[];
  badge?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to DropPay! 👋',
    description: 'Your Complete Pi Network Payment Platform',
    icon: Sparkles,
    details: [
      '✨ Accept Pi Network payments effortlessly',
      '💰 Create unlimited payment & checkout links',
      '📊 Track your earnings with real-time analytics',
      '🌍 Reach customers globally with multi-currency support',
      '🔒 Secure, fast, and reliable payment processing',
      '🎨 Customize payment pages to match your brand',
    ],
  },
  {
    title: 'Dashboard Overview 📊',
    description: 'Your Command Center for All Activities',
    icon: LayoutDashboard,
    details: [
      '💵 View your total earnings and balance at a glance',
      '📈 Monitor payment trends with beautiful analytics charts',
      '🔔 Get real-time notifications for new payments',
      '⚡ Quick actions: Create links, view transactions, withdraw funds',
      '🎯 Track conversion rates and link performance',
      '📱 Fully responsive design - works on all devices',
    ],
  },
  {
    title: 'Payment Links 🔗',
    description: 'Create & Manage Payment Links',
    icon: Link2,
    details: [
      '➕ Create unlimited payment links (based on your plan)',
      '💳 Support for one-time, recurring, and free payment types',
      '🎨 Customize title, description, amount, and redirect URLs',
      '📸 Add custom images to your payment pages',
      '📋 Set stock limits and enable waitlists',
      '❓ Ask custom questions during checkout',
      '📱 Generate QR codes for easy mobile payments',
      '📊 Track views, conversions, and revenue per link',
      '🔗 Share links via social media, email, or website',
    ],
  },
  {
    title: 'Transactions History 💸',
    description: 'Monitor All Your Payments',
    icon: History,
    details: [
      '📜 View complete transaction history with filters',
      '🔍 Search by customer username, amount, or date',
      '✅ See payment status: Completed, Pending, or Failed',
      '📧 Customer email addresses for receipt delivery',
      '🆔 Transaction IDs for tracking and support',
      '💰 Total amount received per transaction',
      '⏰ Timestamp for each payment',
      '📥 Export transaction data for accounting',
    ],
  },
  {
    title: 'Withdrawals 💰',
    description: 'Cash Out Your Earnings',
    icon: Wallet,
    details: [
      '💸 Withdraw your Pi earnings to your wallet',
      '🎯 Minimum withdrawal: 10 Pi',
      '⚡ Fast processing (usually within 24-48 hours)',
      '📋 View withdrawal history and status',
      '🔒 Secure wallet address verification',
      '📊 Track pending, approved, and completed withdrawals',
      '❌ Cancel pending withdrawal requests',
      '💵 View available balance before withdrawing',
    ],
  },
  {
    title: 'Subscription Plans 👑',
    description: 'Upgrade for More Features',
    icon: Crown,
    details: [
      '🆓 Free Plan: 1 payment link, free payments only',
      '⭐ Basic Plan (π 10/month): 5 links, 2% platform fee',
      '🚀 Pro Plan (π 20/month): 10 links, advanced features',
      '💎 Enterprise Plan (π 50/month): Unlimited links, priority support',
      '🔄 Recurring payment support (Pro & Enterprise)',
      '🎯 Advanced analytics and tracking',
      '🔗 Custom tracking links for marketing',
      '📈 Higher conversion rates with premium features',
    ],
  },
  {
    title: 'Global Map 🌍',
    description: 'See Your Worldwide Reach',
    icon: MapPin,
    details: [
      '🗺️ Interactive map showing customer locations',
      '📍 See where your payments are coming from',
      '🌎 Identify your strongest markets',
      '📊 Country-level transaction statistics',
      '🎯 Plan targeted marketing campaigns',
      '🌐 Expand your global presence',
      '📈 Track growth by region',
    ],
  },
  {
    title: 'Watch Ads & Earn 💰',
    description: 'Boost Your Earnings',
    icon: Play,
    details: [
      '🎬 Watch Pi Network ads to earn extra Pi',
      '💰 Earn Pi rewards for each ad watched',
      '⏱️ Quick 30-second ads',
      '🎯 Daily ad opportunities',
      '💵 Rewards credited instantly to your account',
      '📊 Track your ad earnings',
      '🚀 Boost your balance without selling anything',
    ],
  },
  {
    title: 'Widgets & Embeds 🔧',
    description: 'Integrate with Your Website',
    icon: Code2,
    details: [
      '🎨 Beautiful payment widgets for your website',
      '🔗 Embed payment links anywhere',
      '💳 Pre-built payment buttons (Buy Now, Donate, Subscribe)',
      '📱 Mobile-responsive widget designs',
      '🎭 Customize colors, styles, and layouts',
      '⚡ Copy & paste integration - no coding required',
      '🔒 Secure iframe embedding',
      '📊 Track widget performance',
    ],
  },
  {
    title: 'API & Webhooks 🔌',
    description: 'Developer Integration Tools',
    icon: Code,
    details: [
      '🔑 Generate API keys for programmatic access',
      '📡 Set up webhooks for real-time event notifications',
      '💻 RESTful API for payment creation and management',
      '🔔 Webhook events: payment.completed, payment.failed, etc.',
      '📚 Comprehensive API documentation',
      '🧪 Test mode for development',
      '🔒 Secure authentication with API keys',
      '📊 Monitor API usage and rate limits',
    ],
  },
  {
    title: 'AI Support 🤖',
    description: 'Get Instant Help',
    icon: MessageCircle,
    details: [
      '💬 24/7 AI-powered support assistant',
      '❓ Ask questions about any feature',
      '🔧 Get troubleshooting help instantly',
      '📖 Learn best practices and tips',
      '🚀 Onboarding guidance for new users',
      '💡 Suggestions for optimizing your setup',
      '🌍 Multi-language support',
    ],
  },
  {
    title: 'Help & Tutorials 📚',
    description: 'Learn and Master DropPay',
    icon: BookOpen,
    details: [
      '📖 Step-by-step guides and tutorials',
      '🎥 Video walkthroughs',
      '💡 Best practices for maximizing earnings',
      '🔍 Search for specific topics',
      '📝 Written documentation for all features',
      '🎯 Use case examples and templates',
      '📧 Contact support for personalized help',
    ],
  },
  {
    title: 'Settings ⚙️',
    description: 'Customize Your Experience',
    icon: Settings,
    details: [
      '👤 Update your profile information',
      '🏢 Set business name and details',
      '💰 Configure your Pi wallet address',
      '🔔 Manage notification preferences',
      '🌓 Toggle light/dark theme',
      '🔒 Security settings and 2FA',
      '📧 Email notification settings',
      '🗑️ Account management and deletion',
    ],
  },
  {
    title: 'Quick Tips 💡',
    description: 'Pro Tips to Get Started',
    icon: CheckCircle2,
    details: [
      '✅ Create your first payment link in under 2 minutes',
      '✅ Test your payment link before sharing with customers',
      '✅ Add a custom image to increase conversions',
      '✅ Use clear, descriptive titles and descriptions',
      '✅ Set up webhooks to automate your workflow',
      '✅ Check your dashboard daily for new transactions',
      '✅ Upgrade your plan as your business grows',
      '✅ Enable waitlists for popular products',
      '✅ Use tracking links to measure marketing campaigns',
      '✅ Reach out to support if you need any help!',
    ],
  },
];

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TutorialModal({ open, onOpenChange }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (currentStep === tutorialSteps.length - 1 && open) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [currentStep, open]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onOpenChange(false);
  };

  const currentTutorial = tutorialSteps[currentStep];
  const Icon = currentTutorial.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Character GIF */}
                <img
                  src="https://i.ibb.co/0RBRR9xw/media-76.gif"
                  alt="DropPay Guide"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
                {showConfetti && (
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                  </div>
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  {currentTutorial.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {currentTutorial.description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                {currentTutorial.badge && (
                  <Badge variant="secondary" className="text-sm">
                    {currentTutorial.badge}
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {currentTutorial.details.map((detail, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg transition-all',
                      'hover:bg-accent/50 group',
                      'animate-in fade-in slide-in-from-left-4',
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                    </div>
                    <p className="text-sm leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Tips */}
          {currentStep === 0 && (
            <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">💡 Quick Start Tip</p>
                    <p className="text-sm text-muted-foreground">
                      Navigate through this guide using the arrows below, or jump to any section using the step indicators. Don't worry - you can always access this tutorial again from the Help menu!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Step Indicators */}
          <div className="hidden md:flex items-center gap-1">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-secondary',
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {currentStep === tutorialSteps.length - 1 ? (
            <Button onClick={handleClose} className="gap-2">
              Get Started
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
