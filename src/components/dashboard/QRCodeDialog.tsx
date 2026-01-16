import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  title: string;
}

export function QRCodeDialog({ isOpen, onClose, slug, title }: QRCodeDialogProps) {
  const paymentUrl = `${window.location.origin}/pay/${slug}`;
  const logoSrc = '/droppay-logo.png';
  const logoSize = 48;

  const handleDownload = () => {
    const svg = document.getElementById('payment-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${slug}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR code downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG
              id="payment-qr-code"
              value={paymentUrl}
              size={200}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#000000"
              imageSettings={{
                src: logoSrc,
                height: logoSize,
                width: logoSize,
                excavate: true,
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center break-all">
            {paymentUrl}
          </p>
          <Button onClick={handleDownload} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
