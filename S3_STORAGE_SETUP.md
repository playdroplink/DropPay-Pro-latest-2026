# S3 Storage Setup Guide

## Step 1: Create Storage Bucket in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** → **Buckets**
4. Click **New Bucket**
5. Configure:
   - **Name:** `payment-content`
   - **Privacy:** Check "Public bucket"
   - Click **Create Bucket**

## Step 2: Configure CORS Policy

1. In Storage, click the **payment-content** bucket
2. Click **Settings** → **CORS**
3. Paste this CORS policy:
```json
[
  {
    "origin": ["*"],
    "methods": ["GET", "POST", "PUT", "DELETE"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }
]
```
4. Click **Save**

## Step 3: Add S3 Credentials to Supabase Secrets

Your S3 credentials have been generated and saved. Set them in Supabase edge functions:

```bash
# From your project root, run:
supabase secrets set S3_ACCESS_KEY="352e5b2395fe72f70c5b5631139a5d5c"
supabase secrets set S3_SECRET_KEY="8339f2f71776a4e9aa52aa22c6a5e1a0f99908cf3c23047715bedf42b5b7fea0"
```

Verify they were set:
```bash
supabase secrets list
```

## Step 4: Deploy Edge Functions

Deploy all functions with the new secrets:

```bash
supabase functions deploy --all
```

This deploys:
- `approve-payment`
- `complete-payment`
- `verify-payment`
- `send-download-email`
- `verify-ad-reward`
- `process-withdrawal`
- `delete-account`

## Step 5: Test File Upload

1. Create a payment link in the dashboard
2. Upload a file
3. Watch the console for these success indicators:
   - 🔼 Uploading file: [filename]
   - ✅ File uploaded: [filename]
   - ✅ Public URL generated: [url]

## Troubleshooting

### "Bucket not found" Error
- Verify bucket name is `payment-content`
- Check bucket privacy setting is "Public"
- Restart the app (clear cache)

### CORS Issues
- Verify CORS policy is set in bucket settings
- Check browser console for CORS errors
- Ensure `origin: ["*"]` is in CORS config

### Secret Errors in Functions
```bash
# View function logs
supabase functions logs approve-payment

# Re-set secrets if needed
supabase secrets set S3_ACCESS_KEY="352e5b2395fe72f70c5b5631139a5d5c"
supabase secrets set S3_SECRET_KEY="8339f2f71776a4e9aa52aa22c6a5e1a0f99908cf3c23047715bedf42b5b7fea0"

# Redeploy functions
supabase functions deploy --all
```

### File Upload Still Failing
1. Check browser console for error messages
2. Verify bucket exists: `supabase storage buckets list`
3. Test bucket permissions:
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM storage.buckets WHERE name = 'payment-content';
   ```
4. Check function logs:
   ```bash
   supabase functions logs send-download-email
   ```

## Environment Variables

Your local `.env.local` should have:

```env
VITE_PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
VITE_PI_VALIDATION_KEY=ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a
VITE_PI_SANDBOX_MODE=false
VITE_SUPABASE_URL=https://xoofailhzhfyebzpzrfs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**S3 credentials are ONLY needed in Supabase secrets (not in .env.local).**

## Verification Checklist

- [ ] `payment-content` bucket created
- [ ] Bucket privacy set to "Public"
- [ ] CORS policy configured in bucket settings
- [ ] S3 credentials set via `supabase secrets set`
- [ ] `supabase secrets list` shows S3_ACCESS_KEY and S3_SECRET_KEY
- [ ] All edge functions deployed: `supabase functions deploy --all`
- [ ] File upload test shows ✅ indicators in console
- [ ] Public file URL is accessible in browser

## Next Steps

Once storage is configured:

1. **Test the complete payment flow:**
   - Create payment link with file
   - Complete payment in Pi Browser
   - Verify email received with download link
   - Download file successfully

2. **Monitor in production:**
   - Check edge function logs daily
   - Monitor file upload success rate
   - Verify all payment statuses are updated

3. **Performance optimization:**
   - Configure CDN if needed
   - Set cache headers for files
   - Monitor storage usage

## Reference

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [S3 API Reference](https://docs.aws.amazon.com/s3/latest/API/Welcome.html)
- [CORS Configuration](https://supabase.com/docs/guides/storage/buckets/fundamentals#cors)
