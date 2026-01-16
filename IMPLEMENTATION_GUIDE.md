# DropPay Implementation Guide

**Quick Reference for Developers**

---

## 1. Local Development Setup

### Prerequisites Check
```bash
# Verify Node.js version
node --version  # Should be 18+

# Verify npm/bun
npm --version
# or
bun --version
```

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/yourusername/droppay-v2
cd droppay-v2

# 2. Install dependencies
npm install
# or
bun install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your credentials
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 5. Start development server
npm run dev
# or
bun run dev

# App runs at http://localhost:5173
```

---

## 2. First Payment Link

### Step 1: Authenticate
1. Open app in **Pi Browser** (download from minepi.com)
2. Click "Login with Pi" 
3. Approve scopes: `username`, `payments`, `wallet_address`

### Step 2: Create Payment Link
1. Go to **Dashboard**
2. Click **"Create Link"**
3. Fill in:
   - **Title:** "My First Product"
   - **Description:** "Test product"
   - **Price:** 1.00 (USD)
   - **Type:** "One-Time Payment"
   - **Delivery:** "Instant Download" (optional: upload test file)
4. Click **"Publish"**
5. Copy link (format: `https://droppay.space/pay/slug-123`)

### Step 3: Test Payment
1. Open payment link in **new tab** (still in Pi Browser)
2. Review details
3. Click **"Pay π X.XX"**
4. Complete payment flow
5. Verify success message

### Step 4: Check Dashboard
1. Go back to Dashboard
2. See new transaction with status **"Completed"**
3. Balance updated (minus 2% fee)

---

## 3. Backend Functions Deployment

### Deploy Functions

```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project
supabase link --project-ref <your-project-ref>

# 3. Set secrets (never commit these)
supabase secrets set PI_API_KEY="<your-pi-api-key>"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
supabase secrets set ALLOW_ORIGIN="https://your-domain.com"
supabase secrets set RESEND_API_KEY="<your-resend-api-key>"

# 4. Deploy all functions
supabase functions deploy

# 5. Verify deployment
supabase functions list
```

### Test Function

```bash
# Test approve-payment function
curl -X POST https://your-project.supabase.co/functions/v1/approve-payment \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "test-payment-id", "paymentLinkId": "test-link-id"}'
```

---

## 4. Database Setup

### Automatic (Recommended)

```bash
# Apply all migrations
supabase db push

# Check migration status
supabase migration list
```

### Manual SQL (if needed)

```bash
# Copy SQL files
cp supabase/migrations/*.sql supabase/

# Run in Supabase Dashboard → SQL Editor:
# 1. Open each file
# 2. Execute
# 3. Verify in Tables view
```

---

## 5. Environment Variables Explained

### Frontend (.env) - Exposed Variables

```env
# Platform Info (example)
VITE_PLATFORM_NAME=DropPay
VITE_PLATFORM_URL=https://your-domain.com
VITE_DOMAIN=your-domain.com

# Supabase (Public Keys - SAFE to expose)
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-public-key>

# Pi Network (public endpoints only; do NOT expose secret keys)
VITE_PI_MAINNET_MODE=true
VITE_PI_SANDBOX_MODE=false
VITE_PI_NETWORK=mainnet
```

### Backend (Secrets) - Not Exposed

Set via `supabase secrets set`:
```
PI_API_KEY                 (Required, secret)
SUPABASE_SERVICE_ROLE_KEY  (Required, secret)
SUPABASE_URL               (Required)
ALLOW_ORIGIN               (Required, restrict to your domain)
RESEND_API_KEY             (Optional - for emails)
```

**⚠️ NEVER commit secrets to git!**

---

## 6. Common Tasks

### Add Custom Currency

Edit `src/pages/PaymentLinkBuilder.tsx`:

```tsx
<select value={data.currency} onChange={e => onChange({ currency: e.target.value })}>
  <option value="USD">$ USD</option>
  <option value="EUR">€ EUR</option>
  <option value="JPY">¥ JPY</option>
  {/* Add new currency */}
  <option value="GBP">£ GBP - British Pound</option>
</select>
```

### Modify Platform Fee

File: `supabase/functions/complete-payment/index.ts`

