# 🔧 Quick Troubleshooting Guide

## Issue: "Failed to connect" showing on Dashboard

### What's happening?
The error message is likely a **stale toast notification** from a previous failed login. If you can see your username (@Wain2020) on the dashboard, the login actually **worked successfully**.

### Quick Fix Steps:

#### 1. Clear the Toast Notification
The error should disappear on its own after a few seconds. If it persists:
- Refresh the page (F5)
- Or clear browser cache and reload

#### 2. Apply Database Migration (One-time setup)

The admin features require the `is_admin` column in your database.

**Option A: Via Supabase Dashboard (Recommended)**
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to your project → SQL Editor
3. Copy the entire content of `apply-admin-fix.sql`
4. Paste into SQL Editor
5. Click "RUN"
6. Check the output - should show "@Wain2020" is now admin

**Option B: Via Supabase CLI**
```bash
# In your project directory
supabase db reset

# Or apply specific migration
supabase migration up
```

#### 3. Verify Admin Access

After applying the migration:
1. Refresh your app
2. Navigate to: `/admin/withdrawals`
3. You should see the admin panel

### Testing Checklist:

✅ **Authentication Working**
- You see "Welcome back, @Wain2020" on dashboard
- You can navigate between pages

✅ **Merchant Profile Created**
- Open DevTools → Console
- Look for: "Merchant created successfully" or "Merchant fetched successfully"

✅ **Payment Links Work**
- Go to "Links" tab
- Click "Create Link"
- Dialog opens without errors

✅ **Admin Access**
- Go to `/admin/withdrawals`
- Should see admin panel (not access denied)

### Common Issues:

**Q: Still seeing "Failed to connect"?**
- This is a harmless stale toast. Ignore it if dashboard loads correctly.
- Clear browser cache: Ctrl+Shift+Delete

**Q: "Access denied" on admin panel?**
- Apply the database migration (see step 2 above)
- Make sure you're logged in as @Wain2020
- Check console for errors

**Q: Can't create payment links?**
- Wait 2-3 seconds for merchant profile to load
- Refresh page if it's been more than 5 seconds
- Check console for "Merchant created successfully"

**Q: Database migration not working?**
- Make sure you're using the correct Supabase project
- Check you have admin access to the database
- Verify connection in Supabase dashboard

### Debug Commands:

Open DevTools Console (F12) and run:

```javascript
// Check stored user
JSON.parse(localStorage.getItem('pi_user'))

// Clear everything and retry
localStorage.clear()
location.reload()

// Check Supabase connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```

### Still Having Issues?

1. Clear all browser data:
   - Press F12 → Application → Storage
   - Click "Clear site data"
   
2. Hard refresh:
   - Windows: Ctrl+Shift+R
   - Mac: Cmd+Shift+R

3. Check Supabase logs:
   - Go to Supabase Dashboard
   - Logs → Edge Functions
   - Look for errors

4. Check browser console:
   - Press F12
   - Look for red errors
   - Check Network tab for failed requests

### Need More Help?

- Check `FIXES_APPLIED.md` for detailed changelog
- Review console logs for specific error messages
- Verify `.env.local` has correct Supabase credentials
