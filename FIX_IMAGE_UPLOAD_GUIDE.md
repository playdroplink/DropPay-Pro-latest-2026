# 🔧 Fix Image Upload in Payment Links - Complete Guide

## Issue
**Error Message:** "Upload failed: Storage security not configured. Please run FIX_STORAGE_SECURITY.sql"

**Problem:** Supabase storage buckets for checkout images don't have proper Row Level Security (RLS) policies configured.

---

## Quick Fix (2 Minutes)

### Step 1: Get the SQL Script
The file `FIX_STORAGE_SECURITY.sql` already exists in your project root.

### Step 2: Execute in Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (xoofailhzhfyebzpzrfs)
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy ALL content from `FIX_STORAGE_SECURITY.sql`
6. Paste into the SQL editor
7. Click **RUN** button
8. Wait for success message

### Step 3: Verify
After running the SQL, you should see:
- ✅ All policies created successfully
- ✅ 5 buckets with 4 policies each = 20 total policies

---

## What Gets Fixed

### RLS Policies Created
The script creates Row Level Security policies for these buckets:

| Bucket | Select | Insert | Update | Delete |
|--------|--------|--------|--------|--------|
| **checkout-images** | ✅ | ✅ | ✅ | ✅ |
| **payment-link-images** | ✅ | ✅ | ✅ | ✅ |
| **merchant-products** | ✅ | ✅ | ✅ | ✅ |
| **payment-content** | ✅ | ✅ | ✅ | ✅ |
| **user-uploads** | ✅ | ✅ | ✅ | ✅ |

### Permission Levels

**SELECT (Read)**
- Allows: Public (unauthenticated) and Authenticated users
- Buckets affected: All except payment-content
- Use case: Display images on payment pages

**INSERT (Upload)**
- Allows: Authenticated users only
- Buckets affected: All
- Use case: Users uploading their own checkout images

**UPDATE (Modify)**
- Allows: Authenticated users only
- Buckets affected: All
- Use case: Replace or update existing uploads

**DELETE (Remove)**
- Allows: Authenticated users only
- Buckets affected: All
- Use case: Delete old/unused images

---

## SQL Script Breakdown

### Enable RLS
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```
Ensures Row Level Security is active on storage objects.

### Drop Existing Policies
```sql
DROP POLICY IF EXISTS "Public read checkout-images" ON storage.objects;
-- ... (drops all old policies)
```
Cleans up any conflicting policies from previous attempts.

### Create Policies (Example)
```sql
-- Public can read checkout images
CREATE POLICY "Public read checkout-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'checkout-images');

-- Authenticated users can upload checkout images
CREATE POLICY "Authenticated insert checkout-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checkout-images');
```

---

## Testing Image Upload

### Step 1: Navigate to Dashboard
1. Open DropPay dashboard: https://droppay.space/dashboard
2. Ensure you're authenticated (Pi Network login)

### Step 2: Create Payment Link
1. Click **"+ Create Link"** button
2. Fill in link details
3. Look for **"Checkout Image"** section
4. Click **"Choose Image"** button
5. Select an image file (JPG, PNG, etc.)
6. See preview appear
7. Click **"Create Payment Link"**

### Step 3: Verify Upload
When the link is created successfully:
- ✅ "Payment link created successfully!" message appears
- ✅ Image is displayed in the payment link preview
- ✅ No "Upload failed" errors in browser console

### Browser Console Check
Open Developer Tools (F12) and look for:
```
✅ Checkout image uploaded and accessible: https://...storage.supabase.co...
```

---

## Upload Flow Diagram

```
User uploads image
        ↓
PaymentLinks.tsx validates file
        ↓
Supabase auth.getUser() checks authentication
        ↓
storage.from('checkout-images').upload()
        ↓
RLS Policy checks: "Is user authenticated?" → YES ✅
        ↓
File stored in bucket
        ↓
getPublicUrl() retrieves accessible URL
        ↓
URL saved to database (checkout_image field)
        ↓
Image displayed in checkout flow
```

---

## Common Issues & Solutions

### Issue 1: Still Getting RLS Error After Fixing
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Logout and login again
3. Try with a different image file
4. Check browser console for exact error message

**Debug Command** (in browser console):
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.id);
// Should show your user ID, not null
```

### Issue 2: Upload Succeeds But Image Not Visible
**Solution:**
1. Check image URL in database:
   ```sql
   SELECT id, title, checkout_image FROM checkout_links LIMIT 5;
   ```
2. Verify URL is valid (copy to new tab)
3. If 404 error: File might not be accessible
4. Re-run FIX_STORAGE_SECURITY.sql and try again

### Issue 3: Can't Access Supabase Dashboard
**Solution:**
1. Go to https://supabase.com/dashboard
2. Sign in with your account
3. Select project "droppay" (xoofailhzhfyebzpzrfs)
4. Navigate to **SQL Editor** tab

### Issue 4: SQL Script Fails to Run
**Solution:**
1. Copy SQL content again (full text)
2. Paste into a fresh new query
3. Check for any error messages
4. If syntax error: Click the error line to see details
5. Try running smaller sections first (Step 1, then Step 2, etc.)

---

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| SQL Fix | `FIX_STORAGE_SECURITY.sql` | RLS policies to run in Supabase |
| Upload Code | `src/pages/PaymentLinks.tsx` (line 198) | Where images are uploaded |
| Error Handler | `src/pages/PaymentLinks.tsx` (line 217) | Detects RLS errors |
| PowerShell Script | `apply-storage-security-fix.ps1` | Automation helper (optional) |

---

## Security Configuration

### Why This Matters
- **RLS Policies** prevent unauthorized access
- **Public Read** allows customers to see product images
- **Authenticated Only** ensures only logged-in users can upload
- **Bucket Isolation** keeps different image types separate

### Bucket Purpose
- **checkout-images** - Product/service images in checkout
- **payment-link-images** - Cover images for payment links
- **merchant-products** - E-commerce product images
- **payment-content** - Protected/premium content files
- **user-uploads** - General user file uploads

---

## Verification Checklist

After running FIX_STORAGE_SECURITY.sql:

- [ ] SQL runs without errors
- [ ] Verification query shows 20 policies created
- [ ] Can upload image to payment link
- [ ] Image displays in dashboard
- [ ] Image URL in database is valid
- [ ] Payment link shows checkout image to customers
- [ ] No console errors for 'row-level security'

---

## Next Steps

Once upload is working:

1. **Create test payment links** with images
2. **Share links** and verify image displays
3. **Test in Pi Browser** with actual payment flow
4. **Check analytics** - track image click-through rates

---

## Additional Resources

### Related Files:
- [NEW_CHECKOUT_FEATURES_GUIDE.md](NEW_CHECKOUT_FEATURES_GUIDE.md) - Checkout image feature overview
- [FILE_UPLOAD_VERIFICATION.md](FILE_UPLOAD_VERIFICATION.md) - General upload troubleshooting
- [PI_NETWORK_INTEGRATION_VERIFICATION.md](PI_NETWORK_INTEGRATION_VERIFICATION.md) - Complete system status

### Supabase Docs:
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Buckets](https://supabase.com/docs/guides/storage)
- [Managing Policies](https://supabase.com/docs/guides/auth/row-level-security/manage-policies)

---

## Support

If you still have issues:

1. **Check browser console** (F12) for actual error
2. **Verify authentication** - user must be logged in
3. **Check bucket name** - must match exactly: `checkout-images`
4. **Run SQL again** - sometimes policies need refresh
5. **Clear cache** - old policies might be cached

---

**Last Updated:** January 9, 2026  
**Status:** 🟢 Production Ready After SQL Fix
