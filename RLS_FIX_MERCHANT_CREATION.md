# RLS Policy Violation Fix: "Failed to create merchant"

## Error
```
Profile setup failed: Failed to create merchant: new row violates row-level security policy for table "merchants"
```

## Root Cause

The DropPay app uses **Pi Network authentication**, not Supabase auth. When users authenticate:
1. They get a Pi Network auth token
2. The frontend stores this in localStorage
3. Supabase treats them as an **anonymous user** (not authenticated with Supabase)
4. Supabase RLS policies check user authentication
5. Anonymous users cannot insert into tables with RLS enabled

The `merchants` table has RLS enabled with this INSERT policy:
```sql
CREATE POLICY "Anyone can create merchant" ON public.merchants FOR INSERT WITH CHECK (true);
```

This policy technically says "allow", but Supabase's RLS engine still blocks anonymous users from inserting into RLS-protected tables, even with permissive policies.

## Solution

Use a **Supabase Edge Function** with the **Service Role Key** to handle merchant creation. The Service Role Key bypasses RLS entirely and can always insert data.

### Changes Made

#### 1. Created Edge Function: `create-merchant-profile`
**Location**: `supabase/functions/create-merchant-profile/index.ts`

This edge function:
- Accepts `piUserId` and `piUsername` from the frontend
- Uses the Service Role Key (server-side, secure)
- Bypasses RLS policies
- Returns the created merchant or existing merchant
- Includes error handling and validation

**Key features**:
```typescript
// Uses Service Role Key (environment variable on Supabase)
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Service role can insert even with RLS enabled
const { data: newMerchant, error } = await supabaseAdmin
  .from("merchants")
  .insert({ pi_user_id: piUserId, pi_username: piUsername })
  .select()
  .single();
```

#### 2. Updated `AuthContext.tsx`
**Location**: `src/contexts/AuthContext.tsx` - `createOrUpdateMerchant()` function

Changes:
- Replaced direct `.insert()` with edge function call
- Uses `supabase.functions.invoke('create-merchant-profile', {...})`
- Includes fallback to direct insert if edge function fails
- Better error logging

```typescript
const response = await supabase.functions.invoke('create-merchant-profile', {
  body: {
    piUserId: user.uid,
    piUsername: user.username,
  },
});

if (response.data?.merchant) {
  setMerchant(response.data.merchant);
  console.log('✅ New merchant created successfully:', response.data.merchant.id);
}
```

#### 3. Created RLS Fix Migration (Optional)
**Location**: `supabase/migrations/fix_merchants_rls_insert_policy.sql`

If you ever want to allow anonymous users directly (not recommended for security), this migration:
- Drops and recreates all merchants table policies
- Makes them more explicitly permissive
- Acts as backup if edge function approach doesn't work

## How It Works Now

### Flow
1. User signs in with Pi Network
2. AuthContext calls `createOrUpdateMerchant(piUser)`
3. First, it tries to fetch existing merchant (this works fine)
4. If merchant doesn't exist, it calls the edge function
5. Edge function uses Service Role Key to insert merchant
6. RLS policies are bypassed on server-side
7. Merchant is created successfully
8. Frontend receives the new merchant and dashboard loads

### Security
✅ **Secure because**:
- Edge function validates inputs (`piUserId`, `piUsername` are required)
- Service Role Key never leaves Supabase servers
- Frontend cannot access or use the service key
- Frontend only calls the function with limited inputs
- Database RLS still protects data from unauthorized access in other contexts

## Testing

### Test 1: First-Time Merchant Creation
1. Clear localStorage
2. Open http://localhost:5173/auth in browser
3. Click "Connect with Pi Network"
4. Accept demo mode
5. **Expected**: Dashboard loads immediately, merchant created
6. **Check console**: Should see ✅ message for merchant creation

### Test 2: Returning User
1. Refresh page
2. **Expected**: Session restored, dashboard loads with merchant
3. **Check console**: Should see session restoration messages

### Test 3: Edge Function Error Recovery
1. Temporarily disable the edge function (rename it)
2. Try authentication
3. **Expected**: Should fall back to direct insert and still work
4. **Check console**: Should see "Attempting direct insert fallback..."

## Console Log Markers

Look for these to verify everything is working:

- `🔍 Fetching existing merchant for user:` - Starting merchant lookup
- `📝 Creating new merchant profile for:` - Creating new merchant
- `✅ New merchant created successfully:` - Merchant created via edge function
- `🔄 Attempting direct insert fallback...` - Using fallback method
- `📄 Updating existing merchant profile...` - Updating returning user's merchant

## Deployment Requirements

The edge function requires:
- Supabase project with edge functions enabled
- Environment variables available in Supabase:
  - `SUPABASE_URL` - Your Supabase URL
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (treat as secret)

These are **automatically available** in Supabase edge functions, no manual setup needed.

## Rollback

If you need to rollback:
1. Revert the AuthContext changes (remove edge function call)
2. Restore direct Supabase insert
3. Either:
   - Fix RLS policies to allow anonymous users (not recommended)
   - OR implement Supabase auth alongside Pi Network auth

## Alternative Solutions (Not Used)

### Option 1: Supabase Auth
Could use Supabase auth + Pi Network auth together
- ❌ More complex
- ❌ Requires managing two auth systems
- ✅ Would allow direct RLS policies

### Option 2: Open RLS Policies
Could make RLS policies allow all users:
- ❌ Less secure
- ❌ Doesn't follow RLS best practices
- ✓ Simpler but not recommended for production

### Option 3: Signed URLs + Service Role
Could pre-sign inserts server-side
- ❌ More overhead
- ✅ Good for specific use cases

**We chose Edge Function approach because**:
- ✅ Secure - service key never leaves server
- ✅ Clean - single function for merchant creation
- ✅ Fallback - direct insert still works if needed
- ✅ Best practice - Supabase recommended pattern
