# Supabase Sender Email Configuration

## Supabase Email Settings Fields

When you enable Custom SMTP in Supabase, you'll see these fields:

```
Sender Email: [email address]
Sender Name: [display name]
```

## For DropPay Setup

### Option 1: Using a Domain Email (Best)

**Sender Email:**
```
noreply@droppay.space
```
(or noreply@yourdomain.com if you have your own domain)

**Sender Name:**
```
DropPay Support
```

**In Recipient's Inbox It Shows:**
```
From: DropPay Support <noreply@droppay.space>
```

### Option 2: Using Resend's Domain (If No Custom Domain)

**Sender Email:**
```
onboarding@resend.dev  (Resend's default)
```

**Sender Name:**
```
DropPay
```

**In Recipient's Inbox It Shows:**
```
From: DropPay <onboarding@resend.dev>
```

### Option 3: Using SendGrid Domain

**Sender Email:**
```
noreply@sendgrid.net  (or your verified domain)
```

**Sender Name:**
```
DropPay Team
```

---

## Important Notes

### Email Must Be Verified
- **Resend**: Verify domain or email in Resend dashboard
- **SendGrid**: Verify sender domain (goes in DNS)
- **AWS SES**: Verify email/domain before sending

### What Recipient Sees
The sender name appears in their inbox:
```
DropPay Support  ← This is the Sender Name
←───────────────────────
From: noreply@droppay.space ← This is the Sender Email
```

### Best Practices
1. **Use recognizable name** → "DropPay Support" or "DropPay Team"
2. **Use no-reply address** → noreply@domain prevents reply confusion
3. **Match your branding** → Should clearly be from DropPay
4. **Keep consistent** → Use same sender across all emails

---

## Step-by-Step Supabase Setup

1. **Go to Supabase Dashboard**
   - Project Settings → Email

2. **Find "Custom SMTP" Section**
   - Toggle it ON

3. **Fill in Sender Fields**
   ```
   Sender Email: noreply@droppay.space
   Sender Name: DropPay Support
   ```

4. **Fill in SMTP Fields**
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 465
   SMTP Username: resend
   SMTP Password: [Your API Key]
   ```

5. **Enable TLS/SSL**
   - Usually checked by default
   - Keep it ON

6. **Test Email**
   - Send test email to verify
   - Check inbox and spam

7. **Save Settings**

---

## Email Provider Setup (Before Supabase)

### For Resend:
1. Go to https://resend.com
2. Create account
3. Get API key
4. **Add verified sender email:**
   - Click "Domains" 
   - Add your domain (droppay.space)
   - OR add email (noreply@yourdomain.com)
   - Verify per instructions
5. Use verified email as Sender Email in Supabase

### For SendGrid:
1. Go to https://sendgrid.com
2. Create account
3. Get API key
4. **Verify Sender Domain:**
   - Settings → Sender Authentication
   - Add domain (droppay.space)
   - Add DNS records
   - Wait for verification
5. Use verified domain in Supabase

### For AWS SES:
1. Go to AWS SES Console
2. Verify email/domain
3. Create SMTP credentials
4. Request production access
5. Use verified email in Supabase

---

## Recommended Configuration for DropPay

**If you have droppay.space domain:**
```
Sender Email: noreply@droppay.space
Sender Name: DropPay Support
```

**If using Resend free tier (no domain):**
```
Sender Email: onboarding@resend.dev
Sender Name: DropPay
```

**If using SendGrid:**
```
Sender Email: noreply@yourdomain.com
Sender Name: DropPay Support
```

---

## Testing the Configuration

After setup, test with:

```bash
supabase functions invoke send-receipt-email --no-verify-jwt \
  --body '{
    "transactionId": "test-123",
    "buyerEmail": "your-test-email@gmail.com",
    "paymentLinkTitle": "Test Product",
    "merchantName": "Test Merchant",
    "payerUsername": "testuser",
    "amount": 10.5,
    "currency": "Pi",
    "txid": "test-tx-id",
    "isBlockchainVerified": true
  }'
```

**Check the email:**
- Should say "From: DropPay Support <noreply@droppay.space>"
- Should include receipt details
- Should arrive in inbox or spam folder

---

## Verification Checklist

- [ ] Email provider account created
- [ ] Sender email verified in provider
- [ ] API key generated
- [ ] Supabase secrets set (SMTP_HOST, SMTP_USERNAME, etc.)
- [ ] Supabase Custom SMTP enabled
- [ ] Sender Email set to verified email
- [ ] Sender Name set to "DropPay Support"
- [ ] Test email sent and received
- [ ] Edge function deployed
- [ ] Production payment tested

Once verified, you're ready to receive transaction receipts!

