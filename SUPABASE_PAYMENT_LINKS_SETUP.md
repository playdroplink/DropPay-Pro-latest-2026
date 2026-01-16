# ✅ Supabase Payment Links - Complete Setup Guide

## Overview

Your Supabase integration is now fully configured with **enhanced logging and error reporting** to ensure all payment links are properly saved and retrieved.

## What's Been Set Up

### 1. **Payment Links Table**
- ✅ Fetches all payment links for authenticated users
- ✅ Saves new payment links with all fields
- ✅ Supports all pricing types: free, one-time, recurring, donation
- ✅ Handles file uploads for digital products
- ✅ Tracks views and conversions

### 2. **Enhanced Logging**
When you create or view payment links, you'll see detailed console messages:

#### Creating a Link:
```
🚀 Creating payment link with data: {
  title: "My Payment Link",
  pricing_type: "free",
  amount: 0.01,
  merchant_id: "user-123",
  slug: "abc12345"
}

✅ Payment link successfully saved to Supabase: {
  id: "link-123",
  slug: "abc12345",
  title: "My Payment Link",
  url: "https://droppay.com/pay/abc12345"
}
```

#### Fetching Links:
```
🔄 Fetching payment links for merchant: user-123
✅ Successfully fetched 5 payment links
📋 Payment Links:
   • "Product 1" (free) - abc12345
   • "Product 2" (one_time) - def67890
   • "Donation" (donation) - ghi11111
```

### 3. **Error Reporting**
If something fails, you'll get detailed error info:
```
❌ Error creating payment link: {
  message: "INSERT not allowed",
  code: "PGRST204",
  details: "...",
  hint: "..."
}
```

## Quick Start

### 1. **Create a Payment Link**
1. Go to Dashboard
2. Click "Create Payment Link"
3. Fill in the details
4. Click "Create"
5. **Check Console (F12)** for ✅ success message

### 2. **View Payment Links**
1. Go to Dashboard
2. Scroll through your links
3. **Check Console (F12)** for loading messages

### 3. **Test in Browser Console**
```javascript
// Open F12 → Console and run:
// Get all your payment links
const { data } = await supabase
  .from('payment_links')
  .select('*')
  .eq('merchant_id', 'your-merchant-id');

console.log('My links:', data);
```

## How to Verify Everything is Working

### Method 1: **Console Messages**
When you create a link and see this message, everything is working:
```
✅ Payment link successfully saved to Supabase: {
  slug: "abc12345",
  title: "My Product",
  url: "https://droppay.com/pay/abc12345"
}
```

### Method 2: **Dashboard Check**
1. Create a link
2. It should appear immediately in your dashboard list
3. Count should increase

### Method 3: **Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Go to **Table Editor** → **payment_links**
4. You should see your newly created links

### Method 4: **Test Payment Page**
1. Create a payment link
2. Copy the slug from console
3. Visit `https://droppay.com/pay/[slug]`
4. It should load correctly

## Troubleshooting

### Problem: "Payment link created!" message but link doesn't appear

**Check:**
1. Open F12 → Console
2. Look for ✅ or ❌ messages
3. If you see ❌ error, note the code
4. Check if link appears in Supabase dashboard

**Solutions:**
- **Code: PGRST404** → Table doesn't exist
  ```sql
  -- Run in Supabase SQL Editor:
  SELECT * FROM payment_links LIMIT 1;
  ```

- **Code: PGRST204** → RLS policy blocks insert
  ```sql
  -- Enable RLS policy:
  ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
  ```

- **Code: 400 Bad Request** → Missing or wrong column
  ```sql
  -- Check columns:
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_name = 'payment_links';
  ```

### Problem: Links don't appear in list after creation

**Solutions:**
1. Hard refresh page: `Ctrl+Shift+R`
2. Check merchant_id is correct:
   ```javascript
   // In console:
   console.log('Merchant ID:', piUser.uid);
   ```
3. Check links exist in Supabase:
   ```javascript
   const { data } = await supabase
     .from('payment_links')
     .select('merchant_id', { count: 'exact' });
   console.log('Total links:', data?.length);
   ```

