'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  Copy,
  Eye,
  Share2,
  Loader2,
  Check,
  Plus,
  Trash2,
  Download,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type Step = 'product' | 'checkout' | 'confirmation';

interface ProductData {
  name: string;
  description: string;
  price: string;
  currency: string;
  productId: string;
  images: string[];
  variants: Array<{ name: string; options: string }>;
  inventory: string;
}

interface CheckoutData {
  requireName: boolean;
  requireAddress: boolean;
  requirePhone: boolean;
  shippingFee: string;
  taxRate: string;
  discount: string;
  handlingFee: string;
  autoReturnUrl: string;
}

export default function MerchantCreateLink() {
  const { merchant } = useAuth();
  const { plan, linkCount, remainingLinks, canCreateLink } = useSubscription();
  const [currentStep, setCurrentStep] = useState<Step>('product');
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [linkSlug, setLinkSlug] = useState<string | null>(null);

  // Product Step State
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    productId: '',
    images: [],
    variants: [],
    inventory: '',
  });

  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [variantInput, setVariantInput] = useState({ name: '', options: '' });

  // Checkout Step State
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    requireName: true,
    requireAddress: true,
    requirePhone: false,
    shippingFee: '',
    taxRate: '',
    discount: '',
    handlingFee: '',
    autoReturnUrl: '',
  });

  // Handle product image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (pendingImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setPendingImages([...pendingImages, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setPendingImages(pendingImages.filter((_, i) => i !== index));
    setImagePreview(imagePreview.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    if (!variantInput.name || !variantInput.options) {
      toast.error('Please fill variant name and options');
      return;
    }

    const newVariant = {
      name: variantInput.name,
      options: variantInput.options,
    };

    setProductData({
      ...productData,
      variants: [...productData.variants, newVariant],
    });
    setVariantInput({ name: '', options: '' });
  };

  const removeVariant = (index: number) => {
    setProductData({
      ...productData,
      variants: productData.variants.filter((_, i) => i !== index),
    });
  };

  // Upload images to Supabase
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of pendingImages) {
      const fileName = `${Date.now()}-${uuidv4()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('merchant-products')
        .upload(fileName, file);

      if (error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }

      const { data: publicUrl } = supabase.storage
        .from('merchant-products')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl.publicUrl);
    }

    return uploadedUrls;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!merchant) {
      toast.error('You must be logged in as a merchant');
      return;
    }

    // Check subscription plan limits
    if (!canCreateLink) {
      toast.error(`You've reached the ${plan?.link_limit} link limit for your ${plan?.name} plan. Upgrade to create more links.`);
      return;
    }

    if (!productData.name || !productData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Upload images
      let uploadedImageUrls: string[] = [];
      if (pendingImages.length > 0) {
        uploadedImageUrls = await uploadImages();
      }

      // Generate link code
      const linkCode = Math.random().toString(36).substring(2, 10);

      // Insert into payment_links table (the actual table that exists)
      const { error: dbError } = await supabase
        .from('payment_links')
        .insert({
          merchant_id: merchant.id,
          title: productData.name,
          description: productData.description,
          amount: parseFloat(productData.price),
          slug: linkCode,
          template_type: 'ecommerce',
          product_images: uploadedImageUrls,
          product_variants: productData.variants,
          require_shipping: checkoutData.requireAddress,
        });

      if (dbError) {
        throw new Error(dbError.message);
      }

      const link = `${window.location.origin}/pay/${linkCode}`;
      setCreatedLink(link);
      setLinkSlug(linkCode);
      setCurrentStep('confirmation');
      toast.success('Product link created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  // Product Step Component
  const ProductStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Product Name *
        </label>
        <Input
          placeholder="e.g., Premium T-Shirt"
          value={productData.name}
          onChange={(e) =>
            setProductData({ ...productData, name: e.target.value })
          }
          className="border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description
        </label>
        <Textarea
          placeholder="Describe your product..."
          value={productData.description}
          onChange={(e) =>
            setProductData({ ...productData, description: e.target.value })
          }
          className="border-gray-300 resize-none"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Price *
          </label>
          <Input
            placeholder="0.00"
            type="number"
            step="0.01"
            value={productData.price}
            onChange={(e) =>
              setProductData({ ...productData, price: e.target.value })
            }
            className="border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Currency
          </label>
          <select
            value={productData.currency}
            onChange={(e) =>
              setProductData({ ...productData, currency: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="AUD">AUD</option>
            <option value="CAD">CAD</option>
            <option value="ZAR">ZAR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Product ID (Optional)
          </label>
          <Input
            placeholder="e.g., SKU-001"
            value={productData.productId}
            onChange={(e) =>
              setProductData({ ...productData, productId: e.target.value })
            }
            className="border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Inventory
          </label>
          <Input
            placeholder="Stock quantity"
            type="number"
            value={productData.inventory}
            onChange={(e) =>
              setProductData({ ...productData, inventory: e.target.value })
            }
            className="border-gray-300"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Product Images ({imagePreview.length}/5)
        </label>
        <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center cursor-pointer hover:bg-orange-50 transition">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="image-input"
          />
          <label htmlFor="image-input" className="cursor-pointer">
            <div className="flex justify-center mb-2">
              <Package className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              Click to upload images
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 10MB each
            </p>
          </label>
        </div>

        {imagePreview.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {imagePreview.map((preview, idx) => (
              <div
                key={idx}
                className="relative group rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Product Variants
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Variant name (e.g., Size)"
            value={variantInput.name}
            onChange={(e) =>
              setVariantInput({ ...variantInput, name: e.target.value })
            }
            className="border-gray-300"
          />
          <Input
            placeholder="Options (comma-separated)"
            value={variantInput.options}
            onChange={(e) =>
              setVariantInput({ ...variantInput, options: e.target.value })
            }
            className="border-gray-300"
          />
          <Button
            onClick={addVariant}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {productData.variants.length > 0 && (
          <div className="space-y-2">
            {productData.variants.map((variant, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-orange-50 border border-orange-200 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{variant.name}</p>
                  <p className="text-sm text-gray-600">
                    {variant.options}
                  </p>
                </div>
                <button
                  onClick={() => removeVariant(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => setCurrentStep('checkout')}
        disabled={!productData.name || !productData.price || !canCreateLink}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!canCreateLink ? (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Link Limit Reached - Upgrade to Continue
          </>
        ) : (
          <>Next: Checkout Options</>
        )}
      </Button>
    </div>
  );

  // Checkout Step Component
  const CheckoutStep = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={checkoutData.requireName}
              onChange={(e) =>
                setCheckoutData({
                  ...checkoutData,
                  requireName: e.target.checked,
                })
              }
              className="w-4 h-4 text-orange-600"
            />
            <span className="text-sm text-gray-700">Require customer name</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={checkoutData.requireAddress}
              onChange={(e) =>
                setCheckoutData({
                  ...checkoutData,
                  requireAddress: e.target.checked,
                })
              }
              className="w-4 h-4 text-orange-600"
            />
            <span className="text-sm text-gray-700">
              Require shipping address
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={checkoutData.requirePhone}
              onChange={(e) =>
                setCheckoutData({
                  ...checkoutData,
                  requirePhone: e.target.checked,
                })
              }
              className="w-4 h-4 text-orange-600"
            />
            <span className="text-sm text-gray-700">
              Require phone number
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Shipping Fee
          </label>
          <Input
            placeholder="0.00"
            type="number"
            step="0.01"
            value={checkoutData.shippingFee}
            onChange={(e) =>
              setCheckoutData({
                ...checkoutData,
                shippingFee: e.target.value,
              })
            }
            className="border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Tax Rate (%)
          </label>
          <Input
            placeholder="0"
            type="number"
            step="0.01"
            value={checkoutData.taxRate}
            onChange={(e) =>
              setCheckoutData({
                ...checkoutData,
                taxRate: e.target.value,
              })
            }
            className="border-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Discount (%)
          </label>
          <Input
            placeholder="0"
            type="number"
            step="0.01"
            value={checkoutData.discount}
            onChange={(e) =>
              setCheckoutData({
                ...checkoutData,
                discount: e.target.value,
              })
            }
            className="border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Handling Fee
          </label>
          <Input
            placeholder="0.00"
            type="number"
            step="0.01"
            value={checkoutData.handlingFee}
            onChange={(e) =>
              setCheckoutData({
                ...checkoutData,
                handlingFee: e.target.value,
              })
            }
            className="border-gray-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Auto-Return URL (Optional)
        </label>
        <Input
          placeholder="https://example.com/thank-you"
          value={checkoutData.autoReturnUrl}
          onChange={(e) =>
            setCheckoutData({
              ...checkoutData,
              autoReturnUrl: e.target.value,
            })
          }
          className="border-gray-300"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setCurrentStep('product')}
          variant="outline"
          className="flex-1"
          disabled={!canCreateLink}
        >
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep('confirmation')}
          disabled={!canCreateLink}
          className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!canCreateLink ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Upgrade Required
            </>
          ) : (
            <>Review & Create</>
          )}
        </Button>
      </div>
    </div>
  );

  // Confirmation Step Component
  const ConfirmationStep = () => {
    const handleCopyLink = () => {
      if (createdLink) {
        navigator.clipboard.writeText(createdLink);
        toast.success('Link copied to clipboard!');
      }
    };

    const handleShare = async () => {
      if (!createdLink) return;

      if (navigator.share) {
        try {
          await navigator.share({
            title: productData.name,
            text: `Check out my product: ${productData.name}`,
            url: createdLink,
          });
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            toast.error('Share failed');
          }
        }
      } else {
        handleCopyLink();
      }
    };

    const handleDownloadQR = () => {
      if (!createdLink) return;

      const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(
        createdLink
      )}`;
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `${productData.name}-qr.png`;
      link.click();
      toast.success('QR code downloaded!');
    };

    const embedCode = `<iframe src="${createdLink}" width="500" height="600" frameborder="0" style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"></iframe>`;

    const handleCopyEmbed = () => {
      navigator.clipboard.writeText(embedCode);
      toast.success('Embed code copied!');
    };

    if (!createdLink) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
          <p className="text-gray-600">Creating your product link...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Product Link Created Successfully!
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Product</p>
              <p className="font-semibold text-gray-900">{productData.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Price</p>
              <p className="font-semibold text-gray-900">
                {productData.price} {productData.currency}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Inventory</p>
              <p className="font-semibold text-gray-900">
                {productData.inventory || 'Unlimited'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Variants</p>
              <p className="font-semibold text-gray-900">
                {productData.variants.length || 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Shareable Link */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Shareable Link</h3>
          </div>
          <div className="flex gap-2">
            <Input
              value={createdLink}
              readOnly
              className="flex-1 bg-white border-gray-300"
            />
            <Button
              onClick={handleCopyLink}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleShare}
              size="sm"
              variant="outline"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">QR Code</h3>
          </div>
          <div className="flex justify-center">
            <img
              src={`https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(
                createdLink
              )}`}
              alt="QR Code"
              className="w-48 h-48 border-4 border-white"
            />
          </div>
          <Button
            onClick={handleDownloadQR}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>

        {/* Embed Code */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Embed on Website</h3>
          </div>
          <div className="bg-gray-900 rounded p-3 text-xs text-gray-300 font-mono overflow-x-auto">
            <pre>{embedCode}</pre>
          </div>
          <Button
            onClick={handleCopyEmbed}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Embed Code
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition">
            <CardContent className="p-4">
              <div className="text-3xl mb-3 p-2 bg-orange-100 rounded-lg w-fit">
                🔗
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Shareable Link</h3>
              <p className="text-xs text-gray-600">
                Share the link via email, social media, or messaging
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition">
            <CardContent className="p-4">
              <div className="text-3xl mb-3 p-2 bg-orange-100 rounded-lg w-fit">
                📱
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">QR Code</h3>
              <p className="text-xs text-gray-600">
                Generate QR codes for print materials or signage
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition">
            <CardContent className="p-4">
              <div className="text-3xl mb-3 p-2 bg-orange-100 rounded-lg w-fit">
                💻
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Embed Button</h3>
              <p className="text-xs text-gray-600">
                Embed directly on your website or blog
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => {
              setCurrentStep('product');
              setProductData({
                name: '',
                description: '',
                price: '',
                currency: 'USD',
                productId: '',
                images: [],
                variants: [],
                inventory: '',
              });
              setPendingImages([]);
              setImagePreview([]);
              setCreatedLink(null);
            }}
            variant="outline"
            className="flex-1"
          >
            Create Another Product
          </Button>
          <Button
            onClick={() => (window.location.href = '/dashboard')}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Create Product Link</h1>
          </div>
          <p className="text-orange-100 text-sm">
            Build a shareable product link with images, variants, and inventory tracking
          </p>
        </div>

        {/* Subscription Plan Info Banner */}
        {plan && (
          <Card className={`mb-8 border-2 ${canCreateLink ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {canCreateLink ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {plan.name} Plan {canCreateLink ? '✓' : '- Limit Reached'}
                    </p>
                    <p className={`text-sm ${canCreateLink ? 'text-green-700' : 'text-red-700'}`}>
                      {plan.link_limit === null ? (
                        <span>Unlimited payment links</span>
                      ) : (
                        <span>
                          {linkCount} / {plan.link_limit} links used
                          {canCreateLink && remainingLinks && (
                            <span className="ml-2">({remainingLinks} remaining)</span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {!canCreateLink && (
                  <Button
                    onClick={() => (window.location.href = '/dashboard/subscription')}
                    className="bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cannot Create Link - Blocked UI */}
        {!canCreateLink && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Lock className="w-8 h-8 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Link Limit Reached</h3>
                  <p className="text-sm text-red-700">
                    You've reached the maximum number of payment links for your {plan?.name} plan. 
                    Upgrade your plan to create more links.
                  </p>
                </div>
                <Button
                  onClick={() => (window.location.href = '/dashboard/subscription')}
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 whitespace-nowrap"
                >
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { title: '1) Product details', desc: 'Add name, price, images, variants, and stock.' },
            { title: '2) Checkout fields', desc: 'Choose which buyer details to collect and optional fees.' },
            { title: '3) Share link', desc: 'We generate the product link with copy, preview, and QR options.' },
          ].map((step, idx) => (
            <Card key={idx} className="border border-orange-100 bg-white/70 shadow-sm">
              <CardContent className="p-3 space-y-1">
                <p className="text-xs font-semibold text-orange-600">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8">
          {['product', 'checkout', 'confirmation'].map((step, idx) => (
            <div key={step} className="flex-1 flex items-center">
              <button
                onClick={() => {
                  if (
                    step === 'product' ||
                    (step === 'checkout' && currentStep !== 'product')
                  ) {
                    setCurrentStep(step as Step);
                  }
                }}
                className={`flex-1 py-3 rounded-lg font-medium transition ${
                  currentStep === step
                    ? 'bg-orange-600 text-white shadow-lg'
                    : currentStep === 'confirmation' ||
                        (currentStep === 'checkout' && step === 'confirmation')
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {idx + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
              </button>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {currentStep === 'product' && <ProductStep />}
            {currentStep === 'checkout' && <CheckoutStep />}
            {currentStep === 'confirmation' && !loading && (
              <ConfirmationStep />
            )}
            {currentStep === 'confirmation' && loading && (
              <div className="flex flex-col items-center justify-center gap-6 py-12">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                <p className="text-gray-600">Creating your product link...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Button (when on confirmation step after submission) */}
        {currentStep === 'confirmation' && !createdLink && !loading && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-12 py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Create Product Link
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2">Outputs product link + copy/share + QR for checkout</p>
          </div>
        )}
      </div>
    </div>
  );
}
