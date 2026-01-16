# 🖼️ Complete Image Upload Fix for Payment Links

## Problem
Users are seeing: **"Upload failed: Storage security not configured. Please run FIX_STORAGE_SECURITY.sql"**

## Root Cause
Supabase storage buckets need:
1. ✅ **Buckets to exist** (checkout-images, payment-link-images, etc.)
2. ✅ **RLS Policies configured** (allow uploads and reads)

---

## Solution: Complete 2-Step Fix

### ⏱️ Time Required: 5 Minutes

---

## STEP 1: Create Storage Buckets

### Requirement
You need administrative access to Supabase SQL Editor

### Instructions

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Sign in with your credentials

2. **Select Your Project**
   - Project: `droppay` (xoofailhzhfyebzpzrfs)

3. **Open SQL Editor**
   - Left sidebar → SQL Editor
   - Click "New Query"

4. **Copy & Paste SQL**
   - Open file: `CREATE_BUCKETS_ONLY.sql` in your editor
   - Copy ALL content
   - Paste into Supabase SQL Editor

5. **Execute Query**
   - Click the **RUN** button
   - Wait for success message
   - You should see table showing 5 buckets created:
     - ✓ checkout-images (52 MB, PUBLIC)
     - ✓ payment-link-images (52 MB, PUBLIC)
     - ✓ merchant-products (100 MB, PUBLIC)
     - ✓ payment-content (512 MB, PRIVATE)
     - ✓ user-uploads (52 MB, PUBLIC)

### Expected Output
```
Storage Buckets Created
✓ checkout-images (52 MB, PUBLIC)
✓ merchant-products (100 MB, PUBLIC)
✓ payment-content (512 MB, PRIVATE)
✓ payment-link-images (52 MB, PUBLIC)
✓ user-uploads (52 MB, PUBLIC)
```

---

## STEP 2: Configure RLS Policies

### Instructions

1. **Create New Query in SQL Editor**
   - Click "New Query" again in Supabase

2. **Copy & Paste SQL**
   - Open file: `FIX_STORAGE_SECURITY.sql` in your editor
   - Copy ALL content
   - Paste into Supabase SQL Editor

3. **Execute Query**
   - Click the **RUN** button
   - Wait for completion
   - Should complete without errors

### What Gets Applied
- ✅ Enables RLS on storage.objects
- ✅ Creates 20 policies (4 per bucket × 5 buckets)
- ✅ Allows public read on image buckets
- ✅ Allows authenticated users to upload

### Expected Output
```
Policies Applied: 20
- checkout-images: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- payment-link-images: 4 policies
- merchant-products: 4 policies
- payment-content: 4 policies
- user-uploads: 4 policies
```

---

## STEP 3: Test Image Upload

1. **Go to DropPay Dashboard**
   - https://droppay.space/dashboard
   - Ensure you're logged in (Pi Network)

2. **Create a Payment Link**
   - Click "+ Create Link (200 left)"
   - Fill in link details
   - Look for "Upload Image" button
   - Select a test image (JPG, PNG, etc.)
   - See preview appear

3. **Submit Link**
   - Click "Create Payment Link"
   - Should see: "✅ Payment link created successfully!"
   - Image should display in the link card

4. **Verify in Console**
   - Open Developer Tools (F12)
   - Look for: `✅ Checkout image uploaded and accessible:`
   - Copy the URL and open in new tab to verify image loads

---

## File Reference

| File | Purpose | Step |
|------|---------|------|
| `CREATE_BUCKETS_ONLY.sql` | Create 5 storage buckets | 1 |
| `FIX_STORAGE_SECURITY.sql` | Add RLS policies | 2 |
| `src/pages/PaymentLinks.tsx` | Upload handler code | Reference |
| `FIX_IMAGE_UPLOAD_GUIDE.md` | Detailed troubleshooting | Reference |

---

## Bucket Details

### checkout-images
- **Purpose:** Product/service images shown in checkout
- **Size Limit:** 52 MB per file
- **Public:** Yes (customers can view)
- **Formats:** JPEG, PNG, WebP, GIF, SVG

### payment-link-images
- **Purpose:** Cover/thumbnail images for payment links
- **Size Limit:** 52 MB per file
- **Public:** Yes
- **Formats:** JPEG, PNG, WebP, GIF, SVG

### merchant-products
- **Purpose:** E-commerce product images
- **Size Limit:** 100 MB per file
- **Public:** Yes
- **Formats:** JPEG, PNG, WebP, GIF, Video, PDF

### payment-content
- **Purpose:** Protected/premium content
- **Size Limit:** 512 MB per file
- **Public:** No (private bucket)
- **Formats:** Any

### user-uploads
- **Purpose:** General user file uploads
- **Size Limit:** 52 MB per file
- **Public:** Yes
- **Formats:** JPEG, PNG, WebP, GIF

---

## RLS Policies Explained

### Permission Matrix
```
                SELECT   INSERT   UPDATE   DELETE
checkout-images   Public   Auth     Auth     Auth
payment-link-*    Public   Auth     Auth     Auth
merchant-products Public   Auth     Auth     Auth
payment-content   Auth     Auth     Auth     Auth
user-uploads      Public   Auth     Auth     Auth
```

