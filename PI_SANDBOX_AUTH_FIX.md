# Pi Sandbox Authentication Troubleshooting Guide

## Issue: Pi Authentication Not Working in Sandbox Mode

### Current Status
- ✅ Sandbox mode enabled in `.env` and `index.html`
- ✅ AuthContext updated to read sandbox setting from environment
- ✅ Debug page created at `/pi-debug`

---

## Quick Fixes Applied

### 1. **Fixed AuthContext Sandbox Configuration**
The main issue was that `AuthContext.tsx` had hardcoded `sandbox: false` (mainnet), but your `.env` was set to sandbox mode. This caused a mismatch.

**Fixed:**
- AuthContext now reads `VITE_PI_SANDBOX_MODE` from environment
- Both SDK initialization points now use environment config:
  - Initial SDK init in `useEffect`
  - Re-init in `login()` method if needed

### 2. **Updated Scopes**
Changed scopes from `['username', 'payments']` to `['username', 'payments', 'wallet_address']`
- Required for Pi payments in both sandbox and mainnet
- Wallet address needed for payment operations

### 3. **Added Debug Page**
Navigate to `/pi-debug` to test:
- ✅ SDK availability
- ✅ Pi.init() functionality  
- ✅ Pi.authenticate() flow
- ✅ Pi.createPayment() setup
- View real-time debug logs

---

## Testing Sandbox Mode

### Option 1: Using Pi Browser (Recommended)
```bash
1. Download Pi App and Pi Browser
2. Open DropPay within Pi Browser
3. Development URL configured: http://localhost:5173 (or your dev URL)
```

### Option 2: Using Pi Sandbox
```bash
1. Visit: https://sandbox.minepi.com
2. Configure your app's development URL in Developer Portal
3. Load DropPay in the sandbox
```

### Option 3: Demo Mode (Testing Without Pi Browser)
If you don't have Pi Browser, the app has built-in demo mode:
```typescript
// When authentication is clicked and Pi SDK is not available:
1. Click "Connect with Pi Network"
2. Confirm "Use demo mode for testing"
3. Creates a test user automatically
4. Works with all sandbox features
```

---

## Troubleshooting Steps

### Step 1: Check Environment Configuration
```bash
# Verify .env file has:
VITE_PI_SANDBOX_MODE="true"
VITE_PI_MAINNET_MODE="false"
VITE_PI_NETWORK="sandbox"
VITE_PI_STELLAR_NETWORK="testnet"
```

### Step 2: Hard Refresh Browser
```bash
Ctrl+Shift+R (Windows/Linux)
or
Cmd+Shift+R (Mac)
```
This clears cached environment variables.

### Step 3: Check Browser Console
```javascript
// Open DevTools (F12) → Console
// Look for logs like:
✅ Pi SDK initialized successfully
🔧 Pi SDK initialization: { sandbox: true, mode: 'sandbox/testnet' }
```

### Step 4: Use Debug Page
```bash
1. Navigate to http://localhost:5173/pi-debug
2. Click "Test Pi.init()" - should show sandbox mode
3. Click "Test Authenticate" - should show auth flow
4. Review logs in the debug panel
```

### Step 5: Check network.js (Frontend SDK Source)
```javascript
// In browser DevTools → Sources
// Find the Pi SDK script (pi-sdk.js)
// Should show initialization with { sandbox: true }
```

---

## Common Issues & Solutions

### Issue: "window.Pi is undefined"
**Cause:** Pi SDK hasn't loaded yet  
**Solution:**  
- Wait 2-3 seconds before authentication attempt
- Check that `https://sdk.minepi.com/pi-sdk.js` is loaded in Network tab
- Verify you're in Pi Browser or using sandbox.minepi.com

### Issue: Authentication timeout (30 seconds)
**Cause:** Pi Browser not responding or disconnected  
**Solution:**
- Ensure you're actually in Pi Browser (check User Agent)
- Verify development URL is configured in Developer Portal
- Try demo mode for testing
- Check Pi Browser is up to date

### Issue: "Pi.authenticate is not a function"
**Cause:** SDK initialized but methods not available  
**Solution:**
- Check that `Pi.init()` was called before `authenticate()`
- Verify SDK loaded from correct URL
- Try hard refresh (Ctrl+Shift+R)

