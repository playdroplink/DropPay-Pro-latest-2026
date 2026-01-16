# DropPay Pi Network Configuration

## Pi Network API Keys

Your DropPay instance is configured with the following Pi Network credentials:

### Frontend Configuration (.env.local)
```
VITE_PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
VITE_PI_VALIDATION_KEY=ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a
VITE_PI_SANDBOX_MODE=false  # Mainnet (production)
```

### Backend Secrets (Supabase Edge Functions)
Set these using Supabase CLI:
```bash
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
supabase secrets set PI_VALIDATION_KEY="ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a"
```

---

## Documentation

### Pi Network Payment Integration
Official Pi Network developer documentation and payment flow guide:
- **Link:** https://pi-apps.github.io/community-developer-guide/
- **Topics:** Authentication, Payment creation, Callback handling, Blockchain verification

### Pi Network Ad Network & Platform Docs
Complete Pi Apps platform documentation including ad network rewards:
- **Link:** https://github.com/pi-apps/pi-platform-docs/tree/master
- **Topics:** Ad network SDK, Reward system, Platform integration

---

## Feature Implementation

DropPay uses these Pi Network features:

### 1. Authentication
- **Method:** Pi.authenticate() with scopes: `username`, `payments`, `wallet_address`
- **File:** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- **Mode:** Mainnet (production) - Set `VITE_PI_SANDBOX_MODE=false`

### 2. Payment Processing
- **Method:** Pi.createPayment() with callbacks
- **Callbacks:** onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError
- **File:** [src/pages/PayPage.tsx](src/pages/PayPage.tsx)
- **Backend:** [supabase/functions/approve-payment](supabase/functions/approve-payment), [supabase/functions/complete-payment](supabase/functions/complete-payment)

### 3. Blockchain Verification
- **Method:** Pi Network API verification endpoint
- **File:** [supabase/functions/verify-payment](supabase/functions/verify-payment)
- **Purpose:** Confirm transaction on Pi Blockchain

### 4. Payment Links
- **Create:** [src/pages/PaymentLinks.tsx](src/pages/PaymentLinks.tsx)
- **Checkout:** [src/pages/PayPage.tsx](src/pages/PayPage.tsx)
- **Database:** `payment_links` table with merchant_id FK

---

## Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_PI_API_KEY` | a7hucm1nw... | Pi Network API key for authentication requests |
| `VITE_PI_VALIDATION_KEY` | ca9a30c5... | Validation key for payment verification |
| `VITE_PI_SANDBOX_MODE` | false | false = Mainnet (production), true = Testnet |
| `VITE_SUPABASE_URL` | https://... | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ... | Supabase public API key |

---

## Testing

### In Pi Browser (Production)
1. Open https://your-domain.com in Pi Browser app
2. Authenticate with your Pi account
3. Create payment link
4. Make payment - Pi SDK handles the flow
5. Transaction verified on Pi Blockchain

### In Regular Browser (Demo Mode)
1. Open http://localhost:8080 in Chrome, Firefox, Safari, etc.
2. Demo mode enables authentication and payment simulation
3. No actual Pi payment (sandbox/demo only)
4. Good for UI testing before Pi Browser testing

---

## Deployment Checklist

- [ ] Update `.env.local` with these keys (frontend)
- [ ] Deploy Supabase Edge Functions: `supabase functions deploy --all`
- [ ] Set backend secrets: `supabase secrets set PI_API_KEY="..."` and `PI_VALIDATION_KEY="..."`
- [ ] Test in Pi Browser
- [ ] Verify blockchain transactions on [Pi Block Explorer](https://blockexplorer.minepi.com/mainnet/)

---

## Support

- **Pi Network Docs:** https://pi-apps.github.io/community-developer-guide/
- **Pi Platform Docs:** https://github.com/pi-apps/pi-platform-docs/tree/master
- **Block Explorer:** https://blockexplorer.minepi.com/mainnet/

