# DropPay Payment System - Complete Fix Guide

## Quick Start (30 seconds)

### Already Applied Payment Links Fix?
Then you only need **ONE MORE fix** for the "Payment Failed" error.

### Apply This Now:
1. **Open:** Supabase Dashboard → SQL Editor
2. **Copy:** `FIX_PAYMENT_COMPLETION.sql`
3. **Paste & Run**
4. **Test:** Try making a payment

---

## The Three Errors

### ❌ Error #1: "new row violates row-level security policy for table 'payment_links'"
- **When:** Creating checkout payment links
- **File:** `QUICK_FIX_PAYMENT_LINKS.sql`
- **Status:** ✅ Already created for you

### ❌ Error #2: "Failed to create subscription link" 
- **When:** Upgrading subscription plans
- **File:** Same as Error #1
- **Status:** ✅ Already created for you

### ❌ Error #3: "Payment Failed - Something went wrong"
- **When:** After successful Pi Network payment
- **File:** `FIX_PAYMENT_COMPLETION.sql`
- **Status:** ⏳ **NEEDS TO BE APPLIED** ← YOU ARE HERE
- **Cause:** Edge function can't read checkout_links due to broken RLS

---

## Why Error #3 Happens

The payment flow works like this:

```
1. User clicks "Pay" button
   ✅ PayPage.tsx handles this
   
2. User authenticates with Pi Network
   ✅ Pi SDK handles this
   
3. User approves payment in Pi wallet
   ✅ Pi SDK handles this
   
4. Edge function: complete-payment runs
   ❌ FAILS HERE - Can't read checkout_links
   
   The query fails because:
   - RLS policy: merchant_id = auth.uid()
   - merchant_id is UUID: "550e8400-e29b-41d4-a716-446655440000"
   - auth.uid() is text: "some_pi_username_string"
   - They DON'T match, so RLS blocks access
   
5. Can't record transaction
   ❌ Transaction insert skipped
   
6. Returns error to frontend
   ❌ "Payment Failed" message shown
```

---

## The Fix

Change checkout_links RLS from:
```sql
-- BROKEN - compares UUID with text string
USING (merchant_id = auth.uid());
```

To:
```sql
-- CORRECT - checks if link is active (public viewing)
USING (is_active = true);
```

This allows the edge function to read active checkout links.

---

## Step-by-Step Fix

### Step 1: Open Supabase Dashboard
Go to: https://app.supabase.com → Your Project → SQL Editor

### Step 2: Copy the SQL
Open: `FIX_PAYMENT_COMPLETION.sql`

Copy entire contents (or just the key parts):

```sql
-- Drop old broken policies
DROP POLICY IF EXISTS "Users can view their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can insert their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can update their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can delete their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Anyone can view checkout link by slug" ON public.checkout_links;

-- Enable RLS
ALTER TABLE public.checkout_links ENABLE ROW LEVEL SECURITY;

-- Create correct SELECT policy
CREATE POLICY "Anyone can view active checkout links"
ON public.checkout_links
FOR SELECT
USING (is_active = true);

-- [Rest of file continues...]
```

### Step 3: Paste in SQL Editor
1. Click "New Query"
2. Paste the SQL
3. Don't modify anything

### Step 4: Click "Run"
The query should execute with no errors.

### Step 5: Verify Success
You should see:
```
✓ Payment links policies: 4
✓ Checkout links policies: 4
✓ Transactions policies: 3
```

If you see errors, check:
- Did you paste the entire file?
- Are you in the correct Supabase project?
- Do you have SQL editor permissions?

---

## Test the Fix

### Test Case: Complete a Payment

1. **Open a payment link**
   - Go to DropPay dashboard
   - Click any payment link (or create a new one)

2. **Click "Pay"**
   - Button should be visible

3. **Authenticate with Pi Network**
   - If using Pi Browser, may not ask
   - Enter payment details if prompted

4. **Approve in Pi Wallet**
   - Pi wallet pops up
   - Review amount
   - Click "Approve"

