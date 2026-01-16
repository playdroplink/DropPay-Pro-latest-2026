## 🚨 STORAGE POLICY SETUP - DASHBOARD METHOD
## (For when SQL permissions are insufficient)

### ⚠️ The Problem:
- SQL approach fails with "must be owner of table objects" error
- Regular users cannot create storage policies via SQL
- Must use Supabase Dashboard interface instead

### 🛠️ SOLUTION: Manual Dashboard Setup

#### **STEP 1: Go to Storage in Supabase Dashboard**
1. Open: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/storage/buckets
2. You should see your buckets listed (if not, run SETUP_DASHBOARD.sql first)

#### **STEP 2: Enable RLS on Storage Objects**
1. Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/database/tables
2. Click on **storage** schema
3. Find **objects** table and click it
4. Click **"Enable RLS"** button
5. Confirm by clicking **"Enable RLS"**

#### **STEP 3: Create Policies for Each Bucket**

**For EACH of the 5 buckets below, you need to create 4 policies:**

---

### 📁 **BUCKET 1: payment-link-images**
1. Click on **payment-link-images** bucket
2. Go to **Policies** tab
3. Click **"New Policy"** and create these 4 policies:

**Policy 1: Public Read**
- Name: `Public read payment-link-images`
- Operation: `SELECT`
- Target roles: `public`
- Policy definition: `bucket_id = 'payment-link-images'`

**Policy 2: Authenticated Insert**
- Name: `Authenticated insert payment-link-images`
- Operation: `INSERT`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'payment-link-images'`

**Policy 3: Authenticated Update**
- Name: `Authenticated update payment-link-images`
- Operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'payment-link-images'`

**Policy 4: Authenticated Delete**
- Name: `Authenticated delete payment-link-images`
- Operation: `DELETE`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'payment-link-images'`

---

### 📁 **BUCKET 2: checkout-images**
Repeat the same 4 policies as above, but replace:
- Names: Change `payment-link-images` to `checkout-images`
- Policy definitions: Change to `bucket_id = 'checkout-images'`

---

### 📁 **BUCKET 3: merchant-products**
Repeat the same 4 policies as above, but replace:
- Names: Change `payment-link-images` to `merchant-products`
- Policy definitions: Change to `bucket_id = 'merchant-products'`

---

### 📁 **BUCKET 4: payment-content** (Private bucket)
**SPECIAL**: This bucket is private, so ALL policies use `authenticated` role:

**Policy 1: Authenticated Read**
- Name: `Authenticated read payment-content`
- Operation: `SELECT`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'payment-content'`

**Policy 2: Authenticated Insert**
- Name: `Authenticated insert payment-content`
- Operation: `INSERT`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'payment-content'`

**Policy 3: Authenticated Update**
- Name: `Authenticated update payment-content`
- Operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'payment-content'`

**Policy 4: Authenticated Delete**
- Name: `Authenticated delete payment-content`
- Operation: `DELETE`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'payment-content'`

---

### 📁 **BUCKET 5: user-uploads**
Repeat the same 4 policies as bucket 1, but replace:
- Names: Change `payment-link-images` to `user-uploads`
- Policy definitions: Change to `bucket_id = 'user-uploads'`

---

## ✅ **VERIFICATION**

After creating all 20 policies (4 per bucket × 5 buckets), test upload:

### **Test in Browser Console:**
```javascript
// Make sure you're logged in first
const { data: user } = await supabase.auth.getUser();
console.log('User authenticated:', !!user.user);

// Test upload to payment-link-images bucket
const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('payment-link-images')
  .upload('test/test-' + Date.now() + '.jpg', testFile);

console.log('Upload test result:', { 
  success: !error, 
  data: data, 
  error: error 
});
```

**Expected Result:** `success: true`, no error

---

## 🔧 **POLICY TEMPLATE (Copy-Paste Ready)**

When creating policies in the dashboard, use these exact templates:

**For Public Buckets (payment-link-images, checkout-images, merchant-products, user-uploads):**

```sql
-- SELECT Policy (Public Read)
bucket_id = 'BUCKET_NAME_HERE'

-- INSERT Policy (Authenticated)
bucket_id = 'BUCKET_NAME_HERE'

-- UPDATE Policy (Authenticated)  
bucket_id = 'BUCKET_NAME_HERE'

-- DELETE Policy (Authenticated)
bucket_id = 'BUCKET_NAME_HERE'
```

**For Private Bucket (payment-content):**
```sql
-- All policies use same definition
bucket_id = 'payment-content'
```

---

## 🎯 **Quick Checklist**

- [ ] RLS enabled on storage.objects table
- [ ] 4 policies created for payment-link-images bucket
- [ ] 4 policies created for checkout-images bucket  
- [ ] 4 policies created for merchant-products bucket
- [ ] 4 policies created for payment-content bucket
- [ ] 4 policies created for user-uploads bucket
- [ ] Total: 20 policies created
- [ ] Test upload works in browser console

## 🚀 **After Setup Complete**

Your file uploads will work without "row level security policy" errors!

Check browser console for these success messages:
- `✅ Image uploaded and accessible: https://...`
- `✅ Content file uploaded successfully`
- `✅ File uploaded successfully`