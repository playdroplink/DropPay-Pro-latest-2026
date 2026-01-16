import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

interface PublicReleaseAnnouncementProps {
  trigger?: React.ReactNode;
}

export function PublicReleaseAnnouncement({ trigger }: PublicReleaseAnnouncementProps) {
  const [open, setOpen] = useState(false);
  const headerPrevDisplay = useRef<string | null>(null);

  const announcement = `DropPay - Public Network Announcement
January 11, 2026

FROM: Mrwain Organization
SUBJECT: DropPay - Open Network for Pi Payments

---

Hello Pi Community,

DropPay is an open network for peer-to-peer payments on Pi Network. We built it to remove barriers and expand how pi can be used.

WHAT IS DROPPAY?

DropPay is a decentralized payment gateway that lets anyone send and receive pi payments. No bank. No intermediaries. Just direct p2p transactions between users.

KEY FEATURES:

• Decentralized - No central authority controls payments
• Open Network - Anyone can join and use DropPay
• P2P Payments - Direct payments between users
• External Integration - Businesses can accept pi payments on their websites
• Simple Links - Share payment links anywhere
• Instant Settlement - Payments complete on Pi blockchain

WHY DECENTRALIZED?

Decentralized means no single company controls your money. You control your payments. This is the future of money.

OPEN FOR EVERYONE:

DropPay is open for:
- Individual users sending pi to friends and family
- Merchants accepting payments from customers
- Businesses expanding to pi payments
- Developers building on top of DropPay
- Communities creating new use cases

P2P EXPANSION:

Pi Network is designed for peer-to-peer transactions. DropPay makes this easy:
- Person to person payments
- Business to person payments
- Community to community payments
- Global pi ecosystem

EXTERNAL INTEGRATION:

DropPay allows external websites and businesses to:
- Accept pi payments directly
- Embed payment links
- Track transactions
- Manage subscriptions
- Scale globally

HOW IT WORKS:

1. Create a payment link
2. Share with anyone
3. Recipient pays in Pi Browser
4. Payment completes instantly
5. Funds reach your pi wallet

FUTURE VISION:

DropPay is a foundation for pi economy expansion. We are building tools that let pi flow freely between people, businesses, and communities worldwide.

No restrictions. No barriers. Just open network for everyone.

This is the start of real-world payments for the Pi Network.

---

Join us in Building The Future of Decentralized Network

Mrwain Organization
January 11, 2026`;

  // Hide the site header while the modal is open to keep focus on the announcement
  useEffect(() => {
    const headerEl = document.querySelector('header') as HTMLElement | null;
    if (!headerEl) return;

    if (open) {
      headerPrevDisplay.current = headerEl.style.display;
      headerEl.style.display = 'none';
    } else {
      headerEl.style.display = headerPrevDisplay.current ?? '';
    }

    return () => {
      if (headerEl) {
        headerEl.style.display = headerPrevDisplay.current ?? '';
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="w-4 h-4" />
            Public Announcement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono text-orange-500">
            ✦ PUBLIC RELEASE ANNOUNCEMENT ✦
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Announcement Content */}
          <div className="font-mono text-sm leading-relaxed space-y-4 bg-muted p-6 rounded border border-border">
            {announcement.split('\n').map((line, idx) => (
              <div key={idx} className="text-foreground whitespace-pre-wrap break-words">
                {line === '' ? <div>&nbsp;</div> : line}
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border">
            <div>
              <div className="text-primary font-semibold mb-1">Organization</div>
              <div className="text-muted-foreground">Mrwain</div>
            </div>
            <div>
              <div className="text-primary font-semibold mb-1">Release Date</div>
              <div className="text-muted-foreground">January 11, 2026</div>
            </div>
            <div>
              <div className="text-primary font-semibold mb-1">Status</div>
              <div className="text-primary font-semibold">ACTIVE</div>
            </div>
            <div>
              <div className="text-primary font-semibold mb-1">Visibility</div>
              <div className="text-muted-foreground">Public Record</div>
            </div>
          </div>

          {/* White Paper Link */}
          <div className="flex justify-center pt-4">
            <Button 
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <a 
                href="https://minepi.com/white-paper/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Read Pi Network White Paper
              </a>
            </Button>
          </div>

          {/* Footer Message */}
          <div className="text-xs text-muted-foreground italic text-center pt-4 border-t border-border space-y-1">
            <div>"History is the blueprint."</div>
            <div>"The future is written in the present."</div>
          </div>

          {/* Signature */}
          <div className="space-y-3 pt-4 border-t border-border text-center">
            <div className="text-sm font-semibold text-foreground">
              mrwain organization
            </div>
            <div className="text-xs text-muted-foreground">
              Building the Open Network for The Future
            </div>
            <div className="text-xs text-muted-foreground">
              mrwainorganization@gmail.com
            </div>
            <div className="text-xs text-muted-foreground">
              January 11, 2026
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
