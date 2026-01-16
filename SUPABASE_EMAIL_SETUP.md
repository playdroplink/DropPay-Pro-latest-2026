# Supabase Email Setup - Custom SMTP Configuration

## Overview

Enable custom SMTP in Supabase to send transaction receipts and payment notifications via email service providers.

## Step 1: Choose Email Provider

### Option A: Resend (Recommended - Easiest)
- **Pros**: Free tier, no credit card needed, easy setup, great for developers
- **Free Tier**: 100 emails/day
- **Setup Time**: 5 minutes
- **Website**: https://resend.com

### Option B: SendGrid
- **Pros**: Industry standard, reliable, good documentation
- **Free Tier**: 100 emails/day
- **Setup Time**: 10 minutes
- **Website**: https://sendgrid.com

### Option C: AWS SES (Simple Email Service)
- **Pros**: Cheapest at scale, powerful, reliable
- **Free Tier**: 62,000 emails/month (if within AWS free tier)
- **Setup Time**: 15 minutes
- **Website**: https://aws.amazon.com/ses/

## Setup Instructions

### Option A: Resend Setup (RECOMMENDED)

#### 1. Create Resend Account
1. Go to https://resend.com
2. Sign up with email
3. Verify email address
4. Go to API Keys dashboard

#### 2. Get API Keys
1. Click "Create API Key"
2. Copy the API key (starts with `re_`)
3. Save it securely

#### 3. Configure Supabase Email
1. Go to Supabase Dashboard
2. Navigate to **Project Settings → Email**
3. Enable **Custom SMTP**
4. Fill in the following:

```
SMTP Host: smtp.resend.com
SMTP Port: 465
SMTP Username: resend
SMTP Password: [Your Resend API Key]
Sender Email: noreply@yourdomain.com  (or any verified sender)
Sender Name: DropPay
```

#### 4. Verify Sender Email
For Resend:
- Free tier requires verified domain or email
- Add verified email in Resend dashboard
- Use that email in Sender Email field

---

### Option B: SendGrid Setup

#### 1. Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up
3. Verify email and create account

#### 2. Generate API Key
1. Go to **Settings → API Keys**
2. Click **Create API Key**
3. Name it (e.g., "DropPay Email")
4. Copy the key (starts with `SG.`)
5. Save securely

#### 3. Configure Supabase Email
1. Go to Supabase Dashboard
2. Navigate to **Project Settings → Email**
3. Enable **Custom SMTP**
4. Fill in:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@yourdomain.com
Sender Name: DropPay
```

#### 4. Verify Domain (Optional but Recommended)
- Add domain to SendGrid to improve deliverability
- Follow verification steps in SendGrid dashboard

---

### Option C: AWS SES Setup

#### 1. Request Production Access
1. Go to AWS SES Console
2. Verify email address or domain
3. Request production access (move out of sandbox)

#### 2. Generate SMTP Credentials
1. Go to **SES → Account Dashboard**
2. Click **Create SMTP Credentials**
3. Download credentials (Username and Password)
4. Save securely

#### 3. Configure Supabase Email
1. Go to Supabase Dashboard
2. Navigate to **Project Settings → Email**
3. Enable **Custom SMTP**
4. Fill in:

```
SMTP Host: email-smtp.[region].amazonaws.com
SMTP Port: 465
SMTP Username: [From AWS credentials]
SMTP Password: [From AWS credentials]
Sender Email: [Verified email in SES]
Sender Name: DropPay
```

Replace `[region]` with your AWS region (e.g., `us-east-1`, `eu-west-1`)

---

## Step 2: Enable Custom SMTP in Supabase

### In Supabase Dashboard:

1. **Go to Project Settings**
   - Click gear icon → Settings

2. **Navigate to Email Configuration**
   - Look for "Email" or "Email Settings"
   - May be under "Email Templates" section

3. **Enable Custom SMTP**
   - Toggle "Custom SMTP" ON
   - Fill in the SMTP details from your provider

4. **Test Configuration**
   - Send test email to verify setup
   - Check for delivery

### Email Configuration Fields:

```
Provider: Custom SMTP
SMTP Host: [From provider above]
SMTP Port: [From provider above]
SMTP Username: [From provider above]
SMTP Password: [From provider above]
From Email: noreply@yourdomain.com
From Name: DropPay
Enable SSL/TLS: Yes (usually)
```

---

## Step 3: Use Email in Edge Functions

### Using Supabase `auth.users` for Email

The Supabase `auth` service automatically uses configured SMTP to send:
- Welcome emails
- Password reset emails
- Email confirmation emails

### Custom Email from Edge Function

For sending custom emails from edge functions, use the Supabase client:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Send email via Supabase Auth
const { data, error } = await supabase.auth.admin.sendRawEmail({
  to: buyerEmail,
  html: htmlContent,
  subject: "Your DropPay Receipt",
});
```

OR use native SMTP with Deno:

