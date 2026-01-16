# 🚀 SUBSCRIPTION PLAN WORKFLOW - COMPLETE TEST GUIDE

## ✅ PRE-FLIGHT CHECKLIST

### 1. Database Setup
- [ ] Run `FIX_RLS_POLICIES.sql` in Supabase SQL Editor
- [ ] Verify subscription_plans table has data (Free, Basic, Pro, Enterprise)
- [ ] Verify user_subscriptions table exists
- [ ] Run `VERIFY_SUBSCRIPTION_WORKFLOW.sql` to check all tables

### 2. Environment Configuration
- [x] Pi Network API Key configured (mainnet)
- [x] Sandbox mode: false (production mainnet)
- [x] Supabase project connected

### 3. Code Changes Applied
- [x] AuthContext: Merchant profile auto-creation enabled
- [x] Subscription.tsx: localStorage fallback for authentication
- [x] PayPage.tsx: Subscription detection and activation
- [x] Edge functions: approve-payment & complete-payment enhanced

---

## 🧪 TEST WORKFLOW

### Test 1: Authentication ✅
**Location:** `/dashboard/subscription`

1. Open app in Pi Browser
2. Navigate to Subscription page
3. **Expected:** See welcome message with @username
4. **Verify:** Console shows authentication details
5. **Check:** merchant profile created in database

**Success Criteria:**
- ✅ "Welcome, @Wain2020!" message appears
- ✅ Subscription plan cards visible
- ✅ No "Please sign in" errors
- ✅ Console logs show: `hasPiUser: true`, `hasMerchant: true`

---

### Test 2: Free Plan (Direct Upgrade) ✅
**Flow:** No payment required

1. Click "Get Started" on Free Plan
2. **Expected:** Instant activation
3. **Verify:** 
   - Toast: "Successfully switched to Free plan!"
   - Badge changes to "Free" (current plan)
   - No payment page redirect

**Database Check:**
```sql
SELECT * FROM user_subscriptions 
WHERE merchant_id = 'YOUR_USER_ID';
```
**Expected:** `status = 'active'`, `plan_id` = Free plan ID

---

### Test 3: Paid Plan (DropPay Link Method) 🔥
**Flow:** Create payment link → Redirect to pay page

1. Click "Upgrade with DropPay" on Pro Plan ($10/month)
2. **Expected:** 
   - Toast: "Creating subscription payment link..."
   - Redirect to `/pay/droppay-pro-plan-{timestamp}`
3. On Payment Page:
   - Title: "Pro Plan Subscription - DropPay"
   - Amount: 10.00 π
   - Type badge: "Recurring"
   - Description includes "Monthly subscription"
4. Click "Pay with Pi Network"
5. Complete Pi payment in SDK
6. **Expected:**
   - Payment approved
   - Payment completed
   - Toast: "🎉 Pro Plan activated! Welcome to premium features."
   - Redirect to `/dashboard/subscription?upgraded=Pro`

**Verification:**
```sql
-- Check payment link created
SELECT * FROM payment_links 
WHERE title LIKE '%Pro Plan Subscription%' 
ORDER BY created_at DESC LIMIT 1;

-- Check transaction recorded
SELECT * FROM transactions 
WHERE payment_link_id = 'PAYMENT_LINK_ID' 
AND status = 'completed';

-- Check subscription activated
SELECT * FROM user_subscriptions 
WHERE merchant_id = 'YOUR_USER_ID' 
AND status = 'active';
```

**Success Criteria:**
- ✅ Payment link created with `payment_type = 'recurring'`
- ✅ Transaction status = 'completed'
- ✅ Subscription status = 'active', plan = Pro
- ✅ User sees Pro badge on subscription page

---

### Test 4: Direct Pi Payment (Alternative Method) 💳
**Flow:** Pay directly through Pi SDK

1. Click "Upgrade Now" on Scale Plan ($25/month)
2. Pi SDK authentication prompt appears
3. Complete authentication
4. Pi payment prompt shows:
   - Amount: 25 π
   - Memo: "Upgrade to Scale Plan - DropPay Subscription"
5. Approve and complete payment
6. **Expected:**
   - Subscription activated in `user_subscriptions` table
   - Toast: "Successfully upgraded to Scale plan!"

---

## 🐛 TROUBLESHOOTING

### Issue: "Please sign in with Pi Network first"
**Cause:** Authentication state not detected

