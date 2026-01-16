# DropPay Environment Setup Guide

## Overview
DropPay uses separate environment configurations for frontend (browser) and backend (Supabase Edge Functions). This guide explains how to set up both.

---

## Frontend Setup (.env file)

The frontend uses Vite and only exposes variables prefixed with `VITE_`. Create/update `.env`:

```bash
# Public Supabase configuration (safe to expose)
VITE_SUPABASE_URL="https://xoofailhzhfyebzpzrfs.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_PROJECT_ID="xoofailhzhfyebzpzrfs"
```

**Never add these to .env:**
- Service role keys
- Pi API keys
- Private tokens
- Domain validation keys

---

## Backend Setup (Supabase Secrets)

Edge functions need secrets that must NOT be in tracked files. Set them using Supabase CLI:

### 1. Install Supabase CLI (if not installed)
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link your project
```bash
supabase link --project-ref xoofailhzhfyebzpzrfs
```

### 4. Set Required Secrets

```bash
# Pi Network API Key (get from https://developers.minepi.com)
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"

# Supabase Configuration
supabase secrets set SUPABASE_URL="https://xoofailhzhfyebzpzrfs.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# CORS Configuration (* for development, specific domain for production)
supabase secrets set ALLOW_ORIGIN="*"

# Optional: Email delivery (get from https://resend.com)
supabase secrets set RESEND_API_KEY="re_..."
```

### 5. Verify Secrets
```bash
supabase secrets list
```

### 6. Deploy Edge Functions
```bash
supabase functions deploy approve-payment
supabase functions deploy complete-payment
supabase functions deploy verify-payment
supabase functions deploy verify-ad-reward
supabase functions deploy process-withdrawal
supabase functions deploy send-download-email
supabase functions deploy delete-account
```

---

## Environment Variables Reference

### Frontend (Browser - Safe)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon key | `eyJhbGci...` |
| `VITE_SUPABASE_PROJECT_ID` | Project reference ID | `xoofailhzhfyebzpzrfs` |

### Backend (Edge Functions - Secret)
| Variable | Description | Required For |
|----------|-------------|--------------|
| `PI_API_KEY` | Pi Network API key | All payment operations |
| `SUPABASE_URL` | Supabase URL | All database operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | All database writes |
| `ALLOW_ORIGIN` | CORS allowed origins | All function calls |
| `RESEND_API_KEY` | Email service key | Download email delivery |

---

## Security Best Practices

### ✅ DO:
- Keep secrets in Supabase secrets (CLI)
- Use `.env.local` for local overrides (gitignored)
- Rotate keys immediately if exposed
- Use specific domains in `ALLOW_ORIGIN` for production
- Set minimum RLS policies on all tables

### ❌ DON'T:
- Commit `.env` files with real secrets
- Use `VITE_` prefix for sensitive data
- Share service role keys in frontend code
- Use `ALLOW_ORIGIN=*` in production
- Store Pi API keys in browser-accessible variables

---

## Testing Your Setup

### 1. Frontend Check
```bash
npm run dev
```
Visit `http://localhost:5173` and check browser console for:
- ✅ Supabase client initialized
- ✅ No secret key warnings

### 2. Backend Check (Edge Functions)
Test approve-payment:
```bash
curl -i https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/approve-payment \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"test","paymentLinkId":"test"}'
```

Expected: Should return error about invalid payment ID (not missing secrets)

### 3. Full Flow Test
1. Open app in Pi Browser
2. Click "Login with Pi" (should authenticate)
3. Create a payment link
4. Pay using Pi (should call approve → complete → verify)
5. Check Supabase logs for successful function calls

---

## Troubleshooting

### "Missing PI_API_KEY secret"
```bash
supabase secrets set PI_API_KEY="your_key_here"
supabase functions deploy approve-payment complete-payment
```

### "CORS error"
```bash
supabase secrets set ALLOW_ORIGIN="http://localhost:5173"  # or your domain
supabase functions deploy [function-name]
```

### "Cannot read environment variable"
Frontend: Check `.env` has `VITE_` prefix  
Backend: Check secrets are set with `supabase secrets list`

### "Service role key exposed"
1. Rotate key in Supabase dashboard (Settings → API)
2. Update secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY="new_key"`
3. Redeploy all functions

---

## Production Checklist

- [ ] Rotate all keys from development
- [ ] Set `ALLOW_ORIGIN` to production domain only
- [ ] Remove `VITE_` prefix from any sensitive variables
- [ ] Enable RLS on all Supabase tables
- [ ] Test payment flow in Pi Browser on mainnet
- [ ] Set up monitoring/alerts for edge function errors
- [ ] Document backup Pi API key (store securely)
- [ ] Enable Supabase database backups
- [ ] Configure custom domain (optional)
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

---

## Quick Reference Commands

```bash
# Check current secrets
supabase secrets list

# Update a secret
supabase secrets set SECRET_NAME="new_value"

# Delete a secret
supabase secrets unset SECRET_NAME

# Deploy single function
supabase functions deploy function-name

# Deploy all functions
supabase functions deploy

# View function logs
supabase functions logs function-name --tail

# Test function locally
supabase functions serve function-name
```

---

## Support

- Pi Network Docs: https://pi-apps.github.io/community-developer-guide/
- Supabase Docs: https://supabase.com/docs
- DropPay Integration Guide: See [README.md](../README.md)
