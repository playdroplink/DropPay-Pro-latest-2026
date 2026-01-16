import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { InfoIcon, CreditCard, Coins, Zap } from 'lucide-react';

interface PlatformFeeModalProps {
  children: React.ReactNode;
}

export function PlatformFeeModal({ children }: PlatformFeeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const paymentComparisons = [
    {
      name: 'DropPay',
      icon: <Coins className="h-5 w-5 text-orange-600" />,
      fee: '2%',
      description: 'Low, flat fee to keep the lights on',
      features: ['Instant Pi payments (no card rails)', 'No hidden fees', 'Global accessibility', 'Secure transactions'],
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800'
    },
    {
      name: 'PayPal',
      icon: <CreditCard className="h-5 w-5 text-orange-600" />,
      fee: '2.9% + $0.30',
      description: 'Per transaction + fixed fee',
      features: ['Card network fees', 'FX and cross-border fees', 'Chargebacks/holds', 'Extra checkout friction'],
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800'
    },
    {
      name: 'Stripe',
      icon: <CreditCard className="h-5 w-5 text-orange-600" />,
      fee: '2.9% + $0.30',
      description: 'Card processing + fixed fee',
      features: ['Card network fees', 'International cards +1%', 'Disputes & reversals', 'Add-ons cost extra'],
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800'
    },
    {
      name: 'Ethereum Gas',
      icon: <Zap className="h-5 w-5 text-orange-600" />,
      fee: '0.5223 Gwei',
      description: 'Variable network congestion fees',
      features: ['Unpredictable costs', 'Network dependent', 'Failed transactions still charged', 'Complex for users'],
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-800'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <InfoIcon className="h-5 w-5 text-orange-600" />
            Platform Fee Transparency
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* What are platform fees */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">What are Platform Fees?</h3>
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <p className="text-sm text-orange-800 leading-relaxed">
                DropPay charges a flat 2% to fund reliability, security, and ongoing improvements—without card networks, hidden FX markups, or surprise add-ons. The 2% is paid by the customer at checkout; you receive your listed price in Pi, end-to-end.
              </p>
            </div>
          </div>

          {/* Fee comparison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">How DropPay Compares</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {paymentComparisons.map((payment) => (
                <Card key={payment.name} className={`${payment.color} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {payment.icon}
                        <h4 className={`font-semibold ${payment.textColor}`}>{payment.name}</h4>
                      </div>
                      <Badge variant="secondary" className={`${payment.textColor} font-bold`}>
                        {payment.fee}
                      </Badge>
                    </div>
                    <p className={`text-xs ${payment.textColor} mb-3 opacity-80`}>
                      {payment.description}
                    </p>
                    <ul className={`text-xs ${payment.textColor} space-y-1 opacity-75`}>
                      {payment.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-current rounded-full flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">What Your 2% Supports</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Coins className="h-4 w-4 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-orange-800">Infrastructure</h4>
                </div>
                <p className="text-xs text-orange-700">Server uptime, scalability, and security hardening</p>
              </div>
              
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-orange-800">Innovation</h4>
                </div>
                <p className="text-xs text-orange-700">New features and faster Pi-first payment experiences</p>
              </div>
              
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-orange-800">Security</h4>
                </div>
                <p className="text-xs text-orange-700">Fraud prevention and compliance safeguards</p>
              </div>
              
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <InfoIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-orange-800">Support</h4>
                </div>
                <p className="text-xs text-orange-700">Customer assistance and merchant tooling</p>
              </div>
            </div>
          </div>

          {/* Transparency note */}
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">💡 Full Transparency</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• 2% flat platform fee vs 2.9% + π 0.30 on card rails</li>
              <li>• Fee is paid by the customer at checkout; merchants receive their full listed amount in Pi</li>
              <li>• 100% Pi payments end-to-end: no card networks, no FX markups</li>
              <li>• No setup fees, no long-term contracts, no hidden add-ons</li>
              <li>• Free plan available for getting started; upgrade when you scale</li>
              <li>• No chargebacks or card disputes common with traditional processors</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-4 pt-4 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Why choose DropPay?</strong> 2% flat beats the typical 2.9% + π 0.30 card stack, with faster, Pi-native payments and global reach.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Traditional processors ride card networks and add fixed fees; DropPay runs entirely on Pi, cutting overhead and saving you pi on every transaction.
            </p>
          </div>
          <Button onClick={() => setIsOpen(false)} className="w-full">
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PlatformFeeModal;