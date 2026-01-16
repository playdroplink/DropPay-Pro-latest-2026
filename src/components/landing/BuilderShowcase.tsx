import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, ShoppingCart, Store, QrCode, ShieldCheck } from 'lucide-react';

const showcases = [
  {
    icon: Link2,
    title: 'Payment Links',
    description: 'Generate shareable Pi checkout links with customization options. Every link ships with a redirect, QR, and embed snippet ready to drop anywhere.',
    cta: 'Open Payment Links',
    href: '/dashboard/links',
    highlights: ['Easy customization', 'Link + embed + QR', 'Dashboard + API creation'],
  },
  {
    icon: ShoppingCart,
    title: 'Buttons, Cart, Donate, Subscribe',
    description: 'Use the builders to create buttons that output the same trio: shareable link, iframe embed, and QR. Each flow now includes the 3-step helper banner so teams ship faster.',
    cta: 'Open Buttons Demo',
    href: '/dashboard/payment-buttons/create-link',
    highlights: ['Cart, donate, subscribe presets', 'Absolute URLs for sharing', 'Inline “how it works” guidance'],
  },
  {
    icon: Store,
    title: 'Merchant Pay Pages',
    description: 'Spin up product pages with variants and images, then share one code (m/:code). Customers get the same clean checkout, and you get analytics plus QR + embed in one place.',
    cta: 'Launch Merchant Builder',
    href: '/dashboard/merchant/create-link',
    highlights: ['Multi-item with images', 'Share or embed instantly', 'Tracks conversions + redirects'],
  },
];

export function BuilderShowcase() {
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/40 via-background to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">New demos</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">Build once, share everywhere</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The latest builders ship with absolute links, embeds, and QR codes out of the box. Pick a flow and hand teammates the same predictable 3-step experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {showcases.map((item, index) => (
            <Card key={item.title} className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <Badge variant="outline">Ready to demo</Badge>
                    <CardTitle className="text-2xl mt-2">{item.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {item.highlights.map((highlight) => (
                    <Badge key={highlight} variant="secondary" className="font-normal">
                      {highlight}
                    </Badge>
                  ))}
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link to={item.href}>{item.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Every builder outputs link + embed + QR</p>
              <p className="text-sm text-muted-foreground">Hand off to marketing or devs without extra work—shareable URLs are absolute and ready for Pi Browser checkout.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Checkout is enforced inside Pi Browser for security. Non-Pi browsers see guidance before attempting payment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
