import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Repeat, Eye, Share2, Download, Zap } from 'lucide-react';

export default function CreateSubscribeButton() {
  const [plan, setPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState('monthly');
  const [subscribeLink, setSubscribeLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCreate = () => {
    // Generate link to real SubscribeCheckout page
    const link = `/subscribe?plan=${encodeURIComponent(plan)}&amount=${amount}&interval=${interval}`;
    const full = `${window.location.origin}${link}`;
    setSubscribeLink(full);
    setShowQR(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(subscribeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg shadow-lg p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Repeat className="w-7 h-7" />
            <h1 className="text-2xl font-bold">Create Subscription Plan</h1>
          </div>
          <p className="text-orange-100 text-sm">Set up a plan and generate a one-click subscribe link, embed, and QR code.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { title: '1) Plan basics', desc: 'Name, amount, and billing interval (monthly, yearly, weekly).' },
            { title: '2) Generate link', desc: 'Instant subscribe link with embed code and QR for sharing.' },
            { title: '3) Share & onboard', desc: 'Share the link so customers can subscribe in one click.' },
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
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <Input
            placeholder="Plan Name (e.g. Pro, Gold)"
            value={plan}
            onChange={e => setPlan(e.target.value)}
          />
          <Input
            placeholder="Amount per Interval (π)"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <label className="block text-sm font-medium">Billing Interval</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={interval}
            onChange={e => setInterval(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
          </select>
          <Button onClick={handleCreate} disabled={!plan || !amount} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white">
            Generate Subscribe Link & Button
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">Outputs link + embed code + QR for checkout</p>
          {subscribeLink && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Input value={subscribeLink} readOnly className="flex-1 bg-white" />
                <Button size="icon" variant="outline" onClick={handleCopy} title="Copy link">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'Subscribe', text: plan || 'Subscription', url: subscribeLink });
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
{`<a href="${subscribeLink}" target="_blank" rel="noopener noreferrer">
  <button style="background: linear-gradient(90deg,#ea580c,#f97316); color:#fff; padding:10px 16px; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Subscribe with Droppay</button>
</a>`}
                </pre>
                <Button size="sm" variant="ghost" className="mt-1" onClick={() => {navigator.clipboard.writeText(`<a href=\"${subscribeLink}\" target=\"_blank\" rel=\"noopener noreferrer\"><button style=\"background: linear-gradient(90deg,#ea580c,#f97316); color:#fff; padding:10px 16px; border:none; border-radius:8px; font-weight:600; cursor:pointer;\">Subscribe with Droppay</button></a>`); setCopied(true); setTimeout(()=>setCopied(false),1500);}}>
                  <Copy className="w-4 h-4 mr-1" />Copy Embed Code
                </Button>
              </div>
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={subscribeLink} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-1" />Preview Subscribe Page
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
                      src={`https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(subscribeLink)}`}
                      alt="QR Code"
                      className="w-48 h-48 border-4 border-white"
                    />
                  </div>
                  <Button onClick={() => {
                    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(subscribeLink)}`;
                    const link = document.createElement('a');
                    link.href = qrUrl;
                    link.download = `droppay-subscribe-qr.png`;
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
