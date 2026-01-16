import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Zap, CheckCircle, XCircle, Loader2, Shield, RefreshCw, ShoppingCart, CreditCard, Download, ExternalLink, User, Mail, Copy, AlertTriangle, Gift, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import dropPayLogo from '@/assets/droppay-logo.png';

interface PaymentLink {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  slug: string;
  merchant_id: string;
  payment_type: string;
  redirect_url: string | null;
  content_file: string | null;
  access_type: string | null;
  pricing_type?: string;
  enable_waitlist?: boolean;
  ask_questions?: boolean;
  checkout_questions?: unknown;
  stock?: number | null;
  is_unlimited_stock?: boolean;
  min_amount?: number | null;
  suggested_amounts?: number[] | null;
  merchants: {
    business_name: string | null;
    pi_username: string | null;
    wallet_address: string | null;
  };
}

interface PiUser {
  uid: string;
  username: string;
}

type PaymentStatus = 'idle' | 'authenticating' | 'awaiting_email' | 'processing' | 'verifying' | 'completed' | 'cancelled' | 'error';

const paymentTypeIcons = {
  one_time: CreditCard,
  recurring: RefreshCw,
  checkout: ShoppingCart,
};

export default function PayPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  const [checkoutResponses, setCheckoutResponses] = useState<Record<number, string>>({});
  const [customAmount, setCustomAmount] = useState('');
  // For image from query param
  const [linkImage, setLinkImage] = useState<string | null>(null);

  useEffect(() => {
    // Check if running in Pi Browser (user agent fallback + Pi SDK check)
    if (typeof window !== 'undefined') {
      const ua = window.navigator?.userAgent || '';
      const hasPiSdk = Boolean((window as any).Pi);
      const inPiBrowser = hasPiSdk || ua.includes('PiBrowser');
      setIsPiBrowser(inPiBrowser);
    }
    // Check for image param in URL
    const params = new URLSearchParams(window.location.search);
    const imageParam = params.get('image');
    if (imageParam) {
      setLinkImage(decodeURIComponent(imageParam));
    }
    if (slug) {
      fetchPaymentLink();
    }
  }, [slug]);

  const fetchPaymentLink = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_links')
        .select(`
          *,
          merchants (business_name, pi_username, wallet_address)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setPaymentLink(data);

      // Track view
      if (data) {
        supabase.rpc('increment_views', { link_id: data.id });
      }
    } catch (error) {
      console.error('Error fetching payment link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithPi = async () => {
    if (!isPiBrowser) {
      toast.error('Please open this payment link in Pi Browser to continue.');
      return false;
    }

    setPaymentStatus('authenticating');
    try {
      const Pi = (window as any).Pi;
      const scopes = ['payments', 'username', 'wallet_address'];
      
      const authResult = await Pi.authenticate(scopes, (payment: any) => {
        // Handle incomplete payment
        console.log('Incomplete payment found:', payment);
      });

      if (authResult) {
        setPiUser({
          uid: authResult.user.uid,
          username: authResult.user.username,
        });
        toast.success(`Welcome, @${authResult.user.username}!`);
        // If content file exists, ask for email
        if (paymentLink?.content_file) {
          setPaymentStatus('awaiting_email');
        } else {
          setPaymentStatus('idle');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Pi authentication error:', error);
      toast.error('Authentication failed. Please try again.');
      setPaymentStatus('error');
      return false;
    }
  };

  const verifyPaymentOnBlockchain = async (txid: string) => {
    if (!paymentLink) return false;

    setPaymentStatus('verifying');
    try {
      const response = await supabase.functions.invoke('verify-payment', {
        body: {
          txid,
          expectedAmount: paymentLink.amount,
          paymentLinkId: paymentLink.id,
        },
      });

      if (response.error) throw response.error;

      setVerificationResult(response.data);
      return response.data.verified;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };

  const handlePaymentSuccess = async (txId?: string) => {
    if (!paymentLink) return;

    // Handle content access after payment
    if (paymentLink.content_file) {
      // Get signed URL for the content file (24 hour expiry for email)
      const { data: signedUrlData } = await supabase.storage
        .from('payment-content')
        .createSignedUrl(paymentLink.content_file, 86400); // 24 hours

      if (signedUrlData?.signedUrl) {
        setContentUrl(signedUrlData.signedUrl);
        
        // Send email with download link if email was provided
        if (buyerEmail && transactionId) {
          try {
            await supabase.functions.invoke('send-download-email', {
              body: {
                transactionId: transactionId,
                buyerEmail: buyerEmail,
                paymentLinkId: paymentLink.id,
                downloadUrl: signedUrlData.signedUrl,
                productTitle: paymentLink.title,
              },
            });
            toast.success('Download link sent to your email!');
          } catch (error) {
            console.error('Error sending email:', error);
          }
        }
      }
    }

    // Handle redirect if specified
    if (paymentLink.redirect_url) {
      toast.success('Payment successful! Redirecting...');
      setTimeout(() => {
        window.location.href = paymentLink.redirect_url!;
      }, 2000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handlePayment = async () => {
    if (!paymentLink) return;

    // Check merchant's transaction count for Free plan limits
    const merchantQuery: any = await supabase
      .from('merchants')
      .select('id')
      .eq('id', paymentLink.merchant_id)
      .single();

    if (merchantQuery.data) {
      const merchantData = merchantQuery.data;
      // Get merchant's subscription - type assertion to avoid deep instantiation
      const subQuery: any = await (supabase as any)
        .from('user_subscriptions')
        .select('plan_id')
        .eq('merchant_id', merchantData.id)
        .eq('status', 'active')
        .maybeSingle();
      
      const subData = subQuery.data;
      let planName = 'Free';
      
      if (subData?.plan_id) {
        const planQuery: any = await supabase
          .from('subscription_plans')
          .select('name')
          .eq('id', subData.plan_id)
          .single();
        
        if (planQuery.data) {
          planName = planQuery.data.name;
        }
      }

      // Check if on Free plan
      const isFreePlan = planName === 'Free';

      if (isFreePlan) {
        // Count completed transactions for this payment link
        const countQuery: any = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('payment_link_id', paymentLink.id)
          .eq('status', 'completed');

        const count = countQuery.count;
        if (count !== null && count >= 3) {
          toast.error('This payment link has reached its Free plan limit of 3 transactions. Merchant needs to upgrade.');
          setPaymentStatus('error');
          return;
        }
      }
    }

    // Require Pi authentication first
    if (!piUser) {
      const authenticated = await authenticateWithPi();
      if (!authenticated) return;
      // If awaiting email, don't proceed to payment yet
      if (paymentLink.content_file) return;
    }

    // If there's a content file and we're awaiting email, validate email first
    if (paymentLink.content_file && paymentStatus === 'awaiting_email') {
      if (!buyerEmail || !buyerEmail.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setPaymentStatus('processing');

    try {
      if (isPiBrowser && (window as any).Pi) {
        const Pi = (window as any).Pi;

        const paymentAmount = paymentLink.pricing_type === 'donation' && customAmount 
          ? parseFloat(customAmount) 
          : paymentLink.amount;

        const paymentData = {
          amount: paymentAmount,
          memo: `Payment for: ${paymentLink.title}`,
          metadata: {
            payment_link_id: paymentLink.id,
            merchant_id: paymentLink.merchant_id,
            payer_username: piUser?.username,
            buyer_email: buyerEmail || null,
          },
        };

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              const response = await supabase.functions.invoke('approve-payment', {
                body: { paymentId, paymentLinkId: paymentLink.id },
              });

              if (response.error) throw response.error;
            } catch (error) {
              console.error('Error approving payment:', error);
              setPaymentStatus('error');
              toast.error('Payment approval failed');
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              console.log('Completing payment:', paymentId, 'txid:', txid);
              
              // Complete the payment with Pi Network
              const response = await supabase.functions.invoke('complete-payment', {
                body: { 
                  paymentId, 
                  txid, 
                  paymentLinkId: paymentLink.id,
                  payerUsername: piUser?.username,
                  buyerEmail: buyerEmail || null,
                },
              });
              
              if (response.error) throw response.error;
              console.log('Payment completed:', response.data);

              // Store transaction ID for email sending
              if (response.data?.transactionId) {
                setTransactionId(response.data.transactionId);
              }

              // Verify on blockchain
              const isVerified = await verifyPaymentOnBlockchain(txid);
              
              setPaymentStatus('completed');
              
              if (isVerified) {
                toast.success('Payment verified on blockchain!');
              } else {
                toast.success('Payment completed! Verification pending.');
              }

              // Handle post-payment actions
              await handlePaymentSuccess(txid);
            } catch (error) {
              console.error('Error completing payment:', error);
              setPaymentStatus('error');
              toast.error('Payment completion failed');
            }
          },
          onCancel: (paymentId: string) => {
            console.log('Payment cancelled:', paymentId);
            setPaymentStatus('cancelled');
            toast.error('Payment was cancelled');
          },
          onError: (error: any, payment: any) => {
            console.error('Payment error:', error, payment);
            setPaymentStatus('error');
            toast.error('Payment failed. Please try again.');
          },
        };

        await Pi.createPayment(paymentData, callbacks);
      } else {
        toast.error('Payments must be completed in Pi Browser. Copy the link and open it there.');
        setPaymentStatus('idle');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error('Payment failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Link Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This payment link doesn't exist or has been deactivated.
            </p>
            <Button asChild>
              <Link to="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TypeIcon = paymentTypeIcons[paymentLink.payment_type as keyof typeof paymentTypeIcons] || CreditCard;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 overflow-x-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img 
                src={dropPayLogo} 
                alt="DropPay Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-xl font-bold text-foreground">DropPay</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(window.location.href)}
              title="Copy payment link"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <TypeIcon className="w-4 h-4" />
            <span className="capitalize">{paymentLink.payment_type.replace('_', ' ')} Payment</span>
          </div>
          <CardTitle className="text-2xl">{paymentLink.title}</CardTitle>
          {paymentLink.description && (
            <CardDescription>{paymentLink.description}</CardDescription>
          )}
          {/* Show payment link image if present (from query param or DB in future) */}
          {linkImage && (
            <div className="flex justify-center mt-4">
              <img src={linkImage} alt="Link" className="rounded max-h-40" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentStatus === 'completed' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Successful!
              </h2>
              {verificationResult?.verified && (
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Verified on Pi Blockchain</span>
                </div>
              )}
              <p className="text-muted-foreground mb-4">
                Thank you for your payment.
              </p>

              {/* Content access section */}
              {contentUrl && (
                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-4">
                  <h3 className="font-medium text-foreground">Your Content</h3>
                  
                  {/* Pi Browser Warning */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm text-amber-600 font-medium">
                          Download not available in Pi Browser
                        </p>
                        <p className="text-xs text-amber-600/80">
                          Pi Browser doesn't support file downloads. Please copy the link below and paste it in another browser (Chrome, Safari, Firefox, etc.) to download your file.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Download Link</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={contentUrl} 
                        readOnly 
                        className="text-xs font-mono"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(contentUrl)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <a href={contentUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Open Download Link
                    </a>
                  </Button>

                  {buyerEmail && (
                    <p className="text-xs text-muted-foreground text-center">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Download link also sent to {buyerEmail}
                    </p>
                  )}
                </div>
              )}

              {paymentLink.redirect_url && paymentLink.access_type === 'redirect' && (
                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h3 className="font-medium text-foreground mb-2">Access Your Content</h3>
                  <Button asChild className="w-full">
                    <a href={paymentLink.redirect_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go to Content
                    </a>
                  </Button>
                </div>
              )}

              {verificationResult?.transaction && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/50 text-left">
                  <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                  <p className="text-xs font-mono break-all">{verificationResult.transaction.txid}</p>
                  <a
                    href={`https://blockexplorer.minepi.com/mainnet/tx/${verificationResult.transaction.txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    View on Block Explorer →
                  </a>
                </div>
              )}
            </div>
          ) : paymentStatus === 'cancelled' ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Cancelled
              </h2>
              <p className="text-muted-foreground mb-4">
                Your payment was not completed.
              </p>
              <Button onClick={() => setPaymentStatus('idle')}>Try Again</Button>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Failed
              </h2>
              <p className="text-muted-foreground mb-4">
                Something went wrong. Please try again.
              </p>
              <Button onClick={() => setPaymentStatus('idle')}>Try Again</Button>
            </div>
          ) : (
            <>
              {/* Pi Browser Notice */}
              {!isPiBrowser && (
                <div className="p-4 rounded-lg bg-amber-500/10 border-2 border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                        Pi Browser Required
                      </h3>
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        To complete payments, you need to open this link in the <strong>Pi Browser</strong>. 
                        Regular browsers don't support Pi Network payments.
                      </p>
                      <div className="flex flex-col gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => copyToClipboard(window.location.href)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link to Open in Pi Browser
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Info */}
              {piUser && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">@{piUser.username}</p>
                    <p className="text-xs text-muted-foreground">Authenticated with Pi</p>
                  </div>
                </div>
              )}

              {/* Email Input for file delivery - show after auth if there's a content file */}
              {piUser && paymentLink.content_file && (
                <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <Label htmlFor="buyerEmail" className="font-medium">
                      Email for Download Link
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your email to receive the download link. This is required because file downloads may not work directly in Pi Browser.
                  </p>
                  <Input
                    id="buyerEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full"
                  />
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-600">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Pi Browser doesn't support downloads. We'll email you the link to open in another browser.
                    </p>
                  </div>
                </div>
              )}

              {/* Amount Display */}
              <div className="text-center p-8 rounded-2xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-2">
                  {paymentLink.pricing_type === 'free' ? 'Price' : 'Amount to Pay'}
                </p>
                <p className="text-5xl font-bold text-foreground">
                  {paymentLink.pricing_type === 'free' || paymentLink.amount === 0 ? (
                    <span className="flex items-center justify-center gap-2">
                      <Gift className="w-10 h-10 text-primary" />
                      Free
                    </span>
                  ) : (
                    `π ${Number(paymentLink.amount).toFixed(2)}`
                  )}
                </p>
                {paymentLink.payment_type === 'recurring' && paymentLink.amount > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">per month</p>
                )}
              </div>

              {/* Important Note - Only show when NOT in Pi Browser */}
              {!isPiBrowser && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-medium text-blue-600">
                        💡 For Best Experience: Always use Pi Browser
                      </p>
                      <p className="text-sm text-blue-600/90">
                        Open this payment link in the <strong>Pi Browser</strong> app for secure transactions. Copy the payment link below if you need to switch to Pi Browser.
                      </p>
                      <a
                        href="https://pinet.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
                      >
                        Get Pi Browser at pinet.com
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Questions */}
              {paymentLink.ask_questions && Array.isArray(paymentLink.checkout_questions) && (paymentLink.checkout_questions as { question: string }[]).length > 0 && (
                <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-border">
                  <Label className="font-medium">Please answer these questions:</Label>
                  {(paymentLink.checkout_questions as { question: string }[]).map((q, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-sm text-muted-foreground">{q.question}</Label>
                      <Textarea
                        placeholder="Your answer..."
                        value={checkoutResponses[index] || ''}
                        onChange={(e) => setCheckoutResponses({ ...checkoutResponses, [index]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Merchant Info */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <span className="text-muted-foreground">Paying to</span>
                <span className="font-medium text-foreground">
                  {paymentLink.merchants?.business_name ||
                    `@${paymentLink.merchants?.pi_username}`}
                </span>
              </div>

              {/* What you'll get */}
              {(paymentLink.content_file || paymentLink.redirect_url) && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium text-foreground mb-2">What you'll get:</p>
                  {paymentLink.content_file && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Download className="w-4 h-4" />
                      <span>Downloadable content (link sent to email)</span>
                    </div>
                  )}
                  {paymentLink.redirect_url && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="w-4 h-4" />
                      <span>Access to exclusive content</span>
                    </div>
                  )}
                </div>
              )}

              {/* Security Badge */}
              {paymentLink.merchants?.wallet_address && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <Shield className="w-4 h-4" />
                  <span>Blockchain verification enabled</span>
                </div>
              )}

              {/* Pi Browser Warning */}
              {!isPiBrowser && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-amber-600">
                          Not in Pi Browser
                        </p>
                        <p className="text-sm text-amber-600/90">
                          To process this payment, please copy the link below and paste it in the Pi Browser app.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Payment Link</Label>
                    <div className="flex gap-2">
                      <Input
                        value={window.location.href}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied! Open Pi Browser and paste it.');
                        }}
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      1. Copy this link • 2. Open Pi Browser • 3. Paste and complete payment
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <a
                      href="https://minepi.com/Wain2020"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Download Pi Browser
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Auth & Pay Button */}
              {!piUser ? (
                <Button
                  onClick={authenticateWithPi}
                  disabled={paymentStatus === 'authenticating'}
                  className="w-full h-14 text-lg"
                  variant="outline"
                >
                  {paymentStatus === 'authenticating' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-5 w-5" />
                      Connect Pi Wallet
                    </>
                  )}
                </Button>
              ) : paymentLink.pricing_type === 'free' || paymentLink.amount === 0 ? (
                <Button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'processing' || (paymentLink.content_file && !buyerEmail)}
                  className="w-full h-14 text-lg gradient-primary hover:opacity-90"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-5 w-5" />
                      Get Free Access
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'processing' || paymentStatus === 'verifying' || (paymentLink.content_file && !buyerEmail)}
                  className="w-full h-14 text-lg gradient-primary hover:opacity-90"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : paymentStatus === 'verifying' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying on blockchain...
                    </>
                  ) : (
                    <>Pay π {Number(paymentLink.amount).toFixed(2)}</>
                  )}
                </Button>
              )}

              {/* Waitlist Option */}
              {paymentLink.enable_waitlist && !hasJoinedWaitlist && (
                <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <Label className="font-medium">Join the Waitlist</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get notified when this product becomes available or restocks.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline"
                      disabled={isJoiningWaitlist || !waitlistEmail}
                      onClick={async () => {
                        if (!waitlistEmail.includes('@')) {
                          toast.error('Please enter a valid email');
                          return;
                        }
                        setIsJoiningWaitlist(true);
                        try {
                          await supabase.from('waitlist_entries').insert({
                            payment_link_id: paymentLink.id,
                            email: waitlistEmail,
                            pi_username: piUser?.username || null,
                          });
                          setHasJoinedWaitlist(true);
                          toast.success('You\'ve joined the waitlist!');
                        } catch (error) {
                          console.error('Error joining waitlist:', error);
                          toast.error('Failed to join waitlist');
                        } finally {
                          setIsJoiningWaitlist(false);
                        }
                      }}
                    >
                      {isJoiningWaitlist ? 'Joining...' : 'Join'}
                    </Button>
                  </div>
                </div>
              )}

              {hasJoinedWaitlist && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <p className="text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    You're on the waitlist! We'll notify you.
                  </p>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground">
                Powered by{' '}
                <Link to="/" className="text-primary hover:underline">
                  DropPay
                </Link>
                {' • '}
                <a
                  href="https://blockexplorer.minepi.com/mainnet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Verified on Pi Blockchain
                </a>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