```typescript
// Change from 2% to 5%
const platformFee = paymentLink.amount * 0.05;  // Was 0.02
const merchantAmount = paymentLink.amount - platformFee;
```

### Change Ad Reward Amount

File: `supabase/functions/verify-ad-reward/index.ts`

```typescript
// Change from π 0.005 to π 0.010
const reward = await supabase
  .from('ad_rewards')
  .insert({
    username,
    ad_id: adId,
    amount: 0.010,  // Changed from 0.005
    status: 'completed'
  });
```

### Enable/Disable Feature Flags

Edit `.env`:

```env
# Disable ad network
VITE_PI_AD_NETWORK_ENABLED=false

# Disable subscriptions
VITE_PI_SUBSCRIPTION_ENABLED=false

# Disable email delivery
VITE_ENABLE_EMAIL_DELIVERY=false
```

---

## 7. Testing Payments

### Without Pi Browser (Demo Mode)

The app detects missing Pi SDK and enables **demo mode**:

```typescript
// src/contexts/AuthContext.tsx
const hasPiSdk = Boolean((window as any).Pi);
if (!hasPiSdk) {
  setDemoMode(true);  // Enable mock payment flow
}
```

In demo mode:
- ✅ Create payment links
- ✅ Test checkout UI
- ✅ Simulate payments
- ❌ Cannot create real transactions

### With Pi Browser (Real Payments)