**Public** = Anyone can access (unauthenticated)  
**Auth** = Logged-in users only

### Example Policy
```sql
-- Anyone can see checkout images
CREATE POLICY "Public read checkout-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'checkout-images');

-- Logged-in users can upload
CREATE POLICY "Authenticated insert checkout-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checkout-images');
```

---

## Upload Flow After Fix

```
┌─ User uploads image ─────────────────────┐
│                                          │
├─ Browser validates file                 │
│  (size, type, etc.)                      │
│                                          │
├─ Supabase checks: Is user logged in? ───┐
│                                         │
│ YES → Check RLS policy                   │
│       ↓                                  │
│       Policy says: "Auth users can       │
│       insert into checkout-images"       │
│       ↓                                  │
│       File uploads to S3 ✅              │
│                                          │
│ NO → Show error ❌                       │
│      "Please log in to upload"           │
│                                          │
└──────────────────────────────────────────┘

Result: Image URL saved to database
        Displayed in checkout page
        Customers can see it
```

---

## Troubleshooting

### Issue: SQL Won't Execute
**Solution:**
- Ensure you copied the ENTIRE file content
- No text editor formatting (use plain text)
- Try copying in sections if too long
- Refresh page and try again

### Issue: Still Getting RLS Error
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Logout and login again
- Wait 30 seconds (caching)
- Check browser console for exact error
- Verify you're in the correct project

### Issue: Buckets Exist But RLS Still Fails
**Solution:**
- RLS policies must be applied separately
- Run FIX_STORAGE_SECURITY.sql completely
- Verify all 20 policies are created:
  ```sql
  SELECT COUNT(*) FROM pg_policies 
  WHERE tablename = 'objects' 
  AND schemaname = 'storage';
  ```
  Should show: `20`

### Issue: File Uploads But Image URL Invalid
**Solution:**
1. Check image URL in database:
   ```sql
   SELECT id, title, checkout_image 
   FROM checkout_links 
   ORDER BY created_at DESC LIMIT 1;
   ```
2. Copy the checkout_image URL
3. Open in new browser tab
4. If 404: Bucket might not have public read policy
5. Re-run FIX_STORAGE_SECURITY.sql

---

## Quick Verification

### In Supabase Dashboard:

**Check Buckets Exist:**
```sql
SELECT id, public, file_size_limit 
FROM storage.buckets 
WHERE id LIKE '%-images' OR id = 'merchant-products' OR id = 'payment-content' OR id = 'user-uploads';
```
Should show 5 rows.

**Check Policies Exist:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
```
Should show 20 rows (4 per bucket).

**Check RLS is Enabled:**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';
```
Should show `rowsecurity = true`.

---

## After Fix Checklist

- [ ] CREATE_BUCKETS_ONLY.sql executed successfully
- [ ] FIX_STORAGE_SECURITY.sql executed successfully
- [ ] 5 buckets created (verified in SQL results)
- [ ] 20 policies created (verified in SQL results)
- [ ] Logged in to DropPay dashboard
- [ ] Created test payment link with image
- [ ] Image uploaded without error
- [ ] Image URL appears in database
- [ ] Image visible in dashboard card
- [ ] Image visible in payment link when shared

---

## Next Steps

1. **Test More Images**
   - Try different formats (PNG, JPG, WebP)
   - Try various file sizes
   - Verify all work correctly

2. **Share Payment Links**
   - Copy links and send to others
   - Verify images display in checkout
   - Test actual payment flow

3. **Monitor Performance**
   - Check image loading speed
   - Monitor bandwidth usage
   - Verify no errors in production

---

## Related Documentation

- [FIX_IMAGE_UPLOAD_GUIDE.md](FIX_IMAGE_UPLOAD_GUIDE.md) - Detailed troubleshooting
- [CREATE_BUCKETS_ONLY.sql](CREATE_BUCKETS_ONLY.sql) - Bucket creation SQL
- [FIX_STORAGE_SECURITY.sql](FIX_STORAGE_SECURITY.sql) - RLS policies SQL
- [NEW_CHECKOUT_FEATURES_GUIDE.md](NEW_CHECKOUT_FEATURES_GUIDE.md) - Checkout feature details

---

## Support

If you encounter issues:

1. **Check browser console** (F12) for detailed error
2. **Run verification SQL** to confirm configuration
3. **Clear cache** and try again
4. **Check authentication** - must be logged in
5. **Verify file size** - must be under bucket limit

---

**Status:** 🟢 Ready to Fix  
**Difficulty:** Easy (Copy & Paste SQL)  
**Time Estimate:** 5 minutes  
**Risk Level:** Low (Non-destructive, creates missing items)

---

**Commands for Quick Copy:**

```bash
# Create buckets
CREATE_BUCKETS_ONLY.sql

# Apply RLS policies  
FIX_STORAGE_SECURITY.sql

# Verify in dashboard
https://supabase.com/dashboard → SQL Editor
```
