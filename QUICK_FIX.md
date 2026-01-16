# Quick Fix Guide

## 🚀 Quick Steps to Fix Everything

### 1️⃣ Run SQL Script (REQUIRED)
1. Open: https://supabase.com/dashboard/project/ivwphuvamflcghjliixx/sql/new
2. Copy content from: `fix_database.sql` (or `supabase/migrations/20251222170000_fix_subscription_and_payment_links.sql`)
3. Paste and click **Run**

### 2️⃣ Verify (Check Database)
```sql
-- Check if columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'payment_links' 
  AND column_name IN ('min_amount', 'suggested_amounts');

-- Check if you have a subscription
SELECT us.*, sp.name as plan_name
FROM user_subscriptions us
JOIN subscription_plans sp ON sp.id = us.plan_id
WHERE us.status = 'active';
```

### 3️⃣ Test Your App
- ✅ Create a payment link (should work now)
- ✅ Check your subscription shows "Free" plan
- ✅ Try upgrading to a paid plan

## 📁 Files Changed

✅ **Backend (Database)**
- `fix_database.sql` - Manual SQL fixes
- `supabase/migrations/20251222170000_fix_subscription_and_payment_links.sql` - Migration

✅ **Frontend (Code)**
- `src/pages/Subscription.tsx` - Fixed subscription update (update → upsert)
- `src/hooks/useSubscription.tsx` - Fixed query (pi_username → merchant_id)
- `src/pages/PayPage.tsx` - Fixed TypeScript errors

## 🎯 What Was Wrong?

1. **Missing Column**: `min_amount` column didn't exist in database
2. **Wrong Query**: Subscription was queried by `pi_username` instead of `merchant_id`
3. **No Default**: New merchants didn't get a Free plan automatically
4. **Update Failed**: Used `update` instead of `upsert`, causing failures when no subscription exists

## 🔧 What Was Fixed?

1. ✅ Added `min_amount` and `suggested_amounts` columns
2. ✅ Changed subscription query to use `merchant_id`
3. ✅ Auto-create Free subscription for all merchants
4. ✅ Use `upsert` instead of `update` for subscription changes
5. ✅ Added proper indexes for better performance
6. ✅ Backfilled existing merchants with Free plan

## ⚠️ Important Notes

- **Free Plan**: Never expires (100 years validity)
- **Paid Plans**: 30-day validity per payment
- **Limits**: Enforced at payment link creation time
- **Platform Fee**: Applied based on current plan

## 🆘 Still Not Working?

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Check Supabase logs** in dashboard
3. **Verify environment variables** in `.env`
4. **Check console errors** (F12 in browser)

## 📞 Debug Queries

```sql
-- See your merchant ID
SELECT * FROM merchants WHERE pi_username = 'YOUR_PI_USERNAME';

-- See your subscription
SELECT * FROM user_subscriptions WHERE merchant_id = 'YOUR_MERCHANT_ID';

-- See all plans
SELECT * FROM subscription_plans ORDER BY amount;

-- Count your payment links
SELECT COUNT(*) FROM payment_links WHERE merchant_id = 'YOUR_MERCHANT_ID';
```