**Fix:**
1. Check browser console for auth logs
2. Verify localStorage has `pi_user` key
3. Try signing out and back in
4. Check merchant profile exists: `SELECT * FROM merchants WHERE id = 'USER_ID'`

**Code Reference:**
- [Subscription.tsx](src/pages/Subscription.tsx) lines 188-207
- [AuthContext.tsx](src/contexts/AuthContext.tsx) lines 160-190

---

### Issue: Payment link creation fails
**Error:** "No merchant ID found"

**Fix:**
1. Verify merchant profile exists
2. Check console logs: `console.log('💳 Creating subscription payment link for merchant:', merchantId)`
3. Manually create merchant:
```sql
INSERT INTO merchants (id, username, pi_username, subscription_tier)
VALUES ('USER_UID', 'username', 'username', 'free');
```

**Code Reference:**
- [Subscription.tsx](src/pages/Subscription.tsx) lines 118-145

---

### Issue: Subscription not activating after payment
**Symptom:** Payment completes but plan doesn't change

**Debug Steps:**
1. Check PayPage console logs for subscription detection
2. Verify title pattern matches: `{Plan} Plan Subscription - DropPay`
3. Check database:
```sql
SELECT * FROM user_subscriptions WHERE merchant_id = 'USER_ID';
SELECT * FROM subscription_plans WHERE name ILIKE '%plan_name%';
```

**Fix:**
- Ensure plan name exactly matches (Pro, Basic, Scale, Enterprise)
- Check PayPage.tsx lines 637-690 for subscription activation logic

**Code Reference:**
- [PayPage.tsx](src/pages/PayPage.tsx) lines 637-700

---

## 📊 MONITORING

### Console Logs to Watch
```javascript
// Authentication
🔐 Auth check: { isAuthenticated, hasPiUser, hasMerchant }

// Payment Link Creation  
💳 Creating subscription payment link for merchant: {merchantId}
✅ Payment link created: {slug}

// Payment Processing
🔄 Processing subscription payment: { planName, title }
✅ Found plan: {name}, ID: {id}
✅ Subscription activated successfully: {planName}
```

### Database Queries
```sql
-- Active subscriptions
SELECT 
  us.*,
  sp.name as plan_name,
  m.pi_username
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN merchants m ON us.merchant_id = m.id
WHERE us.status = 'active';

-- Recent subscription payments
SELECT 
  t.*,
  pl.title,
  pl.amount,
  pl.payment_type
FROM transactions t
JOIN payment_links pl ON t.payment_link_id = pl.id
WHERE pl.payment_type = 'recurring'
ORDER BY t.created_at DESC
LIMIT 10;
```

---

## ✅ SUCCESS METRICS

### Workflow Passes When:
1. ✅ User can authenticate with Pi Network
2. ✅ Merchant profile auto-creates on first login
3. ✅ Free plan activates instantly (no payment)
4. ✅ Paid plan creates payment link with correct format
5. ✅ Payment link redirects to PayPage with all details
6. ✅ Pi payment completes successfully
7. ✅ Subscription activates in user_subscriptions table
8. ✅ User sees updated plan badge on dashboard
9. ✅ No console errors or database constraint violations

---

## 📞 SUPPORT

### If Tests Fail:
1. Check FIX_RLS_POLICIES.sql applied correctly
2. Verify Pi API key is valid for mainnet
3. Check Supabase project health
4. Review console logs for error details
5. Run VERIFY_SUBSCRIPTION_WORKFLOW.sql

### Key Files:
- Authentication: [AuthContext.tsx](src/contexts/AuthContext.tsx)
- Subscription Page: [Subscription.tsx](src/pages/Subscription.tsx)
- Payment Flow: [PayPage.tsx](src/pages/PayPage.tsx)
- Database Fix: [FIX_RLS_POLICIES.sql](FIX_RLS_POLICIES.sql)
- Edge Functions: [supabase/functions/](supabase/functions/)

---

## 🎯 NEXT STEPS AFTER SUCCESS

1. ✅ Deploy enhanced edge functions (optional):
   ```bash
   .\deploy-edge-functions.ps1
   ```

2. ✅ Test on mainnet with real Pi payments

3. ✅ Monitor subscription activations in Supabase Dashboard

4. ✅ Set up webhook notifications (if needed)

5. ✅ Test all plan tiers (Free, Basic, Pro, Scale, Enterprise)
