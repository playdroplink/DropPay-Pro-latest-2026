@echo off
echo =========================================
echo SUPABASE DATABASE FIX - MANUAL STEPS
echo =========================================
echo.
echo This will guide you through fixing all Supabase database issues.
echo.
echo Step 1: Open Supabase Dashboard
echo --------------------------------
start https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql
echo.
echo Step 2: Copy the SQL fix to clipboard
echo ------------------------------------
powershell -Command "Get-Content 'SUPABASE_COMPLETE_FIX.sql' | Set-Clipboard"
echo ✅ SQL fix copied to clipboard!
echo.
echo Step 3: Instructions
echo -------------------
echo 1. The Supabase SQL Editor should now be open in your browser
echo 2. Paste the SQL from your clipboard (Ctrl+V)
echo 3. Click "Run" button to execute all fixes
echo 4. Wait for completion (should show success messages)
echo.
echo Step 4: Test the fixes
echo ---------------------
echo After running the SQL:
echo 1. Refresh your DropPay application
echo 2. Try logging in with Pi Network
echo 3. Merchant profile should create successfully
echo 4. Payment links should work
echo 5. Admin features should be accessible
echo.
echo =========================================
echo WHAT THIS FIX DOES:
echo =========================================
echo ✅ Adds unique constraint on merchants.pi_user_id
echo ✅ Ensures is_admin column exists
echo ✅ Creates/updates all required tables
echo ✅ Sets up subscription plans
echo ✅ Disables RLS for testing
echo ✅ Sets Wain2020 as admin
echo ✅ Fixes all authentication issues
echo =========================================
echo.
pause