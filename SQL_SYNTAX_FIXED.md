# SQL Syntax Error Fixed - Ready to Deploy

## Problem
```
ERROR: 42601: syntax error at or near "RAISE" LINE 29
```

The migration files had `RAISE NOTICE` statements outside of PL/pgSQL blocks (DO $$...$$), which is invalid SQL syntax.

## Solution Applied ✅

Fixed both migration files to wrap all statements properly:
- ✅ `supabase/migrations/add_merchants_unique_constraint.sql` - Fixed
- ✅ `supabase/migrations/fix_merchants_rls_insert_policy.sql` - Fixed

All `RAISE NOTICE` statements are now inside `DO $$ BEGIN ... END $$;` blocks.

## Ready to Deploy

### Option 1: Deploy with CLI (Recommended)
```bash
supabase db push
```

This will run both migration files in order.

### Option 2: Run Manually in Supabase Console

1. Go to **Supabase Dashboard > SQL Editor**
2. Copy the entire contents of: `supabase/migrations/add_merchants_unique_constraint.sql`
3. Paste and click **Run**
4. Wait for success (should show checkmarks in logs)
5. Repeat step 2-4 for: `supabase/migrations/fix_merchants_rls_insert_policy.sql`

## Expected Output

When the migrations run successfully, you should see:

```
✓ Dropped existing merchants_pi_user_id_key constraint
✓ Created unique constraint on merchants(pi_user_id)
✓ Created index on merchants(pi_user_id)
✓ Fixed INSERT policy for merchants
✓ Fixed UPDATE policy for merchants
✓ Fixed SELECT policy for merchants
✓ Fixed DELETE policy for merchants
✓ RLS enabled on merchants table
✓ Unique constraint merchants_pi_user_id_key verified
```

## Next Steps

After deploying migrations:

1. **Deploy edge function**
   ```bash
   supabase functions deploy create-merchant-profile
   ```

2. **Clear browser cache**
   ```
   Ctrl+Shift+Delete → Clear All
   ```

3. **Test authentication**
   - Go to http://localhost:5173/auth
   - Sign in with Pi Network
   - Accept demo mode
   - Dashboard should load ✓

## Files Status

| File | Status |
|------|--------|
| `add_merchants_unique_constraint.sql` | ✅ Fixed |
| `fix_merchants_rls_insert_policy.sql` | ✅ Fixed |
| `src/contexts/AuthContext.tsx` | ✅ Updated |
| `supabase/functions/create-merchant-profile/index.ts` | ✅ Ready |

---

**Status**: ✅ Ready to Deploy  
**Next Action**: Run `supabase db push`  
**Test After**: Sign in at http://localhost:5173/auth
