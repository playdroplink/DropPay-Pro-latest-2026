# Supabase SMTP Configuration with Resend

Your Resend API Key: `re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u`

## Step 1: Verify Sender Email in Resend

Before setting up Supabase, verify your sender email in Resend:

1. Go to https://resend.com/emails
2. Sign in with your account
3. Click "Add Sender Email" or "Domains"
4. Add and verify: `noreply@droppay.space` (or any email you want to send from)
5. Follow verification instructions
6. Once verified, you can use it in Supabase

---

## Step 2: Set Supabase Secrets

Run these commands in terminal:

```bash
supabase secrets set SMTP_HOST="smtp.resend.com"
supabase secrets set SMTP_PORT="465"
supabase secrets set SMTP_USERNAME="resend"
supabase secrets set SMTP_PASSWORD="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"
supabase secrets set SMTP_FROM_EMAIL="noreply@droppay.space"
supabase secrets set SMTP_FROM_NAME="DropPay Support"
```

Or if you verified a different email:

```bash
supabase secrets set SMTP_FROM_EMAIL="your-verified-email@example.com"
```

---

## Step 3: Verify Secrets Were Set

```bash
supabase secrets list
```

Should show:
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USERNAME=resend
SMTP_PASSWORD=re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u
SMTP_FROM_EMAIL=noreply@droppay.space
SMTP_FROM_NAME=DropPay Support
```

---

## Step 4: Deploy Edge Function

```bash
supabase functions deploy send-receipt-email --no-verify-jwt
```

---

## Step 5: Test Email Sending

```bash
supabase functions invoke send-receipt-email --no-verify-jwt \
  --body '{
    "transactionId": "test-receipt-123",
    "buyerEmail": "your-test-email@gmail.com",
    "paymentLinkTitle": "Test Payment Link",
    "merchantName": "DropPay Test",
    "payerUsername": "testpiuser",
    "amount": 10.5,
    "currency": "Pi",
    "txid": "test-blockchain-tx-id",
    "isBlockchainVerified": true
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Receipt email sent successfully",
  "email": "your-test-email@gmail.com",
  "transactionId": "test-receipt-123"
}
```

**Check your email:**
- Look for email from "DropPay Support <noreply@droppay.space>"
- Should contain your transaction receipt
- Check spam folder if not found

---

## Complete Setup Summary

```
✅ Resend API Key: Configured
✅ SMTP Host: smtp.resend.com
✅ SMTP Port: 465
✅ SMTP Username: resend
✅ SMTP Password: [Your API Key]
✅ Sender Email: noreply@droppay.space
✅ Sender Name: DropPay Support
✅ Edge Function: send-receipt-email
✅ Ready to send transaction receipts!
```

---

## Troubleshooting

**Email not arriving:**
1. Check spam folder
2. Verify sender email is confirmed in Resend
3. Check Resend dashboard for bounce/errors
4. Ensure email address is valid

**SMTP connection error:**
1. Verify API key is correct (copy from Resend again)
2. Check SMTP_HOST is `smtp.resend.com`
3. Check SMTP_PORT is `465`

**Need to change sender email:**
1. Verify new email in Resend dashboard
2. Update SMTP_FROM_EMAIL secret:
   ```bash
   supabase secrets set SMTP_FROM_EMAIL="new-email@example.com"
   ```
3. Redeploy edge function:
   ```bash
   supabase functions deploy send-receipt-email --no-verify-jwt
   ```

