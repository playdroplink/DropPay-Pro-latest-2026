# 🔧 PROFILE SETUP FIX - Complete Solution

## The Problem
After signing in with Pi Network, you cannot use the app because profile creation fails with this error:
```
Database constraint error (42P10): 
"there is no unique or exclusion constraint matching the ON CONFLICT specification"
```

## The Root Cause
The `merchants` table is missing a **UNIQUE constraint** on the `pi_user_id` column, which is required for the database to handle duplicate insert attempts properly. Additionally, RLS (Row Level Security) policies may be too restrictive.

## The Solution

There are **3 ways** to apply the fix (choose ONE):

---

## ✅ METHOD 1: Using Supabase Dashboard (Recommended for Quick Fix)

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the Fix**
   - Open this file: `FINAL_PROFILE_FIX.sql` in the workspace
   - Copy ALL the content

4. **Paste and Execute**
   - Paste the SQL into the editor
   - Click the "▶ Run" button
   - Wait for the query to complete (you should see ✅ success messages)

5. **Verify**
   - You should see output indicating:
     - ✅ Unique constraint on pi_user_id exists
     - ✅ All RLS policies are configured

6. **Test**
   - Refresh your app (Ctrl+F5)
   - Try signing in with Pi Network again
   - Profile should create successfully ✅

---

## ✅ METHOD 2: Using Supabase CLI (For Development)

### Prerequisites:
- Supabase CLI installed: `npm install -g supabase`
- Supabase project initialized in your workspace

### Step-by-Step:

1. **Run the migration**
   ```powershell
   supabase db push
   ```

2. **Or apply the SQL directly**
   ```powershell
   # Copy FINAL_PROFILE_FIX.sql to your migrations folder
   Copy-Item FINAL_PROFILE_FIX.sql supabase/migrations/
   
   # Push the migration
   supabase db push
   ```

3. **Deploy functions (if needed)**
   ```powershell
   supabase functions deploy
   ```

---

## ✅ METHOD 3: Manual Database Fix (If Above Methods Don't Work)

If you have direct database access or the above methods don't work:

1. Connect to your PostgreSQL database
2. Run the SQL commands from `FINAL_PROFILE_FIX.sql`
3. Execute each section in order:
   - Alter merchants table
   - Fix RLS policies
   - Verify constraints

---

## 🔍 What the Fix Does

### 1. **Adds Unique Constraint**
```sql
ALTER TABLE public.merchants 
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);
```
This allows the app to use `ON CONFLICT` to handle duplicate signups.

### 2. **Fixes RLS Policies**
Creates INSERT, UPDATE, SELECT, and DELETE policies that allow:
- New users to create merchant profiles
- Users to update their own data
- Users to view their own profile

### 3. **Adds Performance Index**
```sql
CREATE INDEX idx_merchants_pi_user_id ON public.merchants(pi_user_id);
```
This speeds up lookups by `pi_user_id`.

---

## 📋 What to Do If the Fix Doesn't Work

### Error: "Cannot find migration file"
- Make sure the file path is correct
- Copy `FINAL_PROFILE_FIX.sql` to `supabase/migrations/` folder

### Error: "Constraint already exists"
- The constraint is already applied ✅
- Clear your browser cache and try again

### Error: "Permission denied"
- You may not have the right role/permissions
- Ensure you're using the **correct Supabase project**
- Check that you're authenticated with the right account

### Error: "Still getting 42P10 error"
- The migration may not have been applied yet
- Check the Supabase project's SQL logs
- Try restarting the app completely
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

---

## ✅ How to Verify the Fix Is Applied

1. **Via Supabase Dashboard:**
   - Go to "Table Editor"
   - Click on "merchants" table
   - Look at the "Constraints" section
   - You should see: `merchants_pi_user_id_key` (UNIQUE)

2. **Via SQL Query:**
   - Open SQL Editor
   - Run this query:
   ```sql
   SELECT constraint_name, constraint_type 
   FROM information_schema.table_constraints 
   WHERE table_name = 'merchants' 
   AND table_schema = 'public';
   ```
   - You should see `merchants_pi_user_id_key` as a UNIQUE constraint

3. **Test the App:**
   - Sign out completely
   - Clear cookies/local storage
   - Sign in again with Pi Network
   - If you get no error and profile is created → ✅ Fixed!

---

## 🚀 Next Steps After Fixing

1. **Test the full flow:**
   - Sign in with Pi Network
   - Create a payment link
   - Test the checkout
   - Verify payments work

2. **If other errors appear:**
   - Check the browser console (F12) for error details
   - Check the Supabase logs
   - Refer to other fix files in the workspace

3. **Need more help?**
   - Check: `DROPPAY_COMPLETE_DOCUMENTATION.md`
   - Check: `QUICK_TROUBLESHOOTING.md`
   - Check: `DEBUG_DIAGNOSTIC.sql` for database diagnostics

---

## 📝 Checklist

- [ ] Opened Supabase Dashboard
- [ ] Found FINAL_PROFILE_FIX.sql file
- [ ] Copied and pasted SQL into SQL Editor
- [ ] Clicked Run and got ✅ success
- [ ] Refreshed the app
- [ ] Tested sign in with Pi Network
- [ ] Verified merchant profile created successfully
- [ ] Can now create payment links ✅

---

## 🎯 Summary

**The fix is complete!** After applying `FINAL_PROFILE_FIX.sql`:

✅ Unique constraint on `pi_user_id` column  
✅ RLS policies for INSERT, UPDATE, SELECT, DELETE  
✅ Performance index on `pi_user_id`  
✅ All database checks and validations  

Your app should now work perfectly after sign-in! 🎉
