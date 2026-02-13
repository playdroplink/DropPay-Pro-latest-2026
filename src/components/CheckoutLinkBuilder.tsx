import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Eye, Save, ShoppingCart, Laptop, ShoppingBag, Heart, Gamepad2, GraduationCap, Upload, ChevronDown, Infinity, Settings, Crown, Lock, Store, UtensilsCrossed, Shirt } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";

const PLATFORM_FEE_PERCENTAGE = 2;

export type CheckoutCategory = "ecommerce" | "saas" | "marketplaces" | "donations" | "gaming" | "education" | "restaurant" | "retail" | "services";

interface CheckoutTemplate {
  id: string;
  name: string;
  description: string;
  category: CheckoutCategory;
  amount: number;
  features: string[];
  gradient: string;
}

export interface CheckoutLinkFormData {
  title: string;
  description: string;
  category: CheckoutCategory;
  amount: number;
  currency: string;
  features: string[];
  useTemplate?: boolean;
  templateId?: string;
  contentFile?: File;
  expireAccess?: string; // "never", "7days", "30days", "90days", "1year"
  stock?: number | null; // null means unlimited
  showOnStorePage?: boolean;
  addWaitlist?: boolean;
  askQuestions?: boolean;
  internalName?: string;
  redirectAfterCheckout?: string;
  cancelRedirect?: string; // Redirect URL when payment is cancelled/failed
  checkoutImage?: File; // Optional image to show on checkout page
}

const CATEGORY_CONFIG = {
  ecommerce: {
    name: "E-Commerce",
    color: "from-orange-400 to-orange-600",
    icon: ShoppingCart,
    templates: [
      {
        name: "Single Product",
        description: "Sell a single product or service",
        amount: 50,
        features: ["Instant delivery", "30-day returns", "Customer support"],
      },
      {
        name: "Product Bundle",
        description: "Bundle multiple products together",
        amount: 150,
        features: ["Free shipping", "Bundle discount", "Premium support"],
      },
      {
        name: "Digital Download",
        description: "Sell digital files or software",
        amount: 29,
        features: ["Instant download", "Lifetime access", "Free updates"],
      },
    ],
  },
  saas: {
    name: "SaaS",
    color: "from-orange-400 to-orange-600",
    icon: Laptop,
    templates: [
      {
        name: "Starter Plan",
        description: "Entry-level subscription plan",
        amount: 29,
        features: ["5 team members", "Basic features", "Email support"],
      },
      {
        name: "Pro Plan",
        description: "Professional subscription plan",
        amount: 99,
        features: ["Unlimited team members", "Advanced features", "Priority support"],
      },
      {
        name: "Enterprise Plan",
        description: "Custom enterprise solution",
        amount: 999,
        features: ["Custom features", "Dedicated support", "SLA guarantee"],
      },
    ],
  },
  marketplaces: {
    name: "Marketplaces",
    color: "from-orange-400 to-orange-600",
    icon: ShoppingBag,
    templates: [
      {
        name: "Vendor Listing",
        description: "Premium vendor listing",
        amount: 250,
        features: ["Featured placement", "Unlimited products", "Analytics"],
      },
      {
        name: "Commission Reduction",
        description: "Reduce commissions for 3 months",
        amount: 500,
        features: ["50% lower commissions", "3 months access", "Seller tools"],
      },
      {
        name: "Store Setup",
        description: "Professional store setup service",
        amount: 300,
        features: ["Complete setup", "SEO optimization", "Launch support"],
      },
    ],
  },
  donations: {
    name: "Donations",
    color: "from-orange-400 to-orange-600",
    icon: Heart,
    templates: [
      {
        name: "One-time Donation",
        description: "Single donation campaign",
        amount: 100,
        features: ["Tax deductible", "Impact report", "Recognition"],
      },
      {
        name: "Monthly Membership",
        description: "Recurring monthly donation",
        amount: 25,
        features: ["Recurring billing", "Member benefits", "Community access"],
      },
      {
        name: "Major Gift",
        description: "Large donation campaign",
        amount: 5000,
        features: ["Named recognition", "Annual report", "Special access"],
      },
    ],
  },
  gaming: {
    name: "Gaming",
    color: "from-orange-400 to-orange-600",
    icon: Gamepad2,
    templates: [
      {
        name: "Battle Pass",
        description: "Seasonal battle pass",
        amount: 12,
        features: ["100 tiers", "Exclusive skins", "XP boost"],
      },
      {
        name: "Premium Currency",
        description: "In-game currency pack",
        amount: 50,
        features: ["5000 coins", "30% bonus", "Free items"],
      },
      {
        name: "Founder Edition",
        description: "Lifetime premium access",
        amount: 200,
        features: ["Lifetime premium", "Exclusive items", "Priority queue"],
      },
    ],
  },
  education: {
    name: "Education",
    color: "from-orange-400 to-orange-600",
    icon: GraduationCap,
    templates: [
      {
        name: "Online Course",
        description: "Single course purchase",
        amount: 199,
        features: ["Lifetime access", "Certificates", "Support"],
      },
      {
        name: "Bootcamp",
        description: "Intensive training program",
        amount: 499,
        features: ["Career support", "Job guarantee", "Mentorship"],
      },
      {
        name: "Annual Membership",
        description: "Year-long learning access",
        amount: 299,
        features: ["All courses", "Community", "Monthly webinars"],
      },
    ],
  },
  restaurant: {
    name: "Restaurant",
    color: "from-amber-400 to-amber-600",
    icon: UtensilsCrossed,
    templates: [
      {
        name: "Menu Item",
        description: "Single food item or dish",
        amount: 15,
        features: ["QR code menu", "Table-side ordering", "Kitchen integration"],
      },
      {
        name: "Meal Combo",
        description: "Complete meal package",
        amount: 25,
        features: ["Combo pricing", "Customization options", "Loyalty points"],
      },
      {
        name: "Catering Order",
        description: "Large group catering service",
        amount: 200,
        features: ["Advance booking", "Group discounts", "Delivery included"],
      },
    ],
  },
  retail: {
    name: "Retail Store",
    color: "from-orange-400 to-orange-600",
    icon: Shirt,
    templates: [
      {
        name: "Clothing Item",
        description: "Individual apparel piece",
        amount: 45,
        features: ["Size selection", "Color options", "In-store pickup"],
      },
      {
        name: "Seasonal Collection",
        description: "Complete outfit or collection",
        amount: 120,
        features: ["Style consultation", "Mix & match", "Alterations included"],
      },
      {
        name: "VIP Experience",
        description: "Personal shopping experience",
        amount: 300,
        features: ["Personal stylist", "Private shopping", "Exclusive access"],
      },
    ],
  },
  services: {
    name: "Local Services",
    color: "from-orange-400 to-orange-600",
    icon: Store,
    templates: [
      {
        name: "Consultation",
        description: "Professional consultation service",
        amount: 75,
        features: ["1-hour session", "Expert advice", "Follow-up email"],
      },
      {
        name: "Service Package",
        description: "Complete service offering",
        amount: 250,
        features: ["Multi-session", "Guaranteed results", "Support included"],
      },
      {
        name: "Premium Service",
        description: "High-end service experience",
        amount: 500,
        features: ["Priority scheduling", "Premium materials", "Extended warranty"],
      },
    ],
  },
};

