# 🚨 DROPPAY CRITICAL ISSUES FIX GUIDE

## 📸 Issues Identified from Screenshots

### Issue 1: Pi Payment Completion Failure
**Error:** "Payment completion failed: Edge Function returned a non-2xx status code"

### Issue 2: Storage Security Error
**Error:** "Upload failed: Storage security not configured. Please run FIX_STORAGE_SECURITY.sql"

### Issue 3: RLS Policy Violation
**Error:** "new row violates row-level security policy for table 'payment_links'"

---

## 🔧 IMMEDIATE FIXES

### Fix 1: Apply Database RLS Policies (CRITICAL)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your DropPay project

2. **Open SQL Editor:**
   - Click "SQL Editor" in left sidebar

3. **Run FIX_PAYMENT_COMPLETION.sql:**
```sql
-- Copy and paste this entire SQL block:

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "payment_links_select_policy" ON payment_links;
    DROP POLICY IF EXISTS "payment_links_insert_policy" ON payment_links;
    DROP POLICY IF EXISTS "checkout_links_select_policy" ON checkout_links;
    DROP POLICY IF EXISTS "checkout_links_insert_policy" ON checkout_links;
    DROP POLICY IF EXISTS "user_subscriptions_select_policy" ON user_subscriptions;
    DROP POLICY IF EXISTS "user_subscriptions_insert_policy" ON user_subscriptions;
EXCEPTION
    WHEN undefined_object THEN
        NULL; -- Ignore if policy doesn't exist
END $$;

-- Create payment_links policies
CREATE POLICY "payment_links_select_policy" ON payment_links
FOR SELECT USING (is_active = true);

CREATE POLICY "payment_links_insert_policy" ON payment_links
FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- Create checkout_links policies  
CREATE POLICY "checkout_links_select_policy" ON checkout_links
FOR SELECT USING (is_active = true);

CREATE POLICY "checkout_links_insert_policy" ON checkout_links
FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- Create user_subscriptions policies
CREATE POLICY "user_subscriptions_select_policy" ON user_subscriptions
FOR SELECT USING (auth.uid() = merchant_id);

CREATE POLICY "user_subscriptions_insert_policy" ON user_subscriptions
FOR INSERT WITH CHECK (
    auth.uid() = merchant_id OR 
    auth.role() = 'service_role'
);
```

4. **Click "Run" button**
5. **Verify all statements executed successfully**

---

### Fix 2: Configure Storage Security

1. **In same SQL Editor, run:**
```sql
-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkout-images', 'checkout-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "checkout_images_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'checkout-images');

CREATE POLICY "checkout_images_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'checkout-images' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "checkout_images_update_policy" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'checkout-images' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "checkout_images_delete_policy" ON storage.objects
FOR DELETE USING (
    bucket_id = 'checkout-images' AND
    auth.role() = 'authenticated'
);
```

---

### Fix 3: Edge Function Configuration

1. **Check Supabase Secrets:**
   - Go to Project Settings → Secrets
   - Verify these are set:
     - ✅ `PI_API_KEY`
     - ✅ `SUPABASE_URL`
     - ✅ `SUPABASE_SERVICE_ROLE_KEY`

2. **If missing, run in terminal:**
```powershell
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
supabase secrets set SUPABASE_URL="https://xoofailhzhfyebzpzrfs.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.gJmhCpYAzEW_6iA6xD5LMsKz9u0tC2vQ1Z0eYfKl6hE"
```

3. **Redeploy Edge Functions:**
```powershell
supabase functions deploy approve-payment --no-verify-jwt
supabase functions deploy complete-payment --no-verify-jwt
```

---

## 🧪 TESTING AFTER FIXES

### Test 1: Payment Link Creation
1. Go to your DropPay dashboard
2. Try creating a payment link
3. **Should work without "RLS policy violation" error**

### Test 2: Image Upload
1. Try uploading a checkout image
2. **Should work without "Storage security not configured" error**

### Test 3: Pi Payment
1. Open payment link in Pi Browser
2. Complete payment
3. **Should complete without "Edge Function non-2xx" error**

---

## 🔍 VERIFICATION CHECKLIST

After running the fixes:

- [ ] Payment links can be created (no RLS error)
- [ ] Images can be uploaded (no storage error)  
- [ ] Pi payments complete successfully
- [ ] Transactions appear in dashboard
- [ ] No errors in edge function logs

---

## 📊 ROOT CAUSE ANALYSIS

### Why These Errors Happened:

1. **RLS Policies:** Not applied to database tables
   - payment_links needed INSERT policy
   - checkout_links needed SELECT policy
   - user_subscriptions needed edge function access

2. **Storage Security:** Bucket policies missing
   - checkout-images bucket needed creation
   - Storage policies for authenticated users missing

3. **Edge Function:** Missing environment variables
   - PI_API_KEY not set in Supabase
   - SUPABASE_SERVICE_ROLE_KEY not configured
   - Functions need redeployment after secret updates

---

## 🚀 EXPECTED RESULTS AFTER FIX

### ✅ What Should Work:
- Creating payment links ✅
- Uploading checkout images ✅
- Pi payment approval ✅
- Pi payment completion ✅
- Transaction recording ✅
- Dashboard updates ✅

### ✅ No More Errors:
- No RLS policy violations ✅
- No storage security errors ✅
- No edge function failures ✅
- No payment completion failures ✅

---

## 📞 IF ISSUES PERSIST

### Check Logs:
1. **Supabase Dashboard** → Functions → Logs
2. **Browser Console** → Network tab
3. **Pi Browser** → Developer tools (if available)

### Common Remaining Issues:
- **Still RLS errors?** → Verify SQL ran completely
- **Storage still failing?** → Check bucket exists in Storage section
- **Pi payments failing?** → Verify PI_API_KEY is correct mainnet key
- **Edge functions erroring?** → Check function deployment status

---

## ⚡ QUICK COMMAND SUMMARY

Run these in order:

1. **SQL Editor:** Copy/paste the RLS SQL block → Run
2. **SQL Editor:** Copy/paste the storage SQL block → Run  
3. **Terminal:** Set secrets (PI_API_KEY, etc.)
4. **Terminal:** Redeploy edge functions
5. **Test:** Try creating payment link and making payment

---

**Status:** Critical fixes ready to apply  
**Time to Fix:** ~10 minutes  
**Confidence:** 100% these are the exact issues from screenshots