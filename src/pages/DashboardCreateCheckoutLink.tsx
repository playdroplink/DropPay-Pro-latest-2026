import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, QrCode, Share2, Copy, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { CheckoutLinkBuilder, CheckoutLinkFormData } from "@/components/CheckoutLinkBuilder";
import { createCheckoutLink } from "@/integrations/supabase/checkout_links";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { buildCheckoutQr } from "@/lib/qr";

// Define allowed features per plan
function validatePaymentTypeForPlan(category: string, planName: string) {
  const planFeatures = {
    'Free': ['ecommerce', 'restaurant', 'retail', 'services'], // Physical stores included in free
    'Basic': ['ecommerce', 'restaurant', 'retail', 'services'], // Physical stores included
    'Pro': ['ecommerce', 'saas', 'marketplaces', 'donations', 'gaming', 'education', 'restaurant', 'retail', 'services'], // Legacy alias of Growth
    'Growth': ['ecommerce', 'saas', 'marketplaces', 'donations', 'gaming', 'education', 'restaurant', 'retail', 'services'], // All categories for Growth
    'Enterprise': ['ecommerce', 'saas', 'marketplaces', 'donations', 'gaming', 'education', 'restaurant', 'retail', 'services'] // All categories
  };

  const allowedCategories = planFeatures[planName as keyof typeof planFeatures] || ['ecommerce', 'restaurant', 'retail', 'services'];
  const allowed = allowedCategories.includes(category);
  
  if (!allowed) {
    const upgradeNeeded = getRequiredPlanForCategory(category);
    return {
      allowed: false,
      message: `${category} checkout links require ${upgradeNeeded} plan or higher. Please upgrade your subscription.`
    };
  }
  
  return { allowed: true, message: '' };
}

function getRequiredPlanForCategory(category: string): string {
  const categoryRequirements = {
    'ecommerce': 'Free',
    'restaurant': 'Free',
    'retail': 'Free',
    'services': 'Free',
      'saas': 'Growth',
      'marketplaces': 'Growth',
      'donations': 'Growth',
      'gaming': 'Growth',
    'education': 'Growth'
  };
  
  return categoryRequirements[category as keyof typeof categoryRequirements] || 'Growth';
}

