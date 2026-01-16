@echo off
echo =========================================
echo FIX REALTIME PUBLICATION ERROR
echo =========================================
echo.
echo Error: cannot add relation "revenue_audit" to publication
echo DETAIL: This operation is not supported for views.
echo.
echo This script will fix the realtime publication error.
echo.
echo Step 1: Open Supabase Dashboard
echo --------------------------------
start https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql
echo.
echo Step 2: Copy the SQL fix to clipboard
echo ------------------------------------
powershell -Command "Get-Content 'FIX_REALTIME_PUBLICATION_ERROR.sql' | Set-Clipboard"
echo ✅ SQL fix copied to clipboard!
echo.
echo Step 3: Instructions
echo -------------------
echo 1. The Supabase SQL Editor should now be open in your browser
echo 2. Paste the SQL from your clipboard (Ctrl+V)
echo 3. Click "Run" button to execute the fix
echo 4. Wait for completion (should show success messages)
echo.
echo =========================================
echo WHAT THIS FIX DOES:
echo =========================================
echo ✅ Removes views from realtime publication
echo ✅ Adds proper tables to realtime publication
echo ✅ Converts revenue_audit to materialized view
echo ✅ Adds auto-refresh triggers
echo ✅ Fixes the publication error
echo.
echo =========================================
echo TECHNICAL DETAILS:
echo =========================================
echo • Views cannot be added to realtime publications
echo • Only tables and materialized views are supported
echo • Materialized views provide cached data with better performance
echo • Auto-refresh triggers keep the data up-to-date
echo.
pause