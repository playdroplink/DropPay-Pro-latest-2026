import { Link2, LayoutDashboard, Code, History, CreditCard, Bell } from 'lucide-react';

const features = [
  {
    icon: Link2,
    title: 'Payment Links',
    description: 'Create shareable payment links in seconds. No coding required. Perfect for social media and email.',
  },
  {
    icon: LayoutDashboard,
    title: 'Merchant Dashboard',
    description: 'Monitor your payments, track revenue, and manage your business all in one place.',
  },
  {
    icon: Code,
    title: 'Developer API',
    description: 'Powerful REST API with webhooks for seamless integration into any application.',
  },
  {
    icon: CreditCard,
    title: 'Embeddable Checkout',
    description: 'Add a beautiful checkout widget to your website with just a few lines of code.',
  },
  {
    icon: History,
    title: 'Transaction History',
    description: 'Complete visibility into all your transactions with search, filter, and export.',
  },
  {
    icon: Bell,
    title: 'Webhook Notifications',
    description: 'Get instant notifications when payments are completed via webhooks.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything you need to accept Pi
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for businesses of all sizes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}