### Problem: File uploads not working

Check the file upload console logs:
```
🔼 Uploading file: [filename]
✅ File uploaded: [filename]
✅ Public URL generated: [url]
```

If you see ❌, check:
1. Storage bucket `payment-content` exists
2. Bucket is public
3. CORS is configured

## Console Log Reference

### Success Messages (✅)
```
✅ Successfully fetched 5 payment links
✅ Payment link successfully saved to Supabase
✅ File uploaded: document.pdf
✅ Public URL generated: https://...
```

### Info Messages (🔄, 📋, 🚀)
```
🔄 Fetching payment links for merchant: user-123
📋 Payment Links:
🚀 Creating payment link with data:
🔼 Uploading file: image.jpg
```

### Error Messages (❌)
```
❌ Error fetching payment links: [error details]
❌ Error creating payment link: [error details]
❌ Error uploading file: [error details]
```

## Features Fully Supported

✅ **Free Payment Links** - No charge to customers
✅ **Paid Links** - Charge for digital products
✅ **Recurring Payments** - Subscription support
✅ **Donations** - Accept any amount from customers
✅ **File Uploads** - Digital product delivery
✅ **Email Delivery** - Send download links via email
✅ **Redirect After Payment** - Send customers to custom URL
✅ **Stock Management** - Limited inventory support
✅ **Waitlist** - Collect emails for future launches
✅ **Custom Questions** - Gather customer data at checkout

## API Endpoints Used

All requests go to Supabase via standard REST API:
- **Base URL:** `https://xoofailhzhfyebzpzrfs.supabase.co`
- **Endpoints:**
  - `POST /rest/v1/payment_links` - Create link
  - `GET /rest/v1/payment_links` - Get links
  - `DELETE /rest/v1/payment_links` - Delete link
  - `PATCH /rest/v1/payment_links` - Update link

## Database Schema

### payment_links Table Columns:
```
✅ id (UUID) - Unique identifier
✅ merchant_id (UUID) - Link owner
✅ title (TEXT) - Link name
✅ description (TEXT) - Link description
✅ amount (NUMERIC) - Price in Pi
✅ slug (TEXT) - URL slug
✅ is_active (BOOLEAN) - Published/Draft
✅ created_at (TIMESTAMP) - Creation date
✅ pricing_type (TEXT) - free/one_time/recurring/donation
✅ min_amount (NUMERIC) - For donations
✅ suggested_amounts (ARRAY) - For donations
✅ content_file (TEXT) - File path if digital product
✅ access_type (TEXT) - instant/redirect/download
✅ redirect_url (TEXT) - Post-payment redirect
✅ stock (INTEGER) - Inventory count
✅ is_unlimited_stock (BOOLEAN) - Unlimited inventory
✅ enable_waitlist (BOOLEAN) - Collect emails
✅ ask_questions (BOOLEAN) - Custom questions
✅ checkout_questions (JSONB) - Question definitions
```

## Next Steps

1. ✅ Create some test payment links
2. ✅ Verify they appear in the dashboard
3. ✅ Check console for success messages
4. ✅ Test the payment page loads correctly
5. ✅ Try paying in Pi Browser
6. ✅ Verify email delivery works
7. ✅ Monitor Supabase logs for any errors

## Help & Support

### For Technical Issues:
1. Check console (F12) for error messages
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Check [Pi Network Docs](https://pi-apps.github.io/docs/)
4. Run test script: `node test-supabase-payment-links.js`

### For Configuration Help:
See `SUPABASE_VERIFICATION.md` for detailed setup guide

## Summary

Your Supabase integration is now:
- ✅ **Connected** - Verified working database connection
- ✅ **Logging** - Detailed console messages for debugging
- ✅ **Saving** - All payment links properly persisted
- ✅ **Retrieving** - Links load correctly in dashboard
- ✅ **Error Handling** - Clear error messages if issues occur

**You're ready to:**
- ✅ Create payment links
- ✅ Accept Pi Network payments
- ✅ Deliver digital products
- ✅ Manage your business

Happy selling! 🚀
