# Fix: Stuck on "Setting Up Your Profile" After Pi Authentication

## Problem
After successfully authenticating with Pi Network, you're stuck on the "Setting Up Your Profile" loading screen indefinitely.

## Root Causes
1. **Merchant profile creation timeout** - Supabase query taking too long or failing
2. **Silent database error** - Error not being reported to user
3. **No timeout protection** - Application doesn't force recovery after waiting

## Fixes Applied

### 1. **Better Error Messages**
Added detailed error logging in `createOrUpdateMerchant()`:
- ✅ Shows exact error message on profile creation
- ✅ Displays error toast to user
- ✅ Logs all database operation details

### 2. **Refresh Button on Loading Screen**
Added "Refresh Page" button in PiAuthGuard:
```tsx
<Button 
  onClick={() => window.location.reload()} 
  variant="outline"
  className="w-full"
  size="sm"
>
  Refresh Page
</Button>
```
- Appears if setup takes longer than expected
- Allows manual recovery instead of infinite wait

### 3. **Auto-Recovery Timeout**
Added automatic page reload if merchant profile doesn't load within 10 seconds:
```tsx
useEffect(() => {
  if (piUser && !merchant && !isLoading) {
    const merchantTimeout = setTimeout(() => {
      console.warn('⚠️ Merchant profile setup timeout');
      window.location.reload();
    }, 10000);
    return () => clearTimeout(merchantTimeout);
  }
}, [piUser, merchant, isLoading]);
```

### 4. **Console Logging**
Added detailed console logs showing:
- ✅ `🔍 Fetching existing merchant for user:` 
- ✅ `📝 Creating new merchant profile for:`
- ✅ `✅ New merchant created successfully:`
- ✅ `❌ Error creating merchant:` (if failed)

---

## What to Do If Still Stuck

### Step 1: Check Browser Console (F12)
Look for these logs:
```
🔧 Initializing DropPay...
✅ Found stored user session: @Wain2020
🔍 Fetching existing merchant for user: user_id_here
📝 Creating new merchant profile for: Wain2020
```

Or error message:
```
❌ Error creating merchant: [specific error]
```

### Step 2: Click the "Refresh Page" Button
- If setup takes more than a few seconds, a refresh button appears
- Click it to retry merchant profile creation

### Step 3: Check Supabase Status
1. Go to Supabase Dashboard
2. Check if `merchants` table exists
3. Verify Row Level Security (RLS) policies allow inserts
4. Check if the user has permission to create merchants

### Step 4: Clear Data & Retry
```javascript
// In browser console (F12):
localStorage.removeItem('pi_user');
localStorage.removeItem('pi_access_token');
localStorage.removeItem('pi_session_timestamp');
window.location.reload();
```

Then authenticate again.

### Step 5: Check Network Requests
In DevTools → Network tab:
1. Look for requests to Supabase
2. Check if they're returning 200 OK
3. Look for any 403/401 errors (permission issues)
4. Look for 500 errors (server issues)

---

## Files Modified

1. **src/contexts/AuthContext.tsx**
   - Enhanced `createOrUpdateMerchant()` with detailed logging
   - Added merchant profile timeout (10 seconds)
   - Improved error messages and toast notifications
   
2. **src/components/auth/PiAuthGuard.tsx**
   - Added "Refresh Page" button for timeout scenario
   - Improved UI messaging

---

## Expected Behavior After Fix

**Success Flow:**
1. Click "Connect with Pi Network"
2. Authenticate successfully
3. See "Setting Up Your Profile..." message
4. After 1-2 seconds, merchant profile created
5. Redirected to dashboard

**If Setup Hangs:**
1. Console shows detailed error message
2. Error toast appears to user
3. After 10 seconds, page auto-refreshes
4. Or click "Refresh Page" button manually

---

## Testing

### Test 1: Verify Supabase Connection
```bash
# In browser console
const { supabase } = await import('@/integrations/supabase/client');
supabase.from('merchants').select('*').limit(1)
```

### Test 2: Manually Create Merchant
```typescript
const { data, error } = await supabase
  .from('merchants')
  .insert({
    pi_user_id: 'test-user-id',
    pi_username: 'TestUser'
  })
  .select()
  .single();

console.log({ data, error });
```

### Test 3: Test with Demo Mode
If having issues with Pi Network:
1. Click "Connect with Pi Network"
2. Choose "Use demo mode for testing"
3. Should create test user immediately
4. Check if dashboard loads

---

## Common Issues & Solutions

### Issue: "Error creating merchant: permission denied"
**Cause:** Supabase RLS policy blocking insert  
**Solution:**
1. Go to Supabase Dashboard
2. Check `merchants` table RLS policies
3. Ensure authenticated users can insert rows
4. Policies should allow self-service merchant creation

### Issue: "Error creating merchant: relation does not exist"
**Cause:** Table doesn't exist or wrong name  
**Solution:**
1. Verify merchants table exists in Supabase
2. Check table name spelling
3. Run migration if needed

### Issue: "Error creating merchant: timeout"
**Cause:** Database query taking too long  
**Solution:**
1. Check if Supabase is under heavy load
2. Try again in a few minutes
3. Consider adding database indexes

### Issue: Toast notification shows but no error message
**Cause:** Silent failure in try-catch  
**Solution:**
1. Check browser console for detailed logs
2. Review network requests in DevTools
3. Enable Supabase logs

---

## Prevention

To avoid this in the future:

1. **Add timeout to all critical operations**
   ```tsx
   const timeoutPromise = new Promise((_, reject) =>
     setTimeout(() => reject(new Error('Operation timeout')), 10000)
   );
   const result = await Promise.race([query, timeoutPromise]);
   ```

2. **Always show errors to user**
   ```tsx
   if (error) {
     console.error('Error:', error);
     toast.error(`Failed: ${error.message}`);
   }
   ```

3. **Add recovery mechanisms**
   - Retry buttons
   - Auto-retry with exponential backoff
   - Manual refresh buttons

---

**Status:** ✅ Fixed  
**Date:** January 4, 2026  
**Testing:** Pending user verification
