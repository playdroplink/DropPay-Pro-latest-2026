# Supabase Payment Links Verification Guide

## ✅ Make Sure Supabase is Working

This guide helps you verify that Supabase is properly connected and saving all payment links.

## 1. Quick Connection Test

### In VS Code Terminal:
```bash
# Run the test script
node test-supabase-payment-links.js
```

This will show:
- ✅ Connection status
- 📋 All existing payment links
- 🔧 Table schema
- 📊 Total link count

## 2. Manual Verification Steps

### Step 1: Check Environment Variables
Your `.env.local` should have:
```env
VITE_SUPABASE_URL=https://xoofailhzhfyebzpzrfs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Test in Browser Console
1. Open Dashboard
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Run this code:
```javascript
// Test Supabase connection
import { supabase } from '@/integrations/supabase/client';

(async () => {
  const { data, error, count } = await supabase
    .from('payment_links')
    .select('*', { count: 'exact' });
  
  console.log('✅ Total Payment Links:', count);
  console.log('📋 Links:', data);
  if (error) console.error('❌ Error:', error);
})();
```

### Step 3: Check Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run this query:
```sql
-- Check payment_links table
SELECT 
  id,
  title,
  slug,
  amount,
  is_active,
  pricing_type,
  created_at
FROM payment_links
ORDER BY created_at DESC
LIMIT 10;
```

## 3. Verify Payment Link Creation

### When You Create a Payment Link:
Check browser console for these messages:
```
✅ Payment link saved to Supabase: [slug]
```

### If You See Errors:

#### Error: "INSERT not allowed"
**Cause:** RLS policy blocks inserts
**Fix:** Run this in Supabase SQL Editor:
```sql
-- Enable insert for payment_links
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to insert their own links" ON payment_links
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Allow public read payment_links" ON payment_links
  FOR SELECT USING (is_active = true OR auth.uid() = merchant_id);
```

#### Error: "Column not found"
**Cause:** Missing columns in table
**Fix:** Check that these columns exist:
```sql
ALTER TABLE payment_links
  ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'one_time',
  ADD COLUMN IF NOT EXISTS min_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS suggested_amounts NUMERIC[],
  ADD COLUMN IF NOT EXISTS enable_waitlist BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ask_questions BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS checkout_questions JSONB,
  ADD COLUMN IF NOT EXISTS internal_name TEXT;
```

## 4. Verify All Payment Links Are Saved

Run this in Supabase SQL Editor:
```sql
-- Get stats about payment links
SELECT 
  COUNT(*) as total_links,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_links,
  COUNT(DISTINCT merchant_id) as total_merchants,
  pricing_type,
  COUNT(*) as count_by_type
FROM payment_links
GROUP BY pricing_type
ORDER BY count_by_type DESC;
```

## 5. Check Data Integrity

### Verify no duplicate links:
```sql
SELECT slug, COUNT(*) as count
FROM payment_links
GROUP BY slug
HAVING COUNT(*) > 1;
```

### Check for orphaned links (no merchant):
```sql
SELECT id, title, merchant_id
FROM payment_links
WHERE merchant_id IS NULL;
```

## 6. Performance Check

### Check storage and indexing:
```sql
-- Check table size
SELECT 
  pg_size_pretty(pg_total_relation_size('payment_links')) as table_size;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'payment_links';
```

## 7. Real-Time Sync

If you have real-time features enabled:
```javascript
// Test real-time subscription
const subscription = supabase
  .from('payment_links')
  .on('*', payload => {
    console.log('📡 Real-time update:', payload);
  })
  .subscribe();

// Clean up when done
supabase.removeSubscription(subscription);
```

## 8. Troubleshooting Checklist

- [ ] Environment variables are set correctly
- [ ] Supabase project is active
- [ ] Payment links table exists
- [ ] RLS policies allow your user to read/write
- [ ] No database storage limit reached
- [ ] Network connection is stable
- [ ] Authentication token is valid

## 9. How to Debug

### Enable Query Logging:
```javascript
// In your code
const { data, error } = await supabase
  .from('payment_links')
  .select('*');

if (error) {
  console.error('❌ Supabase Error:', {
    message: error.message,
    code: error.code,
    hint: error.hint,
    details: error.details
  });
} else {
  console.log('✅ Query successful:', data.length, 'links found');
}
```

### Check Network Tab:
1. F12 → Network tab
2. Create a payment link
3. Look for requests to `supabase.co`
4. Check response status (should be 200/201)
5. Verify response data contains the new link

## 10. Verify Specific Features

### Free Plan Links:
```sql
SELECT COUNT(*) as free_links
FROM payment_links
WHERE pricing_type = 'free';
```

### Donation Links with Min Amount:
```sql
SELECT title, min_amount, suggested_amounts
FROM payment_links
WHERE pricing_type = 'donation'
AND min_amount IS NOT NULL;
```

### Links with File Uploads:
```sql
SELECT title, content_file, access_type
FROM payment_links
WHERE content_file IS NOT NULL;
```

### Waitlist Enabled:
```sql
SELECT title, enable_waitlist
FROM payment_links
WHERE enable_waitlist = true;
```

## 11. Connection String

If you need to manually test with a database client:

```
postgresql://postgres:[PASSWORD]@db.xoofailhzhfyebzpzrfs.supabase.co:5432/postgres
```

Get the password from: Supabase Dashboard → Project Settings → Database

## 12. Success Indicators

You'll know Supabase is working when you see:

✅ Payment links appear immediately in dashboard
✅ Console shows "✅ Payment link saved to Supabase: [slug]"
✅ Payment link counts increase
✅ Links are active by default
✅ All pricing types work (free, one-time, donation, recurring)
✅ Files upload and are attached to links
✅ You can delete links
✅ Payment page loads links by slug
✅ Merchant can see only their own links

## 13. Next Steps

Once verified:
1. ✅ Create test payment links
2. ✅ Test file upload functionality
3. ✅ Verify payment flow in Pi Browser
4. ✅ Check email delivery for purchases
5. ✅ Monitor real-time updates

## Still Having Issues?

Check these logs:
- **Browser Console:** F12 → Console (look for ❌ or ✅ messages)
- **Supabase Logs:** Dashboard → Logs → Edge Functions / Database
- **Network Tab:** F12 → Network (check requests to supabase.co)

For more help: [Supabase Documentation](https://supabase.com/docs)
