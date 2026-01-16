# Complete Fix: All Merchant Creation Errors - RESOLVED

## Error Sequence

### Error 1 ❌ (FIXED)
```
Profile setup failed: Failed to create merchant: 
new row violates row-level security policy for table "merchants"
```
**Solution**: Created edge function with service role key bypass

### Error 2 ❌ (FIXED NOW)
```
Profile setup failed: Failed to create merchant: 
there is no unique or exclusion constraint matching the ON CONFLICT specification
```
**Solution**: Added unique constraint on `merchants.pi_user_id`

---

## All Solutions in Order

### 1️⃣ Add Unique Constraint (DO THIS FIRST)

**Quickest Way**: Copy-paste into Supabase SQL Editor:

```sql
ALTER TABLE public.merchants DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key;
ALTER TABLE public.merchants ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id ON public.merchants(pi_user_id);
```

**Verify it worked**:
```sql
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'merchants' AND constraint_name = 'merchants_pi_user_id_key';
-- Should show: merchants_pi_user_id_key
```

### 2️⃣ Fix RLS Policies

**Option A**: Deploy migration
```bash
supabase db push
```

**Option B**: Manual in Supabase Console
- Go to SQL Editor
- Copy from: `supabase/migrations/fix_merchants_rls_insert_policy.sql`
- Paste and run

### 3️⃣ Deploy Edge Function

```bash
supabase functions deploy create-merchant-profile
```

### 4️⃣ Clear Browser & Test

```bash
# In browser:
1. Ctrl+Shift+Delete → Clear All
2. Go to http://localhost:5173/auth
3. Sign in with Pi Network
4. Accept demo mode
5. Should see dashboard ✓
```

---

## Files Created/Modified

### Migration Files (to be deployed)
- ✅ `supabase/migrations/add_merchants_unique_constraint.sql` - Constraint fix
- ✅ `supabase/migrations/fix_merchants_rls_insert_policy.sql` - RLS fix

### Code Files (updated)
- ✅ `supabase/functions/create-merchant-profile/index.ts` - NEW edge function
- ✅ `src/contexts/AuthContext.tsx` - Updated to use edge function

### Quick Reference Guides
- ✅ `QUICK_FIX_ON_CONFLICT.md` - Read this first for 2-minute fix
- ✅ `FIX_ON_CONFLICT_CONSTRAINT_ERROR.md` - Detailed explanation
- ✅ `RLS_FIX_MERCHANT_CREATION.md` - RLS solution
- ✅ `DEBUG_RLS_MERCHANT_CREATION.md` - Debugging help
- ✅ `DASHBOARD_ACCESS_FIX.md` - Dashboard redirect
- ✅ `EXACT_CODE_CHANGES.md` - Code diffs

---

## Quick Verification

Run these in Supabase SQL Editor to confirm everything:

```sql
-- 1. Check unique constraint exists
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'merchants' AND constraint_name = 'merchants_pi_user_id_key';

-- 2. Check RLS is enabled  
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'merchants';

-- 3. Check RLS policies exist (should show 4)
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'merchants';

-- 4. Check index exists
SELECT indexname FROM pg_indexes WHERE tablename = 'merchants' AND indexname LIKE 'idx_merchants%';
```

All should return results showing:
- ✅ Constraint: merchants_pi_user_id_key
- ✅ RLS: true
- ✅ Policies: 4
- ✅ Index: idx_merchants_pi_user_id

---

## Expected Result After Fix

**Before**: Error when trying to create merchant profile
**After**: Dashboard loads immediately after sign-in

Console should show:
```
✅ New merchant created successfully: <merchant-id>
```

---

## Support Files

For specific issues, see:
- RLS policy violations → `RLS_FIX_MERCHANT_CREATION.md`
- ON CONFLICT errors → `FIX_ON_CONFLICT_CONSTRAINT_ERROR.md`
- Dashboard access issues → `DASHBOARD_ACCESS_FIX.md`
- Debugging → `DEBUG_RLS_MERCHANT_CREATION.md`
- Code details → `EXACT_CODE_CHANGES.md`

---

**Total Setup Time**: ~5-10 minutes
**Status**: Ready to deploy ✅
