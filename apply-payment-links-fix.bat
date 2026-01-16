@echo off
REM =========================================
REM Quick Fix Script for Payment Links RLS
REM =========================================
REM This script provides instructions for applying the RLS fix

echo.
echo ========================================
echo DropPay Payment Links RLS Fix
echo ========================================
echo.
echo This script will help you fix the two issues:
echo   1. Checkout link creation RLS error
echo   2. Subscription link creation failure
echo.
echo Prerequisites:
echo   - Access to Supabase dashboard
echo   - SQL editor permission
echo.

REM Option 1: Show the SQL to run
echo.
echo Option 1: Manual Fix (Recommended)
echo ====================================
echo.
echo 1. Go to your Supabase project dashboard
echo 2. Navigate to SQL Editor
echo 3. Copy and paste the contents of:
echo    FIX_PAYMENT_LINKS_RLS.sql
echo 4. Click "Run"
echo 5. Verify success (no error messages)
echo.

REM Option 2: Using CLI
echo Option 2: Using Supabase CLI
echo =============================
echo.
echo 1. Make sure supabase CLI is installed
echo 2. Run: supabase db push
echo 3. The migration will be applied automatically
echo.

REM Show what was fixed
echo What Gets Fixed:
echo ================
echo.
echo File: FIX_PAYMENT_LINKS_RLS.sql
echo   - Enables RLS on payment_links table
echo   - Adds proper INSERT WITH CHECK policy
echo   - Adds proper UPDATE policy
echo   - Adds proper DELETE policy
echo   - Ensures SELECT policy for public viewing
echo.
echo File: supabase\migrations\20260109_fix_payment_links_rls_policies.sql
echo   - Migration version for version control
echo   - Can be pushed via Supabase CLI
echo.

REM Test instructions
echo How to Test:
echo =============
echo.
echo Test 1: Create a checkout payment link
echo   1. Log in to dashboard
echo   2. Go to Links
echo   3. Click "Create Link"
echo   4. Fill in product details
echo   5. Click "Create Link"
echo   - Expected: Link created successfully
echo   - Previous error: "new row violates row-level security policy"
echo.
echo Test 2: Create a subscription payment link
echo   1. Log in to dashboard
echo   2. Go to Subscription
echo   3. Click "Subscribe" on any plan
echo   - Expected: Redirects to payment page
echo   - Previous errors: "Failed to create subscription link"
echo.

pause
