# =========================================
# Quick Fix Script for Payment Links RLS
# =========================================
# Fixes both payment link creation issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DropPay Payment Links RLS Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Issues Fixed:" -ForegroundColor Yellow
Write-Host "  1. Checkout link: 'new row violates row-level security policy'" -ForegroundColor White
Write-Host "  2. Subscription: 'Failed to create subscription link'" -ForegroundColor White
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  ✓ Access to Supabase dashboard" -ForegroundColor White
Write-Host "  ✓ SQL editor permission" -ForegroundColor White
Write-Host "  ✓ Admin access to the database" -ForegroundColor White
Write-Host ""

Write-Host "Files Created:" -ForegroundColor Yellow
Write-Host "  ✓ FIX_PAYMENT_LINKS_RLS.sql" -ForegroundColor Green
Write-Host "  ✓ supabase\migrations\20260109_fix_payment_links_rls_policies.sql" -ForegroundColor Green
Write-Host "  ✓ PAYMENT_LINKS_FIX_GUIDE.md" -ForegroundColor Green
Write-Host ""

Write-Host "==== METHOD 1: Using Supabase Dashboard ====" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open your Supabase project dashboard" -ForegroundColor White
Write-Host "2. Go to: SQL Editor" -ForegroundColor White
Write-Host "3. Copy contents of: FIX_PAYMENT_LINKS_RLS.sql" -ForegroundColor White
Write-Host "4. Paste into the SQL editor" -ForegroundColor White
Write-Host "5. Click: Run" -ForegroundColor White
Write-Host "6. Verify: No error messages appear" -ForegroundColor White
Write-Host ""

Write-Host "==== METHOD 2: Using Supabase CLI ====" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ensure supabase CLI is installed:" -ForegroundColor White
Write-Host "   npm install -g supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Link your project (if not already linked):" -ForegroundColor White
Write-Host "   supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push the migrations:" -ForegroundColor White
Write-Host "   supabase db push" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verify: Migrations applied successfully" -ForegroundColor White
Write-Host ""

Write-Host "==== WHAT GETS FIXED ====" -ForegroundColor Cyan
Write-Host ""
Write-Host "The SQL migration will:" -ForegroundColor Yellow
Write-Host "  ✓ Drop old overly-permissive RLS policy" -ForegroundColor White
Write-Host "  ✓ Enable RLS on payment_links table" -ForegroundColor White
Write-Host "  ✓ Add proper INSERT WITH CHECK policy" -ForegroundColor White
Write-Host "  ✓ Add proper UPDATE policy for merchants" -ForegroundColor White
Write-Host "  ✓ Add proper DELETE policy for merchants" -ForegroundColor White
Write-Host "  ✓ Keep SELECT policy for public viewing" -ForegroundColor White
Write-Host ""

Write-Host "==== HOW TO TEST ====" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test 1: Checkout Link Creation" -ForegroundColor Yellow
Write-Host "  1. Log in to your dashboard" -ForegroundColor White
Write-Host "  2. Navigate to: Links section" -ForegroundColor White
Write-Host "  3. Click: Create Link" -ForegroundColor White
Write-Host "  4. Fill in product details" -ForegroundColor White
Write-Host "  5. Click: Create Link button" -ForegroundColor White
Write-Host "  ✓ Expected: Link created successfully" -ForegroundColor Green
Write-Host "  ✗ Previous: 'new row violates row-level security policy'" -ForegroundColor Red
Write-Host ""

Write-Host "Test 2: Subscription Payment Link" -ForegroundColor Yellow
Write-Host "  1. Log in to your dashboard" -ForegroundColor White
Write-Host "  2. Navigate to: Subscription" -ForegroundColor White
Write-Host "  3. Click: Subscribe on any plan" -ForegroundColor White
Write-Host "  ✓ Expected: Redirects to payment page" -ForegroundColor Green
Write-Host "  ✗ Previous: 'Failed to create subscription link'" -ForegroundColor Red
Write-Host ""

Write-Host "==== VERIFY THE FIX ====" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run this query in SQL Editor to verify:" -ForegroundColor Yellow
Write-Host ""
Write-Host "SELECT * FROM pg_policies" -ForegroundColor Gray
Write-Host "WHERE tablename = 'payment_links'" -ForegroundColor Gray
Write-Host "ORDER BY policyname;" -ForegroundColor Gray
Write-Host ""
Write-Host "You should see:" -ForegroundColor White
Write-Host "  ✓ Merchants can insert their own payment links" -ForegroundColor Green
Write-Host "  ✓ Merchants can update their own payment links" -ForegroundColor Green
Write-Host "  ✓ Merchants can delete their own payment links" -ForegroundColor Green
Write-Host "  ✓ Payment links view policy" -ForegroundColor Green
Write-Host ""

Write-Host "==== ROLLBACK (if needed) ====" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you need to rollback to the old setup:" -ForegroundColor Yellow
Write-Host ""
Write-Host "ALTER TABLE payment_links DISABLE ROW LEVEL SECURITY;" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: Disabling RLS is less secure. The fix is recommended." -ForegroundColor Yellow
Write-Host ""

Write-Host "For more details, see: PAYMENT_LINKS_FIX_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
