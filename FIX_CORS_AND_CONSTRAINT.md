# CORS and Database Constraint Fix Guide

## Problem Summary
You're experiencing two issues:
1. **CORS Error**: Edge Function is not responding to preflight OPTIONS requests properly
2. **Database Constraint Error**: `ON CONFLICT` clause can't find the unique constraint on `merchants.pi_user_id`

## Status: ✅ Code Fixed, 🔧 Deployment Needed

### What I Fixed in the Code:
1. ✅ Updated Edge Function CORS response to include explicit `status: 200`
2. ✅ Created migration file with unique constraint fix

### What You Need to Do:

## 🔴 CRITICAL: Apply Database Migration

The database is missing the unique constraint on `merchants.pi_user_id`, which is causing the error:
```
error code '42P10': there is no unique or exclusion constraint matching the ON CONFLICT specification
```

### Option 1: Supabase Dashboard (RECOMMENDED - 30 seconds)
1. Open: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql
2. Copy and paste this SQL:

```sql
-- Ensure merchants.pi_user_id can be used with ON CONFLICT/upsert
ALTER TABLE public.merchants
DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key CASCADE;

ALTER TABLE public.merchants
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
ON public.merchants(pi_user_id);
```

3. Click **RUN** button
4. You should see: "Success. No rows returned"

### Option 2: Command Line
```bash
# From project root
supabase login
supabase db push
```

## 🟡 Deploy Edge Function

The Edge Function has been updated with proper CORS handling. Deploy it:

### Steps:
1. Login to Supabase CLI:
   ```bash
   supabase login
   ```
   
2. Deploy the function:
   ```bash
   supabase functions deploy create-merchant-profile
   ```

### If deployment fails:
The function should work once the database migration is applied, as the code will fall back to direct inserts if the Edge Function isn't available.

## 🧪 Testing

After applying the migration:

1. Refresh your application at `http://localhost:8081`
2. Try to authenticate with Pi Network
3. You should no longer see:
   - ❌ CORS errors
   - ❌ "no unique or exclusion constraint" errors
4. You should see:
   - ✅ Merchant profile created successfully
   - ✅ User authenticated

## Verification

To verify the constraint exists, run this in Supabase SQL Editor:

```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'merchants' 
  AND constraint_name = 'merchants_pi_user_id_key';
```

You should see one row:
| constraint_name | constraint_type |
|----------------|----------------|
| merchants_pi_user_id_key | UNIQUE |

## Files Modified
- ✅ [supabase/functions/create-merchant-profile/index.ts](supabase/functions/create-merchant-profile/index.ts#L19-L24) - Fixed CORS preflight response
- 📄 [supabase/migrations/20260105_fix_merchants_unique_constraint.sql](supabase/migrations/20260105_fix_merchants_unique_constraint.sql) - Migration ready to apply

## Quick Reference

The error was happening because:
1. The `merchants` table didn't have a UNIQUE constraint on `pi_user_id`
2. Your code tries to use `ON CONFLICT (pi_user_id)` which requires this constraint
3. The Edge Function CORS wasn't returning explicit HTTP 200 status

Now you just need to apply the migration! 🚀
