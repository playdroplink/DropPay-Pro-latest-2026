# File Upload Troubleshooting Guide

## Quick Checklist for File Upload Issues

### ✅ Browser Console Check
Open **Developer Tools** (F12) and look at the **Console** tab when uploading:

```
🔼 Uploading file: [filename]
✅ File uploaded: [filename]
✅ Public URL generated: https://...
```

If you see these messages, upload is working!

---

### ❌ Common Errors and Solutions

#### Error: "Failed to upload file"
**Check:**
1. Supabase bucket `payment-content` exists
   - Go to Supabase Dashboard → Storage → Buckets
   - Should see `payment-content` listed
   
2. Bucket is **Public** (not Private)
   - Click bucket name → Edit → Check "Public bucket"

3. User is authenticated
   - Ensure Pi auth is working first
   - Check browser console: `@YourUsername` should show

---

#### Error: "Storage bucket not found"
**Solution:**
1. Create new bucket in Supabase Dashboard
   - Name: `payment-content`
   - Click **Create**

2. Make it public:
   - Click bucket → Edit → Check "Public bucket"

---

#### Error: "Anonymous uploads not allowed"
**Reason:** User must be authenticated

**Solution:**
1. Make sure user has signed in with Pi Network first
2. Check RLS policy allows authenticated users
3. See STORAGE_SETUP.md for RLS policy SQL

---

#### File uploads but won't download later
**Check:**
1. File path matches exactly
2. Signed URL hasn't expired (24 hours)
3. Bucket CORS is configured
4. Check PayPage.tsx console for URL generation errors

---

#### URL shows: `https://xoofailhzhfyebzpzrfs.storage.supabase.co/storage/v1/s3` (incomplete)
**Problem:** Missing file path in URL

**Solution:**
1. File wasn't actually uploaded
2. Check browser console for upload error messages
3. Verify bucket exists and is public
4. Check user is authenticated

---

### 🔧 Manual Testing

**Test file upload in browser console:**

```javascript
// 1. Check if bucket exists
const { data: buckets } = await supabase.storage.listBuckets();
console.log('Buckets:', buckets);

// 2. Try uploading a test file
const testFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
const { data, error } = await supabase.storage
  .from('payment-content')
  .upload('test.txt', testFile);
  
if (error) {
  console.error('Upload error:', error);
} else {
  console.log('Upload success:', data);
  
  // 3. Get public URL
  const { data: urlData } = supabase.storage
    .from('payment-content')
    .getPublicUrl('test.txt');
  console.log('Public URL:', urlData.publicUrl);
}
```

---

### 📋 Verification Steps

After uploading a file:

1. **Check Console (F12)**
   ```
   ✅ File uploaded: uuid/filename.ext
   ✅ Public URL generated: https://...
   ```

2. **Check Database**
   - Go to Supabase → Database → payment_links
   - Look for `content_file` column
   - Should show path like: `userid/1234567890.pdf`

3. **Check Storage Bucket**
   - Go to Supabase → Storage → payment-content
   - Should see file listed with same path

4. **Test Download**
   - Visit the public URL in browser
   - Should download or show file content

---

### 🚀 Full Setup (If Starting Fresh)

1. **Create Bucket**
   ```
   Supabase Dashboard → Storage → New Bucket
   Name: payment-content
   Public: ✓ checked
   ```

2. **Set CORS**
   - Bucket Settings → CORS
   - Add: `["*"]` for origin

3. **Add RLS Policies** (see STORAGE_SETUP.md)

4. **Test Upload**
   - Use form in PaymentLinks page
   - Check console for success messages

5. **Test Download**
   - Create payment link with file
   - Complete payment
   - Check signed URL works

---

### 📞 If Still Not Working

1. **Check Supabase Status:**
   - Go to https://status.supabase.com
   - Ensure no outages

2. **Check Network:**
   - Open DevTools → Network tab
   - Look for storage.googleapis.com requests
   - Check for 404 or 403 errors

3. **Check Logs:**
   - Supabase Dashboard → Functions
   - Check any edge function errors

4. **Enable Debug Logging:**
   ```typescript
   // Add to PaymentLinks.tsx
   console.log('Merchant ID:', merchant?.id || piUser?.uid);
   console.log('File:', file.name, file.size);
   console.log('Bucket:', 'payment-content');
   ```

---

## File Upload Flow Diagram

```
User Selects File
        ↓
PaymentLinks.tsx handleFileUpload()
        ↓
Create fileName: merchantId/timestamp.ext
        ↓
supabase.storage.upload() → payment-content bucket
        ↓
   Success? → Store fileName in database
   Failure? → Show error toast
        ↓
After Payment:
PayPage.tsx gets contentUrl
        ↓
Create Signed URL (24 hr expiry)
        ↓
Send to customer email
        ↓
Customer downloads from URL
```

---

## Success Indicators

✅ Console shows: "✅ File uploaded" and "✅ Public URL generated"
✅ Database shows: content_file column has path value
✅ Storage shows: File visible in payment-content bucket
✅ Customer receives: Download link after payment
✅ Download works: File opens/downloads in browser

