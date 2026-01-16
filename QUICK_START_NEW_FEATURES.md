# 🚀 Quick Start - New Checkout Features

## What's New? ✨

Two powerful new features for your checkout links:

1. **📍 Cancel Redirect** - Send users to a custom page when payment fails
2. **🖼️ Checkout Image** - Add images to your checkout pages

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Database Migration (2 minutes)

**Option A - Use the script:**
```powershell
.\apply-new-checkout-features.ps1
```

**Option B - Manual:**
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste from `ADD_CHECKOUT_CANCEL_AND_IMAGE.sql`
3. Click Run

### Step 2: Create Storage Bucket (1 minute)

1. Supabase Dashboard → **Storage**
2. **New Bucket** → Name: `checkout-images`
3. Make it **Public** ✅
4. Click **Create**

### Step 3: Test It! (1 minute)

1. Dashboard → **Checkout Links** → **Create New**
2. Fill in basic details
3. Expand **Advanced options**
4. Try the new features:
   - Toggle **"Cancel redirect"**
   - Click **"Upload Image"**
5. Create the link ✨

---

## 🎯 How to Use

### Cancel Redirect

```
When to use:
✅ Payment cancelled by user
✅ Payment failed
✅ Insufficient funds
✅ Network error

Example URLs:
• https://yoursite.com/payment-cancelled
• https://yoursite.com/try-again
• https://yoursite.com/contact-support
```

### Checkout Image

```
Best practices:
✅ Product photos
✅ Brand logos
✅ Service illustrations
✅ Course thumbnails

Requirements:
• Max size: 5MB
• Format: Any image (jpg, png, gif, webp)
• Displays on checkout page
```

---

## 📋 Checklist

- [ ] Run SQL migration
- [ ] Create `checkout-images` bucket
- [ ] Make bucket public
- [ ] Test creating a link with image
- [ ] Test creating a link with cancel redirect
- [ ] Verify image appears in Storage

---

## ❓ Need Help?

**Migration not working?**
→ Check `NEW_CHECKOUT_FEATURES_GUIDE.md`

**Image upload fails?**
→ Verify bucket exists and is public

**More details?**
→ See `NEW_FEATURES_SUMMARY.md`

---

## 🎉 You're All Set!

Start creating amazing checkout experiences with images and proper failure handling!

**Questions?** Check the full documentation files in your project.
