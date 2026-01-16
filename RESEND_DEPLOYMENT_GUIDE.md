# 🔧 RESEND EMAIL API - ENVIRONMENT & SUPABASE SETUP COMMANDS

**Date**: January 3, 2026  
**Status**: Ready to Deploy

---

## ✅ WHAT'S ALREADY DONE

The Resend API key has been added to your environment files:
- ✅ `.env` file updated
- ✅ `supabase/.env` file updated
- ✅ Edge function ready to use

---

## 🚀 SUPABASE SECRETS SETUP (REQUIRED FOR PRODUCTION)

To enable email delivery in production, you need to set the secret in Supabase.

### Option 1: Using Supabase CLI (Recommended)

Open terminal and run these commands:

```bash
# Set Resend API Key
supabase secrets set RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"

# Verify it was set
supabase secrets list
```

### Option 2: Using Supabase Dashboard (Manual)

1. Go to: https://app.supabase.com
2. Select your project: `xoofailhzhfyebzpzrfs`
3. Navigate to: **Settings** → **Secrets**
4. Click **New secret**
5. Enter details:
   - Name: `RESEND_API_KEY`
   - Value: `re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u`
6. Click **Save**

---

## 📋 ENVIRONMENT VARIABLES REFERENCE

### Current Configuration

**.env (Root)**
```env
RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"
```

**supabase/.env**
```env
RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"
```

**Supabase Secrets (Edge Functions)**
```
RESEND_API_KEY = re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u
```

---

## 🔄 DEPLOYMENT CHECKLIST

### Before Deploying to Production:

```bash
# 1. Set Supabase secrets
supabase secrets set RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"

# 2. Verify secrets are set
supabase secrets list

# Expected output:
# RESEND_API_KEY

# 3. Deploy edge functions (if not auto-deployed)
supabase functions deploy send-download-email
```

### Verify Deployment:

```bash
# Check function exists
supabase functions list

# Expected to see:
# send-download-email (HTTP, enabled)

# Test the function
supabase functions invoke send-download-email --body '{"test": true}'
```

---

## 📧 TESTING AFTER SETUP

### 1. Test via Payment Flow
```bash
# Requirements:
- Open DropPay payment link
- Click "Pay with Pi"
- Complete payment with digital product
- Enter your email
- Check inbox for email

# Expected: Email arrives in 1-2 minutes
```

### 2. Test via Supabase Dashboard
```bash
# Steps:
1. Go to Supabase Dashboard → Functions
2. Select: send-download-email
3. Click: "Invoke Function"
4. Paste test body:

{
  "transactionId": "test-123",
  "buyerEmail": "your-email@example.com",
  "paymentLinkId": "link-456",
  "downloadUrl": "https://example.com/file.pdf",
  "productTitle": "Test Product"
}

5. Click: Execute
6. Check: Your email inbox
```

### 3. Test via Terminal
```bash
# Using curl (replace URLs and API key):
curl --request POST \
  --url https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/send-download-email \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "transactionId": "test-123",
    "buyerEmail": "your-email@example.com",
    "paymentLinkId": "link-456",
    "downloadUrl": "https://example.com/file.pdf",
    "productTitle": "Test Product"
  }'
```

---

## 🐛 TROUBLESHOOTING

### Email not sending?

**Check 1: Verify API key is in Supabase secrets**
```bash
supabase secrets list
# Should show RESEND_API_KEY
```

**Check 2: View edge function logs**
```bash
# In Supabase Dashboard:
# Functions → send-download-email → Logs
# Look for errors
```

**Check 3: Verify buyerEmail is valid**
```bash
# Edge function checks:
- Email format (must contain @)
- Not null/empty
- Resend validates email syntax
```

**Check 4: Check Resend status**
```bash
# Go to: https://resend.com/dashboard
# Verify account is active
# Check email delivery logs
```

---

## 📊 API KEY DETAILS

```
Provider: Resend (https://resend.com)
Key: re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u
Type: API Key (Production)
Free Plan: 100 emails/day
Paid Plans: $20+/month
Status: Active & Ready
```

---

## 🔐 SECURITY NOTES

✅ **DO NOT** commit `.env` with API key to public repos  
✅ **DO** use `.gitignore` to exclude `.env` files  
✅ **DO** set secrets in Supabase Dashboard (not in code)  
✅ **DO** rotate key if accidentally exposed  
✅ **DO** use environment-specific keys for dev/prod  

---

## 📈 MONITORING

### Track Email Delivery:
1. Go to https://resend.com/dashboard
2. Sign in with Resend account
3. View delivery stats:
   - Total sent
   - Delivered count
   - Bounce rate
   - Failed sends

### Track in Supabase:
```sql
-- View sent emails
SELECT 
  id, 
  buyer_email, 
  email_sent, 
  created_at 
FROM transactions 
WHERE email_sent = true 
ORDER BY created_at DESC;
```

---

## 🎯 QUICK SETUP SUMMARY

### For Development:
```bash
# No action needed - already configured locally
# Use with npm run dev
```

### For Production/Deployment:
```bash
# 1. Set secret in Supabase
supabase secrets set RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"

# 2. Deploy edge function
supabase functions deploy send-download-email

# 3. Deploy frontend
npm run build
# Deploy to hosting (Vercel, Netlify, etc.)

# 4. Test
# Make test payment and verify email
```

---

## 📞 SUPPORT

**Resend Documentation**: https://resend.com/docs/introduction  
**API Reference**: https://resend.com/docs/api-reference  
**Supabase Secrets**: https://supabase.com/docs/guides/functions/secrets  
**Email Templates**: https://resend.com/docs/examples  

---

## ✨ STATUS

| Item | Status | Details |
|------|--------|---------|
| API Key | ✅ Set | re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u |
| .env File | ✅ Updated | Root & Supabase |
| Edge Function | ✅ Ready | send-download-email |
| Supabase Secrets | ⏳ Action Needed | Run: supabase secrets set ... |
| Testing | ✅ Ready | Can test immediately after secrets set |

---

## 🚀 READY TO DEPLOY

Once you've set the Supabase secret, your DropPay email system is fully operational!

**Next Steps:**
1. Set Supabase secret (copy command below)
2. Deploy edge function
3. Test with real payment
4. Monitor delivery in Resend dashboard

```bash
# Copy and run this command:
supabase secrets set RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"
```

---

**Setup Date**: January 3, 2026  
**Status**: READY FOR DEPLOYMENT  
**Action Required**: Set Supabase secret

