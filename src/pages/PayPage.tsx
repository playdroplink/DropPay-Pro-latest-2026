import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Zap, CheckCircle, XCircle, Loader2, RefreshCw, ShoppingCart, CreditCard, Download, ExternalLink, User, Mail, AlertTriangle, Gift, Users, HelpCircle, Copy, Shield, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import dropPayLogo from '@/assets/droppay-logo.png';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';
import { InstructionModal } from '@/components/InstructionModal';
import { TransactionReceipt } from '@/components/TransactionReceipt';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentLink {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  slug: string;
  merchant_id: string;
  payment_type: string;
  redirect_url: string | null;
  cancel_redirect_url?: string | null;
  checkout_image?: string | null;
  content_file: string | null;
  access_type: string | null;
  pricing_type?: string;
  checkout_template?: string;
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
  // Checkout-link specific (optional)
  currency?: string;
  category?: string;
  features?: string[];
  is_checkout_link?: boolean;
  link?: string;
  qrData?: string;
}

interface PiUser {
  uid: string;
  username: string;
  wallet_address?: string;
}

type PaymentStatus =
  | 'idle'
  | 'authenticating'
  | 'awaiting_email'
  | 'processing'
  | 'approved'
  | 'verifying'
  | 'completed'
  | 'cancelled'
  | 'approval_failed'
  | 'completion_failed'
  | 'verification_failed'
  | 'error';

const paymentTypeIcons = {
  one_time: CreditCard,
  recurring: RefreshCw,
  checkout: ShoppingCart,
};

