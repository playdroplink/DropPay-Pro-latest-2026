import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Monitor, 
  Smartphone, 
  QrCode, 
  Copy, 
  ExternalLink,
  Zap,
  Globe,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Play,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

export function EmbeddableWidgetsShowcase() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [copiedCode, setCopiedCode] = useState('');
  const [restaurantStep, setRestaurantStep] = useState('menu'); // menu, cart, payment, success
  const [selectedCategory, setSelectedCategory] = useState('pizza'); // pizza, drinks, sides, desserts
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [retailStep, setRetailStep] = useState('scanning'); // scanning, scanned, payment, success
  const [paymentProgress, setPaymentProgress] = useState(0);

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    toast.success(`${type} code copied!`);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleRestaurantPayment = () => {
    if (restaurantStep === 'menu') {
      setRestaurantStep('cart');
    } else if (restaurantStep === 'cart') {
      setRestaurantStep('payment');
      simulatePayment(() => setRestaurantStep('success'));
    } else if (restaurantStep === 'success') {
      setRestaurantStep('menu');
    }
  };

  const handleRetailPayment = () => {
    if (retailStep === 'scanning') {
      setRetailStep('scanned');
    } else if (retailStep === 'scanned') {
      setRetailStep('payment');
      simulatePayment(() => setRetailStep('success'));
    } else if (retailStep === 'success') {
      setRetailStep('scanning');
    }
  };

  const simulatePayment = (onComplete: () => void) => {
    setPaymentProgress(0);
    const interval = setInterval(() => {
      setPaymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Demo codes for different integration types
  const buttonCode = `<!-- DropPay Button Widget -->
<a href="https://droppay.space/pay/demo123" 
   style="display: inline-block; 
          background: linear-gradient(135deg, #f97316, #ea580c); 
          color: white; 
          padding: 12px 24px; 
          border-radius: 12px; 
          text-decoration: none; 
          font-weight: 600; 
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
          transition: all 0.3s ease;"
   onmouseover="this.style.transform='translateY(-2px)'"
   onmouseout="this.style.transform='translateY(0)'">
  🥧 Pay with Pi - π 9.99
</a>`;

  const iframeCode = `<!-- DropPay iFrame Widget -->
<iframe 
  src="https://droppay.space/pay/demo123" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);"
  title="DropPay Checkout">
</iframe>`;

  const qrCode = `<!-- DropPay QR Code Integration -->
<div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 16px;">
  <h3 style="margin-bottom: 16px; color: #1e293b;">Scan to Pay with Pi</h3>
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://droppay.space/pay/demo123&color=f97316&bgcolor=ffffff" 
       alt="Pay with Pi QR Code" 
       style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
  <p style="margin-top: 12px; color: #64748b; font-size: 14px;">
    🥧 Mobile users can scan this QR code to checkout
  </p>
</div>`;

  const htmlWidget = `<!-- Complete DropPay Widget -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DropPay Widget Demo</title>
</head>
<body>
    <div id="droppay-widget" style="
        max-width: 400px; 
        margin: 20px auto; 
        padding: 24px; 
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border-radius: 20px; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;">
        
        <div style="margin-bottom: 20px;">
            <img src="https://i.ibb.co/0RBRR9xw/media-76.gif" 
                 alt="DropPay Mascot" 
                 style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 12px;" />
            <h3 style="margin: 0; color: #92400e;">Premium Course Access</h3>
            <p style="margin: 8px 0; color: #a16207;">Instant access to all content</p>
        </div>
        
        <div style="font-size: 32px; font-weight: bold; color: #ea580c; margin-bottom: 20px;">
            π 24.99
        </div>
        
        <a href="https://droppay.space/pay/demo123" 
           style="display: inline-block; 
                  background: linear-gradient(135deg, #f97316, #ea580c); 
                  color: white; 
                  padding: 16px 32px; 
                  border-radius: 12px; 
                  text-decoration: none; 
                  font-weight: 600; 
                  width: 100%;
                  box-sizing: border-box;
                  transition: all 0.3s ease;">
            🚀 Get Instant Access
        </a>
        
        <p style="margin-top: 16px; font-size: 12px; color: #a16207;">
            🔒 Secure payment powered by DropPay
        </p>
    </div>
</body>
</html>`;

  const integrationSteps = [
    {
      icon: Code,
      title: "Copy the Code",
      description: "Choose your preferred integration method and copy the generated code"
    },
    {
      icon: Globe,
      title: "Paste Anywhere",
      description: "Add the code to your website, app, or any HTML-supported platform"
    },
    {
      icon: Zap,
      title: "Start Earning",
      description: "Customers can immediately pay with Pi - it's that simple!"
    }
  ];

  const useCases = [
    {
      title: "WordPress Blogs",
      icon: "📝",
      description: "Monetize your content with Pi payments"
    },
    {
      title: "E-commerce Sites", 
      icon: "🛍️",
      description: "Accept Pi for digital and physical products"
    },
    {
      title: "Mobile Apps",
      icon: "📱", 
      description: "Integrate Pi payments in any web-based app"
    },
    {
      title: "Social Media",
      icon: "🌐",
      description: "Share payment links across all platforms"
    },
    {
      title: "Email Campaigns",
      icon: "✉️",
      description: "Include payment buttons in newsletters"
    },
    {
      title: "QR Code Posters",
      icon: "🖼️",
      description: "Physical locations can accept Pi payments"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-orange-50/50 via-background to-orange-50/30">
      <div className="container mx-auto px-6">
        
        {/* Announcement Banner */}
        <div className="mb-8 md:mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-orange-500 p-4 shadow-lg border-b border-orange-600">
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 text-center text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                <span className="text-white font-semibold text-sm sm:text-base">
                  🎉 NEW FEATURE:
                </span>
              </div>
              <div className="text-white text-sm sm:text-base">
                Advanced widget customization tools now available! 
                <span className="hidden sm:inline ml-1">Create stunning payment experiences in minutes.</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors text-xs sm:text-sm">
                <ArrowRight className="w-3 h-3 mr-1" />
                Try Now
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Header Section with Mascot */}
        <div className="text-center mb-12 md:mb-20 px-4 sm:px-6">
          <div className="flex justify-center items-center gap-3 sm:gap-6 mb-6 md:mb-8">
            <img 
              src="https://i.ibb.co/0RBRR9xw/media-76.gif" 
              alt="DropPay Mascot" 
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-orange-200 shadow-lg animate-bounce"
            />
            <div className="hidden sm:block">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 text-xs sm:text-sm">
                🚀 Integration Made Simple
              </Badge>
            </div>
            <img 
              src="https://i.ibb.co/Q7GykxDY/media-77.gif" 
              alt="DropPay Mascot" 
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-orange-200 shadow-lg animate-bounce"
              style={{ animationDelay: '0.5s' }}
            />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
            Embed DropPay{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Anywhere
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Add Pi payment functionality to any website, app, or platform with just a few lines of code. 
            From simple buttons to complete checkout widgets - integration has never been easier.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              No coding required
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Mobile responsive
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Instant setup
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Works everywhere
            </Badge>
          </div>
          
          {/* Integration Time Stats */}
          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
            <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">30s</div>
              <div className="text-xs md:text-sm text-green-700">Setup Time</div>
            </div>
            <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">3 Lines</div>
              <div className="text-xs md:text-sm text-blue-700">Of Code</div>
            </div>
            <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">∞</div>
              <div className="text-xs md:text-sm text-orange-700">Platforms</div>
            </div>
          </div>
        </div>

        {/* Live Demo Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
            
            {/* Integration Options */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Choose Your Integration</h3>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-12 md:h-14 bg-orange-50 border border-orange-200">
                  <TabsTrigger value="buttons" className="flex flex-col gap-0.5 md:gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white p-1 md:p-2">
                    <Code className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs">Buttons</span>
                  </TabsTrigger>
                  <TabsTrigger value="iframe" className="flex flex-col gap-0.5 md:gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white p-1 md:p-2">
                    <Monitor className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs">iFrame</span>
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="flex flex-col gap-0.5 md:gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white p-1 md:p-2">
                    <QrCode className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs">QR Code</span>
                  </TabsTrigger>
                  <TabsTrigger value="widget" className="flex flex-col gap-0.5 md:gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white p-1 md:p-2">
                    <Layers className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs">Widget</span>
                  </TabsTrigger>
                  <TabsTrigger value="html" className="flex flex-col gap-0.5 md:gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white p-1 md:p-2">
                    <Globe className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs">HTML</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="buttons" className="space-y-4">
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <Code className="w-5 h-5" />
                        Payment Buttons
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Beautiful, responsive payment buttons that work everywhere
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-white border-2 border-gray-200 text-slate-800 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
                          <code>{buttonCode}</code>
                        </pre>
                        <Button
                          size="sm"
                          className="absolute top-1 md:top-2 right-1 md:right-2 bg-orange-500 hover:bg-orange-600 h-7 w-7 md:h-8 md:w-8 p-0"
                          onClick={() => handleCopyCode(buttonCode, 'Button')}
                        >
                          {copiedCode === 'Button' ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                        </Button>
                      </div>
                      <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-700 font-medium mb-2">Preview:</p>
                        <div className="text-center">
                          <a 
                            href="#"
                            className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                          >
                            🥧 Pay with Pi - π 9.99
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="iframe" className="space-y-4">
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <Monitor className="w-5 h-5" />
                        iFrame Embed
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Embed the complete checkout experience directly in your page
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-white border-2 border-gray-200 text-slate-800 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
                          <code>{iframeCode}</code>
                        </pre>
                        <Button
                          size="sm"
                          className="absolute top-1 md:top-2 right-1 md:right-2 bg-orange-500 hover:bg-orange-600 h-7 w-7 md:h-8 md:w-8 p-0"
                          onClick={() => handleCopyCode(iframeCode, 'iFrame')}
                        >
                          {copiedCode === 'iFrame' ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="qr" className="space-y-4">
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <QrCode className="w-5 h-5" />
                        QR Code Integration
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Perfect for physical locations, posters, and mobile experiences
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-white border-2 border-gray-200 text-slate-800 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
                          <code>{qrCode}</code>
                        </pre>
                        <Button
                          size="sm"
                          className="absolute top-1 md:top-2 right-1 md:right-2 bg-orange-500 hover:bg-orange-600 h-7 w-7 md:h-8 md:w-8 p-0"
                          onClick={() => handleCopyCode(qrCode, 'QR Code')}
                        >
                          {copiedCode === 'QR Code' ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                        </Button>
                      </div>
                      <div className="mt-4 p-3 md:p-4 bg-orange-50 rounded-lg text-center">
                        <p className="text-xs md:text-sm text-orange-700 font-medium mb-2">Preview:</p>
                        <div className="inline-block p-3 md:p-4 bg-white rounded-lg border border-orange-200">
                          <h4 className="text-xs md:text-sm font-semibold mb-2">Scan to Pay with Pi</h4>
                          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center relative overflow-hidden mx-auto">
                            <img 
                              src="https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=https://droppay.space/pay/demo123&color=f97316&bgcolor=ffffff" 
                              alt="QR Code Preview"
                              className="w-18 h-18 md:w-24 md:h-24 rounded"
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-2 flex items-center justify-center gap-1">
                            🥧 QR Code with DropPay branding
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="widget" className="space-y-4">
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <Layers className="w-5 h-5" />
                        Complete Widget
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        A fully styled, self-contained payment widget
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-white border-2 border-gray-200 text-slate-800 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto max-h-48 md:max-h-64">
                          <code>{htmlWidget}</code>
                        </pre>
                        <Button
                          size="sm"
                          className="absolute top-1 md:top-2 right-1 md:right-2 bg-orange-500 hover:bg-orange-600 h-7 w-7 md:h-8 md:w-8 p-0"
                          onClick={() => handleCopyCode(htmlWidget, 'Widget')}
                        >
                          {copiedCode === 'Widget' ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="html" className="space-y-4">
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <Globe className="w-5 h-5" />
                        Complete HTML Page
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Ready-to-use HTML template with DropPay integration
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-white border-2 border-gray-200 text-slate-800 p-3 md:p-4 rounded-lg text-xs md:text-sm overflow-x-auto max-h-48 md:max-h-64">
                          <code>{htmlWidget}</code>
                        </pre>
                        <Button
                          size="sm"
                          className="absolute top-1 md:top-2 right-1 md:right-2 bg-orange-500 hover:bg-orange-600 h-7 w-7 md:h-8 md:w-8 p-0"
                          onClick={() => handleCopyCode(htmlWidget, 'HTML Template')}
                        >
                          {copiedCode === 'HTML Template' ? <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                        </Button>
                      </div>
                      <div className="mt-4 p-3 md:p-4 bg-orange-50 rounded-lg">
                        <p className="text-xs md:text-sm text-orange-700 font-medium mb-2">Features:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            <span>Mobile responsive</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            <span>Pi Network branding</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            <span>Secure checkout</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            <span>Ready to deploy</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Live Preview */}
            <div className="space-y-4 md:space-y-6 mt-8 lg:mt-0">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <Play className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Live Preview</h3>
              </div>
              
              <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/50">
                <CardContent className="p-8">
                  {activeTab === 'buttons' && (
                      <div className="text-center space-y-6">
                        <h4 className="text-xl font-bold">Payment Button Demo</h4>
                        <div className="space-y-3">
                          <a 
                            href="/demos/checkout-builder"
                            className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-sm md:text-base"
                            target="_blank"
                          >
                            🥧 Pay with Pi - π 9.99
                          </a>
                          <p className="text-sm text-muted-foreground">Click to see a live demo!</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 md:gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">Fully Responsive</Badge>
                          <Badge variant="outline" className="text-xs">Customizable Colors</Badge>
                          <Badge variant="outline" className="text-xs">One-Click Integration</Badge>
                        </div>
                      </div>
                  )}
                  
                  {activeTab === 'iframe' && (
                    <div className="text-center space-y-4">
                      <h4 className="text-xl font-bold">iFrame Integration Preview</h4>
                      <div className="border-4 border-dashed border-orange-300 rounded-lg p-6 bg-orange-50 relative overflow-hidden">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                          <div className="bg-orange-500 text-white p-3 text-sm font-semibold">
                            🌐 Embedded DropPay Checkout
                          </div>
                          <div className="p-6">
                            <div className="text-center mb-4">
                              <h5 className="font-bold text-lg mb-2">Digital Marketing Course</h5>
                              <div className="text-3xl font-bold text-orange-600">π 99.99</div>
                            </div>
                            <div className="space-y-3 mb-4 text-sm text-left">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Lifetime access</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>10+ hours of video content</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Certificate of completion</span>
                              </div>
                            </div>
                            <a 
                              href="/demos/checkout-builder" 
                              target="_blank"
                              className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                              🚀 Enroll Now
                            </a>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs bg-white/90">
                            📺 Embedded
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Full payment experience embedded in your page</p>
                    </div>
                  )}
                  
                  {activeTab === 'qr' && (
                    <div className="text-center space-y-4">
                      <h4 className="text-xl font-bold">Interactive QR Demo</h4>
                      <div className="inline-block p-6 bg-white rounded-lg border-2 border-orange-200 shadow-lg">
                        <h5 className="font-semibold mb-3">Scan to Pay with Pi</h5>
                        <div className="relative">
                          <a href="/demos/checkout-builder" target="_blank">
                            <img 
                              src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://droppay.space/demos/checkout-builder&color=f97316&bgcolor=ffffff"
                              alt="Interactive QR Code"
                              className="w-36 h-36 rounded cursor-pointer hover:scale-105 transition-transform"
                            />
                          </a>
                          <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="text-sm font-semibold text-gray-800 mb-1">Concert Ticket</div>
                          <div className="text-xl font-bold text-orange-600">π 45.00</div>
                        </div>
                        <p className="text-xs text-gray-600 mt-3 flex items-center justify-center gap-1">
                          📱 Scan this working QR code!
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1 md:gap-2 text-xs">
                        <Badge variant="outline">Mobile Optimized</Badge>
                        <Badge variant="outline">Instant Scan</Badge>
                        <Badge variant="outline">Offline Ready</Badge>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'widget' && (
                    <div className="text-center space-y-4">
                      <h4 className="text-xl font-bold">Complete Widget Demo</h4>
                      <div className="max-w-sm mx-auto">
                        <div className="p-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-lg border border-orange-300">
                          <div className="text-center mb-4">
                            <img 
                              src="https://i.ibb.co/0RBRR9xw/media-76.gif" 
                              alt="DropPay Mascot" 
                              className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 border-2 border-white shadow-md"
                            />
                            <h5 className="font-bold text-orange-900">Fitness Membership</h5>
                            <p className="text-sm text-orange-700">Premium gym access + classes</p>
                          </div>
                          
                          <div className="bg-white/80 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Monthly Plan</span>
                              <span className="line-through text-gray-500">π 89.99</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Special Offer</span>
                              <span className="text-2xl font-bold text-orange-600">π 59.99</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-orange-800">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>24/7 gym access</span>
                            </div>
                            <div className="flex items-center gap-2 text-orange-800">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>All group classes included</span>
                            </div>
                            <div className="flex items-center gap-2 text-orange-800">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Personal training session</span>
                            </div>
                          </div>
                          
                          <a 
                            href="/demos/checkout-builder" 
                            target="_blank"
                            className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            💪 Start Membership
                          </a>
                          
                          <p className="text-xs text-orange-700 text-center mt-3">
                            🔒 Secure payment powered by DropPay
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center gap-2 text-xs">
                        <Badge variant="outline">Self-Contained</Badge>
                        <Badge variant="outline">Branded</Badge>
                        <Badge variant="outline">Responsive</Badge>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'html' && (
                    <div className="text-center space-y-4">
                      <h4 className="text-xl font-bold">HTML Integration Demo</h4>
                      <div className="max-w-2xl mx-auto">
                        {/* Mockup Browser */}
                        <div className="bg-gray-100 rounded-lg shadow-lg overflow-hidden border border-gray-300">
                          {/* Browser Header */}
                          <div className="bg-gray-200 px-4 py-3 flex items-center gap-2 border-b border-gray-300">
                            <div className="flex gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="flex-1 bg-white rounded px-3 py-1 mx-4">
                              <span className="text-xs text-gray-600">🌐 my-website.com/store</span>
                            </div>
                          </div>
                          
                          {/* HTML Page Content */}
                          <div className="bg-white p-6">
                            <div className="text-left mb-6">
                              <h5 className="text-lg font-bold text-gray-800 mb-2">My Online Store</h5>
                              <p className="text-sm text-gray-600">Simple HTML website with DropPay integration</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="text-center mb-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-xl">
                                    💻
                                  </div>
                                  <h6 className="font-semibold text-sm">Web Development Course</h6>
                                  <div className="text-orange-600 font-bold">π 79.99</div>
                                </div>
                                <a 
                                  href="/demos/checkout-builder?item=web-course"
                                  target="_blank"
                                  className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded text-sm font-semibold hover:shadow-md transition-all"
                                >
                                  Buy with Pi
                                </a>
                              </div>
                              
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="text-center mb-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-xl">
                                    📊
                                  </div>
                                  <h6 className="font-semibold text-sm">Data Analytics Guide</h6>
                                  <div className="text-orange-600 font-bold">π 49.99</div>
                                </div>
                                <a 
                                  href="/demos/checkout-builder?item=analytics-guide"
                                  target="_blank"
                                  className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded text-sm font-semibold hover:shadow-md transition-all"
                                >
                                  Buy with Pi
                                </a>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-2">🔒 Payments powered by DropPay</p>
                              <div className="flex justify-center gap-2">
                                <Badge variant="outline" className="text-xs">Pi Network</Badge>
                                <Badge variant="outline" className="text-xs">Secure</Badge>
                                <Badge variant="outline" className="text-xs">Instant</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <p className="text-sm text-muted-foreground mb-3">
                            Add DropPay to any HTML website with just a few lines of code!
                          </p>
                          <div className="flex flex-wrap justify-center gap-1 md:gap-2 text-xs">
                            <Badge variant="outline">No Framework Required</Badge>
                            <Badge variant="outline">Pure HTML/CSS/JS</Badge>
                            <Badge variant="outline">Copy & Paste Ready</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-700">Try It Yourself</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    asChild
                  >
                    <a href="https://droppay.space/dashboard/widgets" target="_blank">
                      <Zap className="w-4 h-4 mr-2" />
                      Open Widget Generator
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/docs" target="_blank">
                      View Documentation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 md:mt-20 px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-3 md:mb-4">
            How Easy Is It?
          </h3>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
            Get your Pi payment integration up and running in under 5 minutes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {integrationSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{step.title}</h4>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-16 md:mt-20 px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-3 md:mb-4">
            Works Everywhere You Do
          </h3>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
            From personal blogs to enterprise applications - DropPay adapts to your needs
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="text-center p-4 border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="p-0">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{useCase.icon}</div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">{useCase.title}</h4>
                  <p className="text-xs text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Success Examples */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">📊</div>
                <div className="text-2xl font-bold text-green-600 mb-1">2.3x</div>
                <div className="text-sm text-green-700">Higher conversion rates vs traditional payment forms</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">⚡</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">No Checkout Abandonment</div>
                <div className="text-sm text-blue-700">Easy to pay, seamless experience</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <div className="text-2xl font-bold text-orange-600 mb-1">5min</div>
                <div className="text-sm text-orange-700">Average integration time from start to finish</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Meet Our Mascots */}
        <div className="mt-16 md:mt-24 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 mx-4 sm:mx-6">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Meet Our{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Cute Mascots
              </span>
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our adorable DropPay mascots are here to make your Pi payment experience delightful and fun! 
              Each one has their own personality and role in the DropPay ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Primary Mascot */}
            <Card className="overflow-hidden border-2 border-orange-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 md:p-8 text-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white p-2">
                    <img 
                      src="https://i.ibb.co/0RBRR9xw/media-76.gif" 
                      alt="DropPay Primary Mascot" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-orange-800 mb-2 md:mb-3">Pi Helper</h4>
                  <p className="text-sm md:text-base text-orange-700 mb-3 md:mb-4 leading-relaxed">
                    Our main mascot! Always ready to help with payments and integrations. 
                    Loves making Pi transactions smooth and simple.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-white/50 text-orange-700">🥧 Pi Expert</Badge>
                    <Badge variant="outline" className="bg-white/50 text-orange-700">💼 Professional</Badge>
                    <Badge variant="outline" className="bg-white/50 text-orange-700">😊 Friendly</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Mascot */}
            <Card className="overflow-hidden border-2 border-amber-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-amber-100 to-yellow-200 p-8 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white p-2">
                    <img 
                      src="https://i.ibb.co/Q7GykxDY/media-77.gif" 
                      alt="DropPay Support Mascot" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h4 className="text-2xl font-bold text-amber-800 mb-3">Support Buddy</h4>
                  <p className="text-amber-700 mb-4">
                    Your cheerful support companion! Always encouraging and ready to celebrate 
                    your successful Pi payment integrations.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-white/50 text-amber-700">🎉 Cheerful</Badge>
                    <Badge variant="outline" className="bg-white/50 text-amber-700">🤝 Supportive</Badge>
                    <Badge variant="outline" className="bg-white/50 text-amber-700">⚡ Energetic</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kiosk Mascot */}
            <Card className="overflow-hidden border-2 border-green-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-8 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white p-2">
                    <img 
                      src="https://i.ibb.co/C3c3PZ7F/media-78.gif" 
                      alt="DropPay Kiosk Mascot" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h4 className="text-2xl font-bold text-green-800 mb-3">Kiosk Guardian</h4>
                  <p className="text-green-700 mb-4">
                    The tech-savvy mascot powering our kiosk solutions! Specializes in 
                    touchscreen interfaces and physical business payments.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-white/50 text-green-700">🖥️ Tech Expert</Badge>
                    <Badge variant="outline" className="bg-white/50 text-green-700">🛒 Retail Pro</Badge>
                    <Badge variant="outline" className="bg-white/50 text-green-700">🎯 Focused</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mascot Interaction */}
          <div className="mt-12 text-center px-4 sm:px-6">
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-white to-orange-50 border-orange-200">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6">
                  <img 
                    src="https://i.ibb.co/0RBRR9xw/media-76.gif" 
                    alt="Mascot 1" 
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-3 border-orange-300 shadow-lg animate-bounce"
                  />
                  <span className="text-3xl">+</span>
                  <img 
                    src="https://i.ibb.co/Q7GykxDY/media-77.gif" 
                    alt="Mascot 2" 
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-3 border-amber-300 shadow-lg animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span className="text-3xl">+</span>
                  <img 
                    src="https://i.ibb.co/C3c3PZ7F/media-78.gif" 
                    alt="Mascot 3" 
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-3 border-green-300 shadow-lg animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                  <span className="text-3xl">=</span>
                  <div className="text-4xl">💝</div>
                </div>
                
                <h4 className="text-2xl font-bold text-foreground mb-4">
                  The Perfect Team for Pi Payments! 
                </h4>
                <p className="text-muted-foreground mb-6">
                  Our mascot trio works together to make every DropPay experience magical. 
                  From simple button integrations to complex kiosk systems, they're always there to help!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="font-semibold text-orange-700">Beautiful Design</div>
                    <div className="text-sm text-orange-600">Eye-catching and memorable</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-3xl mb-2">😊</div>
                    <div className="font-semibold text-amber-700">User-Friendly</div>
                    <div className="text-sm text-amber-600">Makes payments feel welcoming</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl mb-2">🚀</div>
                    <div className="font-semibold text-green-700">Brand Recognition</div>
                    <div className="text-sm text-green-600">Instantly recognizable DropPay</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming Soon - Kiosk Solutions */}
        <div className="mt-16 md:mt-24 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 mx-4 sm:mx-6">
          <div className="text-center mb-8 md:mb-12">
            <Badge variant="secondary" className="mb-3 md:mb-4 bg-orange-100 text-orange-700 border-orange-300 text-xs md:text-sm">
              🚀 Coming Soon
            </Badge>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 leading-tight">
              Physical Business{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Kiosk Solutions
              </span>
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Self-service Pi payment kiosks for restaurants, retail stores, and service businesses. 
              Let customers order and pay with Pi using intuitive touchscreen interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
            {/* Restaurant Kiosk Demo */}
            <Card className="overflow-hidden border-2 border-orange-200 bg-white shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Restaurant Self-Order Kiosk
                </CardTitle>
                <p className="text-orange-100">Touch-friendly ordering with Pi payments</p>
                
                {/* DropPay Mascot Display */}
                <div className="mt-4 flex items-center justify-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://i.ibb.co/C3c3PZ7F/media-78.gif" 
                      alt="DropPay Mascot"
                      className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-white shadow-lg"
                    />
                    <div className="text-white">
                      <div className="text-sm font-semibold">Powered by DropPay</div>
                      <div className="text-xs opacity-90">🥧 Pi Network Payments</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Kiosk Screen Frame */}
                <div className="bg-black p-2 sm:p-4 md:p-6 rounded-lg mx-2 sm:mx-3 md:mx-4 mt-4">
                  <div className="bg-white rounded-lg overflow-hidden shadow-inner">
                    {/* Header Bar */}
                    <div className="bg-orange-500 text-white p-2 sm:p-3 md:p-4 flex justify-between items-center gap-2">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold">🍕 Pizza Palace</h3>
                      <div className="text-xs sm:text-sm bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                        {restaurantStep === 'menu' && 'Select Items'}
                        {restaurantStep === 'cart' && 'Review Order'}
                        {restaurantStep === 'payment' && 'Processing...'}
                        {restaurantStep === 'success' && 'Order Complete!'}
                      </div>
                    </div>
                    
                    {/* Menu Step */}
                    {restaurantStep === 'menu' && (
                      <div className="p-3 sm:p-4 md:p-6 bg-gray-50">
                        {/* Category Tabs */}
                        <div className="flex justify-center space-x-1 sm:space-x-2 mb-4 sm:mb-6 overflow-x-auto">
                          {[
                            { id: 'pizza', name: '🍕 Pizza', count: 4 },
                            { id: 'drinks', name: '🥤 Drinks', count: 6 },
                            { id: 'sides', name: '🍟 Sides', count: 5 },
                            { id: 'desserts', name: '🍰 Desserts', count: 3 }
                          ].map(category => (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.id)}
                              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 ${
                                selectedCategory === category.id
                                  ? 'bg-orange-500 text-white shadow-lg'
                                  : 'bg-white text-gray-600 hover:bg-orange-50'
                              }`}
                            >
                              {category.name}
                              <span className="ml-1 text-xs opacity-75">({category.count})</span>
                            </button>
                          ))}
                        </div>

                        {/* Pizza Category */}
                        {selectedCategory === 'pizza' && (
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-all cursor-pointer transform hover:scale-105"
                                 onClick={() => {
                                   setCartItems([{ name: 'Margherita Pizza', price: 22.50, emoji: '🍕' }]);
                                   setCartTotal(22.96);
                                   setRestaurantStep('cart');
                                 }}>
                              <div className="text-4xl text-center mb-2">🍕</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Margherita</div>
                                <div className="text-orange-600 font-bold text-xl">π 22.50</div>
                              </div>
                              <div className="mt-2 text-center">
                                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto animate-pulse">
                                  +
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🍖</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Pepperoni</div>
                                <div className="text-orange-600 font-bold text-xl">π 24.99</div>
                              </div>
                              <div className="mt-2 text-center">
                                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto">
                                  +
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🥬</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">BBQ Chicken</div>
                                <div className="text-orange-600 font-bold text-xl">π 26.50</div>
                              </div>
                              <div className="mt-2 text-center">
                                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto">
                                  +
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🍅</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Veggie Supreme</div>
                                <div className="text-orange-600 font-bold text-xl">π 23.99</div>
                              </div>
                              <div className="mt-2 text-center">
                                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto">
                                  +
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Drinks Category */}
                        {selectedCategory === 'drinks' && (
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🥤</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Fresh Orange</div>
                                <div className="text-green-600 font-bold text-xl">π 4.99</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">☕</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Espresso</div>
                                <div className="text-green-600 font-bold text-xl">π 3.50</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🥛</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Smoothie</div>
                                <div className="text-green-600 font-bold text-xl">π 6.99</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🍺</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Craft Beer</div>
                                <div className="text-green-600 font-bold text-xl">π 8.50</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🥤</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Lemonade</div>
                                <div className="text-green-600 font-bold text-xl">π 4.50</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🍵</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Iced Tea</div>
                                <div className="text-green-600 font-bold text-xl">π 3.99</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sides Category */}
                        {selectedCategory === 'sides' && (
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🍟</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Garlic Fries</div>
                                <div className="text-blue-600 font-bold text-xl">π 7.99</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🧄</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Garlic Bread</div>
                                <div className="text-blue-600 font-bold text-xl">π 5.50</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🥗</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Caesar Salad</div>
                                <div className="text-blue-600 font-bold text-xl">π 9.99</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🧅</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Mozzarella Sticks</div>
                                <div className="text-blue-600 font-bold text-xl">π 8.50</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🌶️</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Buffalo Wings</div>
                                <div className="text-blue-600 font-bold text-xl">π 12.99</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Desserts Category */}
                        {selectedCategory === 'desserts' && (
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🍰</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Tiramisu</div>
                                <div className="text-purple-600 font-bold text-xl">π 8.99</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🍨</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Gelato</div>
                                <div className="text-purple-600 font-bold text-xl">π 6.50</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer">
                              <div className="text-4xl text-center mb-2">🍪</div>
                              <div className="text-center">
                                <div className="font-bold text-gray-800">Cannoli</div>
                                <div className="text-purple-600 font-bold text-xl">π 7.99</div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-center space-y-3">
                          <div className="text-gray-600">
                            👆 Tap {selectedCategory === 'pizza' ? 'the pizza' : 'any item'} to add to cart
                          </div>
                          <div className="flex items-center justify-center gap-3 text-sm text-orange-600">
                            <QrCode className="w-4 h-4" />
                            <span>Or scan table QR for mobile ordering</span>
                          </div>
                          {cartItems.length > 0 && (
                            <div className="mt-4">
                              <button
                                onClick={() => setRestaurantStep('cart')}
                                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all"
                              >
                                🛍️ View Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Cart Step */}
                    {restaurantStep === 'cart' && (
                      <div className="p-6 bg-gray-50">
                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold">Your Order</span>
                            <span className="text-sm text-gray-600">1 item</span>
                          </div>
                          <div className="flex justify-between items-center mb-3 p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🍕</span>
                              <span className="font-semibold">Margherita x1</span>
                            </div>
                            <span className="font-bold text-orange-600">π 22.50</span>
                          </div>
                          <div className="border-t pt-3 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Subtotal</span>
                              <span>π 22.50</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Processing Fee (2%)</span>
                              <span>π 0.46</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-xl font-bold">Total</span>
                              <span className="text-2xl font-bold text-orange-600">π 22.96</span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleRestaurantPayment}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                          <QrCode className="w-6 h-6 mr-3 inline" />
                          PROCEED TO PAYMENT π 22.96
                        </button>
                      </div>
                    )}
                    
                    {/* Payment Processing Step */}
                    {restaurantStep === 'payment' && (
                      <div className="p-6 bg-gray-50">
                        <div className="text-center mb-6">
                          {/* DropPay Mascot */}
                          <div className="w-20 h-20 mx-auto mb-4">
                            <img 
                              src="https://i.ibb.co/C3c3PZ7F/media-78.gif" 
                              alt="DropPay Processing"
                              className="w-20 h-20 rounded-full border-4 border-orange-300 shadow-lg"
                            />
                          </div>
                          
                          {/* QR Code Scanning Animation */}
                          <div className="mb-4 p-4 bg-white rounded-lg border-2 border-dashed border-orange-300">
                            <div className="text-center mb-3">
                              <QrCode className="w-12 h-12 mx-auto text-orange-500 mb-2" />
                              <div className="text-sm font-semibold text-orange-700">🔍 Scanning Payment QR Code</div>
                              <div className="w-full bg-orange-100 rounded-full h-2 mt-2">
                                <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                              </div>
                            </div>
                          </div>
                          
                          <h4 className="text-xl font-bold mb-2">Processing Pi Payment</h4>
                          <p className="text-gray-600">QR code scanned successfully! Confirming transaction...</p>
                          
                          <div className="mt-6 bg-white rounded-lg p-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Payment Progress</span>
                              <span>{paymentProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${paymentProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Success Step */}
                    {restaurantStep === 'success' && (
                      <div className="p-6 bg-gray-50 text-center">
                        <div className="mb-6">
                          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-white" />
                          </div>
                          <h4 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h4>
                          <p className="text-gray-600 mb-4">Your order has been confirmed</p>
                          
                          <div className="bg-white rounded-xl p-4 shadow-lg border border-green-200 mb-6">
                            <div className="text-lg font-bold mb-2">Order #1234</div>
                            <div className="text-sm text-gray-600 mb-3">Estimated ready time: 15 minutes</div>
                            <div className="flex justify-between items-center">
                              <span>Total Paid:</span>
                              <span className="font-bold text-green-600">π 22.96</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleRestaurantPayment}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                            Start New Order
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Badge variant="outline" className="justify-center py-2">👆 Touch Interface</Badge>
                    <Badge variant="outline" className="justify-center py-2">📱 QR Ordering</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retail Kiosk Demo */}
            <Card className="overflow-hidden border-2 border-orange-200 bg-white shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Retail Self-Checkout Kiosk
                </CardTitle>
                <p className="text-orange-100">Scan products and pay with Pi instantly</p>
                
                {/* DropPay Mascot Display */}
                <div className="mt-4 flex items-center justify-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://i.ibb.co/C3c3PZ7F/media-78.gif" 
                      alt="DropPay Mascot"
                      className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-white shadow-lg"
                    />
                    <div className="text-white">
                      <div className="text-sm font-semibold">Powered by DropPay</div>
                      <div className="text-xs opacity-90">🛒 Quick & Secure</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Kiosk Screen Frame */}
                <div className="bg-black p-2 sm:p-4 md:p-6 rounded-lg mx-2 sm:mx-3 md:mx-4 mt-4">
                  <div className="bg-white rounded-lg overflow-hidden shadow-inner">
                    {/* Header Bar */}
                    <div className="bg-orange-500 text-white p-2 sm:p-3 md:p-4 flex justify-between items-center gap-2">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold">🛒 QuickMart Self-Checkout</h3>
                      <div className="text-xs sm:text-sm bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                        {retailStep === 'scanning' && 'Ready to Scan'}
                        {retailStep === 'scanned' && 'Items Ready'}
                        {retailStep === 'payment' && 'Processing...'}
                        {retailStep === 'success' && 'Purchase Complete!'}
                      </div>
                    </div>
                    
                    {/* Scanning Step */}
                    {retailStep === 'scanning' && (
                      <div className="p-3 sm:p-4 md:p-6 bg-gray-50">
                        <div className="bg-blue-100 border-2 border-dashed border-blue-300 rounded-xl p-6 mb-6 text-center cursor-pointer hover:bg-blue-200 transition-all"
                             onClick={handleRetailPayment}>
                          <div className="text-6xl mb-3">📱</div>
                          <div className="text-lg font-bold text-blue-800">Scan Product Barcode</div>
                          <div className="text-sm text-blue-600 mt-2">Hold item steady over scanner</div>
                          
                          {/* Barcode Animation */}
                          <div className="mt-4 mb-3 p-3 bg-white rounded-lg border">
                            <div className="text-xs text-gray-600 mb-2">Sample Product Barcode:</div>
                            <div className="font-mono text-xs bg-black text-white p-2 rounded flex items-center justify-center space-x-1">
                              {Array.from({ length: 20 }, (_, i) => (
                                <div key={i} className="w-0.5 h-4 bg-white"></div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">8901234567890</div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="w-16 h-1 bg-red-500 mx-auto animate-pulse"></div>
                          </div>
                          <div className="mt-4 text-sm font-semibold text-blue-700">
                            👆 Click to simulate scanning
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Scanned Items Step */}
                    {retailStep === 'scanned' && (
                      <div className="p-3 sm:p-4 md:p-6 bg-gray-50">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
                          <div className="p-4 border-b border-gray-200 bg-green-50">
                            <h4 className="font-bold text-green-800 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Item Scanned Successfully
                            </h4>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg animate-pulse">
                              <div className="flex items-center gap-3">
                                <div className="text-3xl">📱</div>
                                <div>
                                  <div className="font-semibold">Wireless Headphones</div>
                                  <div className="text-sm text-gray-600">SKU: WH-001 • Qty: 1</div>
                                </div>
                              </div>
                              <div className="text-orange-600 font-bold text-xl">π 25.99</div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-orange-50 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-lg font-semibold">Subtotal</span>
                              <span className="font-bold">π 25.99</span>
                            </div>
                            <div className="flex justify-between items-center text-2xl font-bold text-orange-600">
                              <span>Total</span>
                              <span>π 25.99</span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleRetailPayment}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                          <Zap className="w-6 h-6 mr-3 inline" />
                          PAY WITH PI π 25.99
                        </button>
                      </div>
                    )}
                    
                    {/* Payment Processing Step */}
                    {retailStep === 'payment' && (
                      <div className="p-6 bg-gray-50">
                        <div className="text-center mb-6">
                          {/* DropPay Mascot */}
                          <div className="w-20 h-20 mx-auto mb-4">
                            <img 
                              src="https://i.ibb.co/C3c3PZ7F/media-78.gif" 
                              alt="DropPay Processing"
                              className="w-20 h-20 rounded-full border-4 border-orange-300 shadow-lg"
                            />
                          </div>
                          
                          {/* QR Code Payment Interface */}
                          <div className="mb-4 p-4 bg-white rounded-lg border-2 border-dashed border-orange-300">
                            <div className="text-center mb-3">
                              <div className="relative inline-block">
                                <QrCode className="w-16 h-16 text-orange-500" />
                                <div className="absolute inset-0 bg-orange-500/20 rounded animate-pulse"></div>
                              </div>
                              <div className="text-sm font-semibold text-orange-700 mt-2">📱 Customer Scanning QR Code</div>
                              <div className="text-xs text-gray-600 mt-1">Please hold your phone steady</div>
                            </div>
                            <div className="w-full bg-orange-100 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                          
                          <h4 className="text-xl font-bold mb-2">Processing Pi Payment</h4>
                          <p className="text-gray-600">QR scan complete! Verifying on Pi Network...</p>
                          
                          <div className="mt-6 bg-white rounded-lg p-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Payment Progress</span>
                              <span>{paymentProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${paymentProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Success Step */}
                    {retailStep === 'success' && (
                      <div className="p-6 bg-gray-50 text-center">
                        <div className="mb-6">
                          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-white" />
                          </div>
                          <h4 className="text-2xl font-bold text-green-600 mb-2">Purchase Complete!</h4>
                          <p className="text-gray-600 mb-4">Thank you for your purchase</p>
                          
                          <div className="bg-white rounded-xl p-4 shadow-lg border border-green-200 mb-6">
                            <div className="text-lg font-bold mb-2">Receipt #5678</div>
                            <div className="text-sm text-gray-600 mb-3">📱 Wireless Headphones x1</div>
                            <div className="flex justify-between items-center">
                              <span>Total Paid:</span>
                              <span className="font-bold text-green-600">π 25.99</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleRetailPayment}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                            New Purchase
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Badge variant="outline" className="justify-center py-2">📷 Barcode Scanner</Badge>
                    <Badge variant="outline" className="justify-center py-2">🧾 Receipt Print</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kiosk Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Touch Interface</h4>
              <p className="text-sm text-muted-foreground">Intuitive touchscreen design optimized for all ages</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">QR Integration</h4>
              <p className="text-sm text-muted-foreground">Seamless mobile-to-kiosk ordering experience</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Instant Payments</h4>
              <p className="text-sm text-muted-foreground">Lightning-fast Pi transactions with instant confirmation</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Cloud Managed</h4>
              <p className="text-sm text-muted-foreground">Remote updates and management from your dashboard</p>
            </div>
          </div>

          {/* Industries */}
          <div className="text-center">
            <h4 className="text-2xl font-bold text-foreground mb-6">Perfect for Any Physical Business</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { emoji: "🍕", name: "Restaurants" },
                { emoji: "🛍️", name: "Retail Stores" },
                { emoji: "☕", name: "Coffee Shops" },
                { emoji: "🏥", name: "Clinics" },
                { emoji: "🏨", name: "Hotels" }
              ].map((industry, index) => (
                <Card key={index} className="p-4 text-center border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="text-3xl mb-2">{industry.emoji}</div>
                    <div className="text-sm font-semibold text-foreground">{industry.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Early Access CTA */}
          <div className="mt-8 text-center">
            <Card className="max-w-xl mx-auto bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-foreground mb-3">Get Early Access</h4>
                <p className="text-muted-foreground mb-4">
                  Be the first to know when DropPay Kiosk solutions launch. Join our waitlist for exclusive early access.
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  asChild
                >
                  <a href="https://droppay.space/contact" target="_blank">
                    🚀 Join Waitlist
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 md:mt-20 text-center px-4 sm:px-6">
          <Card className="max-w-2xl mx-auto border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-center mb-4 md:mb-6">
                <img 
                  src="https://i.ibb.co/Q7GykxDY/media-77.gif" 
                  alt="DropPay Mascot" 
                  className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-orange-200 shadow-lg"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">
                Ready to Start Accepting Pi?
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                Join thousands of merchants already earning with DropPay's simple integration
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  asChild
                >
                  <a href="/auth">
                    🚀 Start Building Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://droppay.space/dashboard/widgets" target="_blank">
                    Try Widget Generator
                    <Code className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/demos/checkout-builder" target="_blank">
                    View Live Demo
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DropPay Support Message */}
        <div className="mt-12 md:mt-16 text-center px-4 sm:px-6">
          <Card className="max-w-3xl mx-auto border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="flex justify-center mb-4 md:mb-6">
                <img 
                  src="https://i.ibb.co/W41sLNdT/media-79.gif" 
                  alt="DropPay Support Message" 
                  className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-orange-200 shadow-lg"
                />
              </div>
              
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-4 md:mb-6">
                  🚀 Help Us Build the Future of Pi Payments
                </h3>
                
                <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8">
                  <p>
                    Your continued support makes DropPay possible! Every transaction, every integration, 
                    and every merchant using our platform helps us develop new features and improve the Pi ecosystem.
                  </p>
                  
                  <p className="font-medium text-orange-700">
                    💜 By supporting DropPay, you're ensuring all these amazing features remain available 
                    and that we can continue innovating for the Pi community!
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-orange-200">
                      <div className="text-xl md:text-2xl mb-1">🔧</div>
                      <div className="text-xs md:text-sm font-medium text-orange-700">New Features</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-orange-200">
                      <div className="text-xl md:text-2xl mb-1">🛡️</div>
                      <div className="text-xs md:text-sm font-medium text-orange-700">Enhanced Security</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-orange-200">
                      <div className="text-xl md:text-2xl mb-1">⚡</div>
                      <div className="text-xs md:text-sm font-medium text-orange-700">Better Performance</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-orange-200">
                      <div className="text-xl md:text-2xl mb-1">🤝</div>
                      <div className="text-xs md:text-sm font-medium text-orange-700">24/7 Support</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center mt-4 sm:mt-6 md:mt-8">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    asChild
                  >
                    <a href="/auth">
                      💜 Start Using DropPay
                      <Heart className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    asChild
                  >
                    <a href="https://droppay.space/about" target="_blank">
                      📖 Learn More About Us
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
                
                <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl border border-orange-200">
                  <p className="text-xs md:text-sm text-orange-800 font-medium mb-2">
                    🌟 What Your Support Enables:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <span className="bg-white/80 text-orange-700 px-2 md:px-3 py-1 rounded-full border border-orange-200">
                      Free API Access
                    </span>
                    <span className="bg-white/80 text-orange-700 px-2 md:px-3 py-1 rounded-full border border-orange-200">
                      Regular Updates
                    </span>
                    <span className="bg-white/80 text-orange-700 px-2 md:px-3 py-1 rounded-full border border-orange-200">
                      Community Support
                    </span>
                    <span className="bg-white/80 text-orange-700 px-2 md:px-3 py-1 rounded-full border border-orange-200">
                      Future Innovations
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default EmbeddableWidgetsShowcase;