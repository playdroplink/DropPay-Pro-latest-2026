@echo off
REM ============================================================================
REM DROPPAY PROFILE SETUP FIX - QUICK FIX BATCH FILE
REM Fixes: Database constraint error (42P10)
REM ============================================================================

setlocal enabledelayedexpansion

color 0B
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║    DROPPAY PROFILE SETUP FIX - One-Click Database Fix        ║
echo ║  (Fixes: "there is no unique or exclusion constraint...")    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

REM Step 1: Copy SQL to clipboard
echo [STEP 1] Copying SQL fix to clipboard...
echo.
powershell -Command "Get-Content 'FINAL_PROFILE_FIX.sql' | Set-Clipboard"
if errorlevel 1 (
    color 0C
    echo ✗ ERROR: Could not read FINAL_PROFILE_FIX.sql
    echo.
    echo Make sure FINAL_PROFILE_FIX.sql exists in the current directory.
    echo.
    pause
    exit /b 1
)
echo ✓ SQL fix copied to clipboard!
echo.
echo.

REM Step 2: Open Supabase Dashboard
echo [STEP 2] Opening Supabase Dashboard in your browser...
echo.
echo URL: https://supabase.com/dashboard
start https://supabase.com/dashboard
echo ✓ Browser opened!
echo.
echo.

REM Step 3: Wait for user to be ready
timeout /t 3 /nobreak > nul

echo [STEP 3] Instructions - Follow these steps:
echo.
echo 1. ^ Click on your project in Supabase Dashboard
echo 2. ^ Click "SQL Editor" in the left sidebar
echo 3. ^ Click "+ New Query" button
echo 4. ^ Paste the SQL (Ctrl+V) - it's already copied to clipboard!
echo 5. ^ Click the blue "▶ Run" button
echo 6. ^ Wait for completion (should see ✅ success messages)
echo 7. ^ Return here and press any key
echo.
echo.

echo [STEP 4] What the fix does:
echo ✓ Adds UNIQUE constraint on merchants.pi_user_id
echo ✓ Fixes RLS policies for profile creation
echo ✓ Adds performance index
echo.
echo.

echo [STEP 5] Waiting for you to apply the SQL in Supabase...
echo.
pause

echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║ ✓ SQL APPLIED? Great! Now test your app:                    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 1. Refresh this app in your browser (Ctrl+F5)
echo 2. Sign out completely
echo 3. Sign in again with Pi Network
echo 4. Merchant profile should create without errors ✓
echo.
echo If you still get an error:
echo - Check: QUICK_TROUBLESHOOTING.md
echo - Check: PROFILE_SETUP_FIX_GUIDE.md
echo.
echo Need the SQL again? It's in: FINAL_PROFILE_FIX.sql
echo.

pause
