# DropPay Third-Party Integration (Hosted Checkout)

This guide shows how to use DropPay in another app (like Stripe Checkout): your app calls your backend; your backend talks to Supabase functions and returns a hosted pay URL (`/pay/{slug}`). No secret keys ever touch the frontend.

---

## Prerequisites
- Supabase project + CLI set up
- Secrets set in Supabase: `PI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOW_ORIGIN`, optional `RESEND_API_KEY`
- Frontend env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (and any feature flags you use)
- Functions deployed: `approve-payment`, `complete-payment`, `verify-payment`, `verify-ad-reward`, `process-withdrawal`, `send-download-email`, `delete-account`
- Database migrations applied (`supabase db push`)

---

## Integration Model
1) Your backend creates or fetches a payment link and returns its hosted URL (`/pay/{slug}`) to the client.
2) Client redirects user to that URL (hosted DropPay checkout, Pi Browser aware).
3) Completion and verification run via Supabase functions; your system listens on the database (or polls) to mark the order paid.
4) Withdrawals are initiated via the DropPay dashboard or `process-withdrawal` function.

### No Pi Auth Needed in Your Dashboard
- Your third-party admin/dashboard can stay password-based (email/password, SSO, etc.); do **not** require Pi auth there.
- Pi authentication is only required on the hosted checkout page for buyers (via Pi Browser). Keep your own dashboard independent.

---

## Minimal Backend Endpoint (Node/Express example)
Use Supabase functions as your trusted API. Keep service keys server-side.

```ts
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a payment link (server-side) and return the hosted checkout URL
app.post('/api/create-payment-link', async (req, res) => {
  const { title, amount, currency = 'USD', description } = req.body;

  // Example: call your Supabase REST/RPC to insert a payment_links row
  const response = await fetch(`${SUPABASE_URL}/rest/v1/payment_links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      title,
      description,
      amount,
      currency,
      pricing_type: 'one_time',
      delivery_type: 'redirect',
      redirect_url: 'https://yourapp.com/thanks'
    })
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(400).json({ error: err });
  }

  const [link] = await response.json();
  const payUrl = `https://your-frontend-domain.com/pay/${link.slug}`;
  res.json({ payUrl, linkId: link.id });
});

// Poll or subscribe to transactions to confirm payment
app.get('/api/payment-status/:linkId', async (req, res) => {
  const { linkId } = req.params;
  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?payment_link_id=eq.${linkId}&status=eq.completed`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const data = await txRes.json();
  res.json({ paid: data.length > 0, transactions: data });
});

app.listen(3001, () => console.log('Integration API running on 3001'));
```

Notes:
- In production, add auth for who can create links, validation for amount/title, and idempotency keys.
- You can also wrap Supabase client SDK instead of REST; REST shown for clarity.

---

## Frontend Usage (third-party app)
```ts
// 1) Request a link URL from your backend
const res = await fetch('/api/create-payment-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Premium Plan', amount: 10.5, currency: 'USD' })
});
const { payUrl } = await res.json();

// 2) Redirect user (best inside Pi Browser for real payments)
window.location.href = payUrl;
```

---

## Payment Lifecycle (what DropPay handles)
- Pi SDK checkout on hosted page (`/pay/{slug}`)
- Server approval: `approve-payment` (uses `PI_API_KEY`)
- Server completion: `complete-payment` (writes `transactions`, applies platform fee)
- Optional verification: `verify-payment` (blockchain check)
- Delivery: signed URL/email via `send-download-email` if the link has a file
- Redirect: if `redirect_url` set on the link, user is sent there after success

---

## Reconciling Payments in Your System
- Poll `transactions` table by `payment_link_id` and `status = completed`, or use Supabase Realtime to listen.
- Use `metadata` on links (e.g., `internal_order_id`) to map back to your orders.
- Store your own order row and mark it paid when you see a completed transaction.

---

## Withdrawals / Payouts
- Merchants request payouts in-app; records land in `withdrawal_requests`.
- Admin processes via dashboard or `process-withdrawal` function, updating `withdrawals`.
- Statuses: `pending → approved → completed` (or `rejected/failed`).

---

## Security Checklist
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `PI_API_KEY` to the client.
- Lock `ALLOW_ORIGIN` to your production domain; redeploy functions after changes.
- Keep RLS enabled on all tables; use service role only on the server.
- Use idempotency keys on create-link requests to avoid duplicates.

---

## Going Live
- Run in Pi Browser with `sandbox: false` (mainnet) in the Pi SDK config (already set in app).
- Verify secrets in Supabase, redeploy functions, and test the full flow: create link → pay → transaction written → delivery/redirect.
- Confirm storage bucket permissions for `payment-content` and expiry of signed URLs.
