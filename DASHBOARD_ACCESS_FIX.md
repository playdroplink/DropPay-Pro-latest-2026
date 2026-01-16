# Dashboard Access Fix After Pi Authentication

## Issue
Users could not access the dashboard after signing in with Pi authentication. The redirect from `/auth` to `/dashboard` would fail, and users would either:
- Get stuck on the auth page
- See a loading screen that never resolved
- Be redirected back to `/auth` repeatedly

## Root Causes

### 1. Missing Merchant Profile Creation in Demo Mode
**Location**: `src/contexts/AuthContext.tsx` - `login()` function demo mode branch

**Problem**: When a user authenticated in demo mode, the `piUser` was created and stored, but `createOrUpdateMerchant()` was never called. This meant:
- `setPiUser()` would set `isAuthenticated = true`
- Auth page would try to redirect to dashboard
- `PiAuthGuard` would see `piUser` exists but `merchant` is null
- Since `requireMerchant = true` (default), it would show "Setting Up Your Profile" indefinitely

**Fix**: Added `await createOrUpdateMerchant(demoUser)` before returning in demo mode authentication.

### 2. Race Condition in Loading State
**Location**: `src/contexts/AuthContext.tsx` - `fetchMerchant()` function

**Problem**: The `fetchMerchant()` function had a `finally` block that called `setIsLoading(false)`. Later, when `createOrUpdateMerchant()` was called, it would also call `setIsLoading(false)`. This created a race condition where:
- Loading state could be inconsistently reset
- Components might not wait long enough for merchant data

**Fix**: Removed the `finally` block from `fetchMerchant()`. Let `createOrUpdateMerchant()` handle the loading state.

### 3. Inefficient Session Restoration
**Location**: `src/contexts/AuthContext.tsx` - `restoreSession()` useEffect

**Problem**: The restoration flow was:
1. Call `fetchMerchant(user.uid)` - which calls `setIsLoading(false)` in finally
2. Check if merchant exists
3. Call `createOrUpdateMerchant()` if needed - which also calls `setIsLoading(false)`

This could cause state to be cleared before merchant was loaded.

**Fix**: Refactored to:
1. Set `piUser` directly
2. Fetch existing merchant with direct Supabase query
3. If found, set merchant and finish
4. If not found, call `createOrUpdateMerchant()`
5. Only reset `isLoading` once at the end

### 4. Insufficient Logging in PiAuthGuard
**Location**: `src/components/auth/PiAuthGuard.tsx`

**Problem**: Hard to debug why dashboard wasn't loading because there was minimal logging.

**Fix**: Added detailed console logging to trace the auth flow:
```
🔐 PiAuthGuard state: { piUser, merchant, isAuthenticated, isLoading, ... }
```

Also improved the merchant setup waiting screen to only show when `!isLoading`.

## Files Modified

### 1. `src/contexts/AuthContext.tsx`
- **Demo mode fix**: Added `await createOrUpdateMerchant(demoUser)` before returning
- **fetchMerchant fix**: Removed `setIsLoading(false)` from finally block
- **Session restoration fix**: Refactored to eliminate race conditions and ensure proper loading state management

### 2. `src/components/auth/PiAuthGuard.tsx`
- **Added logging**: Console logs for auth state changes
- **Improved merchant loading screen**: Only shows when authenticated, has merchant, but user is still loading
- **Better state checking**: Added dependency on `merchant` and `requireMerchant` in useEffect

## Testing Checklist

### Test 1: Demo Mode Authentication (Non-Pi Browser)
1. Open http://localhost:5173/auth in a regular browser (not Pi Browser)
2. Click "Connect with Pi Network"
3. Accept demo mode prompt
4. Expected: Should be redirected to dashboard within 2 seconds
5. Check console: Should see ✅ messages for merchant creation

### Test 2: Pi Authentication (Pi Browser)
1. Open http://localhost:5173/auth in Pi Browser
2. Click "Connect with Pi Network"
3. Complete authentication
4. Expected: Should be redirected to dashboard within 5 seconds
5. Check console: Should see ✅ messages for merchant creation

### Test 3: Session Restoration
1. Authenticate once and refresh the page
2. Expected: Dashboard should load immediately with existing data
3. Check console: Should see "Session restored with merchant"

### Test 4: Multiple Redirects
1. Manually navigate to http://localhost:5173/dashboard without being authenticated
2. Should redirect to /auth
3. Complete authentication
4. Should redirect back to /dashboard

## Console Log Markers

Look for these in the browser console to verify fixes are working:

- `🔐 PiAuthGuard state:` - Shows authentication state in guard
- `✅ Merchant loaded from session:` - Merchant was found and loaded
- `📝 Creating new merchant profile for:` - New merchant is being created
- `✅ New merchant created successfully:` - Merchant creation completed
- `💾 Session stored` - Auth session was saved
- `🔄 Session restored with merchant:` - Session restored with merchant on page load

## Expected Behavior

1. **First Time Auth**: 
   - User clicks auth button
   - Profile setup screen shows briefly (2-5 seconds)
   - Dashboard loads automatically

2. **Returning User (Session Restore)**:
   - User refreshes page
   - Loading screen appears briefly
   - Dashboard loads immediately with previous data

3. **Protected Routes**:
   - Any attempt to access `/dashboard/*` without auth redirects to `/auth`
   - After auth, redirect back to dashboard happens smoothly

## Migration Notes

These changes are backward compatible. No database migrations needed.

- Existing users' sessions will work with improved restoration
- Demo users will now properly get merchant profiles created
- No changes to merchant schema
