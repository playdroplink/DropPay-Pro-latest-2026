# DropPay Pi Payment API Reference

**Date**: January 8, 2026  
**Version**: 2.0  
**Environment**: Production Mainnet  
**Status**: ✅ Active

---

## 1. Pi SDK Initialization

### Configuration

```javascript
// Mainnet Production Configuration
window.Pi.init({ 
  version: '2.0', 
  sandbox: false  // IMPORTANT: Production mainnet
});
```

### Environment Variables

```env
VITE_PI_SDK_VERSION="2.0"
VITE_PI_SDK_URL="https://sdk.minepi.com/pi-sdk.js"
VITE_PI_SANDBOX_MODE="false"
VITE_PI_NETWORK="mainnet"
VITE_PI_MAINNET_MODE="true"
VITE_PI_PRODUCTION_MODE="true"
```

### SDK Loading

```html
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
```

---

## 2. Authentication API

### Authenticate User

**Endpoint**: Client-side via `window.Pi.authenticate()`

**Request**:
```javascript
const authResult = await window.Pi.authenticate(
  ['username', 'payments', 'wallet_address'],  // Required scopes
  (incompletePay) => {
    // Handle incomplete payments
    console.log('Incomplete payment:', incompletePay);
  }
);
```

**Response**:
```javascript
{
  user: {
    uid: "UNIQUE_USER_ID",
    username: "pi_username",
    wallet_address: "GXXXXXX..." // Stellar address
  },
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Scopes**:
- `username` - User's Pi Network username
- `payments` - Permission to create payments
- `wallet_address` - User's Stellar wallet address

**Error Handling**:
```javascript
try {
  const authResult = await window.Pi.authenticate(scopes, handler);
  // Success
} catch (error) {
  console.error('Authentication failed:', error);
  // User canceled or error occurred
}
```

---

## 3. Payment Creation API

### Create Payment

**Endpoint**: Client-side via `window.Pi.createPayment()`

**Request**:
```javascript
const paymentData = {
  amount: 102.00,  // Amount in Pi (includes 2% platform fee)
  memo: "Payment for: Premium Subscription",
  metadata: {
    payment_link_id: "uuid-string",
    merchant_id: "uuid-string",
    payer_username: "user@pinetwork",
    buyer_email: "user@example.com",
    is_checkout_link: false,
    is_subscription: true,
    link_title: "Pro Plan Subscription"
  }
};

window.Pi.createPayment(paymentData, {
  onReadyForServerApproval: async (paymentId) => {
    // Call backend approval
    console.log('Payment ready for approval:', paymentId);
  },
  onReadyForServerCompletion: async (paymentId, txid) => {
    // Call backend completion
    console.log('Payment ready for completion:', paymentId, txid);
  },
  onCancel: () => {
    console.log('User canceled payment');
  },
  onError: (error) => {
    console.error('Payment error:', error);
  }
});
```

**Amount Calculation**:
```javascript
// Free payment (no fee)
amount = baseAmount;  // e.g., 0

// One-time payment (2% fee paid by customer)
amount = baseAmount * 1.02;  // e.g., 100 * 1.02 = 102

// Donation (2% fee)
amount = customAmount * 1.02;  // e.g., 50 * 1.02 = 51

// Subscription (2% fee)
amount = baseAmount * 1.02;  // e.g., 9.99 * 1.02 = 10.19
```

**Metadata** (max 1000 bytes):
```javascript
{
  payment_link_id: string,      // UUID of payment link
  merchant_id: string,           // UUID of merchant
  payer_username: string,        // Pi username of payer
  buyer_email: string,           // Email for content delivery
  is_checkout_link: boolean,    // Type of link
  checkout_category: string,    // Product category
  payment_type: string,         // 'payment_link' | 'checkout'
  is_subscription: boolean,     // Recurring payment
  link_title: string            // Display name
}
```

---

## 4. Server-Side Approval API

### Approve Payment (Edge Function)

**Endpoint**: `POST /functions/v1/approve-payment` (Supabase)

**Request**:
```bash
curl -X POST https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/approve-payment \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment_uuid_from_pi_sdk",
    "paymentLinkId": "link_uuid",
    "isCheckoutLink": false,
    "isSubscription": true
  }'
