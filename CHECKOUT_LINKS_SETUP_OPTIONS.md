# Checkout Links Table Setup - Two Options

## If the first setup file fails:

You have **two SQL files** to choose from:

### Option 1: Complete Setup (Recommended)
**File:** `SETUP_CHECKOUT_LINKS_COMPLETE.sql`
- Handles merchants table dependency
- More robust error handling
- Includes all safety checks

**How to use:**
1. Open the file
2. Copy all content
3. Paste in Supabase SQL Editor
4. Click Run

---

### Option 2: Minimal Setup (If Option 1 Fails)
**File:** `SETUP_CHECKOUT_LINKS_MINIMAL.sql`
- Stripped down version
- Removes old objects first
- No external dependencies
- Works standalone

**How to use:**
1. Open the file
2. Copy all content
3. Paste in Supabase SQL Editor
4. Click Run

---

## Troubleshooting

If you still get "relation does not exist" error:

1. **Make sure you're running the ENTIRE file** (not just the first query)
2. **Copy from the top** of the file to the bottom
3. **Paste everything** into one SQL editor window
4. **Click Run once** (not multiple times)

## What Gets Created

Both files create:
- ✅ `checkout_links` table with 20+ columns
- ✅ Advanced options (expire_access, stock, waitlist, questions, etc.)
- ✅ 6 performance indexes
- ✅ Auto-update trigger for timestamps
- ✅ Analytics view
- ✅ Row-level security policies

## After Setup

Once the SQL runs without errors:
1. Go to your app
2. Create a checkout link from dashboard
3. All features should work!
