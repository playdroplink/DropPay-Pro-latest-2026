import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Copy, ExternalLink, Trash2, QrCode, RefreshCw, ShoppingCart, CreditCard, Upload, Link as LinkIcon, Download, ChevronDown, Infinity, Gift, Store, HelpCircle, Clock, Users, Minus, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeDialog } from '@/components/dashboard/QRCodeDialog';
import { Numpad } from '@/components/ui/numpad';
import { TrackingLinks } from '@/components/dashboard/TrackingLinks';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';

interface PaymentLink {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  slug: string;
  is_active: boolean;
  created_at: string;
  payment_type: string;
  views: number;
  conversions: number;
  redirect_url: string | null;
  content_file: string | null;
  access_type: string | null;
  pricing_type?: string;
  expire_access?: string;
  stock?: number | null;
  is_unlimited_stock?: boolean;
  show_on_store?: boolean;
  free_trial?: boolean;
  enable_waitlist?: boolean;
  ask_questions?: boolean;
  checkout_questions?: unknown;
  internal_name?: string | null;
}

const paymentTypeIcons = {
  one_time: CreditCard,
  recurring: RefreshCw,
  checkout: ShoppingCart,
};

const paymentTypeLabels = {
  one_time: 'One-Time',
  recurring: 'Recurring',
  checkout: 'Checkout',
};

const pricingTypeLabels = {
  free: 'Free',
  one_time: 'One-Time',
  recurring: 'Recurring',
  donation: 'Donation',
};

