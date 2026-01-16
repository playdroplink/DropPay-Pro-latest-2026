# Fix for Checkout Link Creation Error

## Issue
The checkout link creation was failing because the database table was missing the new advanced option columns.

## Solution
You need to run the migration SQL on your Supabase database.

### Steps to Fix:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select project ID: `reyhsdlsvclpzsgecoyf`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration SQL**
   - Open the file: `RUN_THIS_SQL_IN_SUPABASE.sql` in this directory
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor

4. **Run the Query**
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait for success message

5. **Test the Feature**
   - Go back to your app
   - Try creating a checkout link again
   - It should now work with all advanced options

## What the Migration Does

Adds these new columns to the `checkout_links` table:
- `expire_access` - When the link expires (never, 7 days, 30 days, 90 days, 1 year)
- `stock` - Limited or unlimited inventory
- `show_on_store_page` - Display on public store page
- `add_waitlist` - Show waitlist when out of stock
- `ask_questions` - Collect custom questions
- `internal_name` - Internal reference for merchants
- `redirect_after_checkout` - Redirect URL after successful payment

## Troubleshooting

If you get an error like "relation does not exist":
- Make sure the `checkout_links` table exists first
- Run the initial migration from `supabase/migrations/create_checkout_links_table.sql` if needed
