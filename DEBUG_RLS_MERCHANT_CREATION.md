# Quick Debug Guide: RLS Policy & Merchant Creation

## If You Still Get RLS Error

### Step 1: Verify Edge Function is Deployed
```bash
# Check if the function exists in Supabase
# Go to Supabase Dashboard > Functions > create-merchant-profile

# Should exist and have these environment variables:
# - SUPABASE_URL ✓
# - SUPABASE_SERVICE_ROLE_KEY ✓
```

### Step 2: Check Browser Console
Open DevTools (F12) → Console and look for:

#### Expected Success Logs
```
🔍 Fetching existing merchant for user: <uid>
📝 Creating new merchant profile for: <username>
✅ New merchant created successfully: <merchant_id>
```

#### If you see RLS error:
```
❌ Error from create-merchant-profile function: ...
🔄 Attempting direct insert fallback...
```

This means:
- Edge function failed
- It's using fallback direct insert
- Check if direct insert works (might need RLS policy fix)

### Step 3: Test Manually in Supabase Console

Go to Supabase Dashboard > SQL Editor and run:

```sql
-- Test 1: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'merchants';
-- Result should show: true for rowsecurity

-- Test 2: List all RLS policies on merchants
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'merchants';
-- Should see: "Anyone can create merchant" with WITH CHECK (true)

-- Test 3: Try inserting as authenticated user
INSERT INTO merchants (pi_user_id, pi_username) 
VALUES ('test-uid-' || now()::text, 'TestUser')
RETURNING id, pi_user_id, pi_username;
-- If this works, RLS allows authenticated users

-- Test 4: If edge function still fails, try updating RLS policy
-- Drop old policy
DROP POLICY IF EXISTS "Anyone can create merchant" ON public.merchants;

-- Create more permissive policy
CREATE POLICY "Anyone can create merchant" ON public.merchants 
  FOR INSERT 
  WITH CHECK (true);
```

### Step 4: Check Supabase Logs
Dashboard > Logs > Edge Functions > create-merchant-profile

Look for:
- Function invocation logs
- Error messages
- Failed requests

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Function not found" | Edge function not deployed | Deploy via CLI: `supabase functions deploy create-merchant-profile` |
| "Missing environment variables" | Service role key not set | Supabase Dashboard > Settings > Environment variables |
| "RLS policy violation" | Fallback direct insert hitting RLS | Run SQL test #4 above to fix RLS policy |
| "CORS error" | Frontend domain blocked | Check `corsHeaders` in edge function |
| "Timeout" | Edge function too slow | Check Supabase function logs for database query issues |

## Manual Edge Function Deployment

If automatic deployment didn't work:

```bash
# From project root
cd supabase/functions/create-merchant-profile

# Deploy using Supabase CLI
supabase functions deploy create-merchant-profile

# Test the function
supabase functions invoke create-merchant-profile \
  --body '{"piUserId": "test-123", "piUsername": "TestUser"}'
```

## Network Debugging

If the edge function call is failing with network errors:

### Check Browser Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Trigger authentication
4. Look for request to: `functions/v1/create-merchant-profile`
5. Check response status and body

### If request fails with 404
- Function not deployed
- Function name misspelled
- Wrong project

### If request fails with 500
- Function error
- Check Supabase logs
- May be a database error

### If request times out
- Function too slow
- Check database indexes
- Check `merchants` table performance

## Performance Optimization

If merchant creation is slow:

```sql
-- Check if indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'merchants';

-- Should see:
-- merchants_pkey (on id)
-- idx_merchants_pi_user_id (on pi_user_id) ← Important!

-- If missing, create it:
CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
ON public.merchants(pi_user_id);
```

## Final Verification

After applying fixes:

1. **Clear browser cache**
   ```
   Ctrl + Shift + Delete → Clear all
   ```

2. **Clear localStorage**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

3. **Test authentication**
   - Go to http://localhost:5173/auth
   - Sign in with Pi Network
   - Accept demo mode
   - Should see dashboard immediately

4. **Check console for success logs**
   ```
   ✅ New merchant created successfully: <id>
   ```

## Still Not Working?

Check in this order:
1. Edge function deployed ✓
2. Environment variables set ✓
3. RLS policies correct ✓
4. Browser console shows specific error ✓
5. Supabase logs show error details ✓

Then:
- Post error logs to Supabase Discord #help
- Share: error message, function logs, RLS policies
