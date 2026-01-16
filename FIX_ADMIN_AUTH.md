# Fix: Admin Access & Merchant Profile Issues

## Problem
After Pi authentication:
- Admin portal not detecting @Wain2020 as admin
- Withdrawal portal not showing
- Can't create payment links (error: "Merchant profile not loaded yet")

## Solution

### 1. Run This SQL in Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql/new

Paste and run:

```sql
-- Add is_admin column to merchants table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'merchants' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE merchants ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN merchants.is_admin IS 'Flag indicating if this merchant has admin privileges';
    END IF;
END $$;

-- Update @Wain2020 to be admin
UPDATE merchants 
SET is_admin = TRUE 
WHERE LOWER(REPLACE(pi_username, '@', '')) = 'wain2020';

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_merchants_is_admin ON merchants(is_admin) WHERE is_admin = TRUE;

-- Check if merchant exists
SELECT * FROM merchants WHERE LOWER(REPLACE(pi_username, '@', '')) = 'wain2020';
```

### 2. Clear Browser Data
In Pi Browser:
1. Go to Settings
2. Clear browser cache
3. Clear site data for droppay.space

### 3. Test Authentication Flow
1. Open https://droppay.space in Pi Browser
2. Click "Login with Pi"
3. Approve authentication
4. Check browser console (F12) for:
   - "Pi authentication successful: Wain2020"
   - "Creating/updating merchant for user: Wain2020"
   - "Merchant created successfully" or "Existing merchant found"

### 4. Verify Admin Access
After successful login:
- Go to `/admin/withdrawals` - should show admin panel
- Check if `merchant.is_admin = true` in browser console:
  ```javascript
  JSON.parse(localStorage.getItem('pi_user'))
  ```

### 5. Create Payment Link
1. Go to Dashboard → Links
2. Click "Create Link"
3. Fill in details
4. Should create successfully

## What Was Fixed

### AuthContext.tsx
✅ Improved merchant creation logic with better error handling  
✅ Added `is_admin` flag during merchant creation  
✅ Automatic admin detection for @Wain2020  
✅ Better logging for debugging  
✅ Ensures merchant is set even if update fails  

### Database
✅ Added `is_admin` column to merchants table  
✅ Auto-set @Wain2020 as admin  
✅ Added index for admin queries  

## Troubleshooting

### If merchant still not loading:
```sql
-- Check if merchant exists
SELECT * FROM merchants WHERE pi_username LIKE '%Wain2020%';

-- If not exists, check if RLS is blocking
SELECT * FROM merchants; -- Run as service role

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'merchants';
```

### If admin access denied:
```sql
-- Manually set admin
UPDATE merchants SET is_admin = TRUE WHERE pi_username = 'Wain2020';
UPDATE merchants SET is_admin = TRUE WHERE pi_username = '@Wain2020';
```

### If payment link creation fails:
1. Check browser console for errors
2. Verify merchant object exists: `console.log(merchant)`
3. Check Supabase dashboard for RLS policy errors

## Manual Merchant Creation (if needed)
```sql
-- Create merchant manually if auto-creation fails
INSERT INTO merchants (pi_user_id, pi_username, is_admin)
VALUES ('your_pi_uid_here', 'Wain2020', TRUE)
ON CONFLICT (pi_user_id) DO UPDATE SET is_admin = TRUE;
```

## Expected Flow After Fix
1. Pi authentication → creates/updates merchant
2. Merchant has is_admin = TRUE for @Wain2020
3. Admin routes accessible
4. Payment link creation works
5. Withdrawals show in admin panel
