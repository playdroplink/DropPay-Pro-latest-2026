# Fix: "relation checkout_links does not exist"

## Problem
The `checkout_links` table hasn't been created in your Supabase database yet.

## Solution
Run the complete setup SQL file that creates everything at once.

### Steps:

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select project ID: `reyhsdlsvclpzsgecoyf`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the Complete Setup File**
   - Open: `SETUP_CHECKOUT_LINKS_COMPLETE.sql` (in project root)
   - Copy the **entire file content**
   - Paste into Supabase SQL Editor

4. **Run the Query**
   - Click "Run" button or press Ctrl+Enter
   - Wait for success message

## What Gets Created

✅ `checkout_links` table with all columns including:
- Basic fields: title, description, category, slug, amount, currency, features
- Advanced options: expire_access, stock, show_on_store_page, add_waitlist, ask_questions, internal_name, redirect_after_checkout
- Analytics: views, conversions, timestamps

✅ Indexes for performance
✅ Auto-update trigger for timestamps
✅ Analytics view
✅ Row-level security policies

## Why You Got This Error

The previous migration file tried to alter the table before it was created. This complete file creates everything from scratch, so it will work regardless of what state your database is in.

## Next Steps

Once the SQL runs successfully:
1. Your checkout links feature will be fully functional
2. All advanced options (expire access, stock, etc.) will work
3. You can start creating checkout links in the dashboard
