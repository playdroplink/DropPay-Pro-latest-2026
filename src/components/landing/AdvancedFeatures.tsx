import { Smartphone, Code2, Globe, Lock, Zap, TrendingUp, Users, Shield, BarChart3, Webhook, CreditCard, FileText } from 'lucide-react';

const advancedFeatures = [
  {
    icon: Webhook,
    title: 'Powerful Webhooks',
    description: 'Get real-time notifications for payment events. Automate your workflow with reliable webhook delivery and retry logic.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep insights into your payment data. Track revenue, conversion rates, and customer behavior with beautiful charts.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, PCI compliance, and blockchain verification ensure your payments are always secure.',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Accept Pi payments from anywhere in the world. Multi-currency support with automatic conversion.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Average response time under 100ms. Optimized infrastructure for high-volume merchants.',
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Built-in customer database with purchase history, preferences, and automated email notifications.',
  },
  {
    icon: Code2,
    title: 'Developer Tools',
    description: 'Comprehensive API, SDKs for all major languages, sandbox environment, and extensive documentation.',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Optimization',
    description: 'Smart routing, failover handling, and conversion optimization to maximize your revenue.',
  },
  {
    icon: CreditCard,
    title: 'Multiple Payment Methods',
    description: 'Payment links, embeddable widgets, QR codes, and direct API integration. Choose what works best.',
  },
  {
    icon: Shield,
    title: 'Fraud Prevention',
    description: 'Advanced fraud detection with machine learning, velocity checks, and customizable rules.',
  },
  // {
  //   icon: FileText,
  //   title: 'Automated Invoicing',
  //   description: 'Generate and send professional invoices automatically. Track payment status and send reminders.',
  // },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Beautiful checkout experience optimized for mobile devices. Works seamlessly on iOS and Android.',
  },
];

export function AdvancedFeatures() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Enterprise-Grade Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to scale your Pi payment infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {advancedFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Integration Partners */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Integrates with Your Stack
            </h3>
            <p className="text-muted-foreground">
              Works seamlessly with the tools you already use
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-12 max-w-5xl mx-auto opacity-60">
            <div className="text-2xl font-bold text-foreground">React</div>
            <div className="text-2xl font-bold text-foreground">Node.js</div>
            <div className="text-2xl font-bold text-foreground">Python</div>
            <div className="text-2xl font-bold text-foreground">PHP</div>
            <div className="text-2xl font-bold text-foreground">Ruby</div>
            <div className="text-2xl font-bold text-foreground">Next.js</div>
            <div className="text-2xl font-bold text-foreground">WordPress</div>
            <div className="text-2xl font-bold text-foreground">DropStore</div>
          </div>
        </div>
      </div>
    </section>
  );
}
