import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, ShoppingCart, Eye, Share2, Download, Zap } from 'lucide-react';

interface CartItem {
  name: string;
  price: string;
}

export default function CreateCartButton() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cartLink, setCartLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const addItem = () => {
    if (!name || !price) return;
    setItems([...items, { name, price }]);
    setName('');
    setPrice('');
  };

  const handleCreate = () => {
    const params = items
      .map((item, i) => `item${i + 1}=${encodeURIComponent(item.name)}&price${i + 1}=${item.price}`)
      .join('&');
    const full = `${window.location.origin}/cart?${params}`;
    setCartLink(full);
    setShowQR(true);
  };

  const handleCopy = () => {
    if (!cartLink) return;
    navigator.clipboard.writeText(cartLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg shadow-lg p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-1">
            <ShoppingCart className="w-7 h-7" />
            <h1 className="text-2xl font-bold">Create Shopping Cart</h1>
          </div>
          <p className="text-orange-100 text-sm">Add multiple items and generate a cart link, embed button, and QR code.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { title: '1) Add items', desc: 'List each item with price before generating the cart link.' },
            { title: '2) Generate link', desc: 'We build a shareable checkout link plus embed code and QR.' },
            { title: '3) Share & pay', desc: 'Share the link or QR. Customers pay through the Droppay checkout.' },
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
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Item Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Price (π)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Button onClick={addItem} disabled={!name || !price} size="sm" className="bg-orange-600 hover:bg-orange-700">
                Add
              </Button>
            </div>

            {items.length > 0 && (
              <ul className="mb-2 list-disc pl-5">
                {items.map((item, i) => (
                  <li key={i}>
                    {item.name} — π{item.price}
                  </li>
                ))}
              </ul>
            )}

            <Button
              onClick={handleCreate}
              disabled={items.length === 0}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
            >
              Generate Cart Link & Button
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Outputs link + embed code + QR for checkout</p>

            {cartLink && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Input value={cartLink} readOnly className="flex-1 bg-white" />
                  <Button size="icon" variant="outline" onClick={handleCopy} title="Copy link">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Droppay Cart', text: 'View my cart', url: cartLink });
                      } else {
                        handleCopy();
                      }
                    }}
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {copied && <span className="text-xs text-green-600 ml-2">Copied!</span>}
                </div>

                <div>
                  <span className="font-semibold">Embed Button:</span>
                  <pre className="bg-gray-900 text-gray-200 p-3 rounded text-xs mt-1 overflow-x-auto">
{`<a href="${cartLink}" target="_blank" rel="noopener noreferrer">
  <button style="background: linear-gradient(90deg,#ea580c,#f97316); color:#fff; padding:10px 16px; border:none; border-radius:8px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
    🛒 View Cart & Pay
  </button>
</a>`}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `<a href=\"${cartLink}\" target=\"_blank\" rel=\"noopener noreferrer\"><button style=\"background: linear-gradient(90deg,#ea580c,#f97316); color:#fff; padding:10px 16px; border:none; border-radius:8px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:8px;\">🛒 View Cart & Pay</button></a>`
                      );
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />Copy Embed Code
                  </Button>
                </div>

                <div className="mt-2 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={cartLink} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4 mr-1" />Preview Cart
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
                        src={`https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(cartLink)}`}
                        alt="QR Code"
                        className="w-48 h-48 border-4 border-white"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(cartLink)}`;
                        const link = document.createElement('a');
                        link.href = qrUrl;
                        link.download = `droppay-cart-qr.png`;
                        link.click();
                      }}
                      className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                    >
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
