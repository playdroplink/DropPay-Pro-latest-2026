# Quick Fix: ON CONFLICT Error - Do This Now

## The Error
```
Failed to create merchant: there is no unique or exclusion constraint 
matching the ON CONFLICT specification
```

## Quick Fix (2 minutes)

### Method 1: Run in Supabase Console (Fastest)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste this:

```sql
-- Drop old constraint if exists
ALTER TABLE public.merchants 
DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key;

-- Create unique constraint
ALTER TABLE public.merchants 
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
ON public.merchants(pi_user_id);

-- Verify (should show 1 row)
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'merchants' AND constraint_name = 'merchants_pi_user_id_key';
```

4. Click **Run**
5. Should see: `merchants_pi_user_id_key` in results

### Method 2: Deploy Migration

```bash
# From project root
supabase db push

# Or if you have multiple migrations:
supabase migration list
supabase migration up
```

### Method 3: Manual in Supabase Console

1. Dashboard > SQL Editor
2. Paste the SQL above
3. Run and verify

## Test the Fix

After applying, test immediately:

```
1. Go to browser: http://localhost:5173/
2. Click "Sign In with Pi Network"
3. Accept demo mode
4. Wait 2-3 seconds
5. Should see dashboard with your username ✓
```

If still fails:
- Check browser console (F12) for new errors
- Verify constraint was created in Supabase Console
- Look for RLS policy errors

## What This Does

Creates a **unique constraint** on the merchants table so:
- Each Pi user can only have ONE merchant profile
- Database prevents duplicates automatically
- Code can safely use upsert operations
- Performance is optimized with index

## Files Involved

- `supabase/migrations/add_merchants_unique_constraint.sql` ← Run this
- `supabase/migrations/fix_merchants_rls_insert_policy.sql` ← Also run this
- `src/contexts/AuthContext.tsx` ← Already updated
- `supabase/functions/create-merchant-profile/index.ts` ← Already updated

## Complete Setup Order

1. **Add unique constraint** (this file)
   ```sql
   -- Copy the SQL above and run
   ```

2. **Fix RLS policies** (already done)
   - Run: `supabase/migrations/fix_merchants_rls_insert_policy.sql`

3. **Clear browser cache**
   ```
   Ctrl+Shift+Delete → Clear All
   ```

4. **Test**
   ```
   http://localhost:5173/auth → Sign in → Should work!
   ```

## Console Output Should Show

```
✓ Created unique constraint on merchants(pi_user_id)
✓ Created index on merchants(pi_user_id)
✓ Unique constraint verified on merchants.pi_user_id
```

If you see warnings, check Supabase logs for the actual error.

## Need Help?

Run this diagnostic query in Supabase Console:

```sql
-- Show all constraints on merchants
SELECT 
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'merchants'
ORDER BY constraint_name;
```

Should show:
- `merchants_pkey` (PRIMARY KEY on id)
- `merchants_pi_user_id_key` (UNIQUE on pi_user_id) ← This is the important one

---

**⏱ Total time**: ~2 minutes  
**✅ Status**: After running above SQL, error should be fixed
**🧪 Test**: Sign in again and verify dashboard loads
