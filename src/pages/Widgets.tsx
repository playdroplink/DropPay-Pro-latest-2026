import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Code, Smartphone, Monitor, ExternalLink, Palette, Layout } from 'lucide-react';
import { toast } from 'sonner';
import { buildCheckoutQr } from '@/lib/qr';

interface PaymentLink {
  id: string;
  title: string;
  slug: string;
  amount: number;
  pricing_type?: string;
}

export default function Widgets() {
  const { isAuthenticated, isLoading, merchant, piUser } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<string>('');
  const [buttonText, setButtonText] = useState('Pay with Pi');
  const [buttonStyle, setButtonStyle] = useState('default');
  const [buttonSize, setButtonSize] = useState('medium');
  const [qrData, setQrData] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const baseUrl = window.location.origin;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && (merchant || piUser)) {
      fetchLinks();
    }
  }, [merchant, piUser, isAuthenticated]);

  const fetchLinks = async () => {
    // Use merchant ID or fallback to piUser UID
    const merchantId = merchant?.id || piUser?.uid;
    if (!merchantId) {
      console.warn('⚠️ No merchant ID or piUser UID available');
      return;
    }

    try {
      console.log('🔄 Fetching payment links for widgets, merchant:', merchantId);
      const { data, error } = await supabase
        .from('payment_links')
        .select('id, title, slug, amount, pricing_type')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching payment links:', error);
        throw error;
      }
      
      console.log('✅ Found', data?.length || 0, 'payment links for widgets');
      setLinks(data || []);
      if (data && data.length > 0) {
        setSelectedLink(data[0].slug);
        console.log('✅ Auto-selected first link:', data[0].title);
      } else {
        console.warn('⚠️ No payment links found');
      }
    } catch (error) {
      console.error('❌ Error fetching payment links:', error);
      toast.error('Failed to load payment links');
    }
  };

  // Generate QR code with logo when selected link changes
  useEffect(() => {
    if (selectedLink) {
      const directLink = `${baseUrl}/pay/${selectedLink}`;
      setIsGeneratingQr(true);
      buildCheckoutQr(directLink)
        .then((qr) => setQrData(qr))
        .catch((error) => {
          console.error('Failed to generate QR code:', error);
          // Fallback to QR Server API
          setQrData(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(directLink)}`);
        })
        .finally(() => setIsGeneratingQr(false));
    }
  }, [selectedLink, baseUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const selectedLinkData = links.find(l => l.slug === selectedLink);

  const buttonStyles = {
    default: 'background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%); color: white; border: none;',
    outline: 'background: transparent; color: #FFA500; border: 2px solid #FFA500;',
    minimal: 'background: #f3f4f6; color: #1f2937; border: 1px solid #d1d5db;',
    dark: 'background: #1f2937; color: #FFA500; border: none;',
  };

  const buttonSizes = {
    small: 'padding: 8px 16px; font-size: 14px;',
    medium: 'padding: 12px 24px; font-size: 16px;',
    large: 'padding: 16px 32px; font-size: 18px;',
  };

  const iframeCode = selectedLink 
    ? `<iframe src="${baseUrl}/pay/${selectedLink}" width="100%" height="600" frameborder="0"></iframe>`
    : '';

  const buttonCode = selectedLink
    ? `<a href="${baseUrl}/pay/${selectedLink}" style="display: inline-block; ${buttonStyles[buttonStyle as keyof typeof buttonStyles]} ${buttonSizes[buttonSize as keyof typeof buttonSizes]} border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.3s; cursor: pointer;">${buttonText}</a>`
    : '';

  const directLink = selectedLink ? `${baseUrl}/pay/${selectedLink}` : '';

  const htmlWidget = selectedLink
    ? `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DropPay Payment Widget</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .droppay-widget {
            max-width: 400px;
            margin: 20px auto;
            padding: 32px;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            background: white;
        }
        
        .droppay-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #1f2937;
            line-height: 1.2;
        }
        
        .droppay-amount {
            font-size: 36px;
            font-weight: 800;
            color: #FFA500;
            margin: 20px 0;
            line-height: 1;
        }
        
        .droppay-button {
            display: block;
            width: 100%;
            ${buttonStyles[buttonStyle as keyof typeof buttonStyles]}
            ${buttonSizes[buttonSize as keyof typeof buttonSizes]}
            border-radius: 12px;
            text-align: center;
            text-decoration: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .droppay-button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }
        
        .droppay-button:active {
            transform: translateY(0);
        }
        
        .droppay-powered {
            text-align: center;
            margin-top: 16px;
            font-size: 12px;
            color: #9ca3af;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="droppay-widget">
        <div class="droppay-title">${selectedLinkData?.title || 'Product'}</div>
        <div class="droppay-amount">${selectedLinkData?.pricing_type === 'free' ? 'Free' : selectedLinkData?.pricing_type === 'donation' ? 'Donate' : `π ${Number(selectedLinkData?.amount || 0).toFixed(2)}`}</div>
        <a href="${directLink}" class="droppay-button">${buttonText}</a>
        <div class="droppay-powered">Powered by DropPay</div>
    </div>
</body>
</html>`
    : '';

  const reactComponent = selectedLink
    ? `import React from 'react';

const DropPayButton = () => {
  const buttonStyle = {
    display: 'inline-block',
    ${buttonStyles[buttonStyle as keyof typeof buttonStyles].split(';').map(s => s.trim()).filter(s => s).map(s => {
      const [key, value] = s.split(':').map(p => p.trim());
      return `${key}: '${value}'`;
    }).join(',\n    ')},
    ${buttonSizes[buttonSize as keyof typeof buttonSizes].split(';').map(s => s.trim()).filter(s => s).map(s => {
      const [key, value] = s.split(':').map(p => p.trim());
      return `${key}: '${value}'`;
    }).join(',\n    ')},
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  return (
    <a 
      href="${directLink}"
      style={buttonStyle}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      ${buttonText}
    </a>
  );
};

export default DropPayButton;`
    : '';

  if (isLoading) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Widgets & Embed Codes</h1>
          <p className="text-muted-foreground">
            Easily integrate payment links into your website with customizable buttons, widgets, and embed codes
          </p>
        </div>

        {/* Link Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Link</CardTitle>
            <CardDescription>Choose which payment link to generate code for</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedLink} onValueChange={setSelectedLink}>
              <SelectTrigger>
                <SelectValue placeholder="Select a payment link" />
              </SelectTrigger>
              <SelectContent>
                {links.map((link) => (
                  <SelectItem key={link.id} value={link.slug}>
                    {link.title} - {link.pricing_type === 'free' ? 'Free' : link.pricing_type === 'donation' ? 'Donation' : `π ${Number(link.amount).toFixed(2)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {links.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No payment links found. Create one first in the{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/dashboard/links')}>
                  Payment Links
                </Button>{' '}
                section.
              </p>
            )}
          </CardContent>
        </Card>

        {selectedLink && (
          <>
            {/* Customization Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Customize Button
                </CardTitle>
                <CardDescription>Personalize the appearance of your payment button</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="button-text">Button Text</Label>
                    <Input
                      id="button-text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Pay with Pi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button-style">Button Style</Label>
                    <Select value={buttonStyle} onValueChange={setButtonStyle}>
                      <SelectTrigger id="button-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button-size">Button Size</Label>
                    <Select value={buttonSize} onValueChange={setButtonSize}>
                      <SelectTrigger id="button-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 p-6 rounded-lg bg-secondary/50 text-center">
                  <Label className="text-sm text-muted-foreground mb-4 block">Preview</Label>
                  <div dangerouslySetInnerHTML={{ __html: buttonCode }} />
                </div>
              </CardContent>
            </Card>

            {/* Embed Codes */}
            <Tabs defaultValue="button" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="button">Button</TabsTrigger>
                <TabsTrigger value="widget">Widget</TabsTrigger>
                <TabsTrigger value="iframe">iFrame</TabsTrigger>
                <TabsTrigger value="link">Direct Link</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
              </TabsList>

              <TabsContent value="button" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      HTML Button Code
                    </CardTitle>
                    <CardDescription>
                      Copy and paste this code into your website's HTML
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={buttonCode}
                        readOnly
                        className="font-mono text-sm min-h-[120px]"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(buttonCode)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">React Component</h4>
                      <div className="relative">
                        <Textarea
                          value={reactComponent}
                          readOnly
                          className="font-mono text-xs min-h-[200px] bg-white dark:bg-gray-950"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(reactComponent)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="widget" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5" />
                      Complete Widget
                    </CardTitle>
                    <CardDescription>
                      A fully styled payment widget ready to embed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={htmlWidget}
                        readOnly
                        className="font-mono text-sm min-h-[300px]"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(htmlWidget)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <Label className="text-sm text-muted-foreground mb-4 block">Preview</Label>
                      <div dangerouslySetInnerHTML={{ __html: htmlWidget }} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="iframe" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      iFrame Embed
                    </CardTitle>
                    <CardDescription>
                      Embed the full payment page in your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={iframeCode}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(iframeCode)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Note: Adjust the width and height attributes to fit your website's layout
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="link" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      Direct Link
                    </CardTitle>
                    <CardDescription>
                      Share this direct link anywhere
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={directLink}
                        readOnly
                        className="flex-1"
                      />
                      <Button onClick={() => copyToClipboard(directLink)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open(directLink, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qr" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      QR Code
                    </CardTitle>
                    <CardDescription>
                      Let customers scan to pay
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center">
                      {isGeneratingQr ? (
                        <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-gray-50">
                          <p className="text-gray-500">Generating QR code with logo...</p>
                        </div>
                      ) : (
                        <img
                          src={qrData}
                          alt="QR Code"
                          className="w-64 h-64 border rounded-lg"
                        />
                      )}
                      <Button
                        variant="outline"
                        className="mt-4"
                        disabled={isGeneratingQr}
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = qrData;
                          link.download = `droppay-qr-${selectedLink}.png`;
                          link.click();
                        }}
                      >
                        Download QR Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