```

**Backend Implementation**:
```typescript
// supabase/functions/approve-payment/index.ts

const PI_API_KEY = Deno.env.get('PI_API_KEY');
const PI_API_BASE = 'https://api.minepi.com/v2';

const response = await fetch(
  `${PI_API_BASE}/payments/${paymentId}/approve`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Key ${PI_API_KEY}`,  // IMPORTANT: Key format
      'Content-Type': 'application/json',
    },
  }
);
```

**Response**:
```json
{
  "success": true,
  "result": {
    "txid": "TBD",
    "paymentId": "payment_uuid",
    "status": "approved"
  }
}
```

**Error Response**:
```json
{
  "error": "Pi API approve failed",
  "details": "Invalid API key"
}
```

**Status Codes**:
- `200` - Payment approved successfully
- `400` - Invalid request (missing paymentId)
- `405` - Invalid HTTP method (must be POST)
- `500` - Missing PI_API_KEY configuration
- `502` - Pi API error (network or auth)

---

## 5. Server-Side Completion API

### Complete Payment (Edge Function)

**Endpoint**: `POST /functions/v1/complete-payment` (Supabase)

**Request**:
```bash
curl -X POST https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/complete-payment \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment_uuid_from_pi_sdk",
    "txid": "stellar_transaction_id",
    "paymentLinkId": "link_uuid",
    "payerUsername": "pi_username",
    "buyerEmail": "user@example.com",
    "amount": 102.00,
    "isCheckoutLink": false,
    "isSubscription": true,
    "paymentType": "recurring"
  }'
```

**Backend Implementation**:
```typescript
// supabase/functions/complete-payment/index.ts

const response = await fetch(
  `${PI_API_BASE}/payments/${paymentId}/complete`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txid }),
  }
);

// Insert transaction record
const { data, error } = await supabaseClient
  .from('transactions')
  .insert({
    payment_link_id: paymentLinkId,
    merchant_id: merchantId,
    payer_username: payerUsername,
    buyer_email: buyerEmail,
    amount: amount,
    blockchain_txid: txid,
    status: 'completed',
    verified: false,
  });
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "transaction_uuid",
    "paymentId": "payment_uuid",
    "status": "completed"
  }
}
```

**Transaction Record**:
```typescript
{
  id: string;                    // UUID
  payment_link_id: string;      // Link UUID
  merchant_id: string;          // Merchant UUID
  payer_username: string;       // Pi username
  buyer_email: string;          // Buyer email
  amount: number;               // Amount paid
  blockchain_txid: string;      // Stellar txid
  status: 'completed';          // Payment status
  blockchain_verified: boolean; // Verification status
  created_at: timestamp;        // Creation time
}
```

---

## 6. Blockchain Verification API

### Verify Payment

**Endpoint**: `GET /functions/v1/verify-payment` (Supabase)

**Request**:
```bash
curl -X GET "https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/verify-payment?txid=stellar_transaction_id"
```

**Stellar Horizon API** (Direct verification):
```bash
curl -X GET "https://horizon.stellar.org/transactions/{txid}"
```

**Verification Logic**:
```javascript
// Check transaction on Stellar Horizon
const txidRegex = /^[a-f0-9]{64}$/i;  // 64-char hex string
const isValidTxid = txidRegex.test(txid);

if (isValidTxid) {
  // Verify on blockchain
  const response = await fetch(`https://horizon.stellar.org/transactions/${txid}`);
  const tx = await response.json();
  const isVerified = tx.successful && tx.ledger_close_time <= now;
}
```

**Response**:
```json
{
  "verified": true,
  "txid": "stellar_transaction_id",
  "amount": 102.00,
  "timestamp": "2026-01-08T12:34:56Z",
  "ledger": 12345,
  "source": "GXXXXXX...",
  "destination": "GYYYYYY..."
}
```

---

## 7. Ad Network API

### Check Ad Support

**Endpoint**: Client-side via `window.Pi.nativeFeaturesList()`

**Request**:
```javascript
const features = await window.Pi.nativeFeaturesList();
const adsSupported = features.includes('ad_network');
```

**Response**:
```javascript
["ad_network", "in_app_browser", "payments", ...]
```

### Display Rewarded Ad

**Request**:
```javascript
// Check if ad is ready
const { ready } = await window.Pi.Ads.isAdReady('rewarded');

