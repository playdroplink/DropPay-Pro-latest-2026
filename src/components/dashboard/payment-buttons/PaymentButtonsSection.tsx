import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Link2, ShoppingCart, Heart, Repeat } from 'lucide-react';

export function PaymentButtonsSection() {
  return (
    <section className="mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <span>New: Payment Buttons & Links</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Beta</span>
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Create shareable payment links, embeddable buttons, donation forms, shopping carts, and subscription plans. Copy and paste code or share links to accept payments anywhere.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="links" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="links"><Link2 className="w-4 h-4 mr-1" />Payment Links & Buttons</TabsTrigger>
              <TabsTrigger value="donate"><Heart className="w-4 h-4 mr-1" />Donate</TabsTrigger>
              <TabsTrigger value="subscribe"><Repeat className="w-4 h-4 mr-1" />Smart Subscribe</TabsTrigger>
            </TabsList>
            <TabsContent value="links">
              <h3 className="text-lg font-semibold mb-2">Payment Links & Buttons</h3>
              <p className="mb-4 text-muted-foreground">Get a shareable link or embeddable button to accept payments for a single item or service. Copy and paste the code to your site or share the link directly.</p>
              <Button asChild variant="default">
                <Link to="/dashboard/payment-buttons/create-link">Create Payment Link/Button</Link>
              </Button>
            </TabsContent>
            <TabsContent value="donate">
              <h3 className="text-lg font-semibold mb-2">Donate</h3>
              <p className="mb-4 text-muted-foreground">Accept one-time and recurring donations with a custom Donate button, shareable link, or QR code.</p>
              <Button asChild variant="default">
                <Link to="/dashboard/payment-buttons/create-donate">Create Donate Button</Link>
              </Button>
            </TabsContent>
            <TabsContent value="subscribe">
              <h3 className="text-lg font-semibold mb-2">Smart Subscribe</h3>
              <p className="mb-4 text-muted-foreground">Set up a subscription plan and give your customers options to subscribe with PayPal and major credit and debit cards on almost any device.</p>
              <Button asChild variant="default">
                <Link to="/dashboard/payment-buttons/create-subscribe">Create Subscription Plan</Link>
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