### Issue: Authentication succeeds but no wallet_address
**Cause:** Scope not requested or user hasn't authorized  
**Solution:**
- Ensure `'wallet_address'` is in scopes array
- User must approve permission request in Pi wallet
- In demo mode, wallet_address is auto-generated

---

## Environment Variable Reference

### Sandbox Configuration
```env
# Enable sandbox testing
VITE_PI_SANDBOX_MODE="true"
VITE_PI_MAINNET_MODE="false"

# Sandbox network settings
VITE_PI_NETWORK="sandbox"
VITE_PI_STELLAR_NETWORK="testnet"
VITE_PI_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# API endpoints (same for both modes)
VITE_API_URL="https://api.minepi.com"
VITE_PI_SDK_URL="https://sdk.minepi.com/pi-sdk.js"
```

### Mainnet Configuration
```env
# Enable mainnet (production)
VITE_PI_SANDBOX_MODE="false"
VITE_PI_MAINNET_MODE="true"

# Mainnet network settings
VITE_PI_NETWORK="mainnet"
VITE_PI_STELLAR_NETWORK="mainnet"
VITE_PI_NETWORK_PASSPHRASE="Pi Mainnet"
```

---

## How to Test Each Feature

### Test Authentication
```
1. Click "Connect with Pi Network" button
2. Should see Pi auth dialog (or demo mode prompt)
3. User should be logged in after approval
4. Check: localStorage has 'pi_user' and 'pi_access_token'
```

### Test Payments
```
1. Go to /pricing or /pay
2. Click to create payment
3. Should see Pi payment dialog
4. Complete or cancel the payment
5. Check console for approval/completion logs
```

### Test Ad Network
```
1. After authentication, should see welcome ad modal
2. Click "Watch Ad" to view ad
3. Should receive reward notification
4. Check console for ad verification logs
```

### Test Demo Mode
```
1. Click "Connect with Pi Network"
2. Confirm "Use demo mode"
3. Should create test user
4. Can test payment/ad flows with simulated data
```

---

## Debug Tools Available

### 1. Developer Console (F12)
```javascript
// Check SDK status
console.log(window.Pi);
console.log(typeof window.Pi.authenticate);

// Check environment
console.log(import.meta.env.VITE_PI_SANDBOX_MODE);

// Test SDK init
window.Pi?.init({ version: '2.0', sandbox: true });

// Check features
window.Pi?.nativeFeaturesList?.().then(console.log);
```

### 2. /pi-debug Page
Complete UI for testing all SDK functionality with logs

### 3. Network Tab
Check if these scripts are loading:
- ✅ `https://sdk.minepi.com/pi-sdk.js`
- ✅ Response should have valid JavaScript
- ✅ Status 200 (not 404)

### 4. Application Tab (Storage)
Check localStorage after auth:
- ✅ `pi_user` (contains uid, username, wallet_address)
- ✅ `pi_access_token` (authentication token)

---

## Next Steps

1. **Verify Sandbox Configuration**
   - [ ] .env has VITE_PI_SANDBOX_MODE="true"
   - [ ] Hard refresh browser (Ctrl+Shift+R)
   - [ ] Check console shows sandbox mode

2. **Test with Debug Page**
   - [ ] Go to http://localhost:5173/pi-debug
   - [ ] Run "Test Pi.init()" - should show sandbox
   - [ ] Run "Test Authenticate" - should show auth flow

3. **Test in Pi Environment**
   - [ ] Test in Pi Browser or sandbox.minepi.com
   - [ ] Verify window.Pi is available
   - [ ] Check authentication works

4. **Test Demo Mode**
   - [ ] Click auth without Pi Browser
   - [ ] Confirm demo mode
   - [ ] Should create test user

---

## Reference Documentation

- Official Pi Guide: https://pi-apps.github.io/community-developer-guide/
- SDK Reference: https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md
- Authentication: https://github.com/pi-apps/pi-platform-docs/blob/master/authentication.md
- Payments: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
- Ads: https://github.com/pi-apps/pi-platform-docs/blob/master/ads.md

---

**Last Updated:** January 4, 2026  
**Status:** Sandbox Authentication Fixed
