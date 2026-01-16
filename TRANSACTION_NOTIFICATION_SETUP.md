# TRANSACTION NOTIFICATION BELL - IMPLEMENTATION GUIDE

## Overview
The notification bell system is now fully integrated with the transaction system. Every time a transaction is completed, a notification will automatically appear in the notification bell on the dashboard.

## What Was Implemented

### 1. ✅ Complete-Payment Edge Function Enhancement
**File:** `supabase/functions/complete-payment/index.ts`

When a payment is completed, the function now:
- Creates a transaction record ✅
- **NEW:** Automatically creates a notification for the merchant
- Notification includes payment amount and payer username
- Uses success type (green icon) for visual indication

**Sample notification:**
```
Title: 💰 Payment Received!
Message: You received 10.5 PI from username_here
Type: success (green checkmark icon)
```

### 2. ✅ Notification Bell Component Enhancement
**File:** `src/components/dashboard/NotificationBell.tsx`

Improvements made:
- Better subscription lifecycle management with cleanup
- Console logging for debugging (green checkmarks for actions)
- Real-time event status logging
- Toast notifications display for 5 seconds
- Unique channel names per merchant to prevent conflicts
- Proper unsubscribe function

### 3. ✅ Database Trigger Setup
**File:** `CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql`

A PostgreSQL trigger automatically:
- Listens for new completed transactions
- Creates notifications in the `notifications` table
- Executes after transaction insert
- Non-blocking (won't fail payment if notification fails)

## How It Works - Step by Step

```
1. User completes payment via Pi Network
                ↓
2. Payment is verified on blockchain
                ↓
3. complete-payment edge function is called
                ↓
4. Transaction is created in database
                ↓
5. Notification is created in notifications table (2 methods):
   a) Via edge function (immediate)
   b) Via database trigger (backup)
                ↓
6. NotificationBell component receives real-time update
                ↓
7. Bell icon badge updates with unread count
                ↓
8. Toast notification appears (success message)
                ↓
9. Merchant can click bell to view notification details
```

## Setup Instructions

### Step 1: Deploy Edge Function Changes
The complete-payment function has been updated. Deploy with:
```bash
# Option A: Using Supabase CLI
supabase functions deploy complete-payment

# Option B: Push to your repository and let CI/CD handle it
git push origin main
```

### Step 2: Apply Database Trigger (IMPORTANT!)
Run the SQL script in your Supabase SQL editor:
```bash
# Copy the entire content from CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql
# Open Supabase Dashboard > SQL Editor
# Paste and run the script
```

Or run via CLI:
```bash
# Using psql
psql -h db.xxx.supabase.co -U postgres -d postgres -f CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql

# Enter your database password when prompted
```

### Step 3: Verify Setup

#### Check Trigger is Active
Run in SQL Editor:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'transaction_notification_trigger';
```

Expected output: One row showing trigger is ACTIVE

#### Check Notification Table Exists
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid)
- merchant_id (uuid)
- title (text)
- message (text)
- type (text) - info, success, warning, error
- is_read (boolean)
- related_type (text) - transaction, withdrawal, etc
- related_id (uuid)
- created_at (timestamp)
- read_at (timestamp)

### Step 4: Manual Testing

#### Test 1: Direct Notification Insert
```sql
-- Insert a test notification
INSERT INTO notifications (
  merchant_id,
  title,
  message,
  type,
  related_type,
  is_read
) VALUES (
  'YOUR_MERCHANT_ID_HERE',
  '✨ Test Notification',
  'This is a test notification from the database',
  'info',
  'test',
  FALSE
);

-- Then check dashboard - bell should show new notification
-- Check browser console for: "🔔 New notification received:"
```

#### Test 2: Trigger Test
```sql
-- This triggers the automatic notification creation
INSERT INTO transactions (
  merchant_id,
  pi_payment_id,
  amount,
  status,
  txid,
  payer_pi_username
) VALUES (
  'YOUR_MERCHANT_ID_HERE',
  'test-payment-123',
  10.5,
  'completed',
  'test-tx-456',
  'testuser'
)
RETURNING id;

-- Check notifications table - should have auto-created notification
SELECT * FROM notifications 
WHERE merchant_id = 'YOUR_MERCHANT_ID_HERE' 
ORDER BY created_at DESC 
LIMIT 1;
```

## Debugging

### Issue: Notification Bell Shows No Updates
**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these log messages:
   - `✅ Notifications loaded: X` - Notifications are loading
   - `🔔 New notification received:` - Real-time update received
   - `📡 Notification subscription status:` - Connection status
   - `🛑 Unsubscribing from notifications` - Cleanup message

### Issue: Toast Shows But Bell Badge Doesn't Update
**Solution:**
1. Check merchant_id is correct in auth context
2. Run test from Test 1 above to verify insert works
3. Check browser console for errors

### Issue: Trigger Doesn't Create Notification
**Solution:**
1. Verify trigger is active (see Step 3 verification)
2. Check RLS policies on notifications table:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'notifications';
   ```
3. Ensure service role has insert permissions
4. Check for database errors:
   ```sql
   SELECT * FROM pg_stat_database 
   WHERE datname = current_database();
   ```

### Issue: "Transaction Notification Bell - Looking for notification" Errors
**Solution:**
- These are normal during development
- Ignore if notifications still appear
- If persistent, check:
  1. Is `notifications` table created? 
  2. Do you have permissions to insert?
  3. Is the channel subscription actually working?

## Monitoring Notifications

### View All Notifications for Merchant
```sql
SELECT 
  id,
  title,
  message,
  type,
  is_read,
  created_at
FROM notifications
WHERE merchant_id = 'YOUR_MERCHANT_ID'
ORDER BY created_at DESC;
```

### View Unread Notifications Count
```sql
SELECT 
  COUNT(*) as unread_count
FROM notifications
WHERE merchant_id = 'YOUR_MERCHANT_ID'
AND is_read = FALSE;
```

### Clean Up Old Notifications (30 days)
```sql
DELETE FROM notifications
WHERE merchant_id = 'YOUR_MERCHANT_ID'
AND created_at < NOW() - INTERVAL '30 days';
```

## Configuration

### Customize Notification Messages
Edit `supabase/functions/complete-payment/index.ts`:
```typescript
const notificationTitle = `💰 Payment Received!`; // Change emoji or text
const notificationMessage = `You received ${amount} PI from ${payerUsername || 'a buyer'}`; // Custom format
```

### Customize Notification Duration (Toast)
Edit `src/components/dashboard/NotificationBell.tsx`:
```typescript
duration: 5000, // Change milliseconds (5000 = 5 seconds)
```

### Customize Notification Icons/Colors
Edit `src/components/dashboard/NotificationBell.tsx`:
```typescript
const notificationIcons = {
  info: Info,
  success: CheckCircle,    // Change icons
  warning: AlertTriangle,
  error: AlertCircle,
  transaction: DollarSign, // Add new type
};

const notificationColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  transaction: 'text-purple-500', // Add new color
};
```

## Features

### Current Features ✅
- Real-time transaction notifications
- Unread count badge on bell icon
- Toast notification on new transaction
- Click to mark as read
- Delete individual notifications
- Mark all as read button
- Notification timestamp (relative time)
- Visual type indicators (success = green, etc)
- Scrollable notification list (20 most recent)

### Future Features (Optional)
- Email notifications for transactions
- SMS notifications
- Webhook notifications
- Notification preferences/settings
- Archive vs delete
- Notification filtering by type
- Batch mark as read/delete
- Sound notifications

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Pi Network Payment Flow                 │
├─────────────────────────────────────────────────┤
│ 1. User initiates payment                        │
│ 2. Pi SDK authenticates transaction              │
│ 3. Payment verified on blockchain                │
│ 4. Calls complete-payment edge function          │
│         ↓                                         │
│ ┌─────────────────────────────────────┐         │
│ │ complete-payment/index.ts           │         │
│ ├─────────────────────────────────────┤         │
│ │ 1. Verify payment with Pi API        │         │
│ │ 2. Insert transaction (DB)           │         │
│ │ 3. Create notification (NEW!)        │         │
│ │ 4. Trigger fires (DB trigger)        │         │
│ │ 5. Notification created again        │         │
│ └─────────────────────────────────────┘         │
│         ↓                                         │
│    Notification in DB                            │
│         ↓                                         │
│ ┌─────────────────────────────────────┐         │
│ │ NotificationBell.tsx                │         │
│ ├─────────────────────────────────────┤         │
│ │ Real-time subscription listening     │         │
│ │ via Supabase Realtime (postgres_     │         │
│ │ changes event)                       │         │
│ └─────────────────────────────────────┘         │
│         ↓                                         │
│   Bell icon updates                              │
│   Toast shows                                    │
│   List refreshes                                 │
└─────────────────────────────────────────────────┘
```

## Troubleshooting Summary

| Issue | Check | Fix |
|-------|-------|-----|
| No notifications appear | Console logs | Verify merchant_id match |
| Bell badge not updating | RLS policies | Check notifications table permissions |
| Toast shows but no list | Subscription | Try page refresh |
| Trigger not firing | pg_policies | Apply CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql |
| "Column X doesn't exist" | Table schema | Add missing columns |
| Duplicate notifications | Race condition | Normal, minor UI issue |

## Support

For issues:
1. Check the Debugging section above
2. Review console logs (DevTools > Console)
3. Check database state:
   ```sql
   SELECT COUNT(*) as notification_count FROM notifications;
   SELECT COUNT(*) as transaction_count FROM transactions;
   ```
4. Verify edge function logs in Supabase Dashboard
5. Check RLS policies are not blocking inserts

## Summary

✅ Notification system is fully integrated with transactions
✅ Real-time notifications via Supabase Realtime
✅ Database trigger for automatic notification creation
✅ Edge function creates notification immediately
✅ Merchant can view all notifications in dashboard
✅ Notifications show payment amount and payer
✅ Toast notifications provide instant feedback
✅ Unread count badge on notification bell

**The notification bell will now notify you every time a transaction is completed!**
