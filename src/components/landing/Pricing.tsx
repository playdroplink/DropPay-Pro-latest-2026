import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: 'π 0.01',
    priceDetail: '/monthly',
    description: 'Perfect for getting started (0.01 Pi minimum)',
    features: [
      '1 Payment Link',
      'Free payment type only',
      'Basic analytics',
      'No platform fee',
      'Community support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Basic',
    price: 'π 10',
    priceDetail: '/monthly',
    description: 'For small businesses',
    features: [
      '5 Payment Links',
      'Free + One-time payments',
      'Basic analytics',
      '2% platform fee (for maintenance & future features)',
      'Email support',
    ],
    cta: 'Subscribe for π10/mo',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'π 20',
    priceDetail: '/monthly',
    description: 'Best for growing businesses',
    features: [
      '10 Payment Links',
      'Free + One-time + Recurring payments',
      'Advanced analytics',
      '2% platform fee (for maintenance & future features)',
      'Priority support',
      'Custom branding',
      'Tracking links',
    ],
    cta: 'Subscribe for π20/mo',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'π 50',
    priceDetail: '/monthly',
    description: 'For large scale operations',
    features: [
      'Unlimited Payment Links',
      'All payment types (Free + One-time + Recurring + Donations)',
      'Full analytics suite',
      '2% platform fee (for maintenance & future features)',
      '24/7 Priority support',
      'Custom integrations',
      'Dedicated account manager',
    ],
    cta: 'Subscribe for π50/mo',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 overflow-x-hidden">
      <div className="container mx-auto px-6 max-w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include Pi Network integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? 'border-primary bg-card shadow-lg shadow-primary/10'
                  : 'border-border bg-card'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.priceDetail && (
                    <span className="text-muted-foreground">{plan.priceDetail}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                asChild
              >
                <Link to="/auth">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}