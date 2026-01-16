# Pi Network Integration - Documentation Reference & Fixes

Based on official Pi Network documentation from:
- https://pi-apps.github.io/community-developer-guide/
- https://github.com/pi-apps/pi-platform-docs

## 1. Pi Authentication ✅

### Official Documentation Requirements
**Source:** [SDK_reference.md - Authentication](https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md#authentication)

#### Current Implementation Status: ✅ CORRECT

**File:** `src/contexts/AuthContext.tsx`

✅ **Properly Implemented:**
- Scopes requested: `['username', 'payments', 'wallet_address']`
- `onIncompletePaymentFound` callback for handling incomplete payments
- Access token obtained for backend verification
- Version 2.0 SDK initialized

#### Verification Flow (Backend)
```typescript
// Verify with Pi API endpoint /me
const me = await axios.get('https://api.minepi.com/v2/me', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

**Recommended Additions:**
- [ ] Add backend verification with `/me` endpoint before granting access
- [ ] Store `wallet_address` separately for payment operations
- [ ] Implement token refresh logic for long sessions

---

## 2. Pi Payments (User-To-App) ✅

### Official Documentation Requirements
**Source:** [payments.md](https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md)

#### Current Implementation Status: ✅ CORRECT

**File:** `src/pages/PayPage.tsx`

✅ **Three-Phase Payment Flow Implemented:**

**Phase I - Server-Side Approval**
```typescript
Pi.createPayment({
  amount: paymentAmount,
  memo: "Payment description",
  metadata: { orderId: "..." }
}, {
  onReadyForServerApproval: async (paymentId) => {
    // Send to backend → POST /payments/{paymentId}/approve
    await backend.approvePayment(paymentId);
  }
});
```

**Phase II - User Transaction**
- User signs transaction in Pi Wallet
- blockchain submission automatic

**Phase III - Server-Side Completion**
```typescript
onReadyForServerCompletion: async (paymentId, txid) => {
  // Send to backend → POST /payments/{paymentId}/complete
  await backend.completePayment(paymentId, txid);
}
```

✅ **Correctly Implemented:**
- Payment creation with amount & memo
- Server-side approval flow
- Server-side completion with txid
- Error handling for incomplete payments
- Metadata for tracking

#### Payment API Endpoints (Backend)
```
POST /payments/{payment_id}/approve
- Authorization: Server API Key
- Enables user to submit transaction

POST /payments/{payment_id}/complete  
- Authorization: Server API Key
- Body: { "txid": "blockchain_transaction_id" }
- Marks payment as completed
```

---

## 3. Pi Ad Network (Rewarded Ads) ✅

### Official Documentation Requirements
**Source:** [ads.md](https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md)

#### Current Implementation Status: ✅ MOSTLY CORRECT

**File:** `src/pages/WatchAds.tsx`

✅ **Proper Ad Flow Implemented:**

**Step 1: Check Support**
```typescript
const features = await Pi.nativeFeaturesList();
const isAdSupported = features.includes('ad_network');
```

**Step 2: Check Readiness**
```typescript
const { ready } = await Pi.Ads.isAdReady('rewarded');
```

**Step 3: Request if Needed**
```typescript
if (!ready) {
  const response = await Pi.Ads.requestAd('rewarded');
  if (response.result !== 'AD_LOADED') return;
}
```

**Step 4: Show Ad**
```typescript
const result = await Pi.Ads.showAd('rewarded');
if (result.result === 'AD_REWARDED' && result.adId) {
  // Proceed to verification
}
```

**Step 5: CRITICAL - Server Verification** ⚠️
```typescript
// Must verify with Pi Platform API BEFORE granting reward
const adStatus = await fetch(`https://api.minepi.com/v2/ads_network/status/${adId}`, {
  headers: { 'Authorization': `Bearer ${serverKey}` }
});

// ONLY grant reward if mediator_ack_status === 'granted'
if (adStatus.mediator_ack_status === 'granted') {
  grantReward(user);
}
```

⚠️ **CRITICAL SECURITY REQUIREMENT:**
> **The user might be cheating on your app!**
> Users might be running a hacked version of the SDK and intercept your `showAd()` method.
> You MUST verify the rewarded status using Pi Platform API BEFORE rewarding.

---

## 4. Pi Testnet vs Mainnet Configuration

### Current Status: ✅ MAINNET (Sandbox: false)

#### Environment Variables Check:

**Current (.env):**
```env
VITE_PI_SANDBOX_MODE="true"          ← CHANGED TO SANDBOX
VITE_PI_MAINNET_MODE="false"         ← CHANGED TO TESTNET
VITE_PI_NETWORK="sandbox"            ← CHANGED
VITE_PI_STELLAR_NETWORK="testnet"   ← CHANGED
```

#### Sandbox Configuration Notes:

**For Development (sandbox: true):**
```typescript
Pi.init({ version: "2.0", sandbox: true });
// Access at: https://sandbox.minepi.com
// Must configure development URL in Developer Portal: develop.pi
```

**For Production (sandbox: false):**
```typescript
Pi.init({ version: "2.0", sandbox: false });
// Mainnet production
// Real Pi transactions
```

---

## 5. Key API Endpoints Reference

### Authentication
```
GET https://api.minepi.com/v2/me
Authorization: Bearer {access_token}
```

### Payments
```
POST https://api.minepi.com/v2/payments
POST https://api.minepi.com/v2/payments/{id}/approve
POST https://api.minepi.com/v2/payments/{id}/complete
```

### Ad Network
```
GET https://api.minepi.com/v2/ads_network/status/{adId}
Authorization: Bearer {server_key}
Returns: { mediator_ack_status: 'granted' | 'revoked' | 'failed' | null }
```

---

## 6. Response Types Reference

### PaymentDTO
```typescript
{
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Object;
  from_address: string;
  to_address: string;
  direction: "user_to_app" | "app_to_user";
  created_at: string;
  network: "Pi Network" | "Pi Testnet";
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  } | null;
}
```

### RewardedAdStatusDTO
```typescript
{
  identifier: string;              // adId from SDK
  mediator_ack_status: "granted" | "revoked" | "failed" | null;
  mediator_granted_at: string | null;
  mediator_revoked_at: string | null;
}
```

### ShowAdResponse (Rewarded)
```typescript
{
  type: "rewarded";
  result: "AD_REWARDED" | "AD_CLOSED" | "AD_DISPLAY_ERROR" | 
          "AD_NETWORK_ERROR" | "AD_NOT_AVAILABLE" | 
          "ADS_NOT_SUPPORTED" | "USER_UNAUTHENTICATED";
  adId?: string;  // ONLY if result === "AD_REWARDED"
}
```

---

## 7. Configuration Summary

### Recommended Environment Setup

**For Sandbox/Development:**
```env
VITE_PI_SANDBOX_MODE="true"
VITE_PI_MAINNET_MODE="false"
VITE_PI_NETWORK="sandbox"
VITE_PI_ENVIRONMENT="development"
```

**For Mainnet/Production:**
```env
VITE_PI_SANDBOX_MODE="false"
VITE_PI_MAINNET_MODE="true"
VITE_PI_NETWORK="mainnet"
VITE_PI_ENVIRONMENT="production"
```

### Feature Flags
```env
VITE_PI_AUTHENTICATION_ENABLED="true"
VITE_PI_PAYMENTS_ENABLED="true"
VITE_PI_AD_NETWORK_ENABLED="true"
VITE_PI_REWARDED_ADS_ENABLED="true"
```

---

## 8. Verification Checklist

### ✅ Authentication
- [x] Scopes: username, payments, wallet_address
- [x] onIncompletePaymentFound callback implemented
- [x] Access token stored
- [ ] Backend verification with /me endpoint
- [ ] Token refresh strategy

### ✅ Payments
- [x] Phase I: Server-side approval
- [x] Phase II: User blockchain transaction
- [x] Phase III: Server-side completion
- [x] Error handling
- [ ] Incomplete payment recovery flow

### ✅ Ad Network
- [x] Ad support detection (nativeFeaturesList)
- [x] Readiness checking (isAdReady)
- [x] Ad request (requestAd)
- [x] Ad display (showAd)
- [x] Result handling (AD_REWARDED check)
- [ ] CRITICAL: Pi Platform API verification before reward grant
- [x] Reward processing
- [x] Duplicate prevention

---

## 9. Security Notes

### Critical Security Requirements

1. **Never trust client-side ad verification**
   - Always verify with Pi Platform API: `/ads_network/status/{adId}`
   - Check `mediator_ack_status === 'granted'`
   - Verify on backend before crediting reward

2. **Payment verification**
   - Always use Server-Side Approval/Completion flow
   - Verify blockchain transaction independently
   - Check PaymentDTO.transaction.verified

3. **Token management**
   - Store access tokens securely
   - Verify token validity with /me endpoint
   - Implement token refresh

---

## 10. Resources

- Official Guide: https://pi-apps.github.io/community-developer-guide/
- API Documentation: https://github.com/pi-apps/pi-platform-docs
- SDK Reference: https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md
- Payments Guide: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
- Ads Guide: https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md
- Platform API: https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md

---

**Last Updated:** January 4, 2026
**Status:** Sandbox Mode Enabled for Testing