if (ready) {
  // Request ad (shows consent)
  const { result } = await window.Pi.Ads.requestAd('rewarded');
  
  if (result === 'granted') {
    // Show ad
    const { result, adId } = await window.Pi.Ads.showAd('rewarded');
    
    if (result === 'completed') {
      console.log('Ad watched successfully, adId:', adId);
      // Grant reward or discount
    }
  }
}
```

**Ad Types**:
- `rewarded` - User watches ad for reward
- `interstitial` - Full-screen ad
- `banner` - Small ad banner

---

## 8. Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `PI_API_KEY not configured` | Secret not set in Supabase | Run `supabase secrets set PI_API_KEY=...` |
| `Invalid API key` | Wrong API key format or expired | Verify key: `a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq` |
| `Method not allowed` | Using GET instead of POST | Use POST method for approve/complete endpoints |
| `Invalid JSON payload` | Malformed JSON body | Check payload structure |
| `paymentId is required` | Missing paymentId in request | Verify paymentId from Pi SDK |
| `Payment timed out` | No response from Pi SDK | Check Pi Browser connection |
| `Not in Pi Browser` | Running in regular browser | Open link in Pi Browser app |

### Error Handling Code

```javascript
try {
  const response = await supabase.functions.invoke('approve-payment', {
    body: { paymentId, paymentLinkId }
  });
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    throw new Error('Empty response from edge function');
  }
  
  console.log('Payment approved:', response.data);
  
} catch (error) {
  console.error('Payment failed:', error);
  toast.error(`Payment failed: ${error.message}`);
  setPaymentStatus('error');
}
```

---

## 9. Data Model

### Payment Link

```typescript
{
  id: string;                    // UUID
  title: string;                 // Display name
  description: string;           // Description text
  amount: number;                // Price in Pi
  slug: string;                  // URL slug
  merchant_id: string;           // Merchant UUID
  payment_type: 'one_time' | 'recurring' | 'checkout';
  pricing_type: 'fixed' | 'free' | 'donation';
  redirect_url?: string;         // Redirect after payment
  cancel_redirect_url?: string;  // Redirect on cancel
  checkout_image?: string;       // Product image
  content_file?: string;         // Digital file to deliver
  is_unlimited_stock?: boolean;  // Unlimited sales
  stock?: number;                // Available stock
  min_amount?: number;           // Minimum donation amount
  suggested_amounts?: number[];  // Suggested prices
  ask_questions?: boolean;       // Collect buyer questions
  checkout_questions?: object[];  // Questions to ask
}
```

### Transaction

```typescript
{
  id: string;                    // UUID
  payment_link_id: string;       // Link UUID
  merchant_id: string;           // Merchant UUID
  payer_username: string;        // Pi username
  buyer_email?: string;          // Buyer email
  amount: number;                // Amount in Pi
  blockchain_txid?: string;      // Stellar transaction ID
  status: 'completed' | 'pending' | 'failed';
  blockchain_verified: boolean;  // Verified on blockchain
  created_at: timestamp;         // Creation time
  updated_at: timestamp;         // Last update
}
```

### Merchant

```typescript
{
  id: string;                    // UUID
  pi_username: string;           // Pi Network username
  business_name: string;         // Business name
  wallet_address: string;        // Stellar wallet address
  email: string;                 // Merchant email
  created_at: timestamp;
}
```

---

## 10. Examples

### Complete Payment Flow (Frontend)

```javascript
// 1. Authenticate
const authResult = await window.Pi.authenticate(
  ['username', 'payments', 'wallet_address'],
  (incompletePay) => console.log('Incomplete:', incompletePay)
);