export default function PayPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [merchantUsername, setMerchantUsername] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  // Default auth header for Supabase Edge Functions to avoid 401 when no session is present
  const functionHeaders = {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  };
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [linkImage, setLinkImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [checkoutResponses, setCheckoutResponses] = useState<Record<number, string>>({});
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    // Check if running in Pi Browser (user agent fallback + Pi SDK check)
    if (typeof window !== 'undefined') {
      const ua = window.navigator?.userAgent || '';
      const hasPiSdk = Boolean((window as any).Pi);
      const inPiBrowser = hasPiSdk || ua.includes('PiBrowser');
      console.log('🌐 Browser check:', { ua, hasPiSdk, inPiBrowser });
      setIsPiBrowser(inPiBrowser);
      
      // Show modal if not in Pi Browser (after short delay)
      if (!inPiBrowser) {
        console.log('⚠️ Not in Pi Browser - showing modal');
        setTimeout(() => {
          console.log('⚠️ Setting showBrowserModal to true');
          setShowBrowserModal(true);
        }, 800);
      }
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

  // Fetch merchant username separately
  useEffect(() => {
    const fetchMerchantUsername = async () => {
      if (!paymentLink?.merchant_id) {
        console.log('No merchant_id available');
        return;
      }

      try {
        // First try to get from merchants table
        const { data, error } = await supabase
          .from('merchants')
          .select('pi_username')
          .eq('id', paymentLink.merchant_id)
          .maybeSingle();

        if (data?.pi_username) {
          console.log('✅ Merchant username found in DB:', data.pi_username);
          setMerchantUsername(data.pi_username);
          return;
        }

        // Fallback: check if paymentLink has merchants.pi_username
        if (paymentLink.merchants?.pi_username) {
          console.log('✅ Merchant username found in link object:', paymentLink.merchants.pi_username);
          setMerchantUsername(paymentLink.merchants.pi_username);
          return;
        }

        // Final fallback: get from localStorage if merchant_id matches current user
        const storedUser = localStorage.getItem('pi_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.uid === paymentLink.merchant_id) {
              console.log('✅ Using stored user username:', user.username);
              setMerchantUsername(user.username);
              return;
            }
          } catch (e) {
            console.warn('Could not parse stored user:', e);
          }
        }

        console.warn('⚠️ Could not determine merchant username for merchant_id:', paymentLink.merchant_id);
      } catch (error) {
        console.error('Error fetching merchant username:', error);
      }
    };

    fetchMerchantUsername();
  }, [paymentLink?.merchant_id, paymentLink?.merchants?.pi_username]);

  const fetchPaymentLink = async () => {
    setIsLoading(true);
    try {
      // 1) Fetch payment_links without merchant join (we use piUser.uid as merchant_id)
      const { data: payData, error: payError } = await supabase
        .from('payment_links')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (payError) {
        console.error('payment_links lookup error:', payError.message);
      }

      if (payData) {
        // Fetch merchant info separately if merchant_id exists
        let merchantInfo = {
          business_name: null,
          pi_username: null,
          wallet_address: null,
        };

        if (payData.merchant_id) {
          const { data: merchantData } = await supabase
            .from('merchants')
            .select('business_name, pi_username, wallet_address')
            .eq('id', payData.merchant_id)
            .maybeSingle();

          if (merchantData) {
            merchantInfo = merchantData;
            // Set merchant username immediately if found
            if (merchantData.pi_username) {
              console.log('✅ Setting merchant username from DB:', merchantData.pi_username);
              setMerchantUsername(merchantData.pi_username);
            }
          }
        }

        const linkData = {
          ...payData,
          merchants: merchantInfo
        };
        setPaymentLink(linkData as any);
        
        // Set checkout image if present
        if (payData.checkout_image) {
          setLinkImage(payData.checkout_image);
        }
        
        supabase.rpc('increment_views', { link_id: payData.id });
        console.log('✅ Payment link loaded:', payData.slug, 'by', merchantInfo.pi_username);
        return;
      }

      // 2) Try checkout_links table (fallback for legacy checkout links)
      const { data: checkoutData, error: checkoutError } = await supabase
        .from('checkout_links')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (checkoutError) {
        console.error('checkout_links lookup error:', checkoutError.message);
      }

      if (checkoutData) {
        const checkout = checkoutData;
        
        // Fetch merchant info for checkout link too
        let merchantInfo = {
          business_name: null,
          pi_username: null,
          wallet_address: null,
        };

        if (checkout.merchant_id) {
          const { data: merchantData } = await supabase
            .from('merchants')
            .select('business_name, pi_username, wallet_address')
            .eq('id', checkout.merchant_id)
            .maybeSingle();

          if (merchantData) {
            merchantInfo = merchantData;
            // Set merchant username immediately if found
            if (merchantData.pi_username) {
              console.log('✅ Setting merchant username from checkout DB:', merchantData.pi_username);
              setMerchantUsername(merchantData.pi_username);
            }
          }
        }

        setPaymentLink({
          id: checkout.id,
          title: checkout.title,
          description: checkout.description,
          amount: checkout.amount,
          slug: checkout.slug,
          merchant_id: checkout.merchant_id,
          payment_type: 'checkout',
          redirect_url: checkout.redirect_after_checkout || null,
          cancel_redirect_url: checkout.cancel_redirect_url || null,
          checkout_image: checkout.checkout_image || null,
          content_file: null,
          access_type: checkout.expire_access || null,
          pricing_type: 'one_time',
          enable_waitlist: checkout.add_waitlist || false,
          ask_questions: checkout.ask_questions || false,
          checkout_questions: null,
          stock: checkout.stock || null,
          is_unlimited_stock: checkout.stock === null || checkout.stock === 0,
          min_amount: null,
          suggested_amounts: null,
          merchants: merchantInfo,
          currency: checkout.currency || 'Pi',
          category: checkout.category,
          features: checkout.features || [],
          is_checkout_link: true,
        } as PaymentLink);
        
        // Set checkout image if present
        if (checkout.checkout_image) {
          setLinkImage(checkout.checkout_image);
        }
        
        // Increment views for checkout links too
        const { error: viewError } = await supabase
          .from('checkout_links')
          .update({ views: (checkout.views || 0) + 1 })
          .eq('id', checkout.id);
        
        if (viewError) {
          console.warn('Failed to increment checkout link views:', viewError);
        }
        
        console.log('✅ Checkout link loaded:', checkout.slug);
        return;
      }

      // 3) Link not found
      console.warn('❌ Payment link not found for slug:', slug);


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
      console.log('🔐 Starting Pi authentication for payment...');
      const Pi = (window as any).Pi;
      
      // Pi SDK is already initialized in AuthContext - do not re-initialize
      const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
      console.log('💳 Using Pi SDK with config:', { sandbox: sandboxMode, mainnet: !sandboxMode });
      
      const scopes = ['username', 'payments', 'wallet_address'];
      console.log('📋 Requesting authentication scopes:', scopes);
      
      const authResult = await Pi.authenticate(scopes, (payment: any) => {
        // Handle incomplete payment as per Pi documentation
        console.log('⚠️ Incomplete payment found:', payment);
        toast.info('You have an incomplete payment. Please complete it first.');
      });

      if (authResult) {
        console.log('✅ Pi authentication successful for payment', {
          username: authResult.user.username,
          uid: authResult.user.uid,
          hasWalletAddress: !!authResult.user.wallet_address
        });
        
        setPiUser({
          uid: authResult.user.uid,
          username: authResult.user.username,
          wallet_address: authResult.user.wallet_address,
        });
        toast.success(`Welcome, @${authResult.user.username}!`);
        
        // Trigger Pi Ad Network - show ad after authentication (non-blocking)
        const showAuthAd = async () => {
          if (!Pi?.Ads || typeof Pi.Ads.showAd !== 'function') {
            console.warn('⚠️ Pi Ads SDK not available');
            return;
          }
          try {
            // Basic flow recommended by Pi Ads docs: check ready → request if needed → show
            const ready = typeof Pi.Ads.isAdReady === 'function' ? await Pi.Ads.isAdReady('rewarded') : null;
            if (ready && ready.ready === false && typeof Pi.Ads.requestAd === 'function') {
              const req = await Pi.Ads.requestAd('rewarded');
              if (req?.result === 'ADS_NOT_SUPPORTED') {
                toast.error('Please update Pi Browser to view ads.');
                return;
              }
              if (!req || req.result !== 'AD_LOADED') {
                console.warn('⚠️ Ad not available right now:', req);
                return;
              }
            }

            const showResp = await Pi.Ads.showAd('rewarded');
            if (showResp?.result === 'AD_REWARDED') {
              console.log('✅ Ad watched successfully:', showResp.adId);
              toast.success('Thanks for watching!');
            } else if (showResp?.result === 'ADS_NOT_SUPPORTED') {
              toast.error('Please update Pi Browser to view ads.');
            } else {
              console.log('ℹ️ Ad closed or not rewarded:', showResp);
            }
          } catch (adError) {
            console.warn('⚠️ Ad display error (non-critical):', adError);
          }
        };
        showAuthAd();
        
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
      console.log('🔍 Verifying payment on blockchain:', { txid, paymentLinkId: paymentLink.id });
      const response = await supabase.functions.invoke('verify-payment', {
        body: {
          txid,
          expectedAmount: paymentLink.amount,
          paymentLinkId: paymentLink.id,
        },
        headers: functionHeaders,
      });

      if (response.error) {
        console.error('❌ Verification error:', response.error);
        throw response.error;
      }

      console.log('✅ Verification response:', response.data);
      setVerificationResult(response.data);
      return response.data?.verified === true;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };

  const handlePaymentSuccess = async (txId?: string) => {
    if (!paymentLink) return;

    // Update conversion count for both payment links and checkout links
    if (paymentLink.is_checkout_link) {
      // Update checkout link conversions - fetch current value and increment
      const { data: currentLink } = await (supabase as any)
        .from('checkout_links')
        .select('conversions')
        .eq('id', paymentLink.id)
        .single();
      
      const newConversions = (currentLink?.conversions || 0) + 1;
      
      const { error } = await (supabase as any)
        .from('checkout_links')
        .update({ conversions: newConversions })
        .eq('id', paymentLink.id);
      
      if (error) {
        console.warn('Failed to update checkout link conversions:', error);
      }
    } else {
      // Update payment link conversions (existing behavior)
      await supabase.rpc('increment_conversions', { link_id: paymentLink.id });
    }

    // Handle content access after payment
    if (paymentLink.content_file) {
      try {
        // Get signed URL for the content file (24 hour expiry for email)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('payment-content')
          .createSignedUrl(paymentLink.content_file, 86400); // 24 hours

        if (signedUrlError) {
          console.error('❌ Error creating signed URL:', signedUrlError);
          toast.error('Failed to generate download link');
        } else if (signedUrlData?.signedUrl) {
          // Validate the signed URL
          const downloadUrl = signedUrlData.signedUrl;
          console.log('✅ Content download URL generated:', downloadUrl);
          setContentUrl(downloadUrl);
          
          // Send email with download link if email was provided
          if (buyerEmail && transactionId) {
            try {
              await supabase.functions.invoke('send-download-email', {
                body: {
                  transactionId: transactionId,
                  buyerEmail: buyerEmail,
                  paymentLinkId: paymentLink.id,
                  downloadUrl: downloadUrl,
                  productTitle: paymentLink.title,
                },
                headers: functionHeaders,
              });
              toast.success('Download link sent to your email!');
            } catch (error) {
              console.error('Error sending email:', error);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error handling content file:', error);
        toast.error('Failed to process downloadable content');
      }
    }

    // Handle redirect if specified (both payment links and checkout links support this)
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
        console.log('🚀 Processing Pi payment for payment link:', paymentLink.title);
        const Pi = (window as any).Pi;
        
        // Validate Pi SDK is ready
        if (!Pi || typeof Pi.createPayment !== 'function') {
          console.error('❌ Pi SDK not properly initialized');
          setPaymentStatus('error');
          toast.error('Pi SDK not ready. Please refresh and try again.');
          return;
        }
        
        // Pi SDK is already initialized in AuthContext with correct mainnet config
        const sandboxMode = import.meta.env.VITE_PI_SANDBOX_MODE === 'true';
        console.log('💳 Creating payment with config:', { sandbox: sandboxMode, mainnet: !sandboxMode, piSdkReady: true });

        const paymentAmount = paymentLink.pricing_type === 'free'
          ? paymentLink.amount // No platform fee for free payment links
          : paymentLink.pricing_type === 'donation' && customAmount 
          ? parseFloat(customAmount) * 1.02 // Add 2% platform fee (for maintenance & future features) for donations
          : paymentLink.pricing_type === 'donation'
          ? paymentLink.amount * 1.02 // Add 2% platform fee (for maintenance & future features) for donation with set amount
          : paymentLink.amount; // Amount already includes platform fee (for maintenance & future features) for paid links

        const paymentData = {
          amount: paymentAmount,
          memo: `Payment for: ${paymentLink.title}`,
          metadata: {
            payment_link_id: paymentLink.id,
            merchant_id: paymentLink.merchant_id,
            payer_username: piUser?.username,
            buyer_email: buyerEmail || null,
            is_checkout_link: paymentLink.is_checkout_link || false,
            checkout_category: paymentLink.category || null,
            payment_type: paymentLink.payment_type || 'payment_link',
            is_subscription: paymentLink.payment_type === 'recurring' || 
                           paymentLink.title?.includes('Subscription') || 
                           paymentLink.title?.includes('Plan Subscription'),
            link_title: paymentLink.title,
          },
        };

        console.log('💳 Creating payment:', paymentData);

        // Set a timeout to prevent endless loading
        const paymentTimeout = setTimeout(() => {
          console.warn('⚠️ Payment process timed out after 2 minutes');
          setPaymentStatus('error');
          toast.error('Payment timed out. Please try again.');
        }, 120000); // 2 minutes timeout

        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              console.log('📡 Approving payment with Pi Network API...');
              console.log('💳 Payment approval details:', { 
                paymentId, 
                paymentLinkId: paymentLink.id,
                isCheckoutLink: paymentLink.is_checkout_link || false,
                isSubscription: paymentData.metadata.is_subscription
              });
              
              // Call Supabase edge function
              console.log('🔄 Calling approve-payment edge function...');
              const response = await supabase.functions.invoke('approve-payment', {
                body: { 
                  paymentId, 
                  paymentLinkId: paymentLink.id,
                  isCheckoutLink: paymentLink.is_checkout_link || false,
                  isSubscription: paymentData.metadata.is_subscription
                },
                headers: functionHeaders,
              });

              console.log('📊 Edge function response:', response);

              if (response.error) {
                console.error('❌ Edge function error:', response.error);
                setPaymentStatus('error');
                toast.error(`Payment approval failed: ${response.error.message || 'Server error'}`);
                throw new Error(`Edge function error: ${response.error.message || JSON.stringify(response.error)}`);
              }
              
              if (!response.data) {
                console.error('❌ No data in response:', response);
                setPaymentStatus('error');
                toast.error('Payment approval failed: No response from server');
                throw new Error('Empty response from edge function');
              }
              
              console.log('✅ Payment approved by Pi Network:', response.data);
              // Reflect approval in UI; completion will follow
              setPaymentStatus('approved');
              toast.success('Payment approved. Completing...');
            } catch (error) {
              console.error('❌ Error in payment approval:', error);
              console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                paymentId,
                paymentLinkId: paymentLink.id
              });
              setPaymentStatus('error');
              toast.error(`Payment approval failed: ${error.message || 'Unknown error'}. Please try again.`);
              throw error; // Re-throw to stop payment flow
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              console.log('🔄 Completing payment on Pi Network...', { paymentId, txid });
              console.log('💳 Payment completion details:', {
                paymentId,
                txid,
                paymentLinkId: paymentLink.id,
                payerUsername: piUser?.username,
                buyerEmail: buyerEmail || null,
                amount: paymentAmount,
                isCheckoutLink: paymentLink.is_checkout_link || false,
                isSubscription: paymentData.metadata.is_subscription
              });
              
              // Call Supabase edge function for completion
              console.log('🔄 Calling complete-payment edge function...');
              const response = await supabase.functions.invoke('complete-payment', {
                body: { 
                  paymentId, 
                  txid, 
                  paymentLinkId: paymentLink.id,
                  payerUsername: piUser?.username,
                  buyerEmail: buyerEmail || null,
                  amount: paymentAmount,
                  isCheckoutLink: paymentLink.is_checkout_link || false,
                  isSubscription: paymentData.metadata.is_subscription,
                  paymentType: paymentLink.title || paymentLink.payment_type,
                },
                headers: functionHeaders,
              });
              
              console.log('📊 Completion response:', response);
              
              if (response.error) {
                console.error('❌ Payment completion failed:', response.error);
                setPaymentStatus('completion_failed');
                toast.error(`Payment completion failed: ${response.error.message || 'Server error'}`);
                throw new Error(`Payment completion failed: ${response.error.message || JSON.stringify(response.error)}`);
              }
              
              if (!response.data) {
                console.error('❌ No data in completion response');
                setPaymentStatus('completion_failed');
                toast.error('Payment completion failed: No response from server');
                throw new Error('No response data from completion');
              }
              
              console.log('✅ Payment completed on Pi Network:', response.data);

              // Store transaction ID for email sending - CRITICAL for success flow
              if (response.data?.transactionId) {
                console.log('💾 Storing transaction ID:', response.data.transactionId);
                setTransactionId(response.data.transactionId);
              } else {
                console.warn('⚠️ No transaction ID in response:', response.data);
              }

              // Subscription activation is handled by backend complete-payment.
              // No frontend upsert to avoid duplication or policy conflicts.

              // Verify on blockchain
              console.log('🔍 Verifying payment on blockchain...');
              const isVerified = await verifyPaymentOnBlockchain(txid);

              if (isVerified) {
                console.log('✅ Payment verified on blockchain - marking as completed');
                setPaymentStatus('completed');
                toast.success('Payment verified on blockchain!');
                // Handle post-payment actions only on verified success
                console.log('✅ Calling handlePaymentSuccess...');
                await handlePaymentSuccess(txid);
                console.log('✅ Payment success handler completed');
              } else {
                console.warn('⚠️ Payment not verified on blockchain — marking as failed');
                setPaymentStatus('verification_failed');
                toast.error('Payment verification failed. Please try again.');
              }
            } catch (error) {
              console.error('❌ Error completing payment:', error);
              console.error('❌ Completion error details:', {
                message: error.message,
                stack: error.stack,
                paymentId,
                txid
              });
              setPaymentStatus('error');
              toast.error(`Payment completion failed: ${error.message || 'Unknown error'}. Please contact support.`);
            }
          },
          onCancel: (paymentId: string) => {
            clearTimeout(paymentTimeout);
            console.log('Payment cancelled:', paymentId);
            setPaymentStatus('cancelled');
            toast.error('Payment was cancelled');
            
            // Redirect to cancel URL if specified
            if (paymentLink.cancel_redirect_url) {
              setTimeout(() => {
                window.location.href = paymentLink.cancel_redirect_url!;
              }, 2000);
            }
          },
          onError: (error: any, payment: any) => {
            clearTimeout(paymentTimeout);
            console.error('Payment error:', error, payment);
            setPaymentStatus('error');
            toast.error('Payment failed. Please try again.');
            
            // Redirect to cancel URL on error if specified
            if (paymentLink.cancel_redirect_url) {
              setTimeout(() => {
                window.location.href = paymentLink.cancel_redirect_url!;
              }, 2000);
            }
          },
        };

        try {
          console.log('🚀 Initiating Pi.createPayment...');
          console.log('💳 Payment data being sent:', paymentData);
          await Pi.createPayment(paymentData, callbacks);
          console.log('✅ Pi.createPayment initiated successfully');
          // Clear timeout on successful initiation
          clearTimeout(paymentTimeout);
        } catch (createPaymentError) {
          clearTimeout(paymentTimeout);
          console.error('❌ Error creating payment:', createPaymentError);
          console.error('❌ Create payment error details:', {
            message: createPaymentError.message,
            stack: createPaymentError.stack,
            paymentData
          });
          setPaymentStatus('error');
          toast.error(`Failed to create payment: ${createPaymentError.message || 'Unknown error'}. Please try again.`);
        }
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
  const displayCurrency = paymentLink.currency || 'Pi';

  // Get template-specific styles
  const template = paymentLink.checkout_template || 'default';
  const getTemplateStyles = () => {
    switch (template) {
      case 'modern':
        return {
          card: 'border-2 shadow-2xl',
          header: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white',
          button: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
          accent: 'border-orange-500'
        };
      case 'minimal':
        return {
          card: 'border shadow-sm',
          header: 'bg-white dark:bg-slate-950',
          button: 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black',
          accent: 'border-gray-300'
        };
      case 'gradient':
        return {
          card: 'border-2 shadow-xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950',
          header: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white',
          button: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700',
          accent: 'border-pink-500'
        };
      default: // classic/default
        return {
          card: 'border shadow-lg',
          header: 'bg-card',
          button: 'bg-primary hover:bg-primary/90',
          accent: 'border-primary'
        };
    }
  };
  const templateStyles = getTemplateStyles();

  console.log('🔍 Render state:', { showBrowserModal, isPiBrowser, paymentLink: !!paymentLink });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 overflow-x-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Payment Instructions Button */}
      <Button
        onClick={() => {
          console.log('🔘 Manual trigger clicked, current state:', showBrowserModal);
          setShowBrowserModal(true);
        }}
        className="fixed top-4 right-4 z-50"
        variant="outline"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Payment Instruction
      </Button>

      {/* Pi Browser Instruction Modal */}
      <InstructionModal
        isOpen={showBrowserModal}
        onOpenChange={setShowBrowserModal}
        title="Payment Instructions"
        description="This payment link works best in the <span className='text-orange-600 dark:text-orange-400 font-semibold'>Pi Browser</span>."
        steps={[
          'Copy this payment link using the copy button above',
          'Open the Pi Browser app on your device',
          'Paste the link in Pi Browser\'s address bar',
          'Complete your secure Pi payment'
        ]}
        linkUrl={window?.location?.href}
        showCopyButton={true}
        showDownloadLink={true}
        downloadLink="https://minepi.com/Wain2020"
        downloadLinkText="Don't have Pi Browser? Download here"
        securityNote="Pi Browser ensures secure authentication and blockchain-verified transactions."
        imageUrl="https://i.ibb.co/KpdZ1vj4/media-83-2.gif"
      />

      <Card className={`max-w-md w-full ${templateStyles.card}`}>
        <CardHeader className={`text-center ${templateStyles.header}`}>
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
          {paymentLink.description ? (
            <CardDescription>{paymentLink.description}</CardDescription>
          ) : (
            <CardDescription>
              The simplest way to accept Pi cryptocurrency in your apps and websites. Create payment links,
              embed checkout widgets, and manage transactions seamlessly.
            </CardDescription>
          )}
          {paymentLink.features && paymentLink.features.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {paymentLink.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {feature}
                </span>
              ))}
            </div>
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
            <div className="space-y-6">
              {/* Transaction Receipt */}
              {transactionId && paymentLink && (
                <TransactionReceipt
                  transactionId={transactionId}
                  amount={paymentLink.amount}
                  currency={paymentLink.currency || 'Pi'}
                  paymentLinkTitle={paymentLink.title}
                  merchantName={
                    paymentLink.merchants?.business_name ||
                    (merchantUsername ? `@${merchantUsername}` : 'Merchant')
                  }
                  payerUsername={piUser?.username || 'Unknown'}
                  payerEmail={buyerEmail}
                  txid={verificationResult?.transaction?.txid}
                  completedAt={new Date().toISOString()}
                  isBlockchainVerified={verificationResult?.verified || false}
                  blockExplorerUrl={
                    verificationResult?.transaction?.txid
                      ? `https://blockexplorer.minepi.com/mainnet/tx/${verificationResult.transaction.txid}`
                      : undefined
                  }
                  onSendEmail={async () => {
                    if (!buyerEmail) {
                      toast.error('Please provide an email address');
                      return;
                    }
                    try {
                      await supabase.functions.invoke('send-receipt-email', {
                        body: {
                          transactionId,
                          buyerEmail,
                          paymentLinkTitle: paymentLink.title,
                          merchantName:
                            paymentLink.merchants?.business_name ||
                            (merchantUsername ? `@${merchantUsername}` : 'Merchant'),
                          payerUsername: piUser?.username,
                          amount: paymentLink.amount,
                          currency: paymentLink.currency || 'Pi',
                          txid: verificationResult?.transaction?.txid,
                          isBlockchainVerified: verificationResult?.verified || false,
                        },
                        headers: functionHeaders,
                      });
                      toast.success('Receipt sent to your email!');
                    } catch (error) {
                      console.error('Error sending receipt:', error);
                      toast.error('Failed to send receipt email');
                    }
                  }}
                />
              )}

              {/* Rest of success content */}
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://i.ibb.co/V0G8GR1G/media-84.gif" 
                    alt="Payment Successful" 
                    className="w-32 h-32 rounded-lg"
                  />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Payment Successful!
                </h2>
                {verificationResult?.verified && (
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Verified on Pi Blockchain</span>
                  </div>
                )}
              </div>

              {/* Content access section */}
              {contentUrl && (
                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-4">
                  <h3 className="font-medium text-foreground">Your Content</h3>
                  
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
              <div className="flex justify-center mb-4">
                <img 
                  src="https://i.ibb.co/wZRgyXMF/media-81-1.gif" 
                  alt="Payment Cancelled" 
                  className="w-32 h-32 rounded-lg"
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Cancelled
              </h2>
              <p className="text-muted-foreground mb-4">
                Your payment was not completed.
              </p>
              {paymentLink.cancel_redirect_url && (
                <p className="text-sm text-muted-foreground">
                  Redirecting you back...
                </p>
              )}
              <Button onClick={() => setPaymentStatus('idle')}>Try Again</Button>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <img 
                  src="https://i.ibb.co/wZRgyXMF/media-81-1.gif" 
                  alt="Payment Failed" 
                  className="w-32 h-32 rounded-lg"
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Failed
              </h2>
              <p className="text-muted-foreground mb-4">
                Something went wrong. Please try again.
              </p>
              {paymentLink.cancel_redirect_url && (
                <p className="text-sm text-muted-foreground mb-4">
                  Redirecting you back...
                </p>
              )}
              <Button onClick={() => setPaymentStatus('idle')}>Try Again</Button>
            </div>
          ) : (
            <>
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
              {paymentLink.pricing_type === 'donation' ? (
                <div className="space-y-4 p-6 rounded-2xl bg-secondary/50">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Choose Your Donation Amount</p>
                    <p className="text-2xl font-bold text-foreground">
                      {customAmount ? `π ${Number(customAmount).toFixed(2)}` : `π ${Number(paymentLink.min_amount || 0).toFixed(2)}`}
                    </p>
                    {paymentLink.min_amount && (
                      <p className="text-xs text-muted-foreground mt-1">Minimum: π {Number(paymentLink.min_amount).toFixed(2)}</p>
                    )}
                  </div>

                  {/* Suggested Amounts */}
                  {paymentLink.suggested_amounts && paymentLink.suggested_amounts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Quick Select:</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {paymentLink.suggested_amounts.map((amt, idx) => (
                          <Button
                            key={idx}
                            type="button"
                            variant={customAmount === String(amt) ? 'default' : 'outline'}
                            onClick={() => setCustomAmount(String(amt))}
                            className="h-12"
                          >
                            π {Number(amt).toFixed(2)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="customAmount" className="text-sm font-medium">
                      {paymentLink.suggested_amounts && paymentLink.suggested_amounts.length > 0 ? 'Or Enter Custom Amount:' : 'Enter Amount:'}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">π</span>
                      <Input
                        id="customAmount"
                        type="number"
                        placeholder={`Minimum ${Number(paymentLink.min_amount || 0).toFixed(2)}`}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-8 h-12 text-lg"
                        min={paymentLink.min_amount || 0}
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {/* Platform Fee Breakdown for Donations */}
                  {(customAmount && parseFloat(customAmount) > 0) || (paymentLink.min_amount && paymentLink.min_amount > 0) ? (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-blue-600">
                          💡 Platform Fee Breakdown (2% for maintenance & future features)
                        </p>
                        <PlatformFeeModal>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            Why fees?
                          </Button>
                        </PlatformFeeModal>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Your donation:</span>
                          <span className="font-medium">π {(customAmount ? Number(customAmount) : Number(paymentLink.min_amount || 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform fee (2% for maintenance & future features):</span>
                          <span className="font-medium text-blue-600">+π {((customAmount ? Number(customAmount) : Number(paymentLink.min_amount || 0)) * 0.02).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-1.5 mt-1.5">
                          <span className="font-semibold">Total you pay:</span>
                          <span className="font-bold text-foreground">π {((customAmount ? Number(customAmount) : Number(paymentLink.min_amount || 0)) * 1.02).toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-blue-600/70 mt-1 italic">
                        Platform fee helps maintain secure donation processing, platform reliability, and fund future features.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
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
                      `${displayCurrency === 'Pi' ? 'π' : displayCurrency} ${Number(paymentLink.amount).toFixed(2)}`
                    )}
                  </p>
                  {paymentLink.payment_type === 'recurring' && paymentLink.amount > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">per month</p>
                  )}
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
                    (merchantUsername ? `@${merchantUsername}` : 'Merchant')}
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

              {/* Auth & Pay Button */}
              {!piUser ? (
                <>
                  <div className="flex justify-center mb-4">
                    <img 
                      src="https://i.ibb.co/mdzgyC2/media-90.gif" 
                      alt="Pi Auth" 
                      className="w-32 h-32 rounded-lg border-2 border-orange-200"
                    />
                  </div>
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
                      Pi Auth Sign In
                    </>
                  )}
                </Button>
                </>
              ) : paymentLink.pricing_type === 'free' || paymentLink.amount === 0 ? (
                <Button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'processing' || (paymentLink.content_file && !buyerEmail)}
                  className={`w-full h-14 text-lg ${templateStyles.button}`}
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
                  disabled={paymentStatus === 'processing' || paymentStatus === 'verifying' || (paymentLink.content_file && !buyerEmail) || (paymentLink.pricing_type === 'donation' && (!customAmount || parseFloat(customAmount) < (paymentLink.min_amount || 0)))}
                  className={`w-full h-14 text-lg ${templateStyles.button}`}
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
                    <>
                      {paymentLink.pricing_type === 'donation' ? (
                        <>
                          Donate π {((customAmount ? Number(customAmount) : Number(paymentLink.amount)) * 1.02).toFixed(2)}
                          <span className="text-xs ml-1">(inc. fee)</span>
                        </>
                      ) : (
                        `Pay ${displayCurrency === 'Pi' ? 'π' : displayCurrency} ${Number(paymentLink.amount).toFixed(2)}`
                      )}
                    </>
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

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTermsModal(true)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Terms of Service
                  </Button>
                  <span className="text-muted-foreground">•</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Privacy Policy
                  </Button>
                </div>
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
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Terms of Service Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>
              Last updated: January 10, 2026
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using DropPay's payment services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">2. Payment Processing</h3>
              <p className="text-muted-foreground">
                DropPay facilitates payments through the Pi Network blockchain. All transactions are subject to Pi Network's terms and conditions. We are not responsible for blockchain network delays or failures.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">3. Platform Fees</h3>
              <p className="text-muted-foreground">
                A 2% platform fee is applied to donations and certain payment types to maintain secure processing, platform reliability, and fund future features. Merchants on paid plans have fee structures outlined in their subscription agreement.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">4. User Obligations</h3>
              <p className="text-muted-foreground">
                Users must provide accurate information, maintain the security of their Pi Network credentials, and comply with all applicable laws. You are responsible for all activities under your account.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">5. Refunds and Disputes</h3>
              <p className="text-muted-foreground">
                Refund policies are determined by individual merchants. For disputes, contact the merchant directly. DropPay serves as a payment facilitator and does not control merchant refund policies.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">6. Content and Digital Products</h3>
              <p className="text-muted-foreground">
                Download links for digital products are valid for 24 hours. Merchants are responsible for the quality and delivery of their products. DropPay is not liable for product issues.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">7. Prohibited Activities</h3>
              <p className="text-muted-foreground">
                Users may not use DropPay for illegal activities, fraudulent transactions, money laundering, or any activities that violate Pi Network's policies. We reserve the right to suspend accounts engaged in prohibited activities.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">8. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                DropPay is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from the use of our services.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">9. Modifications to Terms</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of DropPay after changes constitutes acceptance of the modified terms.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">10. Contact Information</h3>
              <p className="text-muted-foreground">
                For questions about these terms, contact us through our support channels or visit our website.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>
              Last updated: January 10, 2026
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Information We Collect</h3>
              <p className="text-muted-foreground mb-2">
                We collect information necessary to provide our payment services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Pi Network username and wallet address (through Pi authentication)</li>
                <li>Email addresses (for sending receipts and download links)</li>
                <li>Transaction data (payment amounts, timestamps, blockchain transaction IDs)</li>
                <li>Device and browser information (for security and fraud prevention)</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">2. How We Use Your Information</h3>
              <p className="text-muted-foreground mb-2">
                Your information is used to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Process payments and verify transactions on the Pi blockchain</li>
                <li>Send transaction receipts and download links for digital products</li>
                <li>Prevent fraud and maintain platform security</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">3. Data Sharing and Disclosure</h3>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Merchants (for transaction processing and order fulfillment)</li>
                <li>Pi Network (for authentication and blockchain verification)</li>
                <li>Service providers (hosting, analytics, email delivery)</li>
                <li>Law enforcement (when required by law)</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">4. Data Security</h3>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">5. Blockchain Transparency</h3>
              <p className="text-muted-foreground">
                Transaction data recorded on the Pi blockchain is public and immutable. This includes wallet addresses and transaction amounts, but not your email or personal identity information.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">6. Cookies and Tracking</h3>
              <p className="text-muted-foreground">
                We use local storage to maintain your session and improve user experience. We do not use third-party advertising cookies.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">7. Your Rights</h3>
              <p className="text-muted-foreground mb-2">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal obligations)</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your transaction history</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">8. Data Retention</h3>
              <p className="text-muted-foreground">
                We retain transaction records for 7 years to comply with financial regulations. Other data is retained as long as necessary to provide services or as required by law.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">9. Children's Privacy</h3>
              <p className="text-muted-foreground">
                DropPay is not intended for users under 18 years of age. We do not knowingly collect data from children.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">10. Changes to Privacy Policy</h3>
              <p className="text-muted-foreground">
                We may update this privacy policy periodically. Material changes will be notified through our platform or via email.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">11. Contact Us</h3>
              <p className="text-muted-foreground">
                For privacy-related questions or to exercise your rights, contact us through our support channels.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}