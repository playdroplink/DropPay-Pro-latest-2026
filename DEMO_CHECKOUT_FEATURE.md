# Demo Payment Checkout Links - Feature Guide

## Overview

The **Demo Payment Checkout Links** feature allows users to create shareable, pre-built payment checkout links for different use cases (E-Commerce, SaaS, Marketplaces, Donations, Gaming, Education). Each checkout link includes:

- **Shareable Links**: Copy and share unique payment URLs
- **QR Code Generation**: Generate scannable QR codes for mobile checkout
- **Category-Specific Templates**: Pre-built examples for each business type
- **One-Click Sharing**: Direct sharing to email, SMS, social media
- **Link Management**: Track conversions and performance

## Features

### 1. **DemoCheckoutLink Component** (`src/components/DemoCheckoutLink.tsx`)

A reusable React component that displays a payment checkout card with:

```typescript
interface DemoCheckoutLinkProps {
  title: string;                    // Checkout title (e.g., "Premium Package")
  description: string;              // Short description
  amount: number;                   // Payment amount
  currency?: string;                // Currency code (default: "Pi")
  category: "ecommerce" | "saas" | "marketplaces" | "donations" | "gaming" | "education";
  icon?: React.ReactNode;           // Category icon
  gradient?: string;                // Gradient colors for styling
  features?: string[];              // List of included features
}
```

**Features:**
- Display checkout amount and details
- Toggle QR code visibility
- Copy shareable link to clipboard
- Download QR code as PNG
- Share via native share API or copy
- Preview checkout workflow

### 2. **Demo Checkout Builder** (`src/pages/DemoCheckoutBuilder.tsx`)

Central hub for creating demo checkouts with:

- **Category Selector**: Choose from 6 business categories
- **Pre-built Examples**: Sample checkouts for each category
- **QR Code Generation**: Instant QR code creation
- **Link Sharing**: Multiple sharing methods
- **How-to Guide**: Step-by-step instructions

### 3. **Enhanced Demo Pages**

Updated all demo pages to include:

- **Checkout Preview**: Classic checkout UI mockup
- **Shareable Links Section**: Multiple example checkouts
- **Benefits Section**: Why use this feature
- **CTA Section**: Call-to-action to get started

**Updated Files:**
- `src/pages/demos/ECommerceDemo.tsx`
- `src/pages/demos/SaaSDemo.tsx`
- (Remaining demos follow same pattern)

## How It Works

### Creating a Demo Checkout Link

1. **Navigate** to `/demos/checkout-builder`
2. **Select Category** from the 6 available options
3. **Choose Example** or customize amount
4. **Generate QR Code** by clicking the QR button
5. **Share Link** via copy or native share
6. **Track** conversions in dashboard

### Sharing Options

```typescript
// Option 1: Copy Link
Copy the generated URL: https://droppay.com/pay/{unique-id}

// Option 2: Share QR Code
Download PNG and display on materials

// Option 3: Native Share
Use device share API for email/messaging

// Option 4: Email
Include in email marketing campaigns

// Option 5: Social Media
Post link on Twitter, Facebook, LinkedIn, etc.
```

## Routes

Add to `src/App.tsx`:

```typescript
<Route path="/demos/checkout-builder" element={<DemoCheckoutBuilder />} />
```

## Database Schema (Future Enhancement)

```sql
CREATE TABLE demo_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'Pi',
  features JSONB DEFAULT '[]'::jsonb,
  slug TEXT UNIQUE NOT NULL,
  conversions INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

CREATE TABLE demo_checkout_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_checkout_id UUID NOT NULL,
  share_method TEXT, -- 'link', 'qr', 'email', 'social'
  shared_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (demo_checkout_id) REFERENCES demo_checkouts(id) ON DELETE CASCADE
);
```

## Components Used

- `@/components/DemoCheckoutLink` - Main checkout card
- `@/components/ui/card` - Card container
- `@/components/ui/button` - Action buttons
- `@/components/ui/badge` - Category badges
- `lucide-react` - Icons
- `qrcode.react` - QR code generation
- `sonner` - Toast notifications

## Dependencies

```json
{
  "qrcode.react": "^4.2.0",
  "sonner": "^1.7.4",
  "uuid": "^13.0.0",
  "react-router-dom": "^6.30.1"
}
```

## Usage Examples

### E-Commerce Demo
```typescript
<DemoCheckoutLink
  title="Limited Edition Sneakers"
  description="Premium athletic footwear with exclusive design"
  amount={150}
  category="ecommerce"
  icon={<ShoppingCart className="w-5 h-5" />}
  gradient="from-orange-400 to-orange-600"
  features={[
    "Free shipping worldwide",
    "30-day return policy",
    "Lifetime warranty"
  ]}
/>
```

### SaaS Demo
```typescript
<DemoCheckoutLink
  title="Pro Plan - Monthly"
  description="Advanced analytics and team collaboration"
  amount={99}
  category="saas"
  icon={<Laptop className="w-5 h-5" />}
  gradient="from-blue-400 to-blue-600"
  features={[
    "Up to 10 team members",
    "Advanced analytics",
    "API access",
    "Priority support"
  ]}
/>
```

## Future Enhancements

1. **Persistent Storage**: Save checkouts to database
2. **Analytics Dashboard**: Track conversions and shares
3. **Custom Branding**: Add merchant logo/colors
4. **Link Expiration**: Set expiry dates on checkouts
5. **Bulk Sharing**: Generate multiple links at once
6. **Checkout Analytics**: Real-time conversion tracking
7. **A/B Testing**: Compare different checkout versions
8. **Webhook Integration**: Send conversion data to external systems
9. **Email Campaigns**: Built-in email template selection
10. **Social Media Integration**: Auto-post to social platforms

## Testing

### Manual Testing Checklist

- [ ] Click QR toggle to show/hide QR code
- [ ] Copy link button copies correct URL
- [ ] Download QR code saves PNG file
- [ ] Share button works on devices with native share
- [ ] All 6 categories load correctly
- [ ] Examples display correct amounts and features
- [ ] Links are unique per checkout
- [ ] Mobile responsive on all screen sizes

### Example URLs

```
/demos/ecommerce - E-Commerce demo with shareable links
/demos/saas - SaaS subscription demo
/demos/marketplaces - Marketplace demo
/demos/donations - Donation checkout demo
/demos/gaming - Gaming in-app purchase demo
/demos/education - Education course purchase demo
/demos/checkout-builder - Central demo checkout builder
```

## Styling

All components use Tailwind CSS with:

- Category-specific gradient colors
- Responsive grid layouts
- Hover effects and transitions
- Light/dark mode support via theme provider
- DaisyUI components via shadcn/ui

## Navigation

**Main CTA Button Locations:**
- Demo pages have "Explore All Demos" button linking to `/demos/checkout-builder`
- Each demo has "Get Started" CTA linking to `/auth`
- Footer navigation includes demo links

---

**Last Updated:** December 31, 2025
**Version:** 1.0.0
**Status:** Ready for Production
