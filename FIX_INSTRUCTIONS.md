# Fix Instructions for DropPay

## Issues Fixed:
1. ✅ Missing `min_amount` column error when creating payment links
2. ✅ Subscription not updating after payment
3. ✅ Features not changing after upgrading plan
4. ✅ Wrong subscription lookup (was using pi_username instead of merchant_id)

## Step 1: Apply Database Fixes

You need to run the SQL script in your Supabase dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project: **ivwphuvamflcghjliixx**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content of `fix_database.sql` file
6. Paste it into the SQL editor
7. Click **Run** or press Ctrl+Enter

This script will:
- Add missing `min_amount` and `suggested_amounts` columns
- Add proper indexes for better performance
- Create a trigger to auto-assign Free plan to new merchants
- Backfill existing merchants without subscriptions
- Ensure merchant_id column exists in user_subscriptions

## Step 2: Verify Database Changes

After running the script, verify in Supabase:

1. Go to **Table Editor** > **payment_links**
2. Check that `min_amount` and `suggested_amounts` columns exist
3. Go to **Table Editor** > **user_subscriptions**
4. Check that all merchants have an active subscription

## Step 3: Code Changes Applied

The following files have been updated automatically:

### 1. `src/pages/Subscription.tsx`
- Changed from `update` to `upsert` to create subscription if it doesn't exist
- Added proper conflict resolution on merchant_id
- Added 1-second delay before reload to ensure database propagation

### 2. `src/hooks/useSubscription.tsx`
- Fixed query to use `merchant_id` instead of `pi_username`
- Changed order by field from `expires_at` to `current_period_end`
- Added type assertion to avoid deep instantiation errors

### 3. `src/pages/PayPage.tsx`
- Added type assertion to prevent TypeScript deep instantiation errors

## Step 4: Test the Fixes

1. **Test Creating Payment Links:**
   ```
   - Go to Dashboard > Payment Links
   - Click "Create New Link"
   - Fill in the form (try both One-Time and Donation types)
   - Click "Create Link"
   - Should work without "min_amount column" error
   ```

2. **Test Subscription Upgrade:**
   ```
   - Go to Dashboard > Subscription
   - Select a paid plan (Professional or Business)
   - Complete payment in Pi Browser
   - Wait for success message
   - Page should reload automatically
   - Your plan should be updated
   - Try creating more links to verify new limits apply
   ```

3. **Verify Features:**
   ```
   - After upgrading, check Dashboard
   - Link creation limits should reflect new plan
   - Analytics should show new data (if upgraded to plan with analytics)
   - Platform fee should be lower (if upgraded)
   ```

## Step 5: Clear Cache (Optional but Recommended)

If issues persist after database fix:

1. Clear browser cache and cookies
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Or open in incognito/private mode

## Troubleshooting

### If "min_amount" error still appears:
- Ensure you ran the SQL script successfully
- Check Supabase logs for any errors
- Try running just this part separately:
  ```sql
  ALTER TABLE payment_links 
  ADD COLUMN IF NOT EXISTS min_amount numeric,
  ADD COLUMN IF NOT EXISTS suggested_amounts numeric[];
  ```

### If subscription still not updating:
- Check browser console for errors
- Verify merchant_id exists in merchants table
- Check user_subscriptions table has a record for your merchant
- Run this query in SQL Editor to check:
  ```sql
  SELECT * FROM user_subscriptions WHERE merchant_id = 'YOUR_MERCHANT_ID';
  ```

### If features don't change after upgrade:
- Make sure the payment completed successfully
- Check transactions table for completed payment record
- Verify user_subscriptions shows updated plan_id and status='active'
- Clear browser cache and hard refresh

## Additional Notes

- All migrations are in `supabase/migrations/` folder
- The fix ensures backward compatibility
- Free plan is automatically assigned to all merchants
- Free plan never expires (100 years validity)
- Paid plans have 30-day validity

## Pi Payments Edge Functions (Environment + Deploy)

If Pi payments/auth stopped working after backend changes, ensure Supabase Edge Function secrets and CORS are configured:

- Required secrets (set in Supabase):
   - `PI_API_KEY` — from Pi Network developer portal
   - `SUPABASE_URL` — your project API URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-side only)
   - Optional: `ALLOW_ORIGIN` — exact frontend origin for CORS (default `*`)

- Set secrets:
  ```bash
  supabase secrets set PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
  supabase secrets set SUPABASE_URL=https://xoofailhzhfyebzpzrfs.supabase.co
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.bS1_S1vkHxDl1Y9tLrBaFbej02ZF2EQDSkNQcwGe8I4
  supabase secrets set ALLOW_ORIGIN=*
  ```

- Deploy updated functions:
  ```bash
  supabase functions deploy approve-payment
  supabase functions deploy complete-payment
  supabase functions deploy verify-payment
  ```

- Frontend calls remain via `supabase.functions.invoke('<name>')` and do not require Vercel rewrites.

- Common issues:
   - 401/403: Missing or incorrect `PI_API_KEY` or service role key
   - CORS preflight fails: set `ALLOW_ORIGIN` or keep default `*`
   - Blockchain verification errors: network/API availability; payment still completes while verification may be pending

For complete Pi integration documentation (authentication, payments, ad network), see [PI_INTEGRATION_GUIDE.md](PI_INTEGRATION_GUIDE.md).
1. Check browser console for errors (F12)
2. Check Supabase logs in Dashboard > Logs
3. Verify all environment variables are set correctly in `.env`
4. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY match your project