5. **Verify Success** ✅
   - Should see: "Payment verified on blockchain!"
   - Should redirect to success page
   - Email receipt may be sent
   - Database shows: ✅ Transaction recorded
   - Subscription shows: ✅ Activated (if applicable)

### Expected Results

**After Fix:**
```
✅ "Payment verified on blockchain!" message
✅ Redirect to success page
✅ Transaction appears in Dashboard → Transactions
✅ Subscription activated (can use more payment links)
```

**Before Fix (Current Problem):**
```
❌ "Payment Failed - Something went wrong" error
❌ No redirect
❌ Transaction NOT in database
❌ Subscription NOT activated
```

---

## Troubleshooting

### Issue: "Payment Failed" still appears after applying fix

**Checklist:**
1. ✓ Did you run BOTH migration files?
   - `supabase/migrations/20260109_fix_payment_links_rls_policies.sql`
   - `supabase/migrations/20260109_fix_payment_completion_rls.sql`

2. ✓ Check Supabase Edge Function logs:
   - Go to: Functions → complete-payment
   - Look for error messages
   - Check "Invocations" tab

3. ✓ Verify RLS policies:
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'checkout_links';
   ```
   Should show: "Anyone can view active checkout links"

4. ✓ Check browser console:
   - Open payment page
   - Press F12 for Developer Tools
   - Go to Console tab
   - Try payment again
   - Look for error messages

### Issue: SQL error when running fix

**Common errors:**
- "Policy already exists"
  - Solution: The DROP POLICY should remove it first
  - If still failing, run each DROP separately

- "Permission denied"
  - Solution: You need Admin access to the Supabase project
  - Ask project owner to apply fix

- "Relation does not exist"
  - Solution: Table name is wrong
  - Check spelling: `checkout_links` not `checkout_link`

---

## Complete File List

### Files to Apply (Required)
- ✅ `FIX_PAYMENT_COMPLETION.sql` ← Apply this now
- ✅ `QUICK_FIX_PAYMENT_LINKS.sql` ← Already created

### Migration Files (For Version Control)
- `supabase/migrations/20260109_fix_payment_links_rls_policies.sql`
- `supabase/migrations/20260109_fix_payment_completion_rls.sql`

### Documentation (Read for details)
- `PAYMENT_SYSTEM_FIX_SUMMARY.md` ← Overview
- `PAYMENT_FAILED_ERROR_FIX.md` ← Detailed issue #3
- `PAYMENT_LINKS_FIX_GUIDE.md` ← Detailed issues #1 & #2
- `THIS FILE` ← Complete guide

### Helper Scripts (Optional)
- `apply-payment-completion-fix.ps1` / `.bat`
- `apply-payment-links-fix.ps1` / `.bat`

---

## Summary

| Status | Issue | File | Action |
|--------|-------|------|--------|
| ✅ DONE | Can't create payment links | QUICK_FIX_PAYMENT_LINKS.sql | Already applied |
| ❌ TODO | Payment shows failed | FIX_PAYMENT_COMPLETION.sql | **Apply now** |
| - | Subscription creation fails | QUICK_FIX_PAYMENT_LINKS.sql | Fixed with above |

---

## Time Estimate
- ⏱️ **Reading this guide:** 5 minutes
- ⏱️ **Applying the fix:** 30 seconds
- ⏱️ **Testing the fix:** 2 minutes
- **Total:** ~8 minutes

---

## After You Apply

✅ All payment links will work
✅ Payments will complete successfully  
✅ Transactions will be recorded
✅ Subscriptions will activate
✅ Users can upgrade plans

---

## Questions?

Refer to:
1. **PAYMENT_FAILED_ERROR_FIX.md** - Why payments fail
2. **PAYMENT_SYSTEM_FIX_SUMMARY.md** - All 3 issues explained
3. **Supabase Logs** - Check edge function for errors

---

**Last Updated:** January 9, 2026
**Status:** Ready to Deploy ✅
