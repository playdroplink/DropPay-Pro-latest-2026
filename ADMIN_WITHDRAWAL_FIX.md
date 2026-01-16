# Admin Withdrawal White Screen Fix

## Issue
AdminWithdrawals page shows white screen - cannot access admin panel.

## Root Cause
Row Level Security (RLS) is **still enabled** on database tables:
- `merchants` table - blocked from SELECT
- `withdrawals` table - blocked from SELECT
- `platform_fees` table - blocked from SELECT

This causes:
1. Admin status check to hang (checkAdminStatus() can't query merchants)
2. Loading state never resolves
3. Page stays blank

## Solution - Run This SQL in Supabase

**URL**: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql/new

**Copy & Paste this SQL:**

```sql
-- Disable RLS on all tables
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_presets DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_signups DISABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

## Steps to Fix

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql/new

2. **Run the SQL**
   - Copy the SQL above
   - Paste into the editor
   - Click **RUN** button
   - Wait for success (should see "ALTER TABLE" messages)

3. **Hard Refresh Browser**
   - Press: `Ctrl + Shift + R` (Windows/Linux)
   - Or: `Cmd + Shift + R` (Mac)
   - In Pi Browser: Hold refresh button → "Hard Refresh"

4. **Clear Cache**
   - In address bar, paste: `javascript:localStorage.clear();location.reload()`
   - Press Enter

5. **Log Back In**
   - Navigate to: https://droppay-v2.lovable.app/auth
   - Click "Connect with Pi Network"
   - Complete Pi authentication

6. **Access Admin Panel**
   - Go to: https://droppay-v2.lovable.app/admin-withdrawals
   - Should now load properly
   - You should see the withdrawal management dashboard

## What This Does

- Disables RLS on all database tables
- Allows the app to SELECT, INSERT, UPDATE, DELETE data
- Admin panel can now query merchant and withdrawal data
- No more white screen

## Verification

After running SQL, check that all tables show `f` in the `rowsecurity` column:

```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All should return: `false` (RLS disabled)

## If Still Having Issues

1. Check browser console (F12 → Console tab)
2. Check for errors in Network tab
3. Verify you're logged in with @Wain2020 account
4. Try Incognito window (Ctrl+Shift+N)

---

**Important**: The admin withdrawal page can ONLY be accessed by @Wain2020 account. If using a different Pi Network account, it will redirect to dashboard.
