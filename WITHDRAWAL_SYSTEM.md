# Withdrawal Request System Setup

## Summary
I've created a comprehensive withdrawal tracking system that allows you to:
1. **Save all withdrawal requests** to the Supabase database
2. **View all withdrawal requests** in the Admin Panel
3. **Approve or reject withdrawals** with admin controls
4. **Track withdrawal status** (pending, approved, completed, rejected, failed)

## Database Changes

### New Table: `withdrawal_requests`
Created in: `supabase/migrations/20251226_add_withdrawal_tracking.sql`

**Columns:**
- `id` - Unique identifier (UUID)
- `merchant_id` - Link to merchant submitting the request
- `amount` - Withdrawal amount in Pi
- `wallet_address` - Pi wallet address (for manual withdrawals)
- `pi_username` - Pi username (for A2U withdrawals)
- `status` - pending, approved, rejected, completed, or failed
- `withdrawal_type` - "manual" or "a2u" (App-to-User)
- `notes` - Additional notes
- `rejection_reason` - Reason if rejected
- `approved_by` - Admin who approved the request
- `approved_at` - When the request was approved
- `completed_at` - When the withdrawal was completed
- `transaction_id` - Transaction ID after completion
- `created_at` - Timestamp of request
- `updated_at` - Last updated timestamp

**Indexes for Performance:**
- merchant_id (for quick lookup by merchant)
- status (for filtering by status)
- created_at (for sorting)
- merchant_id + status (combined for common queries)

## Updated Components

### 1. User Withdrawal Page (`src/pages/Withdrawals.tsx`)
- When users request a withdrawal, it now saves to `withdrawal_requests` table
- Falls back to old `withdrawals` table if new table doesn't exist yet
- Tracks withdrawal type (manual vs A2U)
- Shows pending approval status

### 2. Admin Withdrawals Panel (`src/pages/AdminWithdrawals.tsx`)
- Fetches withdrawals from new `withdrawal_requests` table (or falls back to old table)
- Shows dashboard with stats:
  - Total pending withdrawals
  - Total pending amount
  - Total approved withdrawals
  - Total approved amount
- **Approve function**: Marks request as approved and deducts from merchant balance
- **Reject function**: Can reject requests with reasons

## How to Use

### For Users:
1. Go to Dashboard → Withdrawals
2. Click "Request Withdrawal"
3. Choose withdrawal method (Manual or A2U)
4. Enter amount and wallet/username details
5. Submit request
6. Request appears with "pending" status, awaiting admin approval

### For Admin (@Wain2020):
1. Go to Admin Panel → Withdrawals
2. View all pending withdrawal requests
3. Click "Approve" to approve a request
4. System automatically:
   - Marks request as approved
   - Deducts amount from merchant's available balance
   - Updates total_withdrawn for the merchant
   - Creates a notification for the merchant
5. Optionally reject requests with a reason

## Deployment Steps

1. **Run the migration:**
   ```bash
   supabase migration up
   ```
   Or run the SQL directly in Supabase:
   - Copy contents of `supabase/migrations/20251226_add_withdrawal_tracking.sql`
   - Run in Supabase SQL Editor

2. **Restart the app:**
   ```bash
   npm run dev
   ```

3. **Test the flow:**
   - Submit a withdrawal request as a user
   - Check admin panel to see it in the list
   - Test approve/reject functionality

## Fallback Support

The system is designed with backward compatibility:
- If `withdrawal_requests` table doesn't exist yet, it falls back to `withdrawals` table
- Existing withdrawal requests continue to work
- No data loss during migration

## Status Flow

```
pending → approved → completed
       ↘ rejected
         ↘ failed
```

- **pending**: Initial state when user submits request
- **approved**: Admin has reviewed and approved
- **completed**: Funds have been transferred
- **rejected**: Admin denied the request
- **failed**: Transfer failed during processing

## Security

Row-Level Security (RLS) policies ensure:
- Users can only see their own withdrawal requests
- Only admins (is_admin = true) can view/manage all requests
- Admin can approve requests only through proper authentication
