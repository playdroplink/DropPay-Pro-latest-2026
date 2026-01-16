# PI PAYMENT EDGE FUNCTIONS - DEPLOYMENT GUIDE

## ✅ What's Been Fixed

### Code Changes:
1. ✅ **Updated .env with new credentials**
   - Pi API Key: `a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq`
   - Validation Key: `ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a`

2. ✅ **Enhanced approve-payment Edge Function**
   - Better error logging with emojis for easy debugging
   - Validates paymentId before API call
   - Logs API endpoint and response status
   - Uses Pi Network API v2: `https://api.minepi.com/v2/payments/{id}/approve`

3. ✅ **Enhanced complete-payment Edge Function**
   - Improved logging for payment completion flow
   - Validates required fields (paymentId, txid)
   - Better error messages for missing configuration
   - Uses Pi Network API v2: `https://api.minepi.com/v2/payments/{id}/complete`

---

## 🚀 Manual Deployment Steps

Since Supabase CLI needs interactive login, follow these steps manually:

### Step 1: Login to Supabase

Open a **NEW** PowerShell terminal and run:

```powershell
supabase login
```

This will open your browser for authentication. Complete the login process.

### Step 2: Link to Your Project

```powershell
cd "c:\Users\SIBIYA GAMING\droppay-full-checkout-link"
supabase link --project-ref xoofailhzhfyebzpzrfs
```

### Step 3: Set Secrets

```powershell
# Allow all origins for CORS
supabase secrets set ALLOW_ORIGIN="*"

# Pi Network API Key (mainnet)
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"

# Resend Email API Key
supabase secrets set RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"
```

### Step 4: Deploy Edge Functions

```powershell
# Deploy payment approval function
supabase functions deploy approve-payment --no-verify-jwt

# Deploy payment completion function
supabase functions deploy complete-payment --no-verify-jwt

# Deploy payment verification function
supabase functions deploy verify-payment --no-verify-jwt
```

### Step 5: Verify Deployment

```powershell
# List all deployed functions
supabase functions list

# Check recent logs
supabase functions logs approve-payment --limit 10
supabase functions logs complete-payment --limit 10
```

---

## 🔍 Testing Payment Flow

### Create Test Payment Link

1. Go to your dashboard: `http://localhost:5173/dashboard`
2. Click "Create Payment Link"
3. Fill in details:
   - Title: "Test Payment"
   - Amount: 1 PI
   - Type: One-time payment
4. Save and copy the payment link

### Test in Pi Browser

1. **Open Pi Browser** on your mobile device
2. **Paste the payment link** in the browser
3. **Authenticate** with your Pi account (if not already logged in)
4. **Click "Pay with Pi"** button
5. **Approve the payment** in your Pi wallet

### Expected Console Logs

**Browser Console (Pi Browser):**
```
🚀 Processing Pi payment for payment link: Test Payment
💳 Creating payment: { amount: 1, memo: "Payment for: Test Payment", ... }
📡 Calling approve-payment function...
✅ Payment approved
📡 Calling complete-payment function...
✅ Payment completed on blockchain
🎉 Payment verified on blockchain!
```

**Edge Function Logs (Supabase):**
```
approve-payment:
🔄 Approving payment: { paymentId: "...", paymentLinkId: "...", ... }
📡 Calling Pi Network API...
📊 Pi API Response Status: 200
✅ Payment approved successfully

complete-payment:
🔄 Completing payment: { paymentId: "...", txid: "...", ... }
📡 Calling Pi Network API to complete payment...
📊 Pi API Response Status: 200
✅ Payment completed on Pi Network
💰 Payment amount: 1 PI
💾 Transaction saved to database
```

---

## 📊 Edge Function Architecture

### approve-payment Function

**Purpose:** Approves a payment on Pi Network after user initiates payment

