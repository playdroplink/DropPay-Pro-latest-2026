# DropPay Integration Guide

DropPay is a Pi Network–native payment gateway. It lets merchants create payment links, collect Pi payments, deliver digital goods, and request payouts with Stripe-like flows. This guide explains how to set up the stack, run it locally, and integrate DropPay into any site or app.

---

## What You Get
- Pi authentication and session management (frontend) in [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- Payment links and checkout UI in [src/pages/PaymentLinks.tsx](src/pages/PaymentLinks.tsx) and [src/pages/PayPage.tsx](src/pages/PayPage.tsx)
- Supabase Edge Functions for payment approval/completion/verification, rewards, email delivery, and withdrawals under [supabase/functions](supabase/functions)
- Admin payouts workflow in [src/pages/AdminWithdrawals.tsx](src/pages/AdminWithdrawals.tsx)
- Tracking links, ad rewards, digital file delivery, subscriptions, and widgets/routes wired in [src/App.tsx](src/App.tsx)

## Documentation
- Complete reference: [DROPPAY_COMPLETE_DOCUMENTATION.md](DROPPAY_COMPLETE_DOCUMENTATION.md)
- Quick implementation guide: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

---

## Prerequisites
- Node.js 18+ and npm (or bun) installed
- Supabase project and Supabase CLI configured
- Pi Developer account with `PI_API_KEY` and Pi Browser for testing
- Optional: Resend account for download emails

---

## Environment Variables

Create a `.env.local` for the frontend:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Pi Network (from https://pi-apps.github.io/community-developer-guide/)
VITE_PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
VITE_PI_VALIDATION_KEY=ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a
VITE_PI_SANDBOX_MODE=false  # Mainnet by default
```

**Important:** Do not commit `.env.local` to git.

Set Supabase Edge Function secrets (use `supabase secrets set`):

```bash
PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
PI_VALIDATION_KEY=ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
ALLOW_ORIGIN=<frontend_origin_or_*_for_dev>
RESEND_API_KEY=<resend_key_if_sending_download_emails>
```

Do not commit real keys. Redeploy functions after changing secrets.

---

## Local Setup
1. Install dependencies:
	 ```bash
	 npm install
	 ```
2. Set up environment:
	 - Copy `.env.example` to `.env.local`
	 - Fill in `VITE_SUPABASE_*` keys from your Supabase project
	 - Fill in `VITE_PI_*` keys from https://pi-apps.github.io/community-developer-guide/
3. Start the app:
	 ```bash
	 npm run dev
	 ```
4. Apply database changes:
	 - Run migrations in `supabase/migrations` (includes tracking links, subscription fixes, withdrawal tracking).
	 - Optional: Remove FK constraint on `payment_links.merchant_id` if you want truly zero merchant setup (see "Database Notes" below).

---

## Deploy Edge Functions
Deploy all functions after setting secrets:

```bash
supabase functions deploy approve-payment
supabase functions deploy complete-payment
supabase functions deploy verify-payment
supabase functions deploy verify-ad-reward
supabase functions deploy process-withdrawal
supabase functions deploy send-download-email
supabase functions deploy delete-account
```

Each function already handles CORS via `ALLOW_ORIGIN` where applicable.

---

## Core Flows

### 1) Authentication (Pi SDK Only)
- Implemented in [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx).
- **Zero merchant setup:** Users sign in with Pi Network and immediately access features.
- Flow:
  1. `login()` calls `Pi.authenticate()` with scopes: `username`, `payments`, `wallet_address`
  2. Returns user object with `uid`, `username`, `wallet_address`
  3. Session stored in `localStorage` for auto-restore on reload
  4. No merchant table creation; uses Pi UID as fallback identifier
- Configuration:
  - **Mainnet** (default): Set `sandbox: false` in `window.Pi.init()`
  - **Testnet**: Set `VITE_PI_SANDBOX_MODE=true` to use sandbox mode
- Demo mode: Auto-activates when Pi Browser not detected (local dev only)
- **Official Docs:**
  - Pi Payment SDK & Authentication: https://pi-apps.github.io/community-developer-guide/
  - Pi Ads Network: https://github.com/pi-apps/pi-platform-docs/tree/master
  - Developer Account: https://developers.minepi.com

### 2) Create Payment Links
- UI: [src/pages/PaymentLinks.tsx](src/pages/PaymentLinks.tsx)
- **Auth Only:** Sign in with Pi, immediately create links. No merchant account needed.
- Supports pricing types: free, one-time, recurring, donation (with optional `min_amount` and suggested amounts).
- Delivery types: instant access, redirect, or downloadable file (uploads stored in `payment-content` bucket).
- Stock/limits: optional stock, waitlist, checkout questions, internal names.
- Platform fee: 2% added to customer-facing price for paid items.
- Tracking: views/conversions are incremented via Supabase RPCs (`increment_views`, `increment_conversions`).

### 3) Checkout (Pi Payments)
- Customer-facing page: [src/pages/PayPage.tsx](src/pages/PayPage.tsx)
- Flow:
	- Fetch active link by `slug`, show price, description, optional image, waitlist fields, and Pi Browser reminder.
	- Authenticate with Pi if needed; email is collected when digital delivery is required.
	- Call `Pi.createPayment` with amount/memo/metadata.
	- Server approval: [supabase/functions/approve-payment/index.ts](supabase/functions/approve-payment/index.ts) hits Pi API `/v2/payments/{id}/approve` using `PI_API_KEY`.
	- Server completion: [supabase/functions/complete-payment/index.ts](supabase/functions/complete-payment/index.ts) calls `/v2/payments/{id}/complete`, inserts a `transactions` row, and returns `transactionId`.
	- Optional blockchain verification: [supabase/functions/verify-payment/index.ts](supabase/functions/verify-payment/index.ts) checks `/v2/transactions/{txid}` and marks `blockchain_verified` plus receiver/sender addresses.
	- Digital delivery: if the link has `content_file`, a signed URL is generated and, when email is provided, [supabase/functions/send-download-email/index.ts](supabase/functions/send-download-email/index.ts) sends the download link via Resend.
	- Redirects: if `redirect_url` is set, the buyer is redirected after success.

Example client callbacks (trimmed to match production flow):

```ts
const callbacks = {
	onReadyForServerApproval: async (paymentId: string) => {
		await supabase.functions.invoke('approve-payment', {
			body: { paymentId, paymentLinkId: paymentLink.id },
		});
	},
	onReadyForServerCompletion: async (paymentId: string, txid: string) => {
		const { data } = await supabase.functions.invoke('complete-payment', {
			body: {
				paymentId,
				txid,
				paymentLinkId: paymentLink.id,
				payerUsername: piUser?.username,
				buyerEmail,
			},
		});

		await supabase.functions.invoke('verify-payment', {
			body: {
				txid,
				expectedAmount: paymentLink.amount,
				paymentLinkId: paymentLink.id,
			},
		});

		// Delivery and redirects are handled in PayPage after callbacks finish.
	},
};
```

### 4) File Delivery and Emails
- Storage bucket `payment-content` holds uploaded files.
- [supabase/functions/send-download-email/index.ts](supabase/functions/send-download-email/index.ts) emails signed URLs to buyers; set `RESEND_API_KEY` to enable.

### 5) Tracking Links & Analytics
- UI: [src/components/dashboard/TrackingLinks.tsx](src/components/dashboard/TrackingLinks.tsx) with redirect handler [src/pages/TrackRedirect.tsx](src/pages/TrackRedirect.tsx).
- Database tables: `tracking_links`, `tracking_events` (see migrations under `supabase/migrations`).
- Metrics: visits, conversions, device/referrer metadata, conversion rate.

### 6) Ad Rewards (Pi Ad Network)
- UI: [src/pages/WatchAds.tsx](src/pages/WatchAds.tsx)
- Verification: [supabase/functions/verify-ad-reward/index.ts](supabase/functions/verify-ad-reward/index.ts) optionally checks Pi Ads status and records rewards in `ad_rewards` (π0.005 by default).

### 7) Subscriptions & Plans
- Merchant subscription logic lives in [src/pages/Subscription.tsx](src/pages/Subscription.tsx) and [src/hooks/useSubscription.tsx](src/hooks/useSubscription.tsx).
- Free plan guardrails: PayPage blocks more than three completed transactions per link on the Free plan.

### 8) Withdrawals and Payouts
- Merchant requests: [src/pages/Withdrawals.tsx](src/pages/Withdrawals.tsx) (stores requests in `withdrawal_requests` with fallback to `withdrawals`).
- Admin panel: [src/pages/AdminWithdrawals.tsx](src/pages/AdminWithdrawals.tsx) handles approvals, applies 2% platform fee, updates balances, and writes notifications.
- Legacy/manual flow: [supabase/functions/process-withdrawal/index.ts](supabase/functions/process-withdrawal/index.ts) creates `withdrawals` entries and updates balances when a txid is provided.
- Status model: `pending → approved → completed` (or `rejected/failed`). Manual payouts are currently used until Pi A2U is available.

---

## Database Notes
- Key tables: `payment_links`, `transactions`, `user_subscriptions`, `subscription_plans`, `withdrawal_requests`, `withdrawals`, `platform_fees`, `ad_rewards`, `tracking_links`, `tracking_events`.
- **Merchant Table:** Only used for plan limits and admin flag if needed; auth doesn't require it.
- **Optional:** Remove foreign key constraint on `payment_links.merchant_id` to avoid all merchant setup:
  ```sql
  alter table payment_links alter column merchant_id drop not null;
  alter table payment_links drop constraint if exists payment_links_merchant_id_fkey;
  ```
- Important migrations:
	- `20251222170000_fix_subscription_and_payment_links.sql` (subscription/link fixes)
	- `20251222180000_add_tracking_links.sql` (tracking)
	- `20251226_add_withdrawal_tracking.sql` (withdrawal_requests)

## Production Checklist
- **Environment:** Copy `.env.example` to `.env.local`; set all Supabase and Pi keys.
- **Pi SDK:** Run with `sandbox: false` (mainnet); only works inside Pi Browser for actual payments.
- **Secrets:** Set all Supabase secrets (PI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ALLOW_ORIGIN, optional RESEND_API_KEY) and redeploy Edge Functions.
- **CORS:** Lock down `ALLOW_ORIGIN` to your production domain (not `*`).
- **RLS & Permissions:** Enable RLS on all tables and verify storage bucket permissions for `payment-content`.
- **Admin Access:** Only Pi username `Wain2020` can access `/admin/dashboard` and `/admin/withdrawals`.
- **End-to-End Test:** Sign in with Pi → create payment link → open in Pi Browser → complete payment → verify blockchain (optional) → download/redirect.

## Support & Troubleshooting
- **Pi SDK Missing:** Ensure you're in Pi Browser; checkout page shows a reminder.
- **CORS Issues:** Update `ALLOW_ORIGIN` secret and redeploy affected Edge Function.
- **Payment Auth Fail (401/403):** Verify `PI_API_KEY` is set in Supabase secrets and functions are redeployed.
- **Blockchain Verification Slow:** Transactions complete immediately; verification can lag (non-blocking).
- **Admin Access Denied:** Only `@Wain2020` Pi username allowed (see [src/components/AdminRouteGuard.tsx](src/components/AdminRouteGuard.tsx)).

**Summary:** DropPay is now a zero-setup experience: sign in with Pi Network → choose a plan → create payment links → collect Pi → request payout. No merchant profile required.
