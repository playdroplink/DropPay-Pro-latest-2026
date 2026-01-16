# DropPay File Upload Storage Setup

## Issue
File uploads to Supabase storage bucket `payment-content` may fail if:
1. Bucket doesn't exist
2. CORS not configured
3. RLS policies not set correctly
4. Bucket is private instead of public

## Solution

### 1. Create Storage Bucket (via Supabase Dashboard)

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Name: `payment-content`
4. Access: **Public** (check the checkbox)
5. Create

### 2. Set CORS Policy

Add to bucket CORS settings:
```json
[
  {
    "origin": ["*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

### 3. Enable RLS (Row Level Security)

In Supabase Dashboard:
1. Go to **Storage** → **Policies**
2. Click on `payment-content` bucket
3. Add Policy:

**SELECT (Read) Policy:**
```sql
-- Allow authenticated users to read any file
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-content'
  AND auth.role() = 'authenticated'
);

-- Allow public/anonymous read
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-content');
```

**INSERT (Upload) Policy:**
```sql
-- Allow authenticated users to upload to their own merchant folder
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-content'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**DELETE Policy:**
```sql
-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-content'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 4. Verify Storage Connection

Test file upload with this code:
```typescript
const testUpload = async () => {
  try {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    const { error: uploadError } = await supabase.storage
      .from('payment-content')
      .upload('test-file.txt', file);
    
    if (uploadError) {
      console.error('Upload failed:', uploadError);
      return;
    }
    
    const { data } = supabase.storage
      .from('payment-content')
      .getPublicUrl('test-file.txt');
    
    console.log('✅ Upload successful! Public URL:', data.publicUrl);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## File Upload Flow

### PaymentLinks.tsx (Create)
```typescript
// User uploads file
const fileName = `${merchantId}/${Date.now()}.${fileExt}`;

// Upload to Supabase Storage
await supabase.storage
  .from('payment-content')
  .upload(fileName, file);

// Get public URL (optional, for preview)
const { data: urlData } = supabase.storage
  .from('payment-content')
  .getPublicUrl(fileName);

// Store path in database
setFormData({ content_file: fileName, ... });
```

### PayPage.tsx (Download)
```typescript
// After payment, get signed URL
const { data: signedUrlData } = await supabase.storage
  .from('payment-content')
  .createSignedUrl(paymentLink.content_file, 86400); // 24 hours

// Send to user
setContentUrl(signedUrlData.signedUrl);
```

---

## Troubleshooting

### "Storage bucket not found"
→ Create bucket named `payment-content` in Supabase Dashboard

### "Anonymous uploads not allowed"
→ User must be authenticated (Pi auth)
→ Check RLS policy allows INSERT for authenticated users

### "CORS error"
→ Add CORS policy to bucket
→ Allow origin: `*` or your specific domain

### "File not found when downloading"
→ Check file path matches upload path
→ Verify file exists in bucket
→ Check signed URL is not expired

### "Signed URL returns 404"
→ File path is wrong or file was deleted
→ Check `paymentLink.content_file` matches uploaded `fileName`

---

## Testing Checklist

- [ ] Bucket created and public
- [ ] CORS policy added
- [ ] RLS policies created
- [ ] User authenticated with Pi
- [ ] File selected and uploaded
- [ ] File path stored in database
- [ ] Signed URL generated on payment
- [ ] Download link sent to email

