# 🔧 IMMEDIATE FIX REQUIRED

## Error: Foreign Key Constraint Violation

**Error Message:**
```
insert or update on table "payment_links" violates
foreign key constraint "payment_links_merchant_id_fkey"
```

### What This Means:
Your merchant profile was not properly created in the database. The app thinks you're logged in, but your merchant record is missing or has an invalid ID.

---

## 🚨 QUICK FIX - Do This Now:

### Step 1: Clear Your Session
Open browser DevTools (F12) → Console, then run:
```javascript
localStorage.clear()
location.reload()
```

### Step 2: Log In Again
1. The page will reload to the login screen
2. Click "Connect with Pi Network"
3. Authenticate with Pi
4. Wait for "Merchant created successfully" in console

### Step 3: Verify Merchant Created
In DevTools Console, check:
```javascript
// Should show your merchant data with valid ID
JSON.parse(localStorage.getItem('pi_user'))
```

### Step 4: Try Creating Payment Link Again
- Go to Links tab
- Click "Create Link"
- Fill in details
- Should work now!

---

## 🔍 If Still Not Working:

### Option A: Check Database Manually
Run this in Supabase SQL Editor:
```sql
-- Check if your merchant exists
SELECT * FROM merchants 
WHERE LOWER(REPLACE(pi_username, '@', '')) = 'wain2020';

-- If no results, manually create merchant:
INSERT INTO merchants (pi_user_id, pi_username, business_name, is_admin)
VALUES ('demo_user_id', 'Wain2020', 'Wain2020''s Business', TRUE)
RETURNING *;
```

### Option B: Restart Development Server
Sometimes the issue is stale connections:
```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## 📋 Technical Details:

### Changes Made:
1. ✅ **Added merchant verification** before creating payment links
2. ✅ **Improved error messages** to tell you exactly what's wrong
3. ✅ **Added database checks** to ensure merchant exists
4. ✅ **Auto-redirect to login** if merchant profile is invalid

### Files Modified:
- `src/pages/PaymentLinks.tsx` - Added merchant verification
- `src/contexts/AuthContext.tsx` - Better merchant creation
- `src/pages/Dashboard.tsx` - Validate merchant on load

---

## ✅ Expected Behavior After Fix:

1. **Login**: Creates merchant record automatically
2. **Dashboard**: Verifies merchant exists
3. **Payment Links**: Checks merchant before creating link
4. **Clear Errors**: Shows helpful messages if something's wrong

---

## 🎯 Next Steps:

1. Clear localStorage and log in again (see Step 1 above)
2. Check console logs for "Merchant created successfully"
3. Try creating a payment link
4. If it works, you're all set! 🎉

---

## 💡 Prevention:

Going forward, the app will:
- Verify merchant exists before operations
- Show clear error messages
- Auto-redirect to login if profile is invalid
- Log detailed errors in console for debugging

---

**Still having issues?** Check the browser console (F12) for error messages and share them.