export default function PaymentLinks() {
  const { isAuthenticated, isLoading, merchant, piUser } = useAuth();
  const { canCreateLink, remainingLinks, plan, linkCount, isFreePlan } = useSubscription();
  const navigate = useNavigate();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [qrDialogLink, setQrDialogLink] = useState<PaymentLink | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    payment_type: 'one_time' as 'one_time' | 'recurring' | 'checkout',
    pricing_type: 'free' as 'free' | 'one_time' | 'recurring' | 'donation',
    redirect_url: '',
    cancel_redirect_url: '',
    content_file: '',
    checkout_image: null as File | null,
    access_type: 'instant' as 'instant' | 'redirect' | 'download',
    expire_access: 'never',
    stock: '',
    is_unlimited_stock: true,
    show_on_store: false,
    free_trial: false,
    enable_waitlist: false,
    ask_questions: false,
    checkout_questions: [] as { question: string }[],
    internal_name: '',
    min_amount: '',
    suggested_amounts: [] as string[],
  });

  useEffect(() => {
    if (!isAuthenticated || !piUser) return;

    (async () => {
      const merchantId = merchant?.id || piUser.uid;
      if (merchantId) {
        fetchLinks(merchantId);
      }
    })();
  }, [merchant?.id, piUser?.uid, isAuthenticated]);

  // Force free plan users to use 'free' pricing type
  useEffect(() => {
    if (isFreePlan && formData.pricing_type !== 'free') {
      setFormData(prev => ({ ...prev, pricing_type: 'free' }));
    }
  }, [isFreePlan, formData.pricing_type]);

  const fetchLinks = async (merchantId: string) => {
    try {
      console.log('🔄 Fetching payment links for merchant:', merchantId);
      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Successfully fetched', data?.length || 0, 'payment links');
      setLinks(data || []);
      
      // Log each link
      if (data && data.length > 0) {
        console.log('📋 Payment Links:');
        data.forEach(link => {
          console.log(`   • "${link.title}" (${link.pricing_type}) - ${link.slug}`);
        });
      }
    } catch (error) {
      console.error('❌ Error fetching payment links:', error);
      toast.error('Failed to load payment links');
    }
  };

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleCreateLink = async () => {
    // Auto-generate title from category if not provided
    let finalTitle = formData.title?.trim();
    if (!finalTitle) {
      // Generate title from pricing type or use default
      const typeMap = {
        'free': 'Free Link',
        'one-time': 'Payment Link',
        'subscription': 'Subscription Link',
        'donation': 'Donation Link'
      };
      finalTitle = typeMap[formData.pricing_type as keyof typeof typeMap] || 'Payment Link';
    }

    if (!isAuthenticated || !piUser) {
      toast.error('Please sign in to create payment links');
      return;
    }

    // Prevent free plan users from creating non-free payment links
    if (isFreePlan && formData.pricing_type !== 'free') {
      toast.error('Free plan users can only create free payment links. Please upgrade to unlock more features!');
      return;
    }

    // For non-free and non-donation types, require amount
    if (formData.pricing_type !== 'free' && formData.pricing_type !== 'donation') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        toast.error('Please enter an amount');
        return;
      }
    }

    // Check subscription limits (only if user has a plan)
    if (plan && !canCreateLink) {
      toast.error(`You've reached your plan limit of ${plan.link_limit} link${plan.link_limit !== 1 ? 's' : ''}. Upgrade to create more!`);
      return;
    }

    const merchantId = merchant?.id || piUser.uid;
    if (!merchantId) return;

    setIsCreating(true);
    try {
      // Upload checkout image to Supabase Storage if provided
      let checkoutImageUrl: string | null = null;
      if (formData.checkout_image) {
        try {
          const fileExt = formData.checkout_image.name.split('.').pop();
          const fileName = `${merchantId}/${Date.now()}.${fileExt}`;
          
          console.log('🔼 Attempting to upload checkout image to bucket: checkout-images');
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('checkout-images')
            .upload(fileName, formData.checkout_image, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('❌ Image upload error:', uploadError);
            if (uploadError.message?.includes('row-level security policy')) {
              toast.error('Upload failed: Storage security not configured. Please run FIX_STORAGE_SECURITY.sql');
            } else {
              toast.error(`Failed to upload image: ${uploadError.message}`);
            }
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('checkout-images')
              .getPublicUrl(fileName);
              
            if (publicUrl) {
              const storageUrl = 'https://xoofailhzhfyebzpzrfs.storage.supabase.co/storage/v1/s3';
              checkoutImageUrl = publicUrl.includes('storage.supabase.co') 
                ? publicUrl 
                : `${storageUrl}/checkout-images/${fileName}`;
              console.log('✅ Checkout image uploaded and accessible:', checkoutImageUrl);
            }
          }
        } catch (imgError) {
          console.error('❌ Image upload exception:', imgError);
          if (imgError.message?.includes('row-level security policy')) {
            toast.error('Upload failed: Storage security not configured. Please check your RLS policies.');
          } else {
            toast.error('Image upload failed');
          }
          // Continue without image
        }
      }
      
      // Calculate amount with platform fee (2% for maintenance & future features) added for paid products (excluding free)
      let finalAmount = 0;
      if (formData.pricing_type === 'free') {
        finalAmount = 0.01; // Pi Network minimum payment amount, no platform fee for free products
      } else if (formData.pricing_type === 'donation') {
        // For donations, we store the base amount (what the recipient gets)
        // Platform fee (2% for maintenance & future features) will be added during payment processing
        finalAmount = parseFloat(formData.min_amount || '0');
      } else {
        const baseAmount = parseFloat(formData.amount);
        // Add 2% platform fee (for maintenance & future features) to the customer-facing price (for paid tiers only)
        finalAmount = baseAmount * 1.02;
      }

      const insertData = {
        merchant_id: merchantId,
        title: finalTitle,
        description: formData.description || null,
        amount: finalAmount,
        slug: generateSlug(),
        is_active: true,  // Ensure links are active by default
        payment_type: formData.pricing_type === 'recurring' ? 'recurring' : formData.payment_type,
        pricing_type: formData.pricing_type,
        min_amount: formData.pricing_type === 'donation' && formData.min_amount ? parseFloat(formData.min_amount) : null,
        suggested_amounts: formData.pricing_type === 'donation' ? formData.suggested_amounts.filter(a => a && parseFloat(a) > 0).map(a => parseFloat(a)) : null,
        redirect_url: formData.redirect_url && formData.redirect_url !== '' ? formData.redirect_url : null,
        cancel_redirect_url: formData.cancel_redirect_url && formData.cancel_redirect_url !== '' ? formData.cancel_redirect_url : null,
        checkout_image: checkoutImageUrl,
        content_file: formData.content_file || null,
        access_type: formData.access_type,
        expire_access: formData.expire_access,
        stock: formData.is_unlimited_stock ? null : parseInt(formData.stock) || null,
        is_unlimited_stock: formData.is_unlimited_stock,
        show_on_store: formData.show_on_store,
        free_trial: formData.free_trial,
        enable_waitlist: formData.enable_waitlist,
        ask_questions: formData.ask_questions,
        checkout_questions: formData.checkout_questions,
        internal_name: formData.internal_name || null,
      };
      
      console.log('🚀 Creating payment link with data:', {
        title: insertData.title,
        pricing_type: insertData.pricing_type,
        amount: insertData.amount,
        merchant_id: insertData.merchant_id,
        slug: insertData.slug
      });
      
      const { data, error } = await supabase
        .from('payment_links')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Payment link successfully saved to Supabase:', {
        id: data.id,
        slug: data.slug,
        title: data.title,
        url: `${window.location.origin}/pay/${data.slug}`
      });

      setLinks([data, ...links]);
      resetForm();
      setIsDialogOpen(false);
      toast.success('✅ Payment link created successfully!');
    } catch (error: any) {
      console.error('❌ Error creating payment link:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      const errorMessage = error?.message || 'Failed to create payment link';
      toast.error('❌ ' + errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      amount: '', 
      payment_type: 'one_time',
      pricing_type: isFreePlan ? 'free' : 'free', // Default to 'free' for all users
      redirect_url: '',
      cancel_redirect_url: '',
      checkout_image: null,
      content_file: '',
      access_type: 'instant',
      expire_access: 'never',
      stock: '',
      is_unlimited_stock: true,
      show_on_store: false,
      free_trial: false,
      enable_waitlist: false,
      ask_questions: false,
      checkout_questions: [],
      internal_name: '',
      min_amount: '',
      suggested_amounts: [],
    });
    setAdvancedOpen(false);
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLinks(links.filter((l) => l.id !== id));
      toast.success('Payment link deleted');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete payment link');
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const merchantId = merchant?.id || piUser?.uid;
    if (!merchantId) {
      toast.error('No merchant ID found');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${merchantId}/${Date.now()}.${fileExt}`;

      console.log('🔼 Uploading content file to payment-content bucket:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-content')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded successfully:', fileName);

      // Verify file exists and get metadata
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from('payment-content')
        .list(merchantId);
        
      if (!infoError && fileInfo) {
        const uploadedFile = fileInfo.find(f => f.name === fileName.split('/').pop());
        if (uploadedFile) {
          console.log('✅ File verified in storage:', uploadedFile);
        }
      }

      // Set form data with file path for secure delivery
      setFormData({ ...formData, content_file: fileName, access_type: 'download' });
      toast.success(`File "${file.name}" uploaded successfully! It will be available for download after payment.`);
      
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      checkout_questions: [...formData.checkout_questions, { question: '' }],
    });
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...formData.checkout_questions];
    updated[index] = { question: value };
    setFormData({ ...formData, checkout_questions: updated });
  };

  const removeQuestion = (index: number) => {
    const updated = formData.checkout_questions.filter((_, i) => i !== index);
    setFormData({ ...formData, checkout_questions: updated });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Authentication Required</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please sign in with Pi Network to access payment links
                  </p>
                </div>
                <RouterLink to="/auth">
                  <Button className="w-full">
                    Sign In with Pi Network
                  </Button>
                </RouterLink>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Upgrade Banner */}
        {!canCreateLink && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    You've reached your plan limit
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You have {linkCount} of {plan?.link_limit} payment links. Upgrade to create more links and unlock advanced features.
                  </p>
                  <RouterLink to="/dashboard/subscription">
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      Upgrade Plan
                    </Button>
                  </RouterLink>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Links</h1>
            <p className="text-muted-foreground mt-1">
              Manage payment links and tracking links
            </p>
          </div>
        </div>

        {/* Tabs for Checkout Links and Tracking Links */}
        <Tabs defaultValue="checkout" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="checkout">Checkout Links</TabsTrigger>
            <TabsTrigger value="tracking">Tracking Links</TabsTrigger>
          </TabsList>

          <TabsContent value="checkout" className="space-y-6">
            {/* Create Button */}
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button disabled={!canCreateLink}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Link
                    {remainingLinks !== null && ` (${remainingLinks} left)`}
                  </Button>
                </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Payment Link</DialogTitle>
                <DialogDescription>
                  Create a new payment link to share with your customers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">

                {/* Pricing Type Toggle */}
                <div className="space-y-2">
                  <Label>Pricing type</Label>
                  {(isFreePlan || (plan && plan.name !== 'Enterprise')) && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-3">
                      <p className="text-xs text-amber-700 font-medium">
                        🚀 Upgrade to Unlock More Payment Types
                      </p>
                      <div className="text-xs text-amber-600 mt-1 space-y-1">
                        {isFreePlan && (
                          <>
                            <p>• <strong>Free:</strong> Free payment links only</p>
                            <p>• <strong>Basic:</strong> Free + One-time payments</p>
                            <p>• <strong>Pro:</strong> Free + One-time + Recurring</p>
                            <p>• <strong>Enterprise:</strong> All types including Donations</p>
                          </>
                        )}
                        {plan?.name === 'Basic' && (
                          <>
                            <p>✅ Available: Free + One-time payments</p>
                            <p>🔒 Upgrade to Pro: Recurring payments</p>
                            <p>🔒 Upgrade to Enterprise: Donation payments</p>
                          </>
                        )}
                        {plan?.name === 'Pro' && (
                          <>
                            <p>✅ Available: Free + One-time + Recurring</p>
                            <p>🔒 Upgrade to Enterprise: Donation payments</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {(['free', 'one_time', 'recurring', 'donation'] as const).map((type) => {
                      // Determine if payment type is available based on plan
                      let isAvailable = true;
                      let requiresPlan = '';
                      
                      if (isFreePlan) {
                        // Free plan: only 'free' type
                        isAvailable = type === 'free';
                        if (type === 'one_time') requiresPlan = 'Basic';
                        if (type === 'recurring') requiresPlan = 'Pro';  
                        if (type === 'donation') requiresPlan = 'Enterprise';
                      } else if (plan?.name === 'Basic') {
                        // Basic plan: free + one_time
                        isAvailable = type === 'free' || type === 'one_time';
                        if (type === 'recurring') requiresPlan = 'Pro';
                        if (type === 'donation') requiresPlan = 'Enterprise';
                      } else if (plan?.name === 'Pro') {
                        // Pro plan: free + one_time + recurring
                        isAvailable = type === 'free' || type === 'one_time' || type === 'recurring';
                        if (type === 'donation') requiresPlan = 'Enterprise';
                      }
                      // Enterprise plan: all types available
                      
                      const isDisabled = !isAvailable;
                      
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => !isDisabled && setFormData({ ...formData, pricing_type: type })}
                          disabled={isDisabled}
                          title={isDisabled ? `Requires ${requiresPlan} plan or higher` : ''}
                          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg border ${
                            formData.pricing_type === type && !isDisabled
                              ? 'bg-primary text-primary-foreground border-primary'
                              : isDisabled
                              ? 'bg-muted text-muted-foreground border-muted opacity-50 cursor-not-allowed'
                              : 'bg-background text-muted-foreground hover:bg-secondary border-border'
                          }`}
                        >
                          {type === 'donation' && <Gift className="w-4 h-4" />}
                          {pricingTypeLabels[type]}
                          {isDisabled && <span className="text-xs ml-1">🔒</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-xs text-muted-foreground">(optional - auto-generated if empty)</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g., Product Name or Service"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Amount - only for paid products */}
                {formData.pricing_type !== 'free' && formData.pricing_type !== 'donation' && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Your Amount (π) *</Label>
                    <div 
                      className="relative cursor-pointer" 
                      onClick={() => setShowNumpad(!showNumpad)}
                    >
                      <div className="flex items-center justify-center py-8 bg-secondary/30 rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-foreground">
                            π {formData.amount || '0'}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tap to enter amount
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {showNumpad && (
                      <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                        <Numpad
                          value={formData.amount}
                          onChange={(value) => setFormData({ ...formData, amount: value })}
                          maxLength={12}
                        />
                        <Button 
                          variant="ghost" 
                          className="w-full mt-2" 
                          onClick={() => setShowNumpad(false)}
                        >
                          Done
                        </Button>
                      </div>
                    )}

                    {/* Platform Fee Breakdown */}
                    {formData.amount && parseFloat(formData.amount) > 0 && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-600">Platform Fee Breakdown</span>
                          <PlatformFeeModal>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700">
                              <HelpCircle className="h-3 w-3 mr-1" />
                              Compare Fees
                            </Button>
                          </PlatformFeeModal>
                        </div>
                        {isFreePlan ? (
                          <>
                            <p className="text-xs font-medium text-green-600">🎉 No Platform Fee (Free Plan)</p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Your amount:</span>
                                <span className="font-medium">π {parseFloat(formData.amount).toFixed(7)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Platform fee:</span>
                                <span className="font-medium text-green-600">π 0.00 (Free!)</span>
                              </div>
                              <div className="flex justify-between border-t border-border pt-1.5 mt-1.5">
                                <span className="font-semibold">Customer pays:</span>
                                <span className="font-bold text-foreground">π {parseFloat(formData.amount).toFixed(7)}</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-green-600/70 mt-1 italic">
                              Free plan users enjoy 0% platform fees! Upgrade for more payment types.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-medium text-blue-600">💡 Platform Fee Included (2% for maintenance & future features)</p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Your amount:</span>
                                <span className="font-medium">π {parseFloat(formData.amount).toFixed(7)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Platform fee (2% for maintenance & future features):</span>
                                <span className="font-medium text-blue-600">+π {(parseFloat(formData.amount) * 0.02).toFixed(7)}</span>
                              </div>
                              <div className="flex justify-between border-t border-border pt-1.5 mt-1.5">
                                <span className="font-semibold">Customer pays:</span>
                                <span className="font-bold text-foreground">π {(parseFloat(formData.amount) * 1.02).toFixed(7)}</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              You receive the full amount. Platform fee is charged to customer.
                            </p>
                            <p className="text-[10px] text-blue-600/70 mt-1 italic">
                              Platform fees support maintenance, security, and enable future features for the best experience.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Donation Amount Settings */}
                {formData.pricing_type === 'donation' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_amount">Minimum Amount (π)</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        step="0.0000001"
                        min="0"
                        placeholder="0.00 (optional)"
                        value={formData.min_amount}
                        onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Leave empty for any amount</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Suggested Amounts (π)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((index) => (
                          <Input
                            key={index}
                            type="number"
                            step="0.0000001"
                            min="0"
                            placeholder={`π ${index === 0 ? '5' : index === 1 ? '10' : '25'}`}
                            value={formData.suggested_amounts[index] || ''}
                            onChange={(e) => {
                              const newAmounts = [...formData.suggested_amounts];
                              newAmounts[index] = e.target.value;
                              setFormData({ ...formData, suggested_amounts: newAmounts });
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Quick select buttons for donors</p>
                    </div>

                    {/* Platform Fee Notice for Donations */}
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-blue-600">💡 Platform Fee for Donations (2% for maintenance & future features)</p>
                        <PlatformFeeModal>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            Compare Fees
                          </Button>
                        </PlatformFeeModal>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        A 2% platform fee will be added to cover transaction costs, platform maintenance, and future features.
                        This ensures reliable service for your donation campaigns.
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Example: If donor gives π 10:</span>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span>• You receive:</span>
                          <span className="font-medium">π 10.00</span>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span>• Platform fee (2% for maintenance & future features):</span>
                          <span className="font-medium text-blue-600">π 0.20</span>
                        </div>
                        <div className="flex justify-between pl-2 border-t border-border pt-1">
                          <span>• Donor pays total:</span>
                          <span className="font-bold text-foreground">π 10.20</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-blue-600/70 mt-1 italic">
                        Platform fees help us maintain secure payment processing, support your cause, and develop future features.
                      </p>
                    </div>
                  </div>
                )}

                {/* Content File Upload */}
                <div className="space-y-2">
                  <Label>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Content File (optional)
                    </div>
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : formData.content_file ? (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          File uploaded ✓
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload file
                        </>
                      )}
                    </Button>
                    {formData.content_file && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData({ ...formData, content_file: '', access_type: 'instant' })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.content_file ? (
                      <>✅ File ready to deliver after payment</>
                    ) : (
                      <>Upload PDFs, eBooks, documents, or any file customers get after payment</>
                    )}
                  </p>
                  {formData.content_file && (
                    <p className="text-xs bg-green-500/10 border border-green-500/20 rounded p-2 text-green-700">
                      📦 File: {formData.content_file.split('/').pop()}
                    </p>
                  )}
                </div>

                {/* Advanced Options */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium">
                      Advanced options
                      <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    {/* Expire Access */}
                    <div className="space-y-2">
                      <Label>Expire access</Label>
                      <Select
                        value={formData.expire_access}
                        onValueChange={(value) => setFormData({ ...formData, expire_access: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="1_day">1 Day</SelectItem>
                          <SelectItem value="7_days">7 Days</SelectItem>
                          <SelectItem value="30_days">30 Days</SelectItem>
                          <SelectItem value="90_days">90 Days</SelectItem>
                          <SelectItem value="1_year">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Hourly market updates with live trading sessions..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Unlimited"
                            value={formData.is_unlimited_stock ? '' : formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value, is_unlimited_stock: false })}
                            disabled={formData.is_unlimited_stock}
                            className="flex-1"
                          />
                          <div className="flex border rounded-md">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => {
                                const current = parseInt(formData.stock) || 0;
                                if (current > 0) {
                                  setFormData({ ...formData, stock: (current - 1).toString(), is_unlimited_stock: false });
                                }
                              }}
                              disabled={formData.is_unlimited_stock}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => {
                                const current = parseInt(formData.stock) || 0;
                                setFormData({ ...formData, stock: (current + 1).toString(), is_unlimited_stock: false });
                              }}
                              disabled={formData.is_unlimited_stock}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant={formData.is_unlimited_stock ? 'default' : 'outline'}
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => setFormData({ ...formData, is_unlimited_stock: !formData.is_unlimited_stock, stock: '' })}
                        >
                          <Infinity className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="show_on_store" className="cursor-pointer">Show on store page</Label>
                        </div>
                        <Switch
                          id="show_on_store"
                          checked={formData.show_on_store}
                          onCheckedChange={(checked) => setFormData({ ...formData, show_on_store: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="enable_waitlist" className="cursor-pointer">Add a waitlist</Label>
                        </div>
                        <Switch
                          id="enable_waitlist"
                          checked={formData.enable_waitlist}
                          onCheckedChange={(checked) => setFormData({ ...formData, enable_waitlist: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="ask_questions" className="cursor-pointer">Ask questions before checkout</Label>
                        </div>
                        <Switch
                          id="ask_questions"
                          checked={formData.ask_questions}
                          onCheckedChange={(checked) => setFormData({ ...formData, ask_questions: checked })}
                        />
                      </div>

                      {/* Questions List */}
                      {formData.ask_questions && (
                        <div className="space-y-2 pl-6">
                          {formData.checkout_questions.map((q, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                placeholder={`Question ${index + 1}`}
                                value={q.question}
                                onChange={(e) => updateQuestion(index, e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeQuestion(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addQuestion}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add question
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="internal_name" className="cursor-pointer">Add internal name</Label>
                        </div>
                        <Switch
                          id="internal_name_toggle"
                          checked={!!formData.internal_name}
                          onCheckedChange={(checked) => setFormData({ ...formData, internal_name: checked ? '' : '' })}
                        />
                      </div>

                      {formData.internal_name !== undefined && formData.internal_name !== null && (
                        <Input
                          placeholder="Internal reference name"
                          value={formData.internal_name}
                          onChange={(e) => setFormData({ ...formData, internal_name: e.target.value })}
                          className="ml-6"
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="redirect_toggle" className="cursor-pointer">Redirect after checkout</Label>
                        </div>
                        <Switch
                          id="redirect_toggle"
                          checked={formData.redirect_url !== '' && formData.redirect_url !== null}
                          onCheckedChange={(checked) => setFormData({ ...formData, redirect_url: checked ? 'https://' : '', access_type: checked ? 'redirect' : 'instant' })}
                        />
                      </div>

                      {formData.redirect_url !== '' && formData.redirect_url !== null && (
                        <Input
                          type="url"
                          placeholder="https://your-site.com/thank-you"
                          value={formData.redirect_url}
                          onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                          className="ml-6"
                        />
                      )}

                      {/* Cancel Redirect */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="cancel_redirect_toggle" className="cursor-pointer">Cancel redirect (payment failed)</Label>
                        </div>
                        <Switch
                          id="cancel_redirect_toggle"
                          checked={formData.cancel_redirect_url !== '' && formData.cancel_redirect_url !== null}
                          onCheckedChange={(checked) => setFormData({ ...formData, cancel_redirect_url: checked ? 'https://' : '' })}
                        />
                      </div>

                      {formData.cancel_redirect_url !== '' && formData.cancel_redirect_url !== null && (
                        <Input
                          type="url"
                          placeholder="https://your-site.com/cancel"
                          value={formData.cancel_redirect_url}
                          onChange={(e) => setFormData({ ...formData, cancel_redirect_url: e.target.value })}
                          className="ml-6"
                        />
                      )}

                      {/* Checkout Image Upload */}
                      <div className="space-y-2">
                        <Label>Checkout Image (Optional)</Label>
                        <p className="text-sm text-muted-foreground">Add an image to display on your checkout page</p>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('payment-image-input')?.click()}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {formData.checkout_image ? formData.checkout_image.name : 'Upload Image'}
                          </Button>
                          <input
                            id="payment-image-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error('Image must be less than 5MB');
                                  return;
                                }
                                setFormData({ ...formData, checkout_image: file });
                                toast.success('Image uploaded');
                              }
                            }}
                          />
                          {formData.checkout_image && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setFormData({ ...formData, checkout_image: null })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {formData.checkout_image && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(formData.checkout_image)}
                              alt="Checkout preview"
                              className="max-w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLink} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Link'}
                </Button>
              </DialogFooter>
            </DialogContent>
              </Dialog>
            </div>

            {/* Links Grid */}
            {links.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No payment links yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first payment link to start accepting Pi payments
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map((link) => {
                  const TypeIcon = paymentTypeIcons[link.payment_type as keyof typeof paymentTypeIcons] || CreditCard;
                  const isFree = link.pricing_type === 'free' || link.amount === 0;
                  return (
                    <Card key={link.id} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <TypeIcon className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-primary">
                                {link.pricing_type === 'free' ? 'Free (π 0.01)' : (isFree ? 'Free' : paymentTypeLabels[link.payment_type as keyof typeof paymentTypeLabels])}
                              </span>
                              {link.show_on_store && (
                                <span className="text-xs bg-secondary px-2 py-0.5 rounded">Store</span>
                              )}
                              {link.enable_waitlist && (
                                <span className="text-xs bg-secondary px-2 py-0.5 rounded">Waitlist</span>
                              )}
                            </div>
                            <CardTitle className="text-lg">{link.title}</CardTitle>
                            {link.internal_name && (
                              <p className="text-xs text-muted-foreground italic">{link.internal_name}</p>
                            )}
                            <CardDescription className="mt-1">
                              {link.description || 'No description'}
                            </CardDescription>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              link.is_active
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {link.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <span className="text-2xl font-bold text-foreground">
                            {link.pricing_type === 'free' ? 'π 0.01' : (isFree ? 'Free' : `π ${Number(link.amount).toFixed(2)}`)}
                          </span>
                          {link.stock !== null && link.stock !== undefined && !link.is_unlimited_stock && (
                            <span className="text-sm text-muted-foreground">{link.stock} left</span>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{link.views} views</span>
                          <span>•</span>
                          <span>{link.conversions} conversions</span>
                          <span>•</span>
                          <span>{link.views > 0 ? ((link.conversions / link.views) * 100).toFixed(1) : 0}%</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => copyToClipboard(link.slug)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(`/pay/${link.slug}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQrDialogLink(link)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tracking">
            <TrackingLinks />
          </TabsContent>
        </Tabs>

        {/* QR Code Dialog */}
        {qrDialogLink && (
          <QRCodeDialog
            isOpen={!!qrDialogLink}
            onClose={() => setQrDialogLink(null)}
            slug={qrDialogLink.slug}
            title={qrDialogLink.title}
          />
        )}
      </div>
    </DashboardLayout>
  );
}