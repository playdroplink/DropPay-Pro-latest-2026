import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO, TechFlow',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'DropPay made it incredibly easy to accept Pi payments. We integrated it in less than an hour and have been processing thousands of transactions seamlessly.',
    rating: 5,
  },
  {
    name: 'Michael Rodriguez',
    role: 'Founder, CryptoStore',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    content: 'The API documentation is excellent and the dashboard gives us all the insights we need. Customer support is top-notch too!',
    rating: 5,
  },
  {
    name: 'Emily Johnson',
    role: 'Developer, PixelApps',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    content: 'As a developer, I love how simple the API is. The webhooks work perfectly and the SDK saves us tons of time. Highly recommended!',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'Product Manager, NextGen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content: 'We switched from our old payment system to DropPay and saw a 40% increase in completed transactions. The checkout UX is fantastic.',
    rating: 5,
  },
  {
    name: 'Lisa Thompson',
    role: 'Owner, Digital Goods Shop',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    content: 'No platform fees on the Enterprise plan is a game-changer. We save thousands every month compared to traditional payment processors. The default 2% fee for maintenance and future features on other plans is still very reasonable.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'CTO, SmartCommerce',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    content: 'The real-time analytics and reporting features help us make better business decisions. DropPay is essential to our operations.',
    rating: 5,
  },
  {
    name: 'Rina Patel',
    role: 'Owner, MarketHub Online Store',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina',
    content: 'We sell across web and social. DropPay links + embeddable widgets made checkout effortless for our online shop and DMs. Pi customers love the flow.',
    rating: 5,
  },
  {
    name: 'Carlos Mendes',
    role: 'Founder, Bairro Cafe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    content: 'We print QR checkout links at the counter for contactless in-store payments. Works great for our restaurant and weekend pop-up stall—fast, secure, and Pi-native.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Loved by Developers & Businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of merchants accepting Pi payments with DropPay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-primary/30 mb-3" />
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {testimonial.content}
              </p>
              
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
