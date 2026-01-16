import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Eye, Share2, Loader2, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';


export default function CreateLinkButton() {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [slug, setSlug] = useState('');
  const [link, setLink] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `buttons/${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('payment-link-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('❌ Image upload error:', error);
        toast.error(`Image upload failed: ${error.message}`);
        return null;
      }
      
      const { data: publicUrl } = supabase.storage
        .from('payment-link-images')
        .getPublicUrl(fileName);
        
      if (publicUrl?.publicUrl) {
        const storageUrl = 'https://xoofailhzhfyebzpzrfs.storage.supabase.co/storage/v1/s3';
        const finalUrl = publicUrl.publicUrl.includes('storage.supabase.co') 
          ? publicUrl.publicUrl 
          : `${storageUrl}/payment-link-images/${fileName}`;
          
        setImageUrl(finalUrl);
        console.log('✅ Image uploaded and accessible:', finalUrl);
        return finalUrl;
      } else {
        console.error('❌ Failed to get public URL for uploaded image');
        toast.error('Failed to get image URL');
        return null;
      }
    } catch (error) {
      console.error('❌ Image upload exception:', error);
      toast.error('Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!item || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      // Generate slug
      const newSlug = `${item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${uuidv4().slice(0, 8)}`;
      setSlug(newSlug);

      // Upload image if present
      let imgUrl = imageUrl;
      if (imageFile && !imageUrl) {
        imgUrl = await handleImageUpload();
      }

      // Save to payment_links table
      const { error } = await supabase.from('payment_links').insert([
        {
          title: item,
          amount: Number(amount),
          slug: newSlug,
          is_active: true,
          merchant_id: null,
          images: imgUrl ? [imgUrl] : [],
        },
      ]);

      if (error) throw error;

      // Generate full payment link
      const fullLink = `${window.location.origin}/pay/${newSlug}`;
      const qrLink = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(fullLink)}`;
      
      setLink(fullLink);
      setQrUrl(qrLink);
      setSuccess(true);
      toast.success('Payment link created successfully!');
      
      setTimeout(() => setShowQR(true), 300);
    } catch (error: any) {
      toast.error('Error creating link: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (text: string, label: string = 'Link') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pay for ${item}`,
          text: `Pay π${amount} for ${item}`,
          url: link,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy(link, 'Link');
    }
  };

  const embedCode = `<a href="${link}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;"><button style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;padding:12px 24px;border:none;border-radius:8px;fontWeight:bold;cursor:pointer;font-size:16px;box-shadow:0 4px 15px rgba(102, 126, 234, 0.4);transition:all 0.3s ease;">⚡ Pay with Droppay</button></a>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              <CardTitle>Create Payment Link or Button</CardTitle>
            </div>
            <p className="text-orange-100 text-sm mt-2">Generate a shareable payment link with QR code and embed button</p>
          </CardHeader>
          <div className="p-4 sm:p-6 bg-white border-b border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[{ title: '1) Add item', desc: 'Enter the item or service name and price.' }, { title: '2) Generate link', desc: 'We create the payment link, embed code, and QR instantly.' }, { title: '3) Share & pay', desc: 'Share the link/QR or embed the button for checkout.' }].map((step, idx) => (
                <Card key={idx} className="border border-orange-100 bg-white/80 shadow-sm">
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs font-semibold text-orange-600">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <CardContent className="space-y-6 p-6 sm:p-8">
            {!success ? (
              <>
                {/* Item Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Item or Service Name *
                  </label>
                  <Input
                    placeholder="e.g., Digital Course, Coffee, Consulting"
                    value={item}
                    onChange={e => setItem(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Amount (π) *
                  </label>
                  <Input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product Image (optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <div className="px-4 py-3 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition inline-block">
                        Choose Image
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {uploading && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-3">
                      <img src={imagePreview} alt="Preview" className="rounded-lg max-h-40 object-cover" />
                    </div>
                  )}
                </div>

                {/* Create Button */}
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={handleCreate}
                    disabled={!item || !amount || uploading || creating}
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg transition-all"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Link...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Generate Link & Button
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">Outputs link + embed + QR for checkout</p>
                </div>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Payment Link Created!</p>
                    <p className="text-sm text-green-800 mt-1">Your link is ready to share. Choose how to distribute it below.</p>
                  </div>
                </div>

                {/* Payment Link Copy */}
                <div className="space-y-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <label className="block text-sm font-semibold text-gray-700">Payment Link</label>
                  <div className="flex items-center gap-2">
                    <Input value={link} readOnly className="flex-1 text-xs sm:text-sm bg-white" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy(link, 'Link')}
                      className="shrink-0"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button asChild variant="outline" size="sm">
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                {showQR && (
                  <div className="space-y-3 p-4 rounded-lg bg-orange-50 border border-orange-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <label className="block text-sm font-semibold text-gray-700">QR Code</label>
                    <p className="text-xs text-gray-600">Scan with a phone to open the payment link</p>
                    <div className="flex justify-center p-4 bg-white rounded-lg border border-orange-200">
                      <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = qrUrl;
                        a.download = `${slug}-qr-code.png`;
                        a.click();
                      }}
                      className="w-full"
                    >
                      Download QR Code
                    </Button>
                  </div>
                )}

                {/* Embed Code */}
                {showQR && (
                  <div className="space-y-3 p-4 rounded-lg bg-orange-50 border border-orange-200 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <label className="block text-sm font-semibold text-gray-700">Embed Button on Website</label>
                    <p className="text-xs text-gray-600">Copy this code to your website to embed a payment button</p>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                      {embedCode}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(embedCode, 'Embed code')}
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Embed Code
                    </Button>
                  </div>
                )}

                {/* Reset Button */}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSuccess(false);
                    setShowQR(false);
                    setItem('');
                    setAmount('');
                    setLink('');
                    setQrUrl('');
                    setImageFile(null);
                    setImagePreview(null);
                    setImageUrl(null);
                  }}
                  className="w-full"
                >
                  Create Another Link
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition">
            <CardContent className="p-4">
              <div className="text-3xl mb-3 p-2 bg-orange-100 rounded-lg w-fit">🔗</div>
              <h3 className="font-semibold text-gray-900 mb-1">Shareable Link</h3>
              <p className="text-xs text-gray-600">Share the payment link via email, social media, or messaging apps</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition">
            <CardContent className="p-4">
              <div className="text-3xl mb-3 p-2 bg-orange-100 rounded-lg w-fit">📱</div>
              <h3 className="font-semibold text-gray-900 mb-1">QR Code</h3>
              <p className="text-xs text-gray-600">Generate and download QR codes for print materials or signage</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition">
            <CardContent className="p-4">
              <div className="text-3xl mb-3 p-2 bg-orange-100 rounded-lg w-fit">💻</div>
              <h3 className="font-semibold text-gray-900 mb-1">Embed Button</h3>
              <p className="text-xs text-gray-600">Embed a payment button directly on your website or blog</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
