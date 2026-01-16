# COMPLETE STORAGE POLICY FIX GUIDE
**Follow these steps EXACTLY to fix all upload errors**

---

## ⚠️ CRITICAL: You MUST be logged into your app first!

Before doing anything:
1. Open your DropPay app in browser: http://localhost:5173
2. **SIGN IN** with your account
3. Keep that tab open while you work in the Dashboard

---

## STEP 1: Enable RLS on storage.objects (2 minutes)

1. Open: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/database/tables
2. In the left sidebar, click **"storage"** (under Schemas section)
3. Click **"objects"** table
4. Look at the top right corner - if you see **"Enable RLS"** button, click it
5. If it says **"Disable RLS"**, RLS is already enabled - skip to Step 2

✅ **Verify:** You should see "RLS enabled" indicator on the objects table

---

## STEP 2: Create Policies for payment-link-images (5 minutes)

Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/storage/buckets

### 2.1: Click "payment-link-images" bucket
### 2.2: Click "Policies" tab at the top
### 2.3: Click "New Policy" button
### 2.4: Click "Create a policy from scratch"

### 2.5: Create Policy #1 - Public Read
- **Policy name:** `Public read payment-link-images`
- **Allowed operation:** Check only **SELECT**
- **Target roles:** Select **"public"**
- Click "Use this template" or scroll down
- **USING expression:** Enter exactly: `bucket_id = 'payment-link-images'`
- Click **"Save"**

### 2.6: Create Policy #2 - Authenticated Insert
Click "New Policy" again:
- **Policy name:** `Authenticated insert payment-link-images`
- **Allowed operation:** Check only **INSERT**
- **Target roles:** Select **"authenticated"**
- **WITH CHECK expression:** Enter exactly: `bucket_id = 'payment-link-images'`
- Click **"Save"**

### 2.7: Create Policy #3 - Authenticated Update
Click "New Policy" again:
- **Policy name:** `Authenticated update payment-link-images`
- **Allowed operation:** Check only **UPDATE**
- **Target roles:** Select **"authenticated"**
- **USING expression:** Enter exactly: `bucket_id = 'payment-link-images'`
- **WITH CHECK expression:** Enter exactly: `bucket_id = 'payment-link-images'`
- Click **"Save"**

### 2.8: Create Policy #4 - Authenticated Delete
Click "New Policy" again:
- **Policy name:** `Authenticated delete payment-link-images`
- **Allowed operation:** Check only **DELETE**
- **Target roles:** Select **"authenticated"**
- **USING expression:** Enter exactly: `bucket_id = 'payment-link-images'`
- Click **"Save"**

✅ **Verify:** You should now see 4 policies for payment-link-images bucket

---

## STEP 3: Repeat for checkout-images (5 minutes)

Go back to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/storage/buckets

Click **"checkout-images"** bucket, then repeat STEP 2 with these changes:
- Replace `payment-link-images` with `checkout-images` in ALL policy names and expressions
- Policy names: `Public read checkout-images`, `Authenticated insert checkout-images`, etc.
- Expressions: `bucket_id = 'checkout-images'`

Create all 4 policies (SELECT, INSERT, UPDATE, DELETE)

---

## STEP 4: Repeat for merchant-products (5 minutes)

Click **"merchant-products"** bucket, create 4 policies:
- Replace with `merchant-products` everywhere
- Policy names: `Public read merchant-products`, `Authenticated insert merchant-products`, etc.
- Expressions: `bucket_id = 'merchant-products'`

---

## STEP 5: Repeat for user-uploads (5 minutes)

Click **"user-uploads"** bucket, create 4 policies:
- Replace with `user-uploads` everywhere
- Policy names: `Public read user-uploads`, `Authenticated insert user-uploads`, etc.
- Expressions: `bucket_id = 'user-uploads'`

---

## STEP 6: Create payment-content policies (DIFFERENT - 5 minutes)

Click **"payment-content"** bucket

⚠️ **IMPORTANT:** This bucket is PRIVATE - use **authenticated** role for ALL 4 policies (NOT public)

### Policy #1:
- **Name:** `Authenticated read payment-content`
- **Operation:** SELECT
- **Roles:** **authenticated** (NOT public!)
- **USING:** `bucket_id = 'payment-content'`

### Policy #2:
- **Name:** `Authenticated insert payment-content`
- **Operation:** INSERT
- **Roles:** **authenticated**
- **WITH CHECK:** `bucket_id = 'payment-content'`

### Policy #3:
- **Name:** `Authenticated update payment-content`
- **Operation:** UPDATE
- **Roles:** **authenticated**
- **USING:** `bucket_id = 'payment-content'`
- **WITH CHECK:** `bucket_id = 'payment-content'`

### Policy #4:
- **Name:** `Authenticated delete payment-content`
- **Operation:** DELETE
- **Roles:** **authenticated**
- **USING:** `bucket_id = 'payment-content'`

---

## STEP 7: VERIFY EVERYTHING WORKS (2 minutes)

1. Make sure you're still logged into your DropPay app
2. Press **F12** to open browser console
3. Open the file: `test-storage-complete.js`
4. Copy the ENTIRE contents
5. Paste into browser console and press Enter
6. Watch the output - should see ✅ for all 5 buckets

---

## EXPECTED RESULT:

```
✅ WORKING BUCKETS (5/5):
   ✓ payment-link-images
   ✓ checkout-images
   ✓ merchant-products
   ✓ payment-content
   ✓ user-uploads

🎉 ALL BUCKETS WORKING! Storage is properly configured.
```

---

## If ANY bucket fails:

The console will tell you EXACTLY which policies are missing. Create them following the templates above.

---

## CHECKLIST (Must have ALL 20 policies):

- [ ] payment-link-images: 4 policies (public read + authenticated write/update/delete)
- [ ] checkout-images: 4 policies (public read + authenticated write/update/delete)
- [ ] merchant-products: 4 policies (public read + authenticated write/update/delete)
- [ ] user-uploads: 4 policies (public read + authenticated write/update/delete)
- [ ] payment-content: 4 policies (ALL authenticated - no public access)

**TOTAL: 20 policies required**

---

## Common Mistakes:

❌ Forgot quotes in expression: `bucket_id = payment-link-images` → Use `bucket_id = 'payment-link-images'`
❌ Wrong bucket name in expression: Copy-pasted wrong bucket name
❌ Not logged in when testing: Must be authenticated to upload
❌ Used public for payment-content: Should be authenticated only
❌ Only created policies for one bucket: Need all 5 buckets
❌ Skipped RLS enable step: Must enable RLS on storage.objects first

---

## Need Help?

After following this guide, run the test script. If it still fails, share the console output and I'll tell you exactly what's missing.
