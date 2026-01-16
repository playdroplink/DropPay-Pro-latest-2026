@echo off
REM ========================================
REM QUICK SETUP SCRIPT - Transaction Notifications (Windows)
REM Run this script to complete the setup
REM ========================================

echo.
echo 0x94 Setting up Transaction Notification Bell...
echo.

REM Step 1: Check for required files
echo ^+^+ Step 1: Checking files...
if exist "CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql" (
    echo    Found CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql
) else (
    echo    ERROR: Missing CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql
    exit /b 1
)

if exist "supabase\functions\complete-payment\index.ts" (
    echo    Found complete-payment function
) else (
    echo    ERROR: Missing complete-payment function
    exit /b 1
)

if exist "src\components\dashboard\NotificationBell.tsx" (
    echo    Found NotificationBell component
) else (
    echo    ERROR: Missing NotificationBell component
    exit /b 1
)

echo.
echo ^+^+ Step 2: Install dependencies (if needed)...
if exist "package.json" (
    if exist "node_modules" (
        echo    Dependencies already installed
    ) else (
        echo    Installing npm packages...
        call npm install
    )
) else (
    echo    WARNING: package.json not found, skipping npm install
)

echo.
echo ^+^+ Step 3: Deploy Supabase functions...
echo.
echo    Option A - Using CLI:
echo    ^> supabase functions deploy complete-payment
echo.
echo    Option B - Using git:
echo    ^> git add .
echo    ^> git commit -m "feat: Add transaction notification system"
echo    ^> git push origin main
echo.

echo.
echo ^+^+ Step 4: Apply Database Trigger (IMPORTANT!)
echo.
echo    You MUST run this SQL in Supabase Dashboard ^> SQL Editor:
echo    ────────────────────────────────────────────────────────
type CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql
echo.
echo    ────────────────────────────────────────────────────────
echo.

echo.
echo ^+^+ All files are in place!
echo.
echo    Next Steps:
echo    1. Deploy the edge function:
echo       supabase functions deploy complete-payment
echo.
echo    2. Copy CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql
echo    3. Open Supabase Dashboard ^> SQL Editor
echo    4. Paste and run the SQL script
echo.
echo    5. Verify setup - Run this SQL query:
echo       SELECT COUNT(*) FROM information_schema.triggers
echo       WHERE trigger_name = 'transaction_notification_trigger'^;
echo.
echo    🎉 Once done, notifications will appear in real-time!
echo.

pause
