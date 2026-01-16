# Pi Network Integration Guide

Complete setup and troubleshooting guide for Pi Authentication, Pi Payments, and Pi Ad Network in DropPay.

---

## Overview

DropPay integrates three Pi Network features:
1. **Pi Authentication** - User login via Pi Browser SDK
2. **Pi Payments** - Accept Pi cryptocurrency payments
3. **Pi Ad Network** - Reward users for watching ads

All features require the **Pi Browser** app and mainnet configuration (`sandbox: false`).

---

## Prerequisites

### 1. Pi Developer Account
- Sign up at [https://developers.minepi.com](https://developers.minepi.com)
- Create an app and obtain your `PI_API_KEY`

### 2. Pi Browser
- Download from [https://minepi.com](https://minepi.com)
- Users must open your app in Pi Browser for full functionality

### 3. Environment Variables

**Supabase Edge Functions** (set via `supabase secrets set`):
```bash
PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
SUPABASE_URL=https://xoofailhzhfyebzpzrfs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.bS1_S1vkHxDl1Y9tLrBaFbej02ZF2EQDSkNQcwGe8I4
ALLOW_ORIGIN=* # Or specific frontend domain for CORS
```

---

## 1. Pi Authentication

### How It Works
- Users authenticate via Pi Browser SDK
- Requests scopes: `username`, `payments`, `wallet_address`
- Creates/updates merchant record in Supabase
- Maintains session in localStorage

### Frontend Implementation

**Location:** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)

**Key Features:**
- Automatic Pi SDK initialization
- Production mainnet mode (`sandbox: false`)
- Demo mode fallback for non-Pi browsers
- Session persistence

**Usage Example:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { piUser, login, isPiBrowser } = useAuth();
  
  if (!isPiBrowser) {
    return <div>Please open in Pi Browser</div>;
  }
  
  if (!piUser) {
    return <button onClick={login}>Login with Pi</button>;
  }
  
  return <div>Welcome, @{piUser.username}!</div>;
}
```

### Scopes Explained
- `username` - User's Pi username
- `payments` - Permission to create payments
- `wallet_address` - User's Pi wallet address (for verification)

### Testing
1. Open app in Pi Browser
2. Click "Login with Pi"
3. Approve scopes in Pi dialog
4. Check browser console for: `Pi authentication successful: {username}`

---

## 2. Pi Payments

### How It Works
1. User initiates payment (payment link, subscription, etc.)
2. Frontend calls `Pi.createPayment()` with amount + metadata
3. **Server Approval:** Edge function `approve-payment` validates with Pi API
4. User approves in Pi Browser
5. **Server Completion:** Edge function `complete-payment` finalizes transaction
6. **Blockchain Verification:** Edge function `verify-payment` confirms on-chain

### Edge Functions

#### approve-payment
**Location:** [supabase/functions/approve-payment/index.ts](supabase/functions/approve-payment/index.ts)

**Endpoint:** `https://api.minepi.com/v2/payments/{paymentId}/approve`

**Requires:** `PI_API_KEY`

#### complete-payment
**Location:** [supabase/functions/complete-payment/index.ts](supabase/functions/complete-payment/index.ts)

**Endpoint:** `https://api.minepi.com/v2/payments/{paymentId}/complete`

**Requires:** `PI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

**Creates:** Transaction record in `transactions` table

#### verify-payment
**Location:** [supabase/functions/verify-payment/index.ts](supabase/functions/verify-payment/index.ts)

**Endpoint:** `https://api.minepi.com/v2/transactions/{txid}`

**Verifies:**
- Transaction amount matches expected
- Receiver address matches merchant wallet
- Transaction status is successful

### Frontend Payment Flow

**Example:** [src/pages/PayPage.tsx](src/pages/PayPage.tsx)

```tsx
const Pi = (window as any).Pi;

// 1. Create payment
const paymentData = {
  amount: 10.5,
  memo: "Payment for: Product Name",
  metadata: {
    payment_link_id: "link_123",
    merchant_id: "merchant_456",
  },
};

const callbacks = {
  onReadyForServerApproval: async (paymentId: string) => {
    // Call edge function to approve
    await supabase.functions.invoke('approve-payment', {
      body: { paymentId, paymentLinkId: "link_123" },
    });
  },
  
  onReadyForServerCompletion: async (paymentId: string, txid: string) => {
    // Complete payment and record transaction
    const response = await supabase.functions.invoke('complete-payment', {
      body: { 
        paymentId, 
        txid, 
        paymentLinkId: "link_123",
        payerUsername: piUser.username,
      },
    });
    
    // Verify on blockchain (optional)
    await supabase.functions.invoke('verify-payment', {
      body: { txid, expectedAmount: 10.5, paymentLinkId: "link_123" },
    });
  },
  
  onCancel: () => console.log('Payment cancelled'),
  onError: (error) => console.error('Payment error:', error),
};

await Pi.createPayment(paymentData, callbacks);
```

