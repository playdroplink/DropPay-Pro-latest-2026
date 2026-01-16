# 🚀 Payment Links - New Features Added!

## ✨ What's New for Payment Links

The same two powerful features from Checkout Links are now available in Payment Links:

1. **📍 Cancel Redirect URL** - Direct users to a custom page when payment fails or is cancelled
2. **🖼️ Checkout Image** - Upload an image to display on your payment page (max 5MB)

---

## 📦 Installation Steps

### Step 1: Apply Database Migration

Run the SQL migration for payment_links table:

**File:** `ADD_PAYMENT_LINK_CANCEL_AND_IMAGE.sql`

```powershell
# Open Supabase Dashboard → SQL Editor
# Copy and paste the entire SQL file content
# Click Run
```

The migration adds:
- `cancel_redirect_url` column (TEXT, default '')
- `checkout_image` column (TEXT, nullable)

### Step 2: Verify Storage Bucket

Make sure the `checkout-images` bucket exists (created earlier for Checkout Links):

1. Supabase Dashboard → **Storage**
2. Verify `checkout-images` bucket exists
3. Verify it's set to **Public**

✅ If it already exists from Checkout Links setup, you're all set!

---

## 🎯 How It Works

### In the Payment Link Creation Modal:

1. **Expand "Advanced options"**
2. You'll now see:
   - ✅ Redirect after checkout (existing)
   - ✅ **Cancel redirect (payment failed)** - NEW!
   - ✅ **Checkout Image (Optional)** - NEW!

### Cancel Redirect Usage:
```
Toggle on → Enter URL → https://yoursite.com/payment-cancelled
When payment fails → User redirected to your custom page
```

### Image Upload Usage:
```
Click "Upload Image" → Select file (max 5MB) → See preview
Image appears on payment page → Better branding
```

---

## 🗄️ Database Changes

### payment_links Table - New Columns:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `cancel_redirect_url` | TEXT | `''` | URL to redirect on payment failure/cancel |
| `checkout_image` | TEXT | NULL | Public URL of uploaded image |

---

## 📝 Code Changes Summary

### Files Modified:

1. **src/pages/PaymentLinks.tsx**
   - Added `cancel_redirect_url` and `checkout_image` to formData state
   - Added UI fields in Advanced options section
   - Added image upload logic to handleCreateLink
   - Added image upload to Supabase Storage
   - Updated resetForm to include new fields

2. **Database**
   - Created migration: `ADD_PAYMENT_LINK_CANCEL_AND_IMAGE.sql`

---

## ✅ Features Comparison

| Feature | Checkout Links | Payment Links |
|---------|---------------|---------------|
| Cancel Redirect | ✅ | ✅ (NEW!) |
| Image Upload | ✅ | ✅ (NEW!) |
| Success Redirect | ✅ | ✅ |
| Advanced Options | ✅ | ✅ |

---

## 🎨 UI Preview

### Payment Link Creation Modal - Advanced Options:

```
┌─ Advanced options ────────────────────────┐
│                                            │
│ [✓] Redirect after checkout               │
│     └─ https://example.com/success         │
│                                            │
│ [✓] Cancel redirect (payment failed)  NEW!│
│     └─ https://example.com/cancel          │
│                                            │
│ Checkout Image (Optional)             NEW!│
│ Add an image to display on checkout        │
│ [📤 Upload Image]                          │
│ └─ Preview: [thumbnail if uploaded]        │
│                                            │
│ [✓] Internal reference name                │
│     └─ Internal name...                    │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Image Upload Process:
1. User selects image → Validate size (< 5MB)
2. Upload to `checkout-images/{merchantId}/{timestamp}.{ext}`
3. Get public URL
4. Save URL to `checkout_image` column
5. Display on payment page

### Cancel Redirect Process:
1. User toggles "Cancel redirect"
2. Input field appears
3. URL saved to `cancel_redirect_url` column
4. Used in payment flow when payment fails

---

## 🎉 Benefits

### For Users:
- ✅ Professional payment pages with branding
- ✅ Better failure handling
- ✅ Consistent experience across all link types

### For You:
- ✅ Same features in both Checkout Links and Payment Links
- ✅ Uses same storage bucket (no duplication)
- ✅ Consistent codebase
- ✅ Better user experience

---

## 🐛 Troubleshooting

**Image upload fails?**
- Verify `checkout-images` bucket exists
- Check bucket is public
- Verify file is < 5MB

**Cancel redirect not saving?**
- Run the SQL migration
- Check database column exists

**Need help?**
- See `NEW_CHECKOUT_FEATURES_GUIDE.md` for detailed troubleshooting

---

## ✨ You're All Set!

Both **Checkout Links** and **Payment Links** now support:
- ✅ Cancel redirect URLs
- ✅ Image uploads
- ✅ Professional payment pages

Just apply the migration and start creating amazing payment experiences! 🎊

---

## 📚 Related Documentation

- `ADD_PAYMENT_LINK_CANCEL_AND_IMAGE.sql` - Database migration
- `NEW_CHECKOUT_FEATURES_GUIDE.md` - Detailed guide for Checkout Links
- `QUICK_START_NEW_FEATURES.md` - Quick start guide

**Happy selling! 💰**
