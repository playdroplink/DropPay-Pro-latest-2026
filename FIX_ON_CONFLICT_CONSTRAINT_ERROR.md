# Fix: ON CONFLICT Constraint Error

## Error
```
Profile setup failed: Failed to create merchant: 
there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## Root Cause

This error occurs when:
1. Code tries to do an `INSERT ... ON CONFLICT DO UPDATE` (upsert)
2. But the table doesn't have a unique constraint on the column used in `ON CONFLICT`
3. OR the constraint exists but has a different structure than expected

The merchants table needs a unique constraint on `pi_user_id` for upsert operations.

## Solution

### Option 1: Run This SQL Immediately (Fastest)

Go to **Supabase Dashboard** > **SQL Editor** and run:

```sql
-- Create unique constraint on pi_user_id
ALTER TABLE public.merchants 
DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key;

ALTER TABLE public.merchants 
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
ON public.merchants(pi_user_id);

-- Verify
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'merchants' AND constraint_type = 'UNIQUE';
```

Expected output:
```
constraint_name              | constraint_type
merchants_pi_user_id_key     | UNIQUE
```

### Option 2: Run Migration File

We've updated the migration file `fix_merchants_rls_insert_policy.sql` to include the constraint creation.

Deploy it:
```bash
supabase db push
```

Or execute manually in Supabase Console.

### Option 3: Check Current Constraints

If you're not sure what constraints exist, run this in Supabase SQL Editor:

```sql
-- Check all unique constraints on merchants
SELECT 
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'merchants'
AND constraint_type IN ('UNIQUE', 'PRIMARY KEY');
```

## What the Fix Does

1. **Drops old constraint** - Removes any incorrectly named constraint
2. **Creates unique constraint** - Ensures `pi_user_id` is unique
3. **Creates index** - Improves query performance
4. **Verifies RLS** - Ensures RLS policies are still in place
5. **Tests constraint** - Verifies it was created successfully

## After Applying Fix

Test with:

```bash
# 1. Clear browser
Ctrl+Shift+Delete → Clear all

# 2. Clear localStorage
# In browser console:
localStorage.clear();
location.reload();

# 3. Go to auth and sign in
http://localhost:5173/auth

# 4. Check console for success
✅ New merchant created successfully: <id>
```

## Why This Matters

The unique constraint on `pi_user_id`:
- ✅ Prevents duplicate merchants per user
- ✅ Allows safe upsert operations
- ✅ Improves query performance (indexed)
- ✅ Enforces data integrity

## Related Files

- `supabase/migrations/fix_merchants_rls_insert_policy.sql` - Complete fix migration
- `supabase/migrations/20251231120011_remix_migration_from_pg_dump.sql` - Original schema
- `src/contexts/AuthContext.tsx` - Uses edge function for creation

## Verification Checklist

- [ ] Unique constraint exists: `merchants_pi_user_id_key`
- [ ] Index exists: `idx_merchants_pi_user_id`
- [ ] RLS is still enabled: `ENABLE ROW LEVEL SECURITY`
- [ ] RLS policies exist (INSERT, SELECT, UPDATE, DELETE)
- [ ] Test merchant creation succeeds
- [ ] Dashboard loads after authentication

Run this to verify everything:

```sql
-- Verify constraint
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'merchants' 
AND constraint_name = 'merchants_pi_user_id_key';

-- Verify index
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'merchants' 
AND indexname = 'idx_merchants_pi_user_id';

-- Verify RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'merchants';

-- Verify policies (should show 4 policies)
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'merchants' 
ORDER BY policyname;
```

All should return results showing the constraint, index, and RLS are properly configured.