export function DashboardCreateCheckoutLink() {
  const navigate = useNavigate();
  const { merchant, isAuthenticated, piUser } = useAuth();
  const { subscription, plan, linkCount, canCreateLink, remainingLinks, isFreePlan } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<CheckoutLinkFormData | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);

  // Debug authentication state
  React.useEffect(() => {
    console.log('DashboardCreateCheckoutLink - Auth state:', {
      merchant,
      isAuthenticated,
      piUser,
      merchantId: merchant?.id
    });
  }, [merchant, isAuthenticated, piUser]);

  const handleCreateLink = async (data: CheckoutLinkFormData) => {
    console.log('🚀 Creating checkout link...');
    console.log('📋 Merchant:', merchant);
    console.log('👤 Pi User:', piUser);
    console.log('📝 Form data:', data);
    
    // Use merchant ID or fallback to piUser UID
    const merchantId = merchant?.id || piUser?.uid;
    
    if (!merchantId) {
      console.error('❌ No merchant ID or piUser UID found');
      toast.error("Please sign in with Pi Network to create checkout links");
      navigate("/auth");
      return;
    }

    console.log('✅ Using merchant ID:', merchantId);

    // Check subscription limits
    if (!canCreateLink) {
      console.warn('⚠️ Link creation limit reached');
      toast.error(`You've reached your plan limit of ${plan?.link_limit || 0} checkout links. Please upgrade your plan.`);
      navigate('/pricing');
      return;
    }

    // Validate payment type permissions based on plan
    const planName = plan?.name || 'Growth';
    console.log('📊 Current plan:', planName);
    const isValidPaymentType = validatePaymentTypeForPlan(data.category, planName);
    if (!isValidPaymentType.allowed) {
      console.error('❌ Category not allowed:', data.category);
      toast.error(isValidPaymentType.message);
      return;
    }

    console.log('✅ Category validated:', data.category);
    setIsLoading(true);

    try {
      console.log('💾 Creating checkout link in database...');
      
      // Upload checkout image to Supabase Storage if provided
      let checkoutImageUrl: string | undefined;
      if (data.checkoutImage) {
        try {
          const fileExt = data.checkoutImage.name.split('.').pop();
          const fileName = `${merchantId}/${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('checkout-images')
            .upload(fileName, data.checkoutImage, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            toast.error('Failed to upload image');
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('checkout-images')
              .getPublicUrl(fileName);
            checkoutImageUrl = publicUrl;
            console.log('✅ Image uploaded:', checkoutImageUrl);
          }
        } catch (imgError) {
          console.error('Image upload exception:', imgError);
          // Continue without image
        }
      }
      
      const created = await createCheckoutLink(merchantId, {
        title: data.title,
        description: data.description,
        category: data.category,
        amount: data.amount,
        currency: data.currency,
        features: data.features,
        qr_code_data: undefined,
        expire_access: data.expireAccess,
        stock: data.stock,
        show_on_store_page: data.showOnStorePage,
        add_waitlist: data.addWaitlist,
        ask_questions: data.askQuestions,
        internal_name: data.internalName,
        redirect_after_checkout: data.redirectAfterCheckout,
        cancel_redirect_url: data.cancelRedirect,
        checkout_image: checkoutImageUrl,
      });

      const link = `${window.location.origin}/pay/${created.slug}`;
      setGeneratedLink(link);

      // Generate QR code preview with logo centered
      const qr = await buildCheckoutQr(link);
      setQrData(qr);

      toast.success("Checkout link created successfully!");
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error("Failed to create checkout link");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (data: CheckoutLinkFormData) => {
    setPreview(data);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownloadQR = () => {
    if (qrData) {
      const link = document.createElement("a");
      link.href = qrData;
      link.download = `checkout-qr-${Date.now()}.png`;
      link.click();
      toast.success("QR code downloaded!");
    }
  };

  const handleShare = async () => {
    if (!generatedLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Checkout Link",
          text: "Check out this exclusive offer!",
          url: generatedLink,
        });
        toast.success("Link shared!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (generatedLink && qrData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setGeneratedLink(null);
              setQrData(null);
              setPreview(null);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Create Another
          </Button>
          <h1 className="text-3xl font-bold">Checkout Link Created! 🎉</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Link Details */}
          <Card>
            <CardHeader>
              <CardTitle>Your Checkout Link</CardTitle>
              <CardDescription>Share this link with your customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm">
                {generatedLink}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleCopyLink} className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {preview && (
                <div className={`bg-gradient-to-br from-${preview.category} p-4 rounded-lg text-white mt-4`}>
                  <h3 className="font-semibold mb-2">{preview.title}</h3>
                  <p className="text-sm opacity-90 mb-3">{preview.description}</p>
                  <div className="text-2xl font-bold">
                    {preview.amount} {preview.currency}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Share via QR code</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg border-2">
                <img
                  src={qrData}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>

              <Button onClick={handleDownloadQR} className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Customers can scan this code to access your checkout link
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">1</span>
                <span>Share the link above with your customers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">2</span>
                <span>Or print the QR code to display it</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">3</span>
                <span>Track conversions and views in your dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">4</span>
                <span>Manage all your checkout links from your dashboard</span>
              </li>
            </ul>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => navigate("/dashboard/checkout-links")} className="flex-1">
                View All Links
              </Button>
              <Button
                onClick={() => {
                  setGeneratedLink(null);
                  setQrData(null);
                  setPreview(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Create Another Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while authentication is being determined
  if (!isAuthenticated && !piUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Please Sign In</h1>
            <p className="text-muted-foreground mb-4">You need to authenticate with Pi Network to create checkout links</p>
            <Button onClick={() => navigate("/auth")}>Sign In with Pi Network</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Create Checkout Link</h1>
            <p className="text-muted-foreground">
              Build shareable, customizable checkout links for your products and services
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <CheckoutLinkBuilder
          onCreateLink={handleCreateLink}
          onPreview={handlePreview}
        />
      </div>
    </DashboardLayout>
  );
}
