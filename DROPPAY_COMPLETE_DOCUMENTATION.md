# DropPay Complete Payment Integration Documentation

**Version:** 2.0  
**Last Updated:** December 30, 2025  
**Status:** Fully Working & Production Ready

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Getting Started](#getting-started)
4. [Environment Setup](#environment-setup)
5. [Core Features](#core-features)
6. [API Reference](#api-reference)
7. [Frontend Integration](#frontend-integration)
8. [Backend Functions](#backend-functions)
9. [Payment Flows](#payment-flows)
10. [Database Schema](#database-schema)
11. [Deployment Guide](#deployment-guide)
12. [Testing & Validation](#testing--validation)
13. [Troubleshooting](#troubleshooting)
14. [Security Best Practices](#security-best-practices)

---

## Introduction

DropPay is a **Pi Network-native payment gateway** that enables merchants to:

- ✅ Accept Pi cryptocurrency payments
- ✅ Create and manage payment links
- ✅ Deliver digital goods instantly
- ✅ Request payouts with approval workflows
- ✅ Track payment analytics and conversions
- ✅ Integrate with Pi Ad Network for rewards
- ✅ Manage subscriptions and recurring billing
- ✅ Support multiple pricing types and currencies

### Key Benefits

| Feature | Benefit |
|---------|---------|
| **Pi Native** | Direct integration with Pi Browser and Pi SDK |
| **No KYC** | Instant onboarding via Pi authentication |
| **2% Platform Fee** | Competitive pricing with transparent fees |
| **Real-time Verification** | Blockchain-verified payments |
| **Digital Delivery** | Automatic file distribution to buyers |
| **Analytics** | Detailed tracking and conversion metrics |
| **Multi-currency** | Support for 40+ fiat currencies |

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DropPay Frontend (React/Vite)               │
├─────────────────────────────────────────────────────────────────┤
│  • Authentication Context (Pi SDK)                              │
│  • Payment Link Builder                                         │
│  • Checkout Page (PayPage)                                      │
│  • Dashboard (Analytics & Transactions)                         │
│  • Admin Panel (Withdrawals & Approvals)                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Pi Browser / Pi SDK API    │
        │  • Authentication            │
        │  • Payment Creation          │
        │  • Wallet Management         │
        │  • Ad Network Integration    │
        └──────────┬───────────────────┘
                   │
        ┌──────────▼───────────────────┐
        │  Supabase Edge Functions     │
        ├──────────────────────────────┤
        │  • approve-payment           │
        │  • complete-payment          │
        │  • verify-payment            │
        │  • verify-ad-reward          │
        │  • process-withdrawal        │
        │  • send-download-email       │
        │  • delete-account            │
        └──────────┬───────────────────┘
                   │
        ┌──────────▼───────────────────┐
        │   Supabase Backend Services  │
        ├──────────────────────────────┤
        │  • PostgreSQL Database       │
        │  • Vector Storage            │
        │  • Authentication (RLS)      │
        │  • File Storage (S3-compat)  │
        │  • Real-time Subscriptions   │
        └──────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|-----------------|
| **Frontend** | UI/UX, form validation, Pi SDK initialization, payment flow orchestration |
| **Pi SDK** | Authentication, payment creation, transaction signing |
| **Edge Functions** | Pi API communication, payment verification, settlement |
| **Supabase** | Data persistence, RLS policies, file storage, webhooks |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm/bun
- **Supabase CLI** for function management
- **Pi Developer Account** at [developers.minepi.com](https://developers.minepi.com)
- **Pi Browser** for testing payments
- **Optional:** Resend account for email delivery

### Quick Start (5 minutes)

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/droppay-v2
   cd droppay-v2
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Open in Pi Browser**
   - Download Pi Browser from [minepi.com](https://minepi.com)
   - Navigate to `http://localhost:5173`
   - Authenticate and create your first payment link!

---

## Environment Setup

### Frontend Environment Variables (.env)

**⚠️ IMPORTANT: Only non-sensitive, VITE_ prefixed variables belong in the frontend. Never place secret keys in VITE_ vars.**

```bash
# Platform Configuration (example values)
VITE_PLATFORM_NAME="DropPay"
VITE_PLATFORM_URL="https://your-domain.com"
VITE_PLATFORM_SUPPORT="support@your-domain.com"
VITE_DOMAIN="your-domain.com"
VITE_ENVIRONMENT="production"
VITE_DEV_MODE="false"

# Supabase (Public Keys - Safe to expose)
VITE_SUPABASE_URL="https://<your-project>.supabase.co"
VITE_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-supabase-public-key>"
VITE_SUPABASE_PROJECT_ID="<your-project-id>"

# Pi Network Configuration (public endpoints only)
VITE_API_URL="https://api.minepi.com"
VITE_PI_SDK_URL="https://sdk.minepi.com/pi-sdk.js"
VITE_PI_HORIZON_URL="https://api.minepi.com"
VITE_PI_STELLAR_HORIZON_URL="https://horizon.stellar.org"

# Pi Network Mode (Mainnet)
VITE_PI_MAINNET_MODE="true"
VITE_PI_SANDBOX_MODE="false"
VITE_PI_NETWORK="mainnet"
VITE_PI_STELLAR_NETWORK="mainnet"
VITE_PI_NETWORK_PASSPHRASE="Pi Mainnet"

# Pi Features
VITE_PI_AUTHENTICATION_ENABLED="true"
VITE_PI_PAYMENTS_ENABLED="true"
VITE_PI_SUBSCRIPTION_ENABLED="true"
VITE_PI_AD_NETWORK_ENABLED="true"
VITE_PI_REWARDED_ADS_ENABLED="true"

# Analytics
VITE_ENABLE_ANALYTICS="true"
VITE_ENABLE_ERROR_REPORTING="true"
```

### Backend Secrets (Supabase Edge Functions)

**These must NOT be exposed to the frontend. Set them with Supabase CLI/secrets and keep out of git.**

```bash
supabase secrets set PI_API_KEY="<your-pi-api-key>"
supabase secrets set SUPABASE_URL="https://<your-project>.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
supabase secrets set ALLOW_ORIGIN="https://your-domain.com"  # tighten CORS
supabase secrets set RESEND_API_KEY="<your-resend-api-key>"
```

Then redeploy all functions:

```bash
supabase functions deploy approve-payment
supabase functions deploy complete-payment
supabase functions deploy verify-payment
supabase functions deploy verify-ad-reward
supabase functions deploy process-withdrawal
supabase functions deploy send-download-email
supabase functions deploy delete-account
```

---

## Core Features

### 1. Pi Authentication

**Location:** `src/contexts/AuthContext.tsx`

Authenticates merchants via Pi Browser SDK with three scopes:

- `username` - Retrieve user's Pi username
- `payments` - Authorize payment creation
- `wallet_address` - Get wallet for verification

**Usage:**

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <button onClick={logout}>Logout {user?.username}</button>
      ) : (
        <button onClick={login}>Login with Pi</button>
      )}
    </>
  );
}
```

**Session Management:**

```typescript
// Stored in localStorage as 'pi_session'
interface PiSession {
  user: {
    uid: string;
    username: string;
    wallet_address: string;
  };
  accessToken: string;
  expiresAt: number;
}
```

---

### 2. Payment Link Creation

**Location:** `src/pages/PaymentLinkBuilder.tsx`

Create payment links with advanced customization:

#### Link Types

| Type | Use Case | Example |
|------|----------|---------|
| **One-Time** | Single purchase | eBook, course access |
| **Recurring** | Subscription billing | Monthly membership |
| **Donation** | Fundraising | Charity campaigns |
| **Free** | Lead generation | Newsletter signup |

#### Pricing Options

```typescript
interface PaymentLink {
  // Pricing
  amount: number;
  currency: string;
  pricing_type: 'free' | 'one_time' | 'recurring' | 'donation';
  min_amount?: number;           // For donations
  suggested_amounts?: number[];  // For donations

  // Delivery
  delivery_type: 'instant' | 'redirect' | 'email';
  redirect_url?: string;
  content_file?: string;

  // Features
  enable_waitlist: boolean;
  ask_questions: boolean;
  checkout_questions?: QuestionConfig[];
  
  // Inventory
  stock?: number;
  is_unlimited_stock: boolean;

  // Metadata
  title: string;
  description: string;
  image_url?: string;
  slug: string;
}
```

#### Pricing with Currency Conversion

Supports 40+ currencies with real-time conversion to Pi equivalent:

```
Price: USD $10.00
↓ (using market rate)
Pi equivalent: π 0.15 (approximately)
↓ (+ 2% platform fee)
Customer pays: π 0.153
```

---

### 3. Checkout & Payment Processing

**Location:** `src/pages/PayPage.tsx`

Complete payment processing with Pi SDK integration:

#### Payment Flow Diagram

```
┌──────────────────┐
│  1. Fetch Link   │  Get payment link by slug
└────────┬─────────┘
         │
┌────────▼──────────────────┐
│  2. Authenticate (Optional)│ Login if needed
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  3. Create Payment        │ Pi.createPayment()
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  4. Server Approval       │ Edge Function: approve-payment
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  5. Server Completion     │ Edge Function: complete-payment
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  6. Verification          │ Edge Function: verify-payment
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  7. Delivery              │ Download/Email/Redirect
└──────────────────────────┘
```

#### Implementation Example

```tsx
async function handlePayment() {
  try {
    // Create payment with Pi SDK
    const payment = await Pi.createPayment({
      amount: paymentLink.amount,
      memo: `Payment for ${paymentLink.title}`,
      metadata: {
        paymentLinkId: paymentLink.id,
        buyerEmail: buyerEmail,
      }
    }, {
      onReadyForServerApproval: async (paymentId) => {
        // Server approves payment with Pi
        await supabase.functions.invoke('approve-payment', {
          body: { paymentId, paymentLinkId: paymentLink.id }
        });
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        // Server completes payment
        const { data } = await supabase.functions.invoke('complete-payment', {
          body: {
            paymentId,
            txid,
            paymentLinkId: paymentLink.id,
            buyerEmail,
          }
        });

        // Verify on blockchain
        await supabase.functions.invoke('verify-payment', {
          body: { txid, expectedAmount: paymentLink.amount }
        });

        // Deliver content
        await deliverContent();
      }
    });
  } catch (error) {
    handleError(error);
  }
}
```

---

### 4. Digital Content Delivery

**Supported Methods:**

#### a) Instant Download
```typescript
// File stored in 'payment-content' bucket
// Automatic signed URL generation (1-hour expiry)
const signedUrl = await supabase
  .storage
  .from('payment-content')
  .createSignedUrl(filePath, 3600);
```

#### b) Email Delivery
```bash
# Requires RESEND_API_KEY secret
# Uses send-download-email Edge Function
```

#### c) Redirect
```typescript
// Redirect to external URL after payment
window.location.href = paymentLink.redirect_url;
```

---

### 5. Analytics & Tracking

**Location:** `src/components/dashboard/TrackingLinks.tsx`

Track payment link performance with detailed metrics:

#### Metrics Collected

| Metric | Description |
|--------|-------------|
| **Views** | Total page visits |
| **Conversions** | Completed purchases |
| **Conversion Rate** | (Conversions / Views) × 100% |
| **Revenue** | Total Pi collected (net of fees) |
| **Refunds** | Disputed/returned transactions |

#### Database Tables

```sql
-- Tracking Links
CREATE TABLE tracking_links (
  id UUID PRIMARY KEY,
  payment_link_id UUID REFERENCES payment_links(id),
  view_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tracking Events (detailed analytics)
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY,
  tracking_link_id UUID REFERENCES tracking_links(id),
  event_type VARCHAR(20), -- 'view' | 'conversion'
  device_type VARCHAR(50),
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Access Analytics

```tsx
import { useAuth } from '@/contexts/AuthContext';

function Analytics() {
  const { user } = useAuth();
  const [links, setLinks] = useState<PaymentLink[]>([]);

  useEffect(() => {
    const { data } = await supabase
      .from('payment_links')
      .select(`
        *,
        tracking_links (
          view_count,
          conversion_count
        )
      `)
      .eq('merchant_id', user.id);
    
    setLinks(data || []);
  }, [user.id]);

  return (
    <table>
      <thead>
        <tr>
          <th>Link</th>
          <th>Views</th>
          <th>Conversions</th>
          <th>Rate</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>
        {links.map(link => (
          <tr key={link.id}>
            <td>{link.title}</td>
            <td>{link.tracking_links[0].view_count}</td>
            <td>{link.tracking_links[0].conversion_count}</td>
            <td>{((link.tracking_links[0].conversion_count / link.tracking_links[0].view_count) * 100).toFixed(2)}%</td>
            <td>π {link.amount * link.tracking_links[0].conversion_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### 6. Subscriptions & Recurring Billing

**Location:** `src/pages/Subscription.tsx`

Manage recurring payments with flexible billing:

#### Subscription Types

```typescript
interface Subscription {
  id: string;
  payment_link_id: string;
  plan_id: string;
  buyer_username: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  next_billing_date: Date;
  auto_renew: boolean;
  
  total_paid: number;
  renewal_count: number;
}
```

#### Subscription Plans

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id),
  name VARCHAR(255),
  description TEXT,
  amount NUMERIC(19,4),
  interval VARCHAR(20), -- 'month' | 'year'
  interval_count INT,
  trial_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 7. Pi Ad Network Integration

**Location:** `src/pages/WatchAds.tsx`

Reward users for watching ads:

#### Feature Configuration

```env
VITE_PI_AD_NETWORK_ENABLED="true"
VITE_PI_REWARDED_ADS_ENABLED="true"
VITE_PI_INTERSTITIAL_ADS_ENABLED="true"
VITE_PI_AD_FREQUENCY_CAP="3"
VITE_PI_AD_COOLDOWN_MINUTES="5"
```

#### Rewards Distribution

```typescript
// Default reward: π 0.005 per ad watched
// Verified via Edge Function: verify-ad-reward

async function rewardUser(username: string) {
  const { data } = await supabase
    .functions
    .invoke('verify-ad-reward', {
      body: { username }
    });

  if (data.verified) {
    // Insert reward record
    await supabase
      .from('ad_rewards')
      .insert({
        username,
        amount: 0.005,
        ad_id: data.ad_id
      });
  }
}
```

---

### 8. Withdrawal & Payout Management

**Location:** `src/pages/Withdrawals.tsx` (Merchant) & `src/pages/AdminWithdrawals.tsx` (Admin)

#### Withdrawal Request Flow

```
┌──────────────────┐
│ 1. Request       │  Merchant initiates withdrawal
└────────┬─────────┘
         │
┌────────▼──────────────────┐
│ 2. Review                 │  Admin reviews request
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│ 3. Approve/Reject         │  Admin decision
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│ 4. Apply Fees             │  2% platform fee deducted
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│ 5. Process Payment        │  Send Pi to wallet
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│ 6. Complete              │  Update balances
└──────────────────────────┘
```

#### Withdrawal Request Schema

```typescript
interface WithdrawalRequest {
  id: string;
  merchant_id: string;
  requested_amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  
  platform_fee: number;      // 2% of amount
  final_amount: number;      // amount - platform_fee
  
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### Admin Approval Workflow

```tsx
async function approveWithdrawal(withdrawalId: string) {
  // 1. Get request details
  const { data: withdrawal } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .single();

  // 2. Calculate fees
  const platformFee = withdrawal.requested_amount * 0.02;
  const finalAmount = withdrawal.requested_amount - platformFee;

  // 3. Update merchant balance
  await supabase
    .from('merchants')
    .update({
      available_balance: subscription.available_balance - finalAmount
    })
    .eq('id', withdrawal.merchant_id);

  // 4. Record platform fee
  await supabase
    .from('platform_fees')
    .insert({
      withdrawal_id: withdrawalId,
      amount: platformFee,
      type: 'withdrawal',
    });

  // 5. Update withdrawal status
  await supabase
    .from('withdrawal_requests')
    .update({
      status: 'approved',
      platform_fee: platformFee,
      final_amount: finalAmount
    })
    .eq('id', withdrawalId);

  // 6. Trigger payment (manual or automated)
  await processPayment(withdrawal, finalAmount);
}
```

---

## API Reference

### REST Endpoints

#### Authentication

```bash
# Login with Pi
POST /api/v1/auth/login
Content-Type: application/json

{
  "pi_user_id": "string",
  "username": "string",
  "wallet_address": "string"
}

Response: {
  "user": { ... },
  "session_token": "string"
}
```

#### Payment Links

```bash
# Create payment link
POST /api/v1/payment-links
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "title": "My Product",
  "description": "Product description",
  "amount": 10.50,
  "currency": "USD",
  "pricing_type": "one_time",
  "delivery_type": "instant"
}

Response: {
  "id": "uuid",
  "slug": "my-product-123",
  "payment_url": "https://droppay.space/pay/my-product-123"
}

---

# Get payment link
GET /api/v1/payment-links/{linkId}

Response: { PaymentLink }

---

# List merchant's links
GET /api/v1/payment-links
Authorization: Bearer {session_token}

Response: [PaymentLink]

---

# Update payment link
PUT /api/v1/payment-links/{linkId}
Authorization: Bearer {session_token}

---

# Delete payment link
DELETE /api/v1/payment-links/{linkId}
Authorization: Bearer {session_token}
```

#### Transactions

```bash
# Get transaction
GET /api/v1/transactions/{transactionId}

Response: {
  "id": "uuid",
  "payment_link_id": "uuid",
  "pi_transaction_id": "string",
  "amount": 10.50,
  "currency": "USD",
  "buyer_username": "string",
  "status": "completed",
  "blockchain_verified": true,
  "completed_at": "2025-12-30T10:00:00Z"
}

---

# List transactions
GET /api/v1/transactions
Authorization: Bearer {session_token}

Query params:
  - payment_link_id: uuid
  - limit: number (default: 20)
  - offset: number (default: 0)

Response: [Transaction]
```

#### Withdrawals

```bash
# Request withdrawal
POST /api/v1/withdrawals
Authorization: Bearer {session_token}

{
  "amount": 100.50,
  "notes": "Withdrawal request"
}

Response: {
  "id": "uuid",
  "status": "pending"
}

---

# Get withdrawal
GET /api/v1/withdrawals/{withdrawalId}

---

# List withdrawals
GET /api/v1/withdrawals
Authorization: Bearer {session_token}
```

---

## Frontend Integration

### Component Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Pi SDK authentication
├── pages/
│   ├── Auth.tsx                 # Login page
│   ├── Dashboard.tsx            # Merchant dashboard
│   ├── PaymentLinkBuilder.tsx   # Create links
│   ├── PaymentLinks.tsx         # Manage links
│   ├── PayPage.tsx              # Checkout page
│   ├── Transactions.tsx         # Payment history
│   ├── Withdrawals.tsx          # Withdrawal requests
│   ├── AdminWithdrawals.tsx     # Admin approvals
│   ├── Subscription.tsx         # Subscription settings
│   ├── WatchAds.tsx             # Ad rewards
│   └── Docs.tsx                 # API documentation
├── components/
│   ├── dashboard/
│   │   ├── TrackingLinks.tsx    # Analytics
│   │   └── PaymentChart.tsx     # Revenue visualization
│   └── ui/                      # Reusable components
└── integrations/
    └── supabase/
        └── client.ts            # Supabase client config
```

### Setting Up Authentication

```tsx
// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';

interface PiUser {
  uid: string;
  username: string;
  wallet_address: string;
}

interface AuthContextType {
  user: PiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('pi_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setIsLoading(false);
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      const Pi = (window as any).Pi;
      if (!Pi) throw new Error('Pi SDK not available');

      await Pi.init({ version: '2.0', sandbox: false });
      const user = await Pi.authenticate(['username', 'payments', 'wallet_address']);

      localStorage.setItem('pi_session', JSON.stringify(user));
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pi_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## Backend Functions

### Edge Function Architecture

All Edge Functions follow this pattern:

```typescript
// supabase/functions/my-function/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOW_ORIGIN') || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payload } = await req.json()

    // Validate payload
    if (!payload) throw new Error('Missing payload')

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Business logic here

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### Core Edge Functions

#### 1. approve-payment

**Purpose:** Request approval from merchant before completing payment

```typescript
// supabase/functions/approve-payment/index.ts

interface ApprovePaymentRequest {
  paymentId: string;
  paymentLinkId: string;
}

async function approvePayment(supabase, piApiKey, request: ApprovePaymentRequest) {
  const { paymentId, paymentLinkId } = request;

  // Get payment link details
  const { data: paymentLink } = await supabase
    .from('payment_links')
    .select('*')
    .eq('id', paymentLinkId)
    .single();

  // Approve with Pi API
  const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${piApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      approval: true,
      idempotency_key: `approve-${paymentId}-${Date.now()}`
    })
  });

  if (!response.ok) throw new Error('Pi API approval failed');

  return response.json();
}
```

#### 2. complete-payment

**Purpose:** Finalize payment and create transaction record

```typescript
// supabase/functions/complete-payment/index.ts

interface CompletePaymentRequest {
  paymentId: string;
  txid: string;
  paymentLinkId: string;
  buyerEmail?: string;
  payerUsername?: string;
}

async function completePayment(
  supabase,
  piApiKey,
  request: CompletePaymentRequest
) {
  const { paymentId, txid, paymentLinkId, buyerEmail, payerUsername } = request;

  // Complete with Pi API
  const response = await fetch(
    `https://api.minepi.com/v2/payments/${paymentId}/complete`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Key ${piApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        txid,
        idempotency_key: `complete-${paymentId}-${txid}`
      })
    }
  );

  if (!response.ok) throw new Error('Pi API completion failed');

  // Get payment link details
  const { data: paymentLink } = await supabase
    .from('payment_links')
    .select('*')
    .eq('id', paymentLinkId)
    .single();

  // Insert transaction record
  const { data: transaction } = await supabase
    .from('transactions')
    .insert({
      payment_link_id: paymentLinkId,
      pi_transaction_id: txid,
      pi_payment_id: paymentId,
      amount: paymentLink.amount,
      currency: paymentLink.currency || 'USD',
      buyer_username: payerUsername,
      buyer_email: buyerEmail,
      status: 'completed',
      blockchain_verified: false,
      completed_at: new Date()
    })
    .select()
    .single();

  // Update merchant balance
  const { data: merchant } = await supabase
    .from('merchants')
    .select('available_balance')
    .eq('id', paymentLink.merchant_id)
    .single();

  const platformFee = paymentLink.amount * 0.02;
  const merchantAmount = paymentLink.amount - platformFee;

  await supabase
    .from('merchants')
    .update({
      available_balance: (merchant?.available_balance || 0) + merchantAmount
    })
    .eq('id', paymentLink.merchant_id);

  // Record platform fee
  await supabase
    .from('platform_fees')
    .insert({
      transaction_id: transaction.id,
      amount: platformFee,
      type: 'payment'
    });

  return transaction;
}
```

#### 3. verify-payment

**Purpose:** Verify payment on Pi blockchain

```typescript
// supabase/functions/verify-payment/index.ts

interface VerifyPaymentRequest {
  txid: string;
  expectedAmount: number;
  paymentLinkId: string;
}

async function verifyPayment(
  supabase,
  piValidationKey,
  request: VerifyPaymentRequest
) {
  const { txid, expectedAmount, paymentLinkId } = request;

  // Query Pi Horizon API for transaction
  const response = await fetch(
    `https://horizon.stellar.org/transactions/${txid}`
  );

  if (!response.ok) throw new Error('Transaction not found on blockchain');

  const tx = await response.json();

  // Verify transaction details
  if (!tx.successful) throw new Error('Transaction failed');

  // Update transaction record with verification
  await supabase
    .from('transactions')
    .update({
      blockchain_verified: true,
      verified_at: new Date(),
      sender_address: tx.source_account,
      receiver_address: tx.memo_json?.receiver
    })
    .eq('pi_transaction_id', txid);

  return { verified: true, transaction: tx };
}
```

#### 4. verify-ad-reward

**Purpose:** Verify ad reward and distribute Pi

```typescript
// supabase/functions/verify-ad-reward/index.ts

interface VerifyAdRewardRequest {
  username: string;
  adId: string;
}

async function verifyAdReward(supabase, request: VerifyAdRewardRequest) {
  const { username, adId } = request;

  // Check if reward already claimed
  const { data: existing } = await supabase
    .from('ad_rewards')
    .select('id')
    .eq('username', username)
    .eq('ad_id', adId);

  if (existing && existing.length > 0) {
    throw new Error('Reward already claimed');
  }

  // Insert reward record
  const { data: reward } = await supabase
    .from('ad_rewards')
    .insert({
      username,
      ad_id: adId,
      amount: 0.005,  // Default reward
      status: 'completed'
    })
    .select()
    .single();

  // Update user balance
  const { data: user } = await supabase
    .from('merchants')
    .select('available_balance')
    .eq('pi_username', username)
    .single();

  await supabase
    .from('merchants')
    .update({
      available_balance: (user?.available_balance || 0) + 0.005
    })
    .eq('pi_username', username);

  return reward;
}
```

#### 5. process-withdrawal

**Purpose:** Process withdrawal payment to merchant wallet

```typescript
// supabase/functions/process-withdrawal/index.ts

interface ProcessWithdrawalRequest {
  withdrawalId: string;
  txid: string;
}

async function processWithdrawal(supabase, request: ProcessWithdrawalRequest) {
  const { withdrawalId, txid } = request;

  // Get withdrawal details
  const { data: withdrawal } = await supabase
    .from('withdrawal_requests')
    .select('*, merchants(*)')
    .eq('id', withdrawalId)
    .single();

  // Update withdrawal status
  const { data: updated } = await supabase
    .from('withdrawal_requests')
    .update({
      status: 'completed',
      pi_transaction_id: txid,
      completed_at: new Date()
    })
    .eq('id', withdrawalId)
    .select()
    .single();

  // Create completion notification
  await supabase
    .from('notifications')
    .insert({
      merchant_id: withdrawal.merchant_id,
      type: 'withdrawal_completed',
      message: `Withdrawal of π ${withdrawal.final_amount} completed`,
      data: { withdrawal_id: withdrawalId, txid }
    });

  return updated;
}
```

#### 6. send-download-email

**Purpose:** Email download link to buyer

```typescript
// supabase/functions/send-download-email/index.ts

interface SendEmailRequest {
  transactionId: string;
  buyerEmail: string;
  downloadUrl: string;
}

async function sendDownloadEmail(
  supabase,
  resendApiKey,
  request: SendEmailRequest
) {
  const { transactionId, buyerEmail, downloadUrl } = request;

  // Send via Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'DropPay <noreply@droppay.space>',
      to: buyerEmail,
      subject: 'Your DropPay Purchase - Download Link',
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Your download link is below. It will expire in 24 hours.</p>
        <a href="${downloadUrl}" class="button">Download</a>
      `
    })
  });

  if (!response.ok) throw new Error('Email send failed');

  // Log email sent
  await supabase
    .from('email_logs')
    .insert({
      transaction_id: transactionId,
      recipient: buyerEmail,
      type: 'download_link',
      sent_at: new Date()
    });

  return { sent: true };
}
```

---

## Payment Flows

### Complete Payment Flow Sequence

```
MERCHANT                    CLIENT                     PI SDK                    EDGE FUNCTIONS          DATABASE
    │                          │                          │                           │                      │
    │ 1. Create Link           │                          │                           │                      │
    ├──────────────────────────►                          │                           │                      │
    │                          │                          │                           │                      ├─ Insert payment_link
    │                          │                          │                           │                      │
    │                          │ 2. Request /pay/slug     │                           │                      │
    │                          ◄──────────────────────────┤                           │                      │
    │                          │                          │                           │                      ├─ Fetch link
    │                          │ 3. Authenticate         │                           │                      │
    │                          ├─────────────────────────►                           │                      │
    │                          │◄─────────────────────────┤                           │                      │
    │                          │                          │                           │                      │
    │                          │ 4. createPayment()      │                           │                      │
    │                          ├─────────────────────────►                           │                      │
    │                          │                          │                           │                      │
    │                          │ 5. onReadyForServerApproval (paymentId)              │                      │
    │                          ├──────────────────────────────────────────────────────►                      │
    │                          │                          │         approve-payment  │                      │
    │                          │                          │                          ├──────────────────────┤
    │                          │                          │         /v2/payments/{id}/approve               │
    │                          │                          │◄──────────────────────┘                          │
    │                          │◄──────────────────────────                           │                      │
    │                          │                          │                           │                      │
    │                          │ 6. onReadyForServerCompletion (paymentId, txid)      │                      │
    │                          ├──────────────────────────────────────────────────────►                      │
    │                          │                          │         complete-payment │                      │
    │                          │                          │                          ├──────────────────────┤
    │                          │                          │          /v2/payments/{id}/complete            │
    │                          │                          │                          │                      │
    │                          │                          │         verify-payment  │                      │
    │                          │                          │                          ├──────────────────────┤
    │                          │                          │          /horizon/transaction                   │
    │                          │                          │         Blockchain check                        │
    │                          │                          │                          │                      │
    │                          │◄──────────────────────────────────────────────────────                      │
    │                          │                          │                          │                      ├─ Insert transaction
    │                          │ 7. Deliver Content       │                           │                      ├─ Update balance
    │                          ├─────────────────────────────────────────────────────►                      ├─ Record fee
    │                          │                          │                           │                      │
    │                          │◄─────────────────────────────────────────────────────┤                      │
    │ 8. Receive Notification  │                          │                           │                      │
    ◄──────────────────────────┤                          │                           │                      │
    │ 9. View Dashboard        │                          │                           │                      │
    ├──────────────────────────────────────────────────────────────────────────────────────────────────────►
```

### Quick Checkout Example

**User Journey:**

```
1. Click "Buy Now" on payment link
                ↓
2. System detects Pi Browser or shows warning
                ↓
3. Authenticate with Pi (if not logged in)
                ↓
4. Review payment details (amount, currency, delivery method)
                ↓
5. Click "Pay π X.XX"
                ↓
6. Pi creates payment transaction
                ↓
7. Merchant approves (via Edge Function)
                ↓
8. User completes payment (Pi SDK callback)
                ↓
9. Server verifies on blockchain
                ↓
10. Content delivered (instant/email/redirect)
                ↓
11. Confirmation page + receipt
```

---

## Database Schema

### Core Tables

#### merchants

```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_user_id VARCHAR(255) UNIQUE NOT NULL,
  pi_username VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(255),
  business_name VARCHAR(255),
  business_description TEXT,
  email VARCHAR(255),
  phone VARCHAR(255),
  country VARCHAR(100),
  profile_image_url TEXT,
  
  available_balance NUMERIC(19,4) DEFAULT 0,
  total_revenue NUMERIC(19,4) DEFAULT 0,
  total_fees NUMERIC(19,4) DEFAULT 0,
  
  subscription_status VARCHAR(50) DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  api_key VARCHAR(255) UNIQUE,
  
  kyc_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_balance CHECK (available_balance >= 0)
);

CREATE INDEX idx_merchants_pi_username ON merchants(pi_username);
CREATE INDEX idx_merchants_email ON merchants(email);
```

#### payment_links

```sql
CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  image_url TEXT,
  
  amount NUMERIC(19,4) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  pricing_type VARCHAR(50) DEFAULT 'one_time',
  
  min_amount NUMERIC(19,4),
  suggested_amounts NUMERIC(19,4)[],
  
  delivery_type VARCHAR(50) DEFAULT 'instant',
  redirect_url TEXT,
  content_file TEXT,
  
  enable_waitlist BOOLEAN DEFAULT FALSE,
  ask_questions BOOLEAN DEFAULT FALSE,
  checkout_questions JSONB,
  
  stock INTEGER,
  is_unlimited_stock BOOLEAN DEFAULT TRUE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_payment_links_merchant ON payment_links(merchant_id);
CREATE INDEX idx_payment_links_slug ON payment_links(slug);
```

#### transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id UUID NOT NULL REFERENCES payment_links(id),
  
  pi_payment_id VARCHAR(255),
  pi_transaction_id VARCHAR(255) UNIQUE,
  
  amount NUMERIC(19,4) NOT NULL,
  currency VARCHAR(3),
  
  buyer_username VARCHAR(255),
  buyer_email VARCHAR(255),
  
  status VARCHAR(50) DEFAULT 'pending',
  blockchain_verified BOOLEAN DEFAULT FALSE,
  
  sender_address VARCHAR(255),
  receiver_address VARCHAR(255),
  
  completed_at TIMESTAMP,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

CREATE INDEX idx_transactions_payment_link ON transactions(payment_link_id);
CREATE INDEX idx_transactions_pi_txid ON transactions(pi_transaction_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_username);
```

#### withdrawal_requests

```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  
  requested_amount NUMERIC(19,4) NOT NULL,
  platform_fee NUMERIC(19,4),
  final_amount NUMERIC(19,4),
  
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  
  pi_transaction_id VARCHAR(255),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'failed')),
  CONSTRAINT valid_amount CHECK (requested_amount > 0)
);

CREATE INDEX idx_withdrawals_merchant ON withdrawal_requests(merchant_id);
CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status);
```

#### ad_rewards

```sql
CREATE TABLE ad_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  ad_id VARCHAR(255) NOT NULL,
  amount NUMERIC(19,4) DEFAULT 0.005,
  
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(username, ad_id)
);

CREATE INDEX idx_ad_rewards_username ON ad_rewards(username);
```

#### platform_fees

```sql
CREATE TABLE platform_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  withdrawal_id UUID REFERENCES withdrawal_requests(id),
  
  amount NUMERIC(19,4) NOT NULL,
  type VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_fees_transaction ON platform_fees(transaction_id);
CREATE INDEX idx_platform_fees_withdrawal ON platform_fees(withdrawal_id);
```

#### tracking_links

```sql
CREATE TABLE tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id UUID NOT NULL REFERENCES payment_links(id) ON DELETE CASCADE,
  
  view_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tracking_links_payment_link ON tracking_links(payment_link_id);
```

#### tracking_events

```sql
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id UUID NOT NULL REFERENCES tracking_links(id),
  
  event_type VARCHAR(50),
  device_type VARCHAR(100),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tracking_events_link ON tracking_events(tracking_link_id);
CREATE INDEX idx_tracking_events_type ON tracking_events(event_type);
```

---

## Deployment Guide

### Step 1: Prepare Environment

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref xoofailhzhfyebzpzrfs
```

### Step 2: Set Secrets

```bash
# Set all required secrets
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
supabase secrets set SUPABASE_URL="https://xoofailhzhfyebzpzrfs.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
supabase secrets set ALLOW_ORIGIN="https://droppay.space"
supabase secrets set RESEND_API_KEY="re_your_resend_key"

# Verify secrets
supabase secrets list
```

### Step 3: Deploy Functions

```bash
# Deploy individual functions
supabase functions deploy approve-payment
supabase functions deploy complete-payment
supabase functions deploy verify-payment
supabase functions deploy verify-ad-reward
supabase functions deploy process-withdrawal
supabase functions deploy send-download-email
supabase functions deploy delete-account

# Or deploy all at once
supabase functions deploy
```

### Step 4: Run Migrations

```bash
# Apply all pending migrations
supabase db push

# Or view migration status
supabase migration list
```

### Step 5: Build & Deploy Frontend

```bash
# Development
npm run dev

# Production build
npm run build

# Test production build locally
npm run preview

# Deploy to Vercel/hosting
git push  # If using Vercel GitHub integration
```

### Step 6: Verification

```bash
# Test functions are working
curl -X POST https://xoofailhzhfyebzpzrfs.functions.supabase.co/approve-payment \
  -H "Authorization: Bearer anon_token" \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "test"}'

# Check logs
supabase functions list
supabase functions download approve-payment
```

---

## Testing & Validation

### Manual Testing Checklist

- [ ] **Authentication**
  - [ ] Login with Pi browser
  - [ ] Session persists on refresh
  - [ ] Logout clears session
  - [ ] Demo mode works without Pi browser

- [ ] **Payment Link Creation**
  - [ ] Create one-time payment link
  - [ ] Create recurring link
  - [ ] Upload file for delivery
  - [ ] Set stock limits
  - [ ] Add checkout questions
  - [ ] Preview link before publishing

- [ ] **Checkout Process**
  - [ ] Access payment link by slug
  - [ ] Display correct amount & currency
  - [ ] Show Pi Browser warning if needed
  - [ ] Create payment with Pi SDK
  - [ ] Complete payment flow
  - [ ] Show success page

- [ ] **Digital Delivery**
  - [ ] Instant download link works
  - [ ] Email delivery (if configured)
  - [ ] Redirect URL works
  - [ ] Download links expire properly

- [ ] **Analytics**
  - [ ] View count increments
  - [ ] Conversion count increments
  - [ ] Conversion rate calculated
  - [ ] Revenue summed correctly

- [ ] **Withdrawals**
  - [ ] Merchant can request withdrawal
  - [ ] Admin can approve/reject
  - [ ] Platform fee calculated (2%)
  - [ ] Balance updated
  - [ ] Notifications sent

- [ ] **Admin Panel**
  - [ ] Only accessible to admin
  - [ ] Can view all withdrawals
  - [ ] Can approve/reject
  - [ ] Can view fees collected

### Automated Tests

```bash
# Run test suite
npm run test

# Run with coverage
npm run test:coverage

# Test specific file
npm run test -- src/pages/PayPage.tsx
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Pi SDK Not Loading

**Error:** `Pi is not defined`

**Solution:**
```html
<!-- Ensure Pi SDK is loaded in index.html -->
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
```

#### 2. CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
```bash
# Update ALLOW_ORIGIN secret
supabase secrets set ALLOW_ORIGIN="https://your-domain.com"

# Redeploy affected functions
supabase functions deploy approve-payment
```

#### 3. Payment Verification Fails

**Error:** `Transaction not found on blockchain`

**Solution:**
- Wait 2-3 minutes for Stellar network confirmation
- Check transaction ID is correct
- Verify network is set to mainnet (`sandbox: false`)

#### 4. Email Not Sending

**Error:** `Email send failed`

**Solution:**
```bash
# Verify Resend API key is set
supabase secrets set RESEND_API_KEY="re_your_key"

# Redeploy function
supabase functions deploy send-download-email

# Check email format
# Ensure buyerEmail is valid
```

#### 5. File Download Not Working

**Error:** `Signed URL expired`

**Solution:**
```typescript
// Generate new signed URL with longer expiry
const { data: signedUrl } = await supabase
  .storage
  .from('payment-content')
  .createSignedUrl(filePath, 86400); // 24 hours

// Or use download endpoint
const { data } = await supabase
  .storage
  .from('payment-content')
  .download(filePath);
```

#### 6. Merchant Balance Not Updating

**Error:** `Balance shows 0 after payment`

**Solution:**
```sql
-- Check transaction status
SELECT * FROM transactions 
WHERE payment_link_id = 'your-link-id'
ORDER BY created_at DESC;

-- Verify merchant balance
SELECT available_balance FROM merchants 
WHERE pi_username = 'username';

-- Manually update if needed (admin only)
UPDATE merchants 
SET available_balance = available_balance + amount
WHERE id = 'merchant-id';
```

---

## Security Best Practices

### Authentication & Authorization

✅ **DO:**
- Store session tokens securely
- Use HTTPS only in production
- Implement rate limiting on APIs
- Validate all inputs server-side
- Use Supabase RLS policies

❌ **DON'T:**
- Expose service role keys in frontend code
- Store sensitive data in localStorage
- Commit `.env` with real keys
- Trust client-side validation alone

### Payment Security

✅ **DO:**
- Verify payments on blockchain before delivering
- Use idempotency keys for payment operations
- Log all payment operations
- Monitor for fraud patterns

❌ **DON'T:**
- Complete payments without Pi API verification
- Bypass blockchain verification
- Skip email validation for digital delivery

### Data Protection

✅ **DO:**
- Enable RLS on all tables
- Use row-level policies for access control
- Encrypt sensitive data in transit (TLS)
- Implement GDPR delete endpoints

❌ **DON'T:**
- Store plain-text passwords
- Share private keys
- Expose user wallets unnecessarily

### API Security

```typescript
// Example: Secure Edge Function
serve(async (req) => {
  // 1. Validate origin
  const origin = req.headers.get('origin');
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response('Unauthorized', { status: 403 });
  }

  // 2. Validate auth token
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Missing auth', { status: 401 });
  }

  // 3. Validate payload
  const body = await req.json();
  if (!isValidPayload(body)) {
    return new Response('Invalid payload', { status: 400 });
  }

  // 4. Use service role key (server-side only)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Never expose this
  );

  // 5. Implement idempotency
  const idempotencyKey = body.idempotency_key;
  // ... check if already processed ...

  return new Response(JSON.stringify(result));
});
```

---

## Support & Resources

### Documentation
- [Pi Network Docs](https://developers.minepi.com)
- [Supabase Docs](https://supabase.com/docs)
- [Stellar Docs](https://developers.stellar.org)

### Getting Help
- **Issues:** GitHub Issues repository
- **Email:** support@droppay.space
- **Discord:** [Community Server](https://discord.gg/droppay)

### API Status
- [Status Page](https://status.droppay.space)
- [Pi API Status](https://status.minepi.com)

---

## Changelog

### Version 2.0 (December 30, 2025)
- ✅ Complete Pi mainnet integration
- ✅ Blockchain verification
- ✅ Withdrawal request system with admin approval
- ✅ Analytics & tracking
- ✅ Ad network integration
- ✅ Subscription management
- ✅ Multi-currency support
- ✅ Email delivery with Resend

### Version 1.0
- Initial release with payment links & checkout

---

**DropPay © 2025 - All Rights Reserved**
