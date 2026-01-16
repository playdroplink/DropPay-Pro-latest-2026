import { ShoppingCart, Laptop, Store, Heart, Gamepad2, GraduationCap, UtensilsCrossed, Shirt, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const useCases = [
  {
    icon: ShoppingCart,
    title: 'E-Commerce',
    description: 'Perfect for online stores selling digital or physical products. Accept Pi payments seamlessly with automatic order fulfillment.',
    features: ['Automatic inventory sync', 'Order management', 'Customer notifications', 'Refund handling'],
    gradient: 'from-orange-400 to-orange-600',
    link: '/use-cases/ecommerce',
  },
  {
    icon: UtensilsCrossed,
    title: 'Restaurants & Food',
    description: 'Transform your restaurant with QR code ordering and contactless payments. Perfect for dine-in, takeout, and delivery.',
    features: ['QR code menus', 'Table-side ordering', 'Kitchen integration', 'Loyalty programs'],
    gradient: 'from-amber-400 to-amber-600',
    link: '/demos/restaurant',
  },
  {
    icon: Shirt,
    title: 'Retail & Clothing',
    description: 'Enhance your physical store with digital checkout links. Great for boutiques, fashion stores, and pop-up shops.',
    features: ['In-store pickup', 'Size & color options', 'Style consultation', 'Inventory management'],
    gradient: 'from-orange-400 to-orange-600',
    link: '/demos/retail',
  },
  {
    icon: Laptop,
    title: 'SaaS & Subscriptions',
    description: 'Ideal for subscription-based services. Automate recurring billing, trial periods, and upgrade flows.',
    features: ['Recurring payments', 'Usage-based billing', 'Plan management', 'Dunning automation'],
    gradient: 'from-orange-400 to-orange-600',
    link: '/use-cases/saas',
  },
  {
    icon: MapPin,
    title: 'Local Services',
    description: 'Perfect for service businesses like salons, repair shops, consultants, and home services. Book and pay in one step.',
    features: ['Appointment booking', 'Service packages', 'Customer management', 'Follow-up automation'],
    gradient: 'from-orange-400 to-orange-600',
    link: '/demos/services',
  },
  {
    icon: Store,
    title: 'Marketplaces',
    description: 'Build multi-vendor marketplaces with split payments. Manage seller payouts and platform fees (2% for maintenance & future features) effortlessly.',
    features: ['Split payments', 'Seller dashboards', 'Commission management', 'Escrow support'],
    gradient: 'from-orange-400 to-orange-600',
    link: '/use-cases/marketplaces',
  },
  {
    icon: Heart,
    title: 'Donations & Crowdfunding',
    description: 'Accept donations for your cause or crowdfund your project. Track donors and send automated thank-you messages.',
    features: ['One-time & recurring', 'Donor management', 'Campaign tracking', 'Tax receipts'],
    gradient: 'from-orange-400 to-orange-600',
    link: '/use-cases/donations',
  },
  {
    icon: Gamepad2,
    title: 'Gaming & NFTs',
    description: 'Monetize your game or sell digital collectibles. Perfect for in-game purchases and NFT marketplaces.',
    features: ['In-game purchases', 'NFT payments', 'Virtual goods', 'Instant delivery'],
    gradient: 'from-orange-400 to-orange-600',
    link: '/use-cases/gaming',
  },
  {
    icon: GraduationCap,
    title: 'Education & Courses',
    description: 'Sell online courses, tutorials, and educational content. Manage student access and course enrollment.',
    features: ['Course payments', 'Student management', 'Certificate delivery', 'Lifetime access'],
    gradient: 'from-orange-400 to-orange-600',
    link: '/use-cases/education',
  },
];

export function UseCases() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Perfect for Online & Physical Stores
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From restaurants and retail shops to online businesses and services - DropPay checkout links work everywhere
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Header */}
              <div className={`h-32 bg-gradient-to-br ${useCase.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="p-6 relative -mt-20">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {useCase.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary" asChild>
                  <Link to={useCase.link}>
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Don't see your use case?
            </h3>
            <p className="text-muted-foreground mb-6">
              DropPay is flexible enough to handle any payment scenario. Contact us to discuss your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Contact Sales
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/docs">
                  Read Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
