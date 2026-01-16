# DropPay Deployment & Testing Checklist

## Pre-Launch Verification

### 1. Environment Setup
- [ ] `.env.local` created with all keys:
  ```
  VITE_PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
  VITE_PI_VALIDATION_KEY=ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a
  VITE_PI_SANDBOX_MODE=false
  VITE_SUPABASE_URL=https://xoofailhzhfyebzpzrfs.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=[key]
  ```
- [ ] Supabase secrets set:
  ```bash
  supabase secrets set PI_API_KEY="..."
  supabase secrets set PI_VALIDATION_KEY="..."
  ```

### 2. Pi Network Configuration
- [ ] SDK loads correctly (check console: "🔧 Pi SDK loaded successfully")
- [ ] Sandbox mode disabled (VITE_PI_SANDBOX_MODE=false for mainnet)
- [ ] Scopes correct: username, payments, wallet_address
- [ ] API keys match official keys from DropPay account

### 3. Authentication Testing

**In Pi Browser:**
1. [ ] Open https://droppay.space in Pi Browser
2. [ ] Click "Connect Pi Wallet"
3. [ ] Authenticate with Pi account
4. [ ] Console shows: "✅ Pi authentication successful"
5. [ ] Username displays: @YourPiUsername

**In Regular Browser (Demo):**
1. [ ] Open http://localhost:3000 in Chrome
2. [ ] Click "Connect Pi Wallet"
3. [ ] Confirm demo mode dialog
4. [ ] Creates demo user for testing

### 4. Payment Link Creation
- [ ] User can create payment link
- [ ] Title, amount, description save correctly
- [ ] File upload works (shows "✅ File uploaded")
- [ ] Payment type selected (one-time, recurring, etc.)
- [ ] Link slug generates and is unique

### 5. Payment Testing

**With Real Payment (Pi Browser required):**
1. [ ] Navigate to payment link
2. [ ] Amount displays correctly
3. [ ] "Paying to @YourUsername" shows correct creator
4. [ ] Click "Pay πX.XX"
5. [ ] Pi Wallet opens
6. [ ] Approve payment
7. [ ] Payment processes
8. [ ] Transaction verified on blockchain
9. [ ] User sees success message
10. [ ] Download email sent (if file attached)

**With Demo Payment (Regular Browser):**
1. [ ] Payment link loads
2. [ ] "Paying to Merchant" shows
3. [ ] Click pay button
4. [ ] Demo transaction created
5. [ ] Success page displays

### 6. File Upload & Delivery
- [ ] File uploads to Supabase storage
- [ ] Console shows: "✅ File uploaded" and "✅ Public URL generated"
- [ ] After payment, signed URL generated
- [ ] Email sent with download link
- [ ] Download link works for 24 hours
- [ ] File downloads successfully

### 7. Admin Features
- [ ] Admin login restricted to @Wain2020
- [ ] Admin badge displays in sidebar
- [ ] Withdrawal page shows pending payments
- [ ] Can approve/deny withdrawals
- [ ] Transaction history accurate

### 8. Database
- [ ] payment_links table has records
- [ ] merchants table created (optional)
- [ ] transactions table logs all payments
- [ ] Users can retrieve their links

### 9. Email Delivery
- [ ] Download links email sent after payment
- [ ] Receipt email includes transaction details
- [ ] Withdrawal confirmation emails sent

### 10. Blockchain Verification
- [ ] Payment on Pi Blockchain
- [ ] Transaction visible on block explorer:
  https://blockexplorer.minepi.com/mainnet/
- [ ] Shows: sender, receiver, amount, timestamp

---

## Deployment Steps

### Step 1: Prepare Repository
```bash
git add .
git commit -m "DropPay production ready - Pi auth, payments, file uploads"
git push origin main
```

### Step 2: Deploy Edge Functions
```bash
supabase functions deploy approve-payment
supabase functions deploy complete-payment
supabase functions deploy verify-payment
supabase functions deploy send-download-email
supabase functions deploy process-withdrawal
supabase functions deploy delete-account
supabase functions deploy verify-ad-reward
```

### Step 3: Verify Deployment
```bash
supabase functions list
supabase secrets list
```

### Step 4: Build Frontend
```bash
npm run build
# or
bun run build
```

### Step 5: Deploy Frontend
Options:
- **Vercel:** `vercel deploy`
- **Netlify:** `netlify deploy`
- **Self-hosted:** Copy `dist/` to web server

### Step 6: Test Live
1. Visit production URL
2. Complete full user flow
3. Verify payments on blockchain
4. Check logs for errors

---

## Console Log Monitoring

When testing, look for these **success indicators** in browser console (F12):

### Authentication
```
🔧 Pi SDK loaded successfully - Sandbox Mode
🔧 Pi SDK initialized: Mainnet
🔐 Starting Pi Network authentication...
✅ Pi authentication successful: @Wain2020
✅ Found stored user session: @Wain2020
```

### Payment
```
🔼 Creating payment: amount, memo
✅ Payment approved: paymentId
✅ Payment completed: txid
✅ Verifying on blockchain...
✅ Payment verified: verified=true
```

### File Upload
```
🔼 Uploading file: filename
✅ File uploaded: uuid/timestamp.ext
✅ Public URL generated: https://...
```

### Merchant Username
```
✅ Setting merchant username from DB: @Wain2020
✅ Merchant username found in link object: @Wain2020
✅ Using stored user username: @Wain2020
```

---

## Error Troubleshooting

### Error: "Pi Browser Required"
- **Cause:** Not in Pi Browser
- **Fix:** Open in Pi Browser app or use demo mode

### Error: "Storage bucket not found"
- **Cause:** payment-content bucket doesn't exist
- **Fix:** Create in Supabase Dashboard → Storage

### Error: "Failed to upload file"
- **Cause:** Bucket is private or RLS issues
- **Fix:** Make bucket public and set RLS policies

### Error: "Payment failed"
- **Cause:** Amount mismatch or validation failed
- **Fix:** Check /approve-payment edge function logs

### Error: "Authentication timeout"
- **Cause:** Pi SDK not responding
- **Fix:** Close and reopen app, check Pi Browser version

---

## Performance Checklist

- [ ] Page load time < 3 seconds
- [ ] Payment flow < 30 seconds
- [ ] File upload < 2 seconds
- [ ] Email sends within 5 seconds
- [ ] No console errors

---

## Security Checklist

- [ ] API keys not hardcoded in source
- [ ] All secrets in Supabase, not .env
- [ ] CORS only allows your domain
- [ ] RLS policies restrict data access
- [ ] Signed URLs expire after 24 hours
- [ ] Admin access restricted to @Wain2020
- [ ] No sensitive data in localStorage
- [ ] Transactions verified on blockchain

---

## Post-Launch Monitoring

### Daily Tasks
- [ ] Check for failed transactions
- [ ] Review error logs
- [ ] Verify payments on blockchain
- [ ] Test email delivery

### Weekly Tasks
- [ ] Check payment success rate
- [ ] Monitor storage usage
- [ ] Review withdrawal requests
- [ ] Analyze user engagement

### Monthly Tasks
- [ ] Review performance metrics
- [ ] Update documentation
- [ ] Security audit
- [ ] Backup database

---

## Support Resources

- **Pi Network Docs:** https://pi-apps.github.io/community-developer-guide/
- **Platform API:** https://github.com/pi-apps/pi-platform-docs/tree/master
- **Block Explorer:** https://blockexplorer.minepi.com/mainnet/
- **Supabase Docs:** https://supabase.com/docs
- **Status Page:** https://status.supabase.com

