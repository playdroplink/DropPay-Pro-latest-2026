# Fix for Payment Link Creation Issues

## Issues Identified

### Issue 1: Checkout Link Creation
**Error**: "new row violates row-level security policy for table 'payment_links'"
**Location**: MerchantCreateLink.tsx
**Cause**: RLS policies on `payment_links` table don't properly support INSERT operations

### Issue 2: Subscription Link Creation  
**Error**: "Failed to create subscription link" and "Failed to create payment link"
**Location**: Subscription.tsx
**Cause**: Same RLS policy issue - the INSERT WITH CHECK clause is missing or incorrect

## Root Cause Analysis

The main problem is in the RLS (Row-Level Security) policies on the `payment_links` table. The existing policy:

```sql
CREATE POLICY "Merchants can manage own payment links" ON public.payment_links USING (true);
```

This policy uses only the `USING` clause, which applies to UPDATE and DELETE operations but NOT to INSERT. For INSERT operations, we need an explicit `WITH CHECK` clause that verifies the merchant_id belongs to the authenticated user.

## Solution

### Step 1: Apply the SQL Migration

Run the following migration file in your Supabase SQL editor:

**File**: `supabase/migrations/20260109_fix_payment_links_rls_policies.sql`

This migration will:
1. Drop the old overly-permissive policy
2. Create a proper INSERT policy that checks `merchant_id` belongs to authenticated user
3. Create proper UPDATE and DELETE policies
4. Ensure SELECT policy allows public viewing of active links

### Step 2: How to Apply

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project → SQL Editor
2. Paste the contents of `FIX_PAYMENT_LINKS_RLS.sql`
3. Click "Run"
4. Verify no errors appear

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### Step 3: Verify the Fix

After applying the migration, verify the policies are correct:

```sql
-- Check all payment_links policies
SELECT * FROM pg_policies 
WHERE tablename = 'payment_links' 
ORDER BY policyname;

-- Expected policies:
-- - Merchants can insert their own payment links (INSERT WITH CHECK)
-- - Merchants can update their own payment links (UPDATE)
-- - Merchants can delete their own payment links (DELETE)
-- - Payment links view policy (SELECT)
```

## Technical Details

### How the Fix Works

The RLS policies now properly validate that:

1. **For INSERT**: The `merchant_id` in the new row must match the authenticated user's merchant record
   ```sql
   merchant_id IN (
       SELECT id FROM public.merchants
       WHERE pi_user_id = (auth.uid())::text
   )
   ```

2. **For UPDATE/DELETE**: Same validation - user can only modify their own links

3. **For SELECT**: Anyone can view active links, but merchants can also see their own inactive links

### Why This Fixes Both Issues

**Checkout Link Creation (MerchantCreateLink.tsx)**:
- When merchant is authenticated via context, `merchant.id` is set
- The INSERT now passes the RLS check because `merchant.id` matches `auth.uid()` via the merchants table

**Subscription Link Creation (Subscription.tsx)**:
- When user authenticates via Pi Network, their `piUser.uid` is stored
- A merchant record is created with `pi_user_id = piUser.uid`
- When inserting the subscription payment link with the merchant_id, it now passes the RLS check

## Code Locations Fixed

### MerchantCreateLink.tsx (Line ~170)
```tsx
const { error: dbError } = await supabase
  .from('payment_links')
  .insert({
    merchant_id: merchant.id,  // ← This now works with proper RLS
    title: productData.name,
    // ... other fields
  });
```

### Subscription.tsx (Line ~155)
```tsx
const { data, error } = await supabase
  .from('payment_links')
  .insert([insertData])  // ← This now works with proper RLS
  .select('slug')
  .single();
```

## Testing

After applying the fix:

1. **Test Checkout Link Creation**:
   - Go to Dashboard → Links
   - Create a new payment link
   - Should complete without RLS error

2. **Test Subscription Link Creation**:
   - Go to Dashboard → Subscription
   - Click "Subscribe" on any plan
   - Should create payment link and redirect without errors

## Additional Notes

- The fix maintains security: only authenticated users can insert links
- Only the link's merchant owner can modify/delete it
- Public users can still view active links
- The fix is backward compatible with existing code

## Rollback

If you need to rollback, you can disable RLS entirely (though not recommended for production):

```sql
ALTER TABLE payment_links DISABLE ROW LEVEL SECURITY;
```

However, the recommended fix keeps RLS enabled with proper policies.
