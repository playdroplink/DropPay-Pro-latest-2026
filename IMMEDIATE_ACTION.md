# ⚡ IMMEDIATE ACTION - Fix Both Issues NOW

## You Have TWO Problems

1. **Edge Function Not Deployed** → CORS Error
2. **Database Constraint Missing** → 42P10 Error

---

## 🎯 DO THIS RIGHT NOW (5 minutes)

### Step 1: Deploy Edge Function (1 minute)
```powershell
# Open PowerShell in your project directory, then:
supabase functions deploy create-merchant-profile
```

**Wait for:** "✓ Function created successfully" message

### Step 2: Apply Database Fix (2 minutes)

**Option A: Manual (EASIEST)**
1. Open: https://supabase.com/dashboard
2. Go to: SQL Editor → New Query
3. Open file: `FINAL_PROFILE_FIX.sql`
4. Copy-paste all content into SQL editor
5. Click blue ▶ RUN button
6. Done!

**Option B: CLI**
```powershell
supabase db push
```

### Step 3: Test (2 minutes)
1. Hard refresh: Ctrl+F5
2. Clear cache: F12 → Application → Clear All
3. Sign out completely
4. Try sign-in with Pi Network
5. ✅ Profile should create!

---

## ✅ Verification

After completing above:

**Check Function is Deployed:**
```powershell
supabase functions list
```
Look for: `create-merchant-profile [Active]`

**Check Database Constraint:**
- Go to Supabase Dashboard
- Table Editor → merchants
- Look for constraint: `merchants_pi_user_id_key` ✓

**Test App:**
- Sign in with Pi Network
- Profile should create without errors ✅

---

## 🚨 If Still Not Working

**Edge Function still failing?**
```powershell
# Try force redeploy
supabase functions deploy create-merchant-profile --force
```

**Database still broken?**
- Re-run `FINAL_PROFILE_FIX.sql` from SQL Editor
- Make sure you see ✅ success messages

**Still stuck?**
- Hard refresh: Ctrl+Shift+R
- Clear cookies completely
- Try incognito window
- Sign in again

---

## 📊 What These Fix

| Error | Fix | Method |
|-------|-----|--------|
| CORS Error | Deploy function | `supabase functions deploy` |
| 42P10 Error | Run SQL migration | Supabase SQL Editor |

---

**That's it!** Apply both fixes and everything works! 🎉
