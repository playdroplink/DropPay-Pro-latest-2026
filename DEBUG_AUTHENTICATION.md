# 🔧 Authentication Debug Guide

This guide will help you troubleshoot Pi Network authentication issues in your DropPay application.

## ✅ Recent Fixes Applied

### 1. Enhanced Authentication Context (AuthContext.tsx)
- **Fixed:** Proper loading state management with setIsLoading(false) in all paths
- **Fixed:** Enhanced merchant creation with detailed logging
- **Fixed:** Improved session restoration from localStorage
- **Fixed:** Better error handling in authentication flow

### 2. Updated UI Components
- **PaymentLinks.tsx:** Now shows proper authentication prompt instead of blank page
- **Subscription.tsx:** Removed automatic redirect, shows authentication prompt
- **Both components:** Enhanced loading states and user-friendly error messages

### 3. Admin Route Guard (AdminRouteGuard.tsx)
- **Fixed:** Removed duplicate code that was causing issues
- **Fixed:** Enhanced admin verification logic
- **Fixed:** Better error handling and logging

## 🔍 Debugging Steps

### Step 1: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for these authentication-related logs:

```
✅ Expected logs:
- "🔧 Initializing Pi SDK..."
- "Checking for stored auth session: true/false"
- "Found stored user: [username]" or "No stored authentication session found"
- "Auth state changed: { piUser: [username], merchant: [id], isLoading: false, isAuthenticated: true }"

❌ Error patterns to watch for:
- "❌ Error initializing Pi SDK"
- "Error parsing stored user"
- "Error fetching merchant"
```

### Step 2: Check localStorage Data
In browser console, run:
```javascript
console.log('Pi User:', localStorage.getItem('pi_user'));
console.log('Pi Token:', localStorage.getItem('pi_access_token'));
```

### Step 3: Clear Authentication State (if needed)
If you see corrupted data, clear it:
```javascript
localStorage.removeItem('pi_user');
localStorage.removeItem('pi_access_token');
location.reload();
```

### Step 4: Test Authentication Flow
1. Go to `/auth` page
2. Click "Sign In with Pi Network"
3. Watch console for authentication logs
4. Check if authentication completes successfully

## 🚨 Common Issues & Solutions

### Issue 1: "Please authenticate first" errors
**Cause:** Authentication state not properly restored or timing issues
**Solution:** 
- Check if Pi user data exists in localStorage
- Verify console shows proper auth state changes
- Try refreshing the page

### Issue 2: Components showing login prompts when already authenticated
**Cause:** Race condition between component render and auth context loading
**Solution:**
- Components now properly handle loading states
- Check if `isLoading` is false and `isAuthenticated` is true in console

### Issue 3: Admin access denied
**Cause:** Username not matching exactly or merchant record issues
**Solution:**
- Verify your Pi username is exactly "Wain2020" 
- Check merchant record in database has correct pi_username

### Issue 4: Ad network not working
**Cause:** Pi Browser not detected or ads not supported
**Solution:**
- Must test in actual Pi Browser app for ad functionality
- In demo mode, ads will show simulated behavior

## 📊 Environment Status

### Current Configuration:
- **Pi Network:** Mainnet (sandbox: false)
- **API Key:** a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq
- **Scopes:** ['username', 'payments', 'wallet_address']
- **Demo Mode:** Available for testing outside Pi Browser

### Authentication Flow:
1. User clicks "Sign In with Pi Network"
2. Pi SDK authentication with required scopes
3. User data stored in localStorage
4. Merchant profile created/updated in Supabase
5. Authentication context updated
6. Components refresh with authenticated state

## 🔧 Quick Test Commands

### Test Current Auth State:
```javascript
// Run in browser console
const authData = {
  piUser: JSON.parse(localStorage.getItem('pi_user') || 'null'),
  token: localStorage.getItem('pi_access_token'),
  isPiBrowser: !!window.Pi
};
console.log('Auth Debug Info:', authData);
```

### Force Re-authentication:
```javascript
// Clear and reload
localStorage.clear();
window.location.reload();
```

## 📝 Next Steps

1. **Test the application** on http://localhost:8081
2. **Check console logs** during authentication
3. **Try each feature** (payment links, subscriptions, ads, admin)
4. **Report specific error messages** if issues persist

## 💡 Key Changes Made

- ✅ Fixed authentication loading states
- ✅ Enhanced error handling and logging
- ✅ Improved UI for unauthenticated users
- ✅ Fixed admin route protection
- ✅ Enhanced merchant creation flow
- ✅ Better session restoration

The authentication system should now work properly. Test each feature and check the console for any remaining issues!