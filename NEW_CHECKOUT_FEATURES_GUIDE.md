# New Checkout Link Features - Implementation Guide

## ✨ Features Added

### 1. **Cancel Redirect URL** 
- Redirect users to a custom page when payment is cancelled or fails
- Optional field below "Redirect after checkout"
- Useful for directing users back to your website with a custom message

### 2. **Checkout Image** (Optional)
- Upload an image to display on the checkout page
- Helps with branding and product visualization
- Maximum file size: 5MB
- Supported formats: All image types (jpg, png, gif, webp, etc.)

---

## 🗄️ Database Setup

### Step 1: Apply Database Migration

Run the following SQL in your Supabase SQL Editor:

**File:** `ADD_CHECKOUT_CANCEL_AND_IMAGE.sql`

```sql
-- Add cancel_redirect_url column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='cancel_redirect_url') THEN
        ALTER TABLE checkout_links ADD COLUMN cancel_redirect_url TEXT DEFAULT '';
        RAISE NOTICE 'Added cancel_redirect_url column';
    ELSE
        RAISE NOTICE 'cancel_redirect_url column already exists';
    END IF;
END $$;

-- Add checkout_image column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='checkout_links' AND column_name='checkout_image') THEN
        ALTER TABLE checkout_links ADD COLUMN checkout_image TEXT DEFAULT NULL;
        RAISE NOTICE 'Added checkout_image column';
    ELSE
        RAISE NOTICE 'checkout_image column already exists';
    END IF;
END $$;
```

### Step 2: Create Storage Bucket for Images

In your Supabase Dashboard:

1. Go to **Storage** section
2. Click **New Bucket**
3. Create a bucket named: `checkout-images`
4. Make it **Public** (so images can be displayed)
5. Click **Create bucket**

#### Set up Storage Policy

Run this SQL to allow authenticated users to upload images:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload checkout images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checkout-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to checkout images
CREATE POLICY "Public can view checkout images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'checkout-images');
```

---

## 🎯 How to Use the New Features

### Creating a Checkout Link

1. **Navigate to Dashboard** → **Checkout Links** → **Create New Link**

2. **Fill in basic details:**
   - Title
   - Description
   - Category
   - Amount
   - Features

3. **Expand "Advanced options"**

4. **Set Redirect URLs:**
   - ✅ **Redirect after checkout** - Where to send users after successful payment
     - Example: `https://yoursite.com/success`
   
   - ✅ **Cancel redirect (payment failed)** - NEW! Where to send users if payment fails
     - Example: `https://yoursite.com/cancel`

5. **Upload Checkout Image (Optional):**
   - Click "Upload Image" button
   - Select an image file (max 5MB)
   - Preview will appear below
   - Image will be displayed on the checkout page to your customers

6. **Click "Create Link"**

---

## 📊 Database Schema Changes

### New Columns in `checkout_links` table:

| Column Name | Type | Default | Nullable | Description |
|------------|------|---------|----------|-------------|
| `cancel_redirect_url` | TEXT | `''` | YES | URL to redirect when payment is cancelled/failed |
| `checkout_image` | TEXT | NULL | YES | Public URL of uploaded checkout image |

---

## 🔧 Technical Implementation Details

### Frontend Changes:

1. **CheckoutLinkBuilder.tsx**
   - Added `cancelRedirect?: string` field
   - Added `checkoutImage?: File` field
   - Added UI toggle and input for cancel redirect URL
   - Added image upload button with preview

2. **DashboardCreateCheckoutLink.tsx**
   - Image upload to Supabase Storage bucket `checkout-images`
   - Automatic file naming: `{merchantId}/{timestamp}.{ext}`
   - Error handling for upload failures
   - Passes image URL to database

3. **checkout_links.ts (Supabase integration)**
   - Updated `CreateCheckoutLinkInput` interface
   - Added fields to database insert operation

---

## 🚀 Usage Example

```typescript
// When creating a checkout link:
{
  title: "Premium Course",
  description: "Learn advanced techniques",
  category: "education",
  amount: 99,
  currency: "Pi",
  features: ["Lifetime access", "Certificate"],
  redirectAfterCheckout: "https://mysite.com/thank-you",
  cancelRedirect: "https://mysite.com/payment-cancelled",  // NEW!
  checkoutImage: imageFile  // NEW! (File object)
}
```

---

## ✅ Verification Steps

After applying the migration:

1. **Check Database:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'checkout_links' 
     AND column_name IN ('cancel_redirect_url', 'checkout_image');
   ```

2. **Check Storage Bucket:**
   - Go to Supabase Dashboard → Storage
   - Verify `checkout-images` bucket exists
   - Verify it's set to Public

3. **Test in App:**
   - Create a new checkout link
   - Toggle "Cancel redirect" option
   - Upload an image
   - Verify link is created successfully
   - Check if image appears in Storage bucket

---

## 🎨 UI Screenshots Description

### Before (Original):
- Redirect after checkout toggle/input

### After (New Features):
- Redirect after checkout toggle/input
- **Cancel redirect** toggle/input (NEW)
- **Checkout Image** upload section with preview (NEW)

---

## 📝 Notes

- **Cancel Redirect:** Only activates when payment fails or is cancelled
- **Checkout Image:** Automatically resized and optimized for web display
- **Storage:** Images stored in Supabase Storage with public access
- **Backward Compatible:** Existing checkout links work without these fields

---

## 🐛 Troubleshooting

### Image Upload Fails
- Check Storage bucket exists and is public
- Verify storage policies are applied
- Check file size (must be < 5MB)
- Check file format is an image type

### Cancel Redirect Not Working
- Verify URL starts with `https://`
- Check database column was created successfully
- Verify payment flow includes cancel handling

### Need Help?
Check the Supabase Dashboard:
- SQL Editor for database issues
- Storage section for image upload issues
- Logs for error messages

---

## 🎉 Success!

Your checkout links now support:
✅ Custom cancel/failure redirect URLs
✅ Image uploads for better branding
✅ Enhanced user experience
✅ Professional checkout pages

**Happy selling! 🚀**
