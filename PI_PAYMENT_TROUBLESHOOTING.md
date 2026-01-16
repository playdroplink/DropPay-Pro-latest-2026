# Pi Payment Troubleshooting Guide

## Common Issues and Solutions

### 1. "Payment Failed" Error

**Possible Causes:**
- Edge functions not deployed
- PI_API_KEY not configured in Supabase secrets
- Network connectivity issues
- Pi SDK not properly initialized

**Solutions:**

#### A. Check and Deploy Edge Functions
```powershell
# List deployed functions
supabase functions list

# Deploy approve-payment function
supabase functions deploy approve-payment

# Deploy complete-payment function
supabase functions deploy complete-payment
```

#### B. Configure PI_API_KEY
```powershell
# Set your Pi Network API key (mainnet)
supabase secrets set PI_API_KEY="your_mainnet_api_key_here"

# Verify the secret is set
supabase secrets list
```

#### C. Check Edge Function Logs
```powershell
# View real-time logs for debugging
supabase functions logs approve-payment --tail
supabase functions logs complete-payment --tail
```

### 2. "Not in Pi Browser" Modal

**Solution:**
- Open the payment link in the official Pi Browser app
- Download Pi Browser from: https://minepi.com/Wain2020

### 3. Payment Timeout

**Causes:**
- Slow network connection
- Edge function taking too long to respond
- Pi Network API delays

**Solutions:**
- Check your internet connection
- Try again in a few minutes
- Check edge function logs for errors

### 4. "Payment Already Completed"

This means the payment was successful but the UI didn't update properly.

**Solution:**
- Refresh the page
- Check your transaction history in the merchant dashboard

### 5. Subscription Not Activated After Payment

**Solution:**
Check if the payment link title includes "Subscription" or "Plan Subscription":
```typescript
// Title should be like:
"Pro Plan Subscription - DropPay"
"Starter Plan Subscription - DropPay"
```

## Testing Checklist

Before going live, verify:

1. ✅ Edge functions deployed:
   ```powershell
   supabase functions list
   ```

2. ✅ PI_API_KEY configured:
   ```powershell
   supabase secrets list
   ```

3. ✅ Test in Pi Browser (not regular browser)

4. ✅ Check browser console for detailed logs

5. ✅ Test a small payment first (e.g., 0.1 Pi)

## Debug Mode

Add this to your browser console to enable detailed logging:
```javascript
localStorage.setItem('DEBUG_PAYMENT', 'true');
window.location.reload();
```

## Browser Console Commands

Check payment flow:
```javascript
// Check Pi SDK
console.log('Pi SDK:', window.Pi);

// Check auth state
console.log('Pi User:', localStorage.getItem('pi_user'));

// Run diagnostic
import { runPaymentDiagnostic } from './src/utils/paymentDiagnostic';
runPaymentDiagnostic();
```

## Edge Function Response Examples

### Successful Response:
```json
{
  "success": true,
  "result": { ... },
  "transactionId": "uuid-here"
}
```

### Error Response:
```json
{
  "error": "Payment link not found or inactive"
}
```

## Support

If issues persist:
1. Check the browser console for detailed error messages
2. Review edge function logs
3. Verify Pi Network API status
4. Contact Pi Network support if API issues persist

## Quick Fix Script

Run this to check your configuration:
```powershell
.\test-pi-payment-flow.ps1
```