### Deploy Edge Functions
```bash
supabase functions deploy approve-payment
supabase functions deploy complete-payment
supabase functions deploy verify-payment
```

### Testing Payments
1. Open app in Pi Browser
2. Create a payment link or subscription
3. Click "Pay with Pi"
4. Approve payment in Pi dialog
5. Check Supabase `transactions` table for record
6. Verify `status = 'completed'` and `blockchain_verified = true`

---

## 3. Pi Ad Network

### How It Works
1. Check if Pi Ad Network is supported via `Pi.nativeFeaturesList()`
2. Request rewarded ad: `Pi.Ads.requestAd('rewarded')`
3. Show ad: `Pi.Ads.showAd('rewarded')`
4. On completion, verify with Pi API via edge function
5. Grant reward (π0.005 per ad)

### Edge Function

#### verify-ad-reward
**Location:** [supabase/functions/verify-ad-reward/index.ts](supabase/functions/verify-ad-reward/index.ts)

**Endpoint:** `https://api.minepi.com/v2/ads_network/status/{adId}`

**Requires:** `PI_API_KEY` (optional for verification, works without)

**Creates:** Record in `ad_rewards` table with status `granted` or `pending`

### Frontend Implementation

**Location:** [src/pages/WatchAds.tsx](src/pages/WatchAds.tsx)

**Flow:**
```tsx
const Pi = (window as any).Pi;

// 1. Check support
const features = await Pi.nativeFeaturesList();
const isSupported = features.includes('ad_network');

// 2. Check if ad is ready
const { ready } = await Pi.Ads.isAdReady('rewarded');

// 3. Request ad if not ready
if (!ready) {
  const response = await Pi.Ads.requestAd('rewarded');
  if (response.result !== 'AD_LOADED') {
    // Ad unavailable, try later
  }
}

// 4. Show ad
const result = await Pi.Ads.showAd('rewarded');

// 5. Verify and grant reward
if (result.result === 'AD_REWARDED' && result.adId) {
  const response = await supabase.functions.invoke('verify-ad-reward', {
    body: { 
      adId: result.adId, 
      merchantId: merchant.id, 
      piUsername: piUser.username 
    },
  });
  
  if (response.data?.verified) {
    // Reward granted!
  }
}
```

### Deploy Edge Function
```bash
supabase functions deploy verify-ad-reward
```

### Testing Ads
1. Open app in Pi Browser
2. Go to "Watch Ads & Earn Drop"
3. Click "Watch Ad & Earn Drop"
4. Watch video to completion
5. Check `ad_rewards` table for new record
6. Verify `status = 'granted'` and `reward_amount = 0.005`

---

## Common Issues

### 1. "Pi SDK not available"
**Cause:** App not opened in Pi Browser

**Fix:** Share link with instruction to open in Pi Browser

### 2. "Missing PI_API_KEY secret"
**Cause:** Edge function secret not set

**Fix:**
```bash
supabase secrets set PI_API_KEY=your_api_key_here
```

### 3. CORS Errors
**Cause:** Frontend domain not allowed

**Fix:**
```bash
supabase secrets set ALLOW_ORIGIN=https://your-domain.com
# Or use * for development
supabase secrets set ALLOW_ORIGIN=*
```

### 4. Payment Approval Fails (401/403)
**Cause:** Invalid or missing PI_API_KEY

