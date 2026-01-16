# DATABASE CONSTRAINT FIX - Visual Guide

## The Problem (Flow Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SIGN-IN FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Sign in with Pi Network"
                  ↓
2. Pi Network authenticates user
                  ↓
3. App receives user data (uid, username, etc.)
                  ↓
4. App tries to create merchant profile
   Query: INSERT INTO merchants (pi_user_id, ...) 
          ON CONFLICT (pi_user_id) DO UPDATE ...
                  ↓
5. ❌ DATABASE ERROR (42P10)
   "No unique or exclusion constraint matching ON CONFLICT"
                  ↓
6. User sees error toast
   ❌ "Profile setup failed: Database schema migration required"
                  ↓
7. ⛔ User is stuck - cannot access app
```

## Why This Happens

```
merchants TABLE (BEFORE FIX):
┌─────────────────────────────────────────┐
│ id          │ uuid                      │
│ pi_user_id  │ text (NOT UNIQUE! ⚠️)     │
│ pi_username │ text                      │
│ ...         │ ...                       │
└─────────────────────────────────────────┘

App tries: ON CONFLICT (pi_user_id) ...
Problem:   ❌ No UNIQUE constraint on pi_user_id
Result:    PostgreSQL doesn't know how to handle conflicts
```

## The Solution

```
┌─────────────────────────────────────────────────────────────┐
│              APPLYING THE FIX (3 PARTS)                     │
└─────────────────────────────────────────────────────────────┘

PART 1: Add UNIQUE Constraint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE merchants
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

Result: merchants table now has:
┌─────────────────────────────────────────┐
│ id          │ uuid                      │
│ pi_user_id  │ text ✅ UNIQUE CONSTRAINT │
│ pi_username │ text                      │
│ ...         │ ...                       │
└─────────────────────────────────────────┘

PART 2: Fix RLS Policies
━━━━━━━━━━━━━━━━━━━━━━━━━
- INSERT: Allow anyone to create merchant ✅
- UPDATE: Allow users to update profile ✅
- SELECT: Allow users to view profile ✅
- DELETE: Allow users to delete profile ✅

PART 3: Add Performance Index
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE INDEX idx_merchants_pi_user_id 
ON merchants(pi_user_id);

Benefit: Fast lookups on pi_user_id ⚡
```

## After Fix - Success Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 USER SIGN-IN FLOW (FIXED)                   │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Sign in with Pi Network"
                  ↓
2. Pi Network authenticates user
                  ↓
3. App receives user data
                  ↓
4. App tries to create merchant profile
   Query: INSERT INTO merchants (pi_user_id, ...) 
          ON CONFLICT (pi_user_id) DO UPDATE ...
                  ↓
5. ✅ DATABASE SUCCESS
   UNIQUE constraint exists → PostgreSQL can handle conflicts
                  ↓
6. Merchant profile created/updated successfully
                  ↓
7. ✅ User sees success toast
   "✅ Profile created successfully!"
                  ↓
8. ✅ User can access dashboard and use app
```

## Database State Comparison

### BEFORE (Broken)
```
merchants Table:
┌────────────┬─────────────────────┐
│ Column     │ Constraint          │
├────────────┼─────────────────────┤
│ id         │ PRIMARY KEY         │
│ pi_user_id │ NOT NULL only ⚠️     │
│ pi_username│ (none)              │
│ ...        │ ...                 │
└────────────┴─────────────────────┘

RLS Status: Too restrictive or not set

Result: ❌ ON CONFLICT cannot work
```

### AFTER (Fixed)
```
merchants Table:
┌────────────┬──────────────────────────┐
│ Column     │ Constraint               │
├────────────┼──────────────────────────┤
│ id         │ PRIMARY KEY              │
│ pi_user_id │ NOT NULL + UNIQUE ✅     │
│ pi_username│ (none)                   │
│ ...        │ ...                      │
├────────────┴──────────────────────────┤
│ Indexes:                              │
│ - idx_merchants_pi_user_id ✅         │
└─────────────────────────────────────────┘

RLS Policies: INSERT, UPDATE, SELECT, DELETE ✅

Result: ✅ Everything works!
```

## Implementation Steps

```
Step 1: Get the SQL
├─ File: FINAL_PROFILE_FIX.sql
└─ Contains all 3 parts of the fix

Step 2: Execute the SQL
├─ Open: https://supabase.com/dashboard
├─ Go to: SQL Editor
└─ Run: Paste and click ▶

Step 3: Verify
├─ Check constraint exists
├─ Check RLS policies applied
└─ Check index created

Step 4: Test
├─ Refresh app (Ctrl+F5)
├─ Sign out completely
├─ Sign in with Pi Network
└─ ✅ Merchant profile should create!

Step 5: Confirm
├─ No more 42P10 errors
├─ Success toast message
├─ Can access dashboard
└─ App is fully functional ✅
```

## The Code Path

```
AuthContext.tsx - createOrUpdateMerchant() function:

const { data: existingMerchant } = await supabase
  .from('merchants')
  .select('*')
  .eq('pi_user_id', user.uid)
  .maybeSingle();

if (!existingMerchant) {
  // Create new merchant
  const { data: newMerchant, error: insertError } = await supabase
    .from('merchants')
    .insert({
      pi_user_id: user.uid,           // ← This column needs UNIQUE constraint ✅
      pi_username: user.username,
      business_name: `${user.username}'s Business`,
      is_admin: false,
    })
    .select()
    .single();
  
  // Without constraint: ❌ insertError = 42P10
  // With constraint: ✅ insertError = null
}
```

## Timeline

```
Before (Broken):
User Sign-In → Database Error (42P10) → Can't use app ❌

After (Fixed):
User Sign-In → Profile Created ✅ → Use app normally ✅
```

## Success Criteria

```
✅ Unique constraint exists on pi_user_id
✅ RLS policies allow INSERT operation
✅ Index exists for performance
✅ No more 42P10 errors
✅ Profile creates successfully
✅ User can access dashboard
✅ User can create payment links
```

## Troubleshooting Tree

```
Still getting error?
│
├─ Hard refresh (Ctrl+Shift+R)? 
│  └─ NO → Do it now ✓
│
├─ Clear cache/cookies?
│  └─ NO → Do it now ✓
│
├─ Tried in incognito window?
│  └─ NO → Try it ✓
│
├─ Check Supabase project correct?
│  └─ NO → Verify you're in right project ✓
│
├─ Check constraint exists?
│  └─ NO → Run the SQL again ✓
│
└─ Still broken?
   └─ Check: QUICK_TROUBLESHOOTING.md
```

## Summary Box

```
┌─────────────────────────────────────────────────────────────┐
│                       QUICK SUMMARY                         │
├─────────────────────────────────────────────────────────────┤
│ PROBLEM:   Missing UNIQUE constraint on merchants.pi_user_id│
│ ERROR:     Database constraint error (42P10)                │
│ SYMPTOM:   Profile creation fails after sign-in            │
│ SOLUTION:  Run FINAL_PROFILE_FIX.sql in Supabase          │
│ TIME:      2 minutes                                        │
│ RESULT:    App works perfectly ✅                           │
└─────────────────────────────────────────────────────────────┘
```