```typescript
import { SmtpClient } from "https://deno.land/x/smtp@v0.16.0/mod.ts";

const client = new SmtpClient({
  hostname: Deno.env.get("SMTP_HOST"),
  port: 465,
  username: Deno.env.get("SMTP_USERNAME"),
  password: Deno.env.get("SMTP_PASSWORD"),
  tls: true,
});

await client.connect();
await client.send({
  from: "noreply@droppay.com",
  to: buyerEmail,
  subject: "Your DropPay Receipt",
  content: plaintext,
  html: htmlContent,
});
await client.close();
```

---

## Step 4: Set Environment Variables

Add these to Supabase Secrets:

```bash
# In Supabase CLI or Dashboard → Settings → Secrets

SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USERNAME=resend
SMTP_PASSWORD=re_xxxxxxxxxxxx
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=DropPay
```

Set via CLI:
```bash
supabase secrets set SMTP_HOST=smtp.resend.com
supabase secrets set SMTP_USERNAME=resend
supabase secrets set SMTP_PASSWORD=re_xxxxxxxxxxxx
# etc...
```

---

## Step 5: Test Email Sending

### Test via Supabase CLI:

```bash
# Test email configuration
supabase functions invoke send-receipt-email --no-verify-jwt \
  --body '{
    "transactionId": "test-123",
    "buyerEmail": "your-email@example.com",
    "paymentLinkTitle": "Test Payment",
    "merchantName": "Test Merchant",
    "payerUsername": "testuser",
    "amount": 10.5,
    "currency": "Pi",
    "txid": "blockchain-test-id",
    "isBlockchainVerified": true
  }'
```

### Expected Response:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "email": "your-email@example.com"
}
```

### Check Inbox:
- Check your email inbox
- If not found, check spam folder
- Verify sender email is correct

---

## Troubleshooting

### Email Not Arriving

**Check:**
1. Verify sender email is configured correctly
2. Check spam/junk folder
3. Verify SMTP credentials are correct
4. Check email provider logs
5. Ensure email address is valid

### SMTP Connection Error

**Fix:**
1. Double-check SMTP host and port
2. Verify API key/password is correct
3. Check firewall settings
4. Ensure TLS/SSL is enabled

### Authentication Failed

**Fix:**
1. Regenerate API key in email provider
2. Copy entire key (no extra spaces)
3. Update in Supabase
4. Test again

### Domain Verification Issues

**Fix:**
1. Add domain to email provider
2. Follow verification steps (usually DNS records)
3. Wait for verification (can take hours)
4. Update sender email to use verified domain

---

## Updated send-receipt-email Function

After SMTP is configured, the edge function can use:

```typescript
import { SmtpClient } from "https://deno.land/x/smtp@v0.16.0/mod.ts";

const client = new SmtpClient({
  hostname: Deno.env.get("SMTP_HOST")!,
  port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
  username: Deno.env.get("SMTP_USERNAME")!,
  password: Deno.env.get("SMTP_PASSWORD")!,
  tls: true,
});

await client.connect();

await client.send({
  from: `${Deno.env.get("SMTP_FROM_NAME")} <${Deno.env.get("SMTP_FROM_EMAIL")}>`,
  to: buyerEmail,
  subject: `DropPay Receipt - ${transactionId}`,
  content: receiptContent,
  html: receiptHtml,
});

await client.close();

return new Response(
  JSON.stringify({
    success: true,
    message: "Receipt email sent successfully",
    email: buyerEmail,
    transactionId,
  }),
  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

---

## Email Template Best Practices

### From Address
- Use recognizable sender name: `"DropPay Support" <noreply@droppay.com>`
- Include business name for trust
- Use consistent address

### Subject Line
- Keep it clear: `"Your DropPay Transaction Receipt - #12345"`
- Include receipt ID for easy search
- Avoid spam trigger words

### Email Content
- Include transaction details
- Add blockchain verification status
- Provide block explorer link
- Include support contact info
- Add unsubscribe link (if required)

### Design
- Mobile responsive
- Clear hierarchy
- Company branding/logo
- Professional layout
- Testing in multiple clients

---

## Deployment Checklist

- [ ] Choose email provider (Resend/SendGrid/AWS SES)
- [ ] Create account and get API credentials
- [ ] Enable Custom SMTP in Supabase
- [ ] Configure SMTP settings
- [ ] Set environment variables in Supabase Secrets
- [ ] Test email sending
- [ ] Verify emails arrive in inbox
- [ ] Check spam folder rules
- [ ] Update send-receipt-email function
- [ ] Deploy updated edge function
- [ ] Test full payment flow with email

---

## Support & Monitoring

### Monitor Email Delivery
- Check email provider dashboard
- Review bounce/failure rates
- Monitor open rates
- Track delivery success

### Handle Failures
- Implement retry logic (exponential backoff)
- Log failed emails
- Alert on high failure rates
- Have fallback notifications

### Best Practices
- Validate email addresses
- Implement rate limiting
- Monitor SMTP connection
- Handle provider outages
- Keep sender reputation high

---

**Next Steps:**
1. Select email provider (recommend Resend for quick setup)
2. Create account and get API key
3. Configure in Supabase
4. Test with send-receipt-email function
5. Deploy and test with real payment

