import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Share2, QrCode as QrCodeIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface DemoCheckoutLinkProps {
  title: string;
  description: string;
  amount: number;
  currency?: string;
  category: "ecommerce" | "saas" | "marketplaces" | "donations" | "gaming" | "education";
  icon?: React.ReactNode;
  gradient?: string;
  features?: string[];
}

// Simple QR Code Canvas component (generates QR code using canvas)
const QRCodeCanvas = ({ value, size = 200 }: { value: string; size?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simple QR code rendering using canvas
    // This is a placeholder - in production, use qrcode.js library
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Draw a simple pattern (this is a placeholder)
    ctx.fillStyle = "#000000";
    const cellSize = size / 21;

    // Draw fixed pattern (top-left corner)
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          (i < 1 || i > 5 || j < 1 || j > 5) &&
          !(i === 6 || j === 6)
        ) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw data pattern (simplified)
    const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < 14; i++) {
      for (let j = 8; j < 21; j++) {
        if ((hash + i * j) % 2 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size]);

  return <canvas ref={canvasRef} style={{ border: "2px solid #000" }} />;
};

export function DemoCheckoutLink({
  title,
  description,
  amount,
  currency = "Pi",
  category,
  icon,
  gradient = "from-blue-400 to-blue-600",
  features = [],
}: DemoCheckoutLinkProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // Generate demo link
  const demoLinkId = btoa(`${category}-${title}`).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
  const baseUrl = window.location.origin;
  const paymentLink = `${baseUrl}/pay/${demoLinkId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${category}-${title.replace(/\s+/g, "-")}-qr.png`;
      link.click();
      toast.success("QR code downloaded!");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Checkout: ${title}`,
          text: `Pay ${amount} ${currency} - ${description}`,
          url: paymentLink,
        });
        toast.success("Link shared!");
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-border hover:border-primary/50 transition-all">
      <CardHeader className={`bg-gradient-to-br ${gradient} text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {icon && <div className="mt-1">{icon}</div>}
            <div>
              <CardTitle className="text-white">{title}</CardTitle>
              <CardDescription className="text-white/80 mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Amount Display */}
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
          <p className="text-3xl font-bold">
            {amount} <span className="text-lg">{currency}</span>
          </p>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3">Includes:</p>
            <ul className="space-y-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* QR Code Section */}
        {showQR && (
          <div ref={qrCanvasRef} className="mb-6 p-4 bg-white rounded-lg flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-gray-900">Scan to checkout:</p>
            <QRCodeCanvas value={paymentLink} size={200} />
            <p className="text-xs text-muted-foreground text-center">
              Mobile users can scan this QR code to start checkout
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadQR}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}

        {/* Links & Actions */}
        <div className="space-y-3 pt-4 border-t">
          {/* Payment Link */}
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Payment Link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-md bg-secondary/50 text-sm border border-border text-muted-foreground"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              size="sm"
              variant={showQR ? "default" : "outline"}
              onClick={() => setShowQR(!showQR)}
              className="w-full"
              title="Toggle QR code"
            >
              <QrCodeIcon className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">QR</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="w-full"
              title="Share checkout"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Share</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              asChild
              className="w-full"
              title="Preview checkout"
            >
              <a href={`/demos/${category}-checkout`}>
                <LinkIcon className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Preview</span>
              </a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            This is a demo checkout preview
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
