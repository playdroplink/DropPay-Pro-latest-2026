# DropPay Pi Payment Deployment Guide

**Date**: January 8, 2026  
**Status**: Ready for Deployment  
**API Key**: `a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq`

---

## Step 1: Set Supabase Secrets

Run these commands in PowerShell from the project root directory:

```powershell
# Login to Supabase
supabase login

# Link to your project (if not already linked)
supabase link --project-ref xoofailhzhfyebzpzrfs

# Set the Pi API Key secret
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"

# Verify secrets were set
supabase secrets list --project-ref xoofailhzhfyebzpzrfs
```

**Expected Output**:
```
✅ PI_API_KEY: a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
✅ SUPABASE_URL: https://xoofailhzhfyebzpzrfs.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY: eyJhbGc...
```

---

## Step 2: Deploy Edge Functions

Deploy the approve-payment and complete-payment edge functions:

```powershell
# From the project root directory

# Deploy approve-payment function
supabase functions deploy approve-payment

# Deploy complete-payment function
supabase functions deploy complete-payment

# Verify deployment
supabase functions list --project-ref xoofailhzhfyebzpzrfs
```

**Expected Output**:
```
✅ approve-payment    ACTIVE
✅ complete-payment   ACTIVE
```

---

## Step 3: Verify Environment Configuration

### Frontend (.env file)

Verify these variables are set correctly:

```env
# Pi Network Mainnet Configuration
VITE_PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
VITE_PI_VALIDATION_KEY="ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a"
VITE_API_URL="https://api.minepi.com"
VITE_PI_SDK_URL="https://sdk.minepi.com/pi-sdk.js"
VITE_PI_SANDBOX_MODE="false"
VITE_PI_NETWORK="mainnet"
VITE_PI_MAINNET_MODE="true"
VITE_PI_PRODUCTION_MODE="true"
VITE_PI_SDK_VERSION="2.0"
```

---

## Step 4: Test Pi Payment Flow

### In Pi Browser

1. **Navigate to payment link**:
   - URL: `https://droppay-v2.lovable.app/pay/[payment-slug]`
   - Or test with: `droppay-v2.lovable.app/pay/d6z...`

2. **Authenticate**:
   - Click "Pi Auth Sign In"
   - Authenticate with your Pi account
   - Verify: `username`, `payments`, `wallet_address` scopes requested

3. **Create Payment**:
   - Review amount and payment details
   - Click "Pay with Pi" button
   - Confirm amount in Pi Browser

4. **Verify Success**:
   - Check browser console logs for:
     ```
     ✅ Payment approved by Pi Network
     ✅ Payment completed on Pi Network
     ✅ Payment verified on blockchain
     ```
   - Check Supabase transactions table:
     ```sql
     SELECT * FROM transactions WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1;
     ```

5. **Blockchain Verification**:
   - Verify transaction ID format (Stellar txid)
   - Check Stellar Horizon: `https://horizon.stellar.org/transactions/{txid}`

---

## Step 5: Monitor Payment Transactions

### Supabase Dashboard