**Verify:**
- API key is from [https://developers.minepi.com](https://developers.minepi.com)
- Secret is set in Supabase (not just `.env` file)
- Edge functions are redeployed after setting secrets

### 5. Blockchain Verification Fails
**Cause:** Transaction not yet confirmed on blockchain

**Fix:** This is normal for new transactions. Verification may take a few minutes. Payment still completes successfully; blockchain verification is asynchronous.

### 6. Ad Network Not Supported
**Cause:** Pi Ad Network not available in all regions/versions

**Check:**
```tsx
const features = await Pi.nativeFeaturesList();
console.log('Supported features:', features);
```

If `ad_network` is missing, feature is unavailable for that user.

### 7. Sandbox vs Production
**Always use:** `sandbox: false` for production

**Check in code:**
```tsx
await Pi.init({ version: '2.0', sandbox: false });
```

Files to verify:
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx#L63)
- [src/pages/WatchAds.tsx](src/pages/WatchAds.tsx)
- [src/pages/Subscription.tsx](src/pages/Subscription.tsx)
- [src/pages/Pricing.tsx](src/pages/Pricing.tsx)

---

## Security Best Practices

1. **Never expose PI_API_KEY in frontend** - Always use edge functions
2. **Use service role key only in edge functions** - Never in frontend
3. **Validate payments server-side** - Don't trust client data
4. **Verify blockchain transactions** - Double-check on-chain
5. **Set specific ALLOW_ORIGIN in production** - Don't use `*` in prod

---

## Testing Checklist

### Authentication
- [ ] Pi SDK initializes (`sandbox: false`)
- [ ] Login button appears for unauthenticated users
- [ ] Authentication dialog shows correct scopes
- [ ] User data persists in localStorage
- [ ] Merchant record created in Supabase

### Payments
- [ ] Payment links load correctly
- [ ] Pi payment dialog opens with correct amount
- [ ] Approval edge function succeeds
- [ ] Completion edge function creates transaction
- [ ] Blockchain verification runs (async)
- [ ] Transaction status updates to `completed`

### Ad Network
- [ ] Ad support check runs on page load
- [ ] Ad ready state updates correctly
- [ ] Ad plays without errors
- [ ] Reward verification succeeds
- [ ] Reward record created with correct amount
- [ ] Total earned updates on page

---

## Deployment Steps

1. **Set all secrets:**
   ```bash
   supabase secrets set PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
   supabase secrets set SUPABASE_URL=https://xoofailhzhfyebzpzrfs.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.bS1_S1vkHxDl1Y9tLrBaFbej02ZF2EQDSkNQcwGe8I4
   supabase secrets set ALLOW_ORIGIN=*
   ```

2. **Deploy edge functions:**
   ```bash
   supabase functions deploy approve-payment
   supabase functions deploy complete-payment
   supabase functions deploy verify-payment
   supabase functions deploy verify-ad-reward
   ```

3. **Test in Pi Browser:**
   - Open app URL in Pi Browser
   - Test authentication flow
   - Create test payment (small amount)
   - Watch test ad if available

4. **Monitor logs:**
   - Supabase Dashboard > Edge Functions > Logs
   - Browser Console (F12)
   - Network tab for API calls

---

## Support Resources

- **Pi Developer Portal:** [https://developers.minepi.com](https://developers.minepi.com)
- **Pi SDK Documentation:** [https://github.com/pi-apps/pi-platform-docs](https://github.com/pi-apps/pi-platform-docs)
- **Pi Community:** [https://pinetwork-official.medium.com](https://pinetwork-official.medium.com)
- **Supabase Edge Functions:** [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)

---

## Quick Reference

### Pi SDK Methods
```tsx
// Initialize
await Pi.init({ version: '2.0', sandbox: false });

// Authenticate
const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);

// Create Payment
await Pi.createPayment(paymentData, callbacks);

// Check Ad Support
const features = await Pi.nativeFeaturesList();

// Ad Methods
await Pi.Ads.isAdReady('rewarded');
await Pi.Ads.requestAd('rewarded');
const result = await Pi.Ads.showAd('rewarded');
```

### Edge Function URLs
```
POST https://<project-id>.supabase.co/functions/v1/approve-payment
POST https://<project-id>.supabase.co/functions/v1/complete-payment
POST https://<project-id>.supabase.co/functions/v1/verify-payment
POST https://<project-id>.supabase.co/functions/v1/verify-ad-reward
```

### Pi API Endpoints
```
POST https://api.minepi.com/v2/payments/{paymentId}/approve
POST https://api.minepi.com/v2/payments/{paymentId}/complete
GET  https://api.minepi.com/v2/transactions/{txid}
GET  https://api.minepi.com/v2/ads_network/status/{adId}
```

---

## Changelog

### December 29, 2025
- ✅ Fixed CORS headers across all edge functions
- ✅ Added environment variable validation
- ✅ Standardized `sandbox: false` for production mainnet
- ✅ Added `wallet_address` scope to all auth flows
- ✅ Improved error messages and logging
- ✅ Updated blockchain verification to Pi API v2
- ✅ Added comprehensive integration guide

---

**Need help?** Check browser console and Supabase logs for detailed error messages.
