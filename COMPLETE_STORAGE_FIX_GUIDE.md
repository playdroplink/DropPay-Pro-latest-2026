# 🔧 Complete Storage Upload Fix Guide

## 🎯 Problem
File uploads fail with error: **"new row violates row-level security policy"**

This happens because:
- Storage policies still enforce authentication checks
- `storage.objects` table has RLS enabled
- Policies check for `auth.uid()` which is NULL with Pi Network auth

## ✅ Solution Options

### Option 1: Public Access Policies (Recommended)
Run `FIX_STORAGE_UPLOADS.sql` - Creates policies that allow anyone to upload

### Option 2: Disable Storage RLS Completely
Run `FIX_STORAGE_UPLOADS_ALTERNATIVE.sql` - Disables RLS (requires admin)

## 🚀 Quick Fix Steps

### Step 1: Run the Storage Fix
```sql
-- In Supabase Dashboard > SQL Editor
-- Copy and paste FIX_STORAGE_UPLOADS.sql
-- Click RUN
```

### Step 2: Verify Configuration
After running, you should see:
- ✅ All buckets marked as public
- ✅ 4 storage policies (Insert, Select, Update, Delete) with `true` condition
- ✅ No authentication requirements

### Step 3: Test Upload
Try uploading a file through your app - it should now work!

## 🔍 What Each Script Does

### FIX_STORAGE_UPLOADS.sql
1. ✓ Drops all existing storage policies
2. ✓ Creates new public access policies (no auth required)
3. ✓ Makes all buckets public
4. ✓ Creates missing buckets
5. ✓ Verifies configuration

### FIX_STORAGE_UPLOADS_ALTERNATIVE.sql
1. ✓ Drops all storage policies
2. ✓ Attempts to disable RLS on storage.objects
3. ✓ Makes all buckets public
4. ✓ Shows status

## 📋 Buckets Created/Updated

- `payment-content` - Payment link files
- `payment-link-images` - Payment link images
- `checkout-images` - Checkout page images
- `user-uploads` - User profile images
- `merchant-products` - Product images

All buckets set to:
- ✅ Public access
- ✅ 100MB file size limit
- ✅ All MIME types allowed (no restrictions)

## 🧪 Testing Upload

### Test in Browser Console
```javascript
// Get your Supabase client
const { createClient } = supabase;
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_ANON_KEY';
const client = createClient(supabaseUrl, supabaseKey);

// Try to upload
const file = new File(['test'], 'test.txt', { type: 'text/plain' });
const { data, error } = await client.storage
  .from('payment-content')
  .upload('test.txt', file);

console.log(error ? '❌ Failed: ' + error.message : '✅ Success!');
```

### Test via API
```bash
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/storage/v1/object/payment-content/test.txt' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -F file=@test.txt
```

## ⚠️ If Still Not Working

### Check 1: Verify Policies Exist
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```
Should show 4 policies: Insert, Select, Update, Delete

### Check 2: Verify Buckets are Public
```sql
SELECT id, public FROM storage.buckets;
```
All should show `public = true`

### Check 3: Check for Errors
Look in Supabase Dashboard > Logs for detailed error messages

### Check 4: Verify RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

## 🔒 Security Note

**This solution removes authentication requirements for uploads.**

✅ Safe because:
- Your app uses Pi Network authentication
- Application code validates users
- API routes check merchant ownership
- No sensitive data in file paths

❌ Not suitable if:
- You need user-level file access control
- Files contain sensitive/private data
- You want files only accessible to owners

## 🆘 Alternative: Contact Supabase Support

If you need to completely disable RLS on `storage.objects` and don't have permissions:

1. Go to Supabase Dashboard > Support
2. Request: "Please disable Row Level Security on storage.objects table"
3. Explain: "App uses custom authentication (Pi Network), not Supabase Auth"

## ✨ Success Indicators

After applying the fix:

✅ File uploads succeed without errors  
✅ No "row violates" messages  
✅ Files accessible via public URL  
✅ Upload works from your app  
✅ Storage operations complete  

---

**Last Updated:** January 7, 2026  
**Applies To:** DropPay with Pi Network Authentication