1. **Transactions Table**:
   ```sql
   -- View recent transactions
   SELECT 
     id, payment_link_id, merchant_id, amount, status, 
     created_at, blockchain_verified
   FROM transactions 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

2. **Payment Status**:
   - `pending` → Payment created, awaiting approval
   - `completed` → Server approved and completed
   - `verified` → Blockchain verified

3. **Error Tracking**:
   ```sql
   -- Find failed transactions
   SELECT * FROM transactions 
   WHERE status != 'completed' 
   ORDER BY created_at DESC;
   ```

### Edge Function Logs

1. **Supabase Dashboard** → Functions → approve-payment → View Logs
2. **Look for**:
   - ✅ `Payment approved` (success)
   - ❌ `Pi API approve failed` (authorization error)
   - ❌ `PI_API_KEY not configured` (secret not set)

---

## Step 6: Test Fee Calculation

### Fee Structure (2% Platform Fee)

**Example Payment**:
- Listed amount: `100 π`
- Customer pays: `102 π` (100 + 2% fee)
- Merchant receives: `100 π`
- DropPay keeps: `2 π` (platform maintenance)

### Verify in Browser Console

```javascript
// After payment creation
console.log(paymentData);
// Should show: { amount: 102, memo: "Payment for...", metadata: {...} }
```

---

## Step 7: Test Free Plan Limits

### Transaction Limit (Free Plan = 3 per link)

1. Create a payment link
2. Complete 3 payments
3. Attempt 4th payment
4. Expected error: "This payment link has reached its Free plan limit of 3 transactions"

---

## Step 8: Test Subscription Activation

### Subscription Payment Flow

1. **Create Subscription Link**:
   - Payment type: `recurring`
   - Title: `Pro Plan Subscription - DropPay`
   - Amount: `9.99 π/month`

2. **Complete Payment**:
   - Should trigger subscription activation
   - Check `user_subscriptions` table for new entry

3. **Verify in Database**:
   ```sql
   SELECT * FROM user_subscriptions 
   WHERE status = 'active' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

---

## Step 9: Production Checklist

Before going live, verify:

- [ ] Supabase secrets set (PI_API_KEY, etc.)
- [ ] Edge functions deployed (approve-payment, complete-payment)
- [ ] Environment variables correct in .env
- [ ] Sandbox mode disabled (`VITE_PI_SANDBOX_MODE="false"`)
- [ ] Mainnet enabled (`VITE_PI_NETWORK="mainnet"`)
- [ ] Pi SDK v2.0 loading correctly
- [ ] CORS headers configured for production domain
- [ ] Error logging enabled
- [ ] Email delivery configured (Resend API key)
- [ ] Transaction verification enabled

---

## Step 10: Troubleshooting

### "PI_API_KEY not configured"

```bash
# Check if secret is set
supabase secrets list --project-ref xoofailhzhfyebzpzrfs

# If missing, set it
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"

# Redeploy functions
supabase functions deploy approve-payment
supabase functions deploy complete-payment
```

### "Payment approval failed"

Check edge function logs:
1. Supabase Dashboard → Functions → approve-payment → Logs
2. Look for `Pi API approve failed`
3. Verify API key is correct: `a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq`

### "Not in Pi Browser"

- Link must be opened in **Pi Browser app**, not regular browser
- Check user agent: Should include "PiBrowser" or Pi.init should be available
- Test URL: Copy link from "For Best Experience" note

### "Payment timed out"

- Check network connection
- Verify Supabase API is accessible
- Check edge function logs for errors
- Increase timeout if needed (currently 2 minutes)

---

## Commands Quick Reference

```powershell
# Login to Supabase
supabase login

# Set secrets
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"

# Deploy functions
supabase functions deploy approve-payment
supabase functions deploy complete-payment

# View logs
supabase functions list --project-ref xoofailhzhfyebzpzrfs

# View secrets
supabase secrets list --project-ref xoofailhzhfyebzpzrfs

# Test edge function
curl -X POST https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/approve-payment \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"test-payment-id"}'
```

---

## Support Resources

- **Pi Network Docs**: https://pi-apps.github.io/community-developer-guide/
- **Ad Network Docs**: https://github.com/pi-apps/pi-platform-docs/tree/master
- **Api Endpoints**: https://api.minepi.com/v2/payments/{id}/approve
- **SDK**: https://sdk.minepi.com/pi-sdk.js (v2.0)

---

## Deployment Complete! 🎉

Once all steps are complete:
1. Users can authenticate with Pi Account
2. Users can pay using Pi mainnet
3. Payments are verified on blockchain
4. Merchants receive Pi instantly
5. Subscription plans activate automatically

**Status**: ✅ **PRODUCTION READY**