1. Download Pi Browser from [minepi.com](https://minepi.com)
2. Launch app inside Pi Browser
3. Authenticate with real Pi account
4. Create and complete real payments
5. View transactions in Supabase

### Test Specific Scenarios

```bash
# Test payment approval flow
# supabase/functions/approve-payment/index.ts
async function testApprovePayment() {
  const paymentId = "pi_123456";
  const response = await fetch("https://api.minepi.com/v2/payments/pi_123456/approve", {
    method: "POST",
    headers: {
      "Authorization": "Key your-pi-api-key",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ approval: true })
  });
  console.log(response.json());
}

# Test blockchain verification
# Check Stellar Horizon API
curl https://horizon.stellar.org/transactions/your-txid
```

---

## 8. Production Deployment

### Pre-Launch Checklist

- [ ] Set all production secrets (no test keys)
- [ ] Verify CORS origin is correct domain
- [ ] Test full payment flow in Pi Browser
- [ ] Enable RLS on database tables
- [ ] Backup database
- [ ] Set up monitoring/alerts
- [ ] Review security settings
- [ ] Test withdrawal workflows
- [ ] Verify email delivery (if enabled)
- [ ] Document API endpoints

### Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Production deploy"
git push origin main

# 2. Vercel auto-deploys on push
# Or manual: vercel deploy --prod

# 3. Update DNS to Vercel
# Add CNAME record: droppay.space -> cname.vercel.sh

# 4. Set production environment variables in Vercel dashboard
```

### Monitor After Deploy

```bash
# Check logs
supabase functions logs approve-payment --limit 20

# Monitor errors
supabase functions logs --limit 50 --filter "error"

# Check database
# Supabase Dashboard → Logs → Realtime

# Monitor transactions
SELECT * FROM transactions 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## 9. Debugging Tips

### Enable Debug Logging

```typescript
// src/App.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('Payment Link:', paymentLink);
  console.log('User:', user);
  console.log('Payment Status:', paymentStatus);
}
```

### Check Network Requests

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **XHR/Fetch**
4. Check request/response for errors

### View Supabase Logs

```bash
# Real-time function logs
supabase functions logs approve-payment --limit 50

# View specific function execution
supabase functions logs --project-ref xoofailhzhfyebzpzrfs --limit 100
```

### Check Database State

```sql
-- View recent transactions
SELECT 
  id, payment_link_id, amount, status, created_at
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- View merchant balance
SELECT pi_username, available_balance, total_revenue
FROM merchants
WHERE pi_username = 'username';

-- View platform fees collected
SELECT SUM(amount) as total_fees FROM platform_fees;
```

---

## 10. API Integration Examples

### Create Payment Link (REST API)

```javascript
// Example: Create a π10 payment link
async function createPaymentLink() {
  const response = await fetch('/api/v1/payment-links', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Premium Course',
      description: 'Advanced trading course',
      amount: 10.50,
      currency: 'USD',
      pricing_type: 'one_time',
      delivery_type: 'email',
      image_url: 'https://example.com/image.jpg'
    })
  });

  const link = await response.json();
  return link;  // { id, slug, payment_url }
}
```

### Fetch Payment Link

```javascript
// Customer perspective
async function getPaymentLink(slug) {
  const response = await fetch(`/api/v1/payment-links?slug=${slug}`);
  const link = await response.json();
  
  return {
    title: link.title,
    amount: link.amount,
    currency: link.currency,
    description: link.description,
    image: link.image_url
  };
}
```

### Complete Payment Flow

```javascript
async function completePayment(paymentLinkId, paymentDetails) {
  try {
    // 1. Create payment with Pi SDK
    const payment = await Pi.createPayment({
      amount: paymentDetails.amount,
      memo: paymentDetails.title,
      metadata: { linkId: paymentLinkId }
    }, {
      onReadyForServerApproval: async (paymentId) => {
        // 2. Server approval
        await fetch('/functions/approve-payment', {
          method: 'POST',
          body: JSON.stringify({ paymentId, paymentLinkId })
        });
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        // 3. Server completion
        const result = await fetch('/functions/complete-payment', {
          method: 'POST',
          body: JSON.stringify({
            paymentId,
            txid,
            paymentLinkId,
            buyerEmail: paymentDetails.email
          })
        }).then(r => r.json());

        // 4. Verify on blockchain
        await fetch('/functions/verify-payment', {
          method: 'POST',
          body: JSON.stringify({ txid, expectedAmount: paymentDetails.amount })
        });

        return result;  // Transaction ID
      }
    });

    return payment;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

---

## 11. File Structure Reference

```
droppay-v2/
├── src/
│   ├── pages/
│   │   ├── PayPage.tsx              # Checkout page
│   │   ├── PaymentLinkBuilder.tsx   # Create links
│   │   ├── Dashboard.tsx            # Merchant dashboard
│   │   ├── Withdrawals.tsx          # Withdrawal requests
│   │   ├── AdminWithdrawals.tsx     # Admin approval
│   │   └── Docs.tsx                 # API docs
│   ├── contexts/
│   │   └── AuthContext.tsx          # Pi authentication
│   ├── components/
│   │   ├── dashboard/               # Dashboard components
│   │   └── ui/                      # UI components
│   └── App.tsx                      # Main app
├── supabase/
│   ├── functions/
│   │   ├── approve-payment/
│   │   ├── complete-payment/
│   │   ├── verify-payment/
│   │   ├── verify-ad-reward/
│   │   ├── process-withdrawal/
│   │   ├── send-download-email/
│   │   └── delete-account/
│   ├── migrations/                  # Database migrations
│   └── config.toml
├── .env                             # Environment variables
├── package.json                     # Dependencies
└── vite.config.ts                   # Build config
```

---

## 12. Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production build
npm test                # Run tests

# Database
supabase db push        # Apply migrations
supabase db pull        # Pull remote schema

# Functions
supabase functions deploy           # Deploy all
supabase functions deploy approve-payment  # Deploy one
supabase functions logs approve-payment    # View logs

# Secrets
supabase secrets list               # View all secrets
supabase secrets set KEY="value"    # Set secret
```

---

## 13. Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| `Pi SDK not available` | Use Pi Browser or enable demo mode |
| `CORS error` | Set `ALLOW_ORIGIN` secret and redeploy function |
| `Payment verification fails` | Wait 2-3 min for blockchain confirmation |
| `Email not sending` | Set `RESEND_API_KEY` secret |
| `Function 500 error` | Check `supabase functions logs` |
| `Balance not updating` | Verify transaction status is `completed` |
| `File download broken` | Check file path in `payment-content` bucket |

---

## 14. Support Resources

- **Docs:** [docs.droppay.space](https://docs.droppay.space)
- **Discord:** [discord.gg/droppay](https://discord.gg/droppay)
- **Email:** support@droppay.space
- **GitHub Issues:** [github.com/droppay/issues](https://github.com/droppay/issues)

---

**Ready to build! 🚀**
