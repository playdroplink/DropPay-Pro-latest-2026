# DropPay Pi Payment - Quick Reference Card

**Updated**: January 8, 2026  
**Status**: ✅ Production Ready

---

## 🔑 API Credentials

```
API Key:        a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
Validation Key: ca9a30c58a15511860751e51e1e92fc5e1346e8194...73cd83a (64 chars)
Network:        Mainnet (Production)
SDK Version:    2.0
```

---

## 🚀 Quick Deployment

```bash
# 1. Set secret
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"

# 2. Deploy functions
supabase functions deploy approve-payment
supabase functions deploy complete-payment

# 3. Test
# Open payment link in Pi Browser → Authenticate → Pay → Verify
```

---

## 📝 Configuration

| Variable | Value |
|----------|-------|
| `VITE_PI_SANDBOX_MODE` | `false` |
| `VITE_PI_NETWORK` | `mainnet` |
| `VITE_PI_SDK_VERSION` | `2.0` |
| `VITE_PI_SANDBOX_MODE` | `false` |
| `VITE_PI_SDK_URL` | `https://sdk.minepi.com/pi-sdk.js` |

---

## 🔗 API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/functions/v1/approve-payment` | Server-side approval |
| `/functions/v1/complete-payment` | Server-side completion |
| `https://api.minepi.com/v2/payments/{id}/approve` | Pi API approve |
| `https://api.minepi.com/v2/payments/{id}/complete` | Pi API complete |
| `https://horizon.stellar.org/transactions/{txid}` | Blockchain verify |

---

## 💳 Payment Flow

```
1. Authenticate (Pi.authenticate)
   ↓
2. Create Payment (Pi.createPayment)
   ↓
3. Approve (onReadyForServerApproval)
   → Edge function → Pi API
   ↓
4. Complete (onReadyForServerCompletion)
   → Edge function → Pi API → Supabase DB
   ↓
5. Verify (Stellar Horizon)
   → Mark as verified
   ↓
6. Deliver (Email)
   → Send receipt & content
```

---

## 💰 Fee Structure

| Type | Calculation |
|------|------------|
| One-Time | amount × 1.02 |
| Donation | custom × 1.02 |
| Subscription | amount × 1.02 |
| Free | no fee |

**Example**: 100 π → Customer pays 102 π (2% fee) → Merchant gets 100 π

---

## 🔐 Security

- ✅ API key in Supabase secrets only
- ✅ Auth header: `Key ${API_KEY}`
- ✅ POST method validation
- ✅ JSON payload validation
- ✅ Blockchain verification
- ✅ Email validation
- ✅ HTTPS only

---

## 🧪 Test Scenarios

```javascript
// Test 1: Small payment
amount: 0.01 π
status: Should complete in < 30 seconds

// Test 2: Free payment
amount: 0
status: Should skip payment screen

// Test 3: Subscription
title: "Pro Plan Subscription"
status: Should activate subscription

// Test 4: With content
content_file: set
status: Should send email with download link
```

---

## 📊 Key Files

| File | Purpose |
|------|---------|
| `.env` | Frontend config |
| `src/contexts/AuthContext.tsx` | Pi SDK init |
| `src/pages/PayPage.tsx` | Payment flow |
| `supabase/functions/approve-payment/index.ts` | Server approval |
| `supabase/functions/complete-payment/index.ts` | Server completion |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Not in Pi Browser" | Open link in Pi Browser app |
| "API key not found" | Run `supabase secrets set PI_API_KEY=...` |
| "Payment timed out" | Check network connection |
| "Authorization failed" | Verify API key is correct |
| "Method not allowed" | Use POST for edge functions |

---

## 📋 Pre-Launch Checklist

- [ ] API key set in Supabase secrets
- [ ] Functions deployed
- [ ] Test payment successful
- [ ] Transaction recorded in DB
- [ ] Blockchain verification passed
- [ ] Email delivery tested
- [ ] Frontend .env configured
- [ ] Error logging enabled
- [ ] CORS headers correct
- [ ] Docs reviewed

---

## 🔗 Resources

- **Docs**: https://pi-apps.github.io/community-developer-guide/
- **Ad Network**: https://github.com/pi-apps/pi-platform-docs
- **Horizon**: https://horizon.stellar.org
- **SDK**: https://sdk.minepi.com/pi-sdk.js

---

## ✅ Status Indicators

| Component | Status |
|-----------|--------|
| Authentication | ✅ Active |
| Payments | ✅ Active |
| Ad Network | ✅ Active |
| Blockchain | ✅ Verified |
| Email | ✅ Configured |
| Database | ✅ Ready |
| Edge Functions | ✅ Hardened |
| Security | ✅ Approved |

---

## 💡 Quick Tips

1. **Always use Pi Browser** - Links must open in Pi Browser app
2. **Check logs** - Supabase dashboard → Functions → Logs
3. **Verify txid** - Format: 64-character hex string
4. **Test small amounts** - Start with 0.01 π payments
5. **Monitor transactions** - Check Supabase dashboard for records
6. **Verify blockchain** - Check Stellar Horizon for txid
7. **Send emails** - Use Resend API for delivery notifications
8. **Track analytics** - Use transaction conversion counter

---

**Version**: 2.0 | **Updated**: Jan 8, 2026 | **Status**: Production Ready