**Flow:**
```
1. Client calls function with paymentId
2. Function validates PI_API_KEY exists
3. Calls Pi API: POST /v2/payments/{paymentId}/approve
4. Returns approval result to client
```

**API Endpoint:**
- `POST https://api.minepi.com/v2/payments/{paymentId}/approve`
- Headers: `Authorization: Key {PI_API_KEY}`

### complete-payment Function

**Purpose:** Completes payment on Pi Network and records transaction in database

**Flow:**
```
1. Client calls function with paymentId and txid
2. Function validates required fields and secrets
3. Calls Pi API: POST /v2/payments/{paymentId}/complete
4. Creates transaction record in database
5. Creates notification for merchant
6. Updates payment link conversions
7. Returns completion result
```

**API Endpoint:**
- `POST https://api.minepi.com/v2/payments/{paymentId}/complete`
- Headers: `Authorization: Key {PI_API_KEY}`
- Body: `{ "txid": "..." }`

---

## 🔧 Configuration Summary

### Environment Variables (.env)
```bash
# Mainnet Mode
VITE_PI_SANDBOX_MODE="false"
VITE_PI_MAINNET_MODE="true"
VITE_PI_NETWORK="mainnet"

# API Keys
VITE_PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
VITE_PI_VALIDATION_KEY="ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a"

# Features
VITE_PI_PAYMENTS_ENABLED="true"
VITE_PI_AUTHENTICATION_ENABLED="true"
VITE_PI_AD_NETWORK_ENABLED="true"
VITE_PI_AD_NETWORK_MAINNET="true"
```

### Supabase Secrets
```bash
ALLOW_ORIGIN="*"
PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-configured
```

---

## 📚 Pi Network Documentation References

### Payment Integration
- **Official Guide:** https://pi-apps.github.io/community-developer-guide/
- **API Docs:** https://pi-apps.github.io/community-developer-guide/docs/payments
- **GitHub:** https://github.com/pi-apps/pi-platform-docs

### Ad Network Integration
- **Documentation:** https://github.com/pi-apps/pi-platform-docs/tree/master
- **Ad Types:** Rewarded ads, Interstitial ads
- **Integration:** Already enabled in your app

### Key Endpoints
```
Mainnet API Base: https://api.minepi.com
SDK URL: https://sdk.minepi.com/pi-sdk.js
Horizon: https://api.minepi.com (for blockchain queries)
```

---

## ❌ Troubleshooting

### "PI_API_KEY is not configured"
- Ensure you ran: `supabase secrets set PI_API_KEY="..."`
- Verify with: `supabase secrets list`

### "Unauthorized" when setting secrets
- Run `supabase login` first
- Make sure you're logged into the correct Supabase account

### Payment fails in browser
- **Must use Pi Browser** - regular browsers don't have Pi SDK
- Check browser console for error messages
- Verify `sandbox: false` in Pi SDK initialization logs

### "Failed to link project"
- Verify project reference: `xoofailhzhfyebzpzrfs`
- Ensure you have access to the project in Supabase dashboard
- Try: `supabase projects list` to see available projects

### Edge function deployment fails
- Check you're in the correct directory
- Verify `supabase/functions/{function-name}/index.ts` exists
- Try with `--debug` flag for more info

---

## ✅ Final Checklist

- [ ] Supabase CLI installed and logged in
- [ ] Project linked to xoofailhzhfyebzpzrfs
- [ ] Secrets configured (ALLOW_ORIGIN, PI_API_KEY, RESEND_API_KEY)
- [ ] Edge functions deployed (approve-payment, complete-payment, verify-payment)
- [ ] Development server running (`npm run dev`)
- [ ] Payment link created in dashboard
- [ ] Payment tested in Pi Browser
- [ ] Transaction appears in dashboard
- [ ] Edge function logs show success

---

**Status:** ✅ Code Ready - Manual Deployment Required  
**Updated:** January 7, 2026  
**Pi Network Mode:** Mainnet (Production)