console.log('User:', authResult.user);

// 2. Create payment
window.Pi.createPayment({
  amount: 102.00,
  memo: "Payment for: Premium Plan",
  metadata: { payment_link_id: 'abc-123' }
}, {
  onReadyForServerApproval: async (paymentId) => {
    // 3. Approve on server
    const approveResp = await fetch('/functions/approve-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentId })
    });
    console.log('Approved:', approveResp.data);
  },
  
  onReadyForServerCompletion: async (paymentId, txid) => {
    // 4. Complete on server
    const completeResp = await fetch('/functions/complete-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentId, txid })
    });
    console.log('Completed:', completeResp.data);
    
    // 5. Verify on blockchain
    const verified = await verifyTxid(txid);
    console.log('Verified:', verified);
  },
  
  onCancel: () => console.log('User canceled'),
  onError: (error) => console.error('Error:', error)
});
```

### Backend Approval (Edge Function)

```typescript
// supabase/functions/approve-payment/index.ts
const PI_API_KEY = Deno.env.get('PI_API_KEY');
const paymentId = payload.paymentId;

const response = await fetch(
  `https://api.minepi.com/v2/payments/${paymentId}/approve`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);

const result = await response.json();
console.log('Approved:', result);

return new Response(JSON.stringify({ success: true, result }));
```

### Blockchain Verification

```javascript
// Verify transaction on Stellar Horizon
async function verifyTxid(txid) {
  const response = await fetch(`https://horizon.stellar.org/transactions/${txid}`);
  const tx = await response.json();
  
  return {
    verified: tx.successful === true,
    ledger: tx.ledger_attr,
    timestamp: tx.created_at,
    operations: tx.operation_count
  };
}
```

---

## 11. Best Practices

### Security

- ✅ Never expose `PI_API_KEY` in frontend code
- ✅ Always use `Key ${API_KEY}` authorization header
- ✅ Validate txid format: 64-character hex string
- ✅ Verify amounts match before completion
- ✅ Check user scopes before payment

### Performance

- ✅ Implement payment timeout (2 minutes)
- ✅ Cache feature list (ads support)
- ✅ Optimize image sizes for checkout
- ✅ Use lazy loading for payment links
- ✅ Implement debouncing for repeated calls

### User Experience

- ✅ Always show "For Best Experience: Use Pi Browser" note
- ✅ Provide copy-paste link if user switches apps
- ✅ Show progress indicators during payment
- ✅ Handle incomplete payments gracefully
- ✅ Provide clear error messages

### Testing

- ✅ Test with small amounts first
- ✅ Verify blockchain txid format
- ✅ Check transaction record in Supabase
- ✅ Test offline scenario
- ✅ Test timeout scenario

---

## 12. Useful Links

- **Pi Community Docs**: https://pi-apps.github.io/community-developer-guide/
- **Pi Ad Network Docs**: https://github.com/pi-apps/pi-platform-docs/tree/master
- **Stellar Horizon API**: https://horizon.stellar.org
- **Pi SDK v2.0**: https://sdk.minepi.com/pi-sdk.js
- **Pi API Base**: https://api.minepi.com/v2

---

**Version**: 2.0 (Updated Jan 8, 2026)  
**Status**: ✅ Production Ready  
**Mainnet**: ✅ Enabled  
**Sandbox Mode**: ✅ Disabled
