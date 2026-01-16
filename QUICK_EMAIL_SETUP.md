# Setup Supabase Email SMTP

## Quick Start Guide

### Step 1: Choose Email Provider

**Recommended: Resend (Fastest Setup)**
- Go to https://resend.com
- Sign up
- Get API key from dashboard
- Takes 2 minutes

**Alternative: SendGrid**
- Go to https://sendgrid.com
- Create account
- Get API key from Settings → API Keys
- Takes 5 minutes

### Step 2: Get SMTP Credentials

For **Resend**:
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USERNAME=resend
SMTP_PASSWORD=re_YOUR_RESEND_API_KEY
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=DropPay
```

For **SendGrid**:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG_YOUR_SENDGRID_API_KEY
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=DropPay
```

### Step 3: Set Secrets in Supabase

Run these commands:

```bash
# Via Supabase CLI
supabase secrets set SMTP_HOST=smtp.resend.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USERNAME=resend
supabase secrets set SMTP_PASSWORD=re_YOUR_API_KEY
supabase secrets set SMTP_FROM_EMAIL=noreply@yourdomain.com
supabase secrets set SMTP_FROM_NAME=DropPay
```

OR set via Supabase Dashboard:
1. Project Settings → Secrets
2. Add each key-value pair
3. Save

### Step 4: Test Email Sending

```bash
# Test the edge function
supabase functions invoke send-receipt-email --no-verify-jwt \
  --body '{
    "transactionId": "test-123",
    "buyerEmail": "your-email@example.com",
    "paymentLinkTitle": "Test Product",
    "merchantName": "Test Merchant",
    "payerUsername": "testuser",
    "amount": 10.5,
    "currency": "Pi",
    "txid": "test-blockchain-tx-id",
    "isBlockchainVerified": true
  }'
```

Check your email inbox (and spam folder).

### Step 5: Deploy Edge Function

```bash
supabase functions deploy send-receipt-email --no-verify-jwt
```

### Troubleshooting

**Email not arriving:**
1. Check spam folder
2. Verify SMTP_FROM_EMAIL is correct
3. Check email provider dashboard for errors
4. Verify recipient email is valid

**SMTP connection error:**
1. Double-check SMTP_HOST and SMTP_PORT
2. Verify SMTP_PASSWORD (API key) is correct
3. Check firewall/network settings

**Need help?**
- See SUPABASE_EMAIL_SETUP.md for detailed instructions
- Check email provider's documentation

---

Once configured, the send-receipt-email function will automatically send transaction receipts to customers!