interface CheckoutLinkBuilderProps {
  onCreateLink?: (data: CheckoutLinkFormData) => void;
  onPreview?: (data: CheckoutLinkFormData) => void;
  initialData?: Partial<CheckoutLinkFormData>;
}

export function CheckoutLinkBuilder({
  onCreateLink,
  onPreview,
  initialData,
}: CheckoutLinkBuilderProps) {
  const { subscription, plan, canCreateLink, remainingLinks, isFreePlan } = useSubscription();

  // Debug subscription state
  React.useEffect(() => {
    console.log('CheckoutLinkBuilder - Subscription state:', {
      subscription,
      plan,
      canCreateLink,
      remainingLinks,
      isFreePlan
    });
  }, [subscription, plan, canCreateLink, remainingLinks, isFreePlan]);
  
  // Define category access based on subscription plans
  const getCategoryAccess = (category: CheckoutCategory) => {
    const planName = plan?.name || 'Free';
    const planAccess = {
      'Free': ['ecommerce', 'restaurant', 'retail', 'services'],
      'Basic': ['ecommerce', 'restaurant', 'retail', 'services'],
      'Pro': ['ecommerce', 'saas', 'marketplaces', 'donations', 'gaming', 'education', 'restaurant', 'retail', 'services'],
      'Growth': ['ecommerce', 'saas', 'marketplaces', 'donations', 'gaming', 'education', 'restaurant', 'retail', 'services'],
      'Enterprise': ['ecommerce', 'saas', 'marketplaces', 'donations', 'gaming', 'education', 'restaurant', 'retail', 'services']
    };
    
    const allowedCategories = planAccess[planName as keyof typeof planAccess] || ['ecommerce', 'restaurant', 'retail', 'services'];
    return allowedCategories.includes(category);
  };
  
  const getCategoryRequiredPlan = (category: CheckoutCategory): string => {
    const requirements = {
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
    return requirements[category] || 'Growth';
  };

  const defaultData: CheckoutLinkFormData = {
    title: "",
    description: "",
    category: "ecommerce",
    amount: 50,
    currency: "Pi",
    features: [""],
    useTemplate: false,
    expireAccess: "never",
    stock: null,
    showOnStorePage: false,
    addWaitlist: false,
    askQuestions: false,
    internalName: "",
    redirectAfterCheckout: "",
    cancelRedirect: "",
    checkoutImage: undefined,
  };

  const [formData, setFormData] = useState<CheckoutLinkFormData>(() => {
    const data = {
      ...defaultData,
      ...initialData,
      category: initialData?.category ?? defaultData.category,
      currency: initialData?.currency ?? defaultData.currency,
      amount: initialData?.amount ?? defaultData.amount,
      title: initialData?.title ?? defaultData.title,
      description: initialData?.description ?? defaultData.description,
      features:
        initialData?.features && initialData.features.length > 0
          ? initialData.features
          : defaultData.features,
      useTemplate: initialData?.useTemplate ?? false,
      expireAccess: initialData?.expireAccess ?? "never",
      stock: initialData?.stock ?? null,
      showOnStorePage: initialData?.showOnStorePage ?? false,
      addWaitlist: initialData?.addWaitlist ?? false,
      askQuestions: initialData?.askQuestions ?? false,
      internalName: initialData?.internalName ?? "",
      redirectAfterCheckout: initialData?.redirectAfterCheckout ?? "",
      cancelRedirect: initialData?.cancelRedirect ?? "",
      checkoutImage: initialData?.checkoutImage,
    };
    console.log('Initial form data:', data);
    return data;
  });

  const [selectedTemplate, setSelectedTemplate] = useState<CheckoutTemplate | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Plan info
  const planName = plan?.name || 'Free';

  const categoryConfig = CATEGORY_CONFIG[formData.category];
  const templates = categoryConfig.templates.map((t, i) => ({
    id: `${formData.category}-${i}`,
    name: t.name,
    description: t.description,
    category: formData.category,
    amount: t.amount,
    features: t.features,
    gradient: categoryConfig.color,
  }));

  const handleTemplateSelect = (template: CheckoutTemplate) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      title: template.name,
      description: template.description,
      amount: template.amount,
      features: template.features,
      useTemplate: true,
    }));
    toast.success("Template applied!");
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    console.log('Form data on save:', formData);
    console.log('Title value:', formData.title, 'Length:', formData.title?.length);
    
    // Allow title to be auto-populated from category if empty
    let finalTitle = formData.title?.trim();
    if (!finalTitle) {
      // Auto-generate title from category
      finalTitle = categoryConfig.name || "Checkout Link";
    }
    
    if (!formData.description || !formData.description.trim()) {
      toast.error("Please enter a description for your checkout link");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    // Update form data with auto-generated title if needed
    const updatedFormData = {
      ...formData,
      title: finalTitle
    };

    console.log('Validation passed, calling onCreateLink');
    onCreateLink?.(updatedFormData);
  };

  const handlePreview = () => {
    // Allow title to be auto-populated from category if empty
    let finalTitle = formData.title?.trim();
    if (!finalTitle) {
      finalTitle = categoryConfig.name || "Checkout Link";
    }
    
    if (!formData.description?.trim()) {
      toast.error("Please enter a description to preview");
      return;
    }
    
    onPreview?.({
      ...formData,
      title: finalTitle
    });
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {planName === 'Free' && <Crown className="w-4 h-4 text-muted-foreground" />}
                {planName === 'Basic' && <Crown className="w-4 h-4 text-blue-500" />}
                {(planName === 'Growth' || planName === 'Pro') && <Crown className="w-4 h-4 text-purple-500" />}
                {planName === 'Enterprise' && <Crown className="w-4 h-4 text-orange-500" />}
                Current Plan: {planName}
              </CardTitle>
              <CardDescription>
                {remainingLinks !== null ? (
                  `${remainingLinks} checkout links remaining`
                ) : (
                  'Unlimited checkout links'
                )}
              </CardDescription>
            </div>
            {!canCreateLink && (
              <Badge variant="destructive">Limit Reached</Badge>
            )}
          </div>
        </CardHeader>
        {!canCreateLink && (
          <CardContent>
            <div className="text-sm text-muted-foreground">
              You've reached your plan's checkout link limit. Please upgrade to create more links.
            </div>
          </CardContent>
        )}
      </Card>

      <div className="rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4">
        <p className="font-semibold text-primary">Coming soon</p>
        <p className="text-sm text-muted-foreground">
          Some advanced checkout templates are rolling out soon. Thanks for using DropPay — more categories and features are on the way.
        </p>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>1. Select Category</CardTitle>
          <CardDescription>Choose the type of checkout you want to create</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon;
              const isAccessible = getCategoryAccess(key as CheckoutCategory);
              const requiredPlan = getCategoryRequiredPlan(key as CheckoutCategory);
              
              return (
                <div key={key} className="relative">
                  <Button
                    variant={formData.category === key ? "default" : "outline"}
                    className={`h-auto w-full flex flex-col items-center gap-2 py-4 ${
                      !isAccessible ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!isAccessible}
                    onClick={() => {
                      if (isAccessible) {
                        setFormData((prev) => ({
                          ...prev,
                          category: key as CheckoutCategory,
                        }));
                      } else {
                        toast.error(`${config.name} requires ${requiredPlan} plan or higher`);
                      }
                    }}
                  >
                    <div className="relative">
                      <IconComponent className="w-6 h-6" />
                      {!isAccessible && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />}
                    </div>
                    <span className="text-xs text-center">{config.name}</span>
                    {!isAccessible && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {requiredPlan}
                      </Badge>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>2. Choose Template (Optional)</CardTitle>
          <CardDescription>Start with a pre-built template for {categoryConfig.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? "border-primary ring-2 ring-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">π {template.amount}</div>
                  <div className="space-y-1">
                    {template.features.map((feature, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Basic Details */}
      <Card>
        <CardHeader>
          <CardTitle>3. Customize Details</CardTitle>
          <CardDescription>Personalize your checkout link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-xs text-muted-foreground">(optional - uses category if empty)</span></Label>
              <Input
                id="title"
                placeholder="e.g., Premium Product Bundle"
                value={formData.title || ""}
                onChange={(e) => {
                  console.log('Title input changed:', e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="flex-1"
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pi">π Pi</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what customers will receive..."
              value={formData.description || ""}
              onChange={(e) => {
                console.log('Description input changed:', e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>4. Add Features</CardTitle>
          <CardDescription>List what's included with this checkout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Feature ${index + 1}`}
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
              />
              {formData.features.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveFeature(index)}
                  className="w-10 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={handleAddFeature}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
        </CardContent>
      </Card>

      {/* Content File & Advanced Options */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
            <div>
              <CardTitle>Advanced Options</CardTitle>
              <CardDescription>Content file, expiry, stock, and more</CardDescription>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </div>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-6 border-t pt-6">
            {/* Content File */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Content File (Optional)
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Upload file</p>
                <p className="text-xs text-muted-foreground mt-1">Customers can download this after payment</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData((prev) => ({
                        ...prev,
                        contentFile: file,
                      }));
                      toast.success(`File "${file.name}" selected`);
                    }
                  }}
                  id="content-file"
                />
                <label htmlFor="content-file" className="cursor-pointer">
                  {formData.contentFile ? (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.contentFile.name}</p>
                  ) : null}
                </label>
              </div>
            </div>

            {/* Expire Access */}
            <div className="space-y-2">
              <Label htmlFor="expire">Expire Access</Label>
              <Select value={formData.expireAccess} onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  expireAccess: value,
                }))
              }>
                <SelectTrigger id="expire">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="7days">7 days</SelectItem>
                  <SelectItem value="30days">30 days</SelectItem>
                  <SelectItem value="90days">90 days</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea
                id="details"
                placeholder="Add more details about this offering..."
                rows={2}
              />
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label>Stock</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={formData.stock ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  className="flex-1"
                />
                <Infinity className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition cursor-pointer"
                onClick={() => setFormData((prev) => ({ ...prev, showOnStorePage: !prev.showOnStorePage }))}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Show on store page</span>
                </div>
                <input type="checkbox" checked={formData.showOnStorePage} readOnly className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition cursor-pointer"
                onClick={() => setFormData((prev) => ({ ...prev, addWaitlist: !prev.addWaitlist }))}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Add a waitlist</span>
                </div>
                <input type="checkbox" checked={formData.addWaitlist} readOnly className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition cursor-pointer"
                onClick={() => setFormData((prev) => ({ ...prev, askQuestions: !prev.askQuestions }))}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Ask questions before checkout</span>
                </div>
                <input type="checkbox" checked={formData.askQuestions} readOnly className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition cursor-pointer"
                onClick={() => setFormData((prev) => ({ ...prev, redirectAfterCheckout: !prev.redirectAfterCheckout ? "https://" : "" }))}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Redirect after checkout</span>
                </div>
                <input type="checkbox" checked={!!formData.redirectAfterCheckout} readOnly className="w-4 h-4" />
              </div>

              {formData.redirectAfterCheckout && (
                <Input
                  placeholder="https://example.com/success"
                  value={formData.redirectAfterCheckout}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      redirectAfterCheckout: e.target.value,
                    }))
                  }
                />
              )}

              {/* Cancel Redirect */}
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition cursor-pointer"
                onClick={() => setFormData((prev) => ({ ...prev, cancelRedirect: !prev.cancelRedirect ? "https://" : "" }))}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Cancel redirect (payment failed)</span>
                </div>
                <input type="checkbox" checked={!!formData.cancelRedirect} readOnly className="w-4 h-4" />
              </div>

              {formData.cancelRedirect && (
                <Input
                  placeholder="https://example.com/cancel"
                  value={formData.cancelRedirect}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cancelRedirect: e.target.value,
                    }))
                  }
                />
              )}
            </div>

            {/* Checkout Image */}
            <div className="space-y-2">
              <Label htmlFor="checkout-image">Checkout Image (Optional)</Label>
              <p className="text-sm text-muted-foreground">Add an image to display on your checkout page</p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('checkout-image-input')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {formData.checkoutImage ? formData.checkoutImage.name : 'Upload Image'}
                </Button>
                <input
                  id="checkout-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Check file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Image must be less than 5MB');
                        return;
                      }
                      setFormData((prev) => ({
                        ...prev,
                        checkoutImage: file,
                      }));
                      toast.success('Image uploaded');
                    }
                  }}
                />
                {formData.checkoutImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData((prev) => ({ ...prev, checkoutImage: undefined }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {formData.checkoutImage && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(formData.checkoutImage)}
                    alt="Checkout preview"
                    className="max-w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Internal Name */}
            <div className="space-y-2">
              <Label htmlFor="internal">Internal reference name</Label>
              <Input
                id="internal"
                placeholder="For your records only"
                value={formData.internalName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    internalName: e.target.value,
                  }))
                }
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Platform Fee Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <span>⚡ Platform Fee Included ({PLATFORM_FEE_PERCENTAGE}%)</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Your amount:</span>
                <span className="font-mono font-semibold text-blue-900">π {formData.amount.toFixed(7)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Platform fee ({PLATFORM_FEE_PERCENTAGE}%):</span>
                <span className="font-mono font-semibold text-blue-900">+π {(formData.amount * PLATFORM_FEE_PERCENTAGE / 100).toFixed(7)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-semibold text-blue-900">Customer pays:</span>
                <span className="font-mono font-bold text-blue-900">π {(formData.amount * (1 + PLATFORM_FEE_PERCENTAGE / 100)).toFixed(7)}</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 italic mt-3">You receive the full amount. Platform fee is charged to customer for maintenance and future features.</p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className={`bg-gradient-to-br ${categoryConfig.color} text-white`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white">{formData.title || "Your Checkout"}</CardTitle>
              <CardDescription className="text-white/80">
                {formData.description || "Add a description to see preview"}
              </CardDescription>
            </div>
            <Badge variant="secondary">{categoryConfig.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/10 p-4 rounded-lg">
            <p className="text-sm text-white/80 mb-1">Amount</p>
            <p className="text-3xl font-bold">
              {formData.amount} <span className="text-lg">{formData.currency}</span>
            </p>
          </div>

          {formData.features.filter((f) => f.trim()).length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Includes:</p>
              <ul className="space-y-1">
                {formData.features
                  .filter((f) => f.trim())
                  .map((feature, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span>✓</span> {feature}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          size="lg"
          variant="outline"
          onClick={handlePreview}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          size="lg"
          onClick={() => {
            console.log('Create button clicked, canCreateLink:', canCreateLink);
            if (canCreateLink) {
              handleSave();
            } else {
              toast.error('You have reached your plan limit. Please upgrade to create more links.');
            }
          }}
          disabled={!canCreateLink}
          className="flex-1 bg-gradient-to-r from-primary to-primary/80"
        >
          <Save className="w-4 h-4 mr-2" />
          {canCreateLink ? 'Create Checkout Link' : 'Upgrade to Create More Links'}
        </Button>
      </div>
    </div>
  );
}
