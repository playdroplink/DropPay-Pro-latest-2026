import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Heart, Eye, Share2, Download, Zap } from 'lucide-react';

export default function CreateDonateButton() {
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [donateLink, setDonateLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCreate = () => {
    // Generate link to real DonateCheckout page
    const link = `/donate?purpose=${encodeURIComponent(purpose)}${amount ? `&amount=${amount}` : ''}${recurring ? '&recurring=1' : ''}`;
    const full = `${window.location.origin}${link}`;
    setDonateLink(full);
    setShowQR(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(donateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg shadow-lg p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Heart className="w-7 h-7" />
            <h1 className="text-2xl font-bold">Create Donate Button</h1>
          </div>
          <p className="text-orange-100 text-sm">One-time or recurring donations with a shareable link, embed, and QR code.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { title: '1) Add details', desc: 'Purpose, suggested amount, and whether you want recurring.' },
            { title: '2) Generate link', desc: 'We create the donation checkout link, embed, and QR automatically.' },
            { title: '3) Share & collect', desc: 'Share via link, QR, or embed to start receiving donations.' },
          ].map((step, idx) => (
            <Card key={idx} className="border border-orange-100 bg-white/70 shadow-sm">
              <CardContent className="p-3 space-y-1">
                <p className="text-xs font-semibold text-orange-600">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Donation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <Input
            placeholder="Donation Purpose (e.g. Support our cause)"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
          />
          <Input
            placeholder="Suggested Amount (π, optional)"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={recurring}
              onChange={e => setRecurring(e.target.checked)}
            />
            Enable recurring donations
          </label>
            <Button onClick={handleCreate} disabled={!purpose} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white">
            Generate Donate Link & Button
          </Button>
            <p className="text-[11px] text-muted-foreground text-center">Outputs link + embed code + QR for checkout</p>
          {donateLink && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Input value={donateLink} readOnly className="flex-1 bg-white" />
                <Button size="icon" variant="outline" onClick={handleCopy} title="Copy link">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'Donate', text: purpose || 'Support us', url: donateLink });
                  } else {
                    handleCopy();
                  }
                }} title="Share">
                  <Share2 className="w-4 h-4" />
                </Button>
                {copied && <span className="text-xs text-green-600 ml-2">Copied!</span>}
              </div>
              <div className="mt-2">
                <span className="font-semibold">Embed Button:</span>
                <pre className="bg-gray-900 text-gray-200 p-3 rounded text-xs mt-1 overflow-x-auto">
{`<a href="${donateLink}" target="_blank" rel="noopener noreferrer">
  <button style="background: linear-gradient(90deg,#ea580c,#f97316); color:#fff; padding:10px 16px; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Donate with Droppay</button>
</a>`}
                </pre>
                <Button size="sm" variant="ghost" className="mt-1" onClick={() => {navigator.clipboard.writeText(`<a href=\"${donateLink}\" target=\"_blank\" rel=\"noopener noreferrer\"><button style=\"background: linear-gradient(90deg,#ea580c,#f97316); color:#fff; padding:10px 16px; border:none; border-radius:8px; font-weight:600; cursor:pointer;\">Donate with Droppay</button></a>`); setCopied(true); setTimeout(()=>setCopied(false),1500);}}>
                  <Copy className="w-4 h-4 mr-1" />Copy Embed Code
                </Button>
              </div>
              <div className="mt-2">
                <Button asChild variant="outline" size="sm">
                  <a href={donateLink} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-1" />Preview Donate Page
                  </a>
                </Button>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowQR(true)}>
                  <Zap className="w-4 h-4 mr-1" />Show QR
                </Button>
              </div>
              {showQR && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">QR Code</h3>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={`https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(donateLink)}`}
                      alt="QR Code"
                      className="w-48 h-48 border-4 border-white"
                    />
                  </div>
                  <Button onClick={() => {
                    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(donateLink)}`;
                    const link = document.createElement('a');
                    link.href = qrUrl;
                    link.download = `droppay-donate-qr.png`;
                    link.click();
                  }} className="w-full mt-3 bg-orange-600 hover:bg-orange-700">
                    <Download className="w-4 h-4 mr-2" />Download QR Code
                  </Button>
                </div>
              )}
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
