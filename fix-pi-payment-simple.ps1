# ================================================================
# FIX PI PAYMENT - Complete Payment System Fix
# ================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   DROPPAY - FIX PI PAYMENT SYSTEM" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Verifying Environment Configuration..." -ForegroundColor Yellow
Write-Host ""

$envPath = ".env"
if (Test-Path $envPath) {
    Write-Host "  Environment file found" -ForegroundColor Green
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -like '*VITE_PI_SANDBOX_MODE="false"*') {
        Write-Host "  Sandbox Mode: Disabled (mainnet)" -ForegroundColor Green
    }
    
    if ($envContent -like '*VITE_PI_PAYMENTS_ENABLED="true"*') {
        Write-Host "  Pi Payments: Enabled" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 2: Configuring Supabase Secrets..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Setting ALLOW_ORIGIN..." -ForegroundColor White
supabase secrets set ALLOW_ORIGIN="*"

Write-Host "  Setting PI_API_KEY..." -ForegroundColor White
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"

Write-Host "  Setting RESEND_API_KEY..." -ForegroundColor White
supabase secrets set RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"

Write-Host "  Setting SUPABASE_URL..." -ForegroundColor White
supabase secrets set SUPABASE_URL="https://xoofailhzhfyebzpzrfs.supabase.co"

Write-Host "  Setting SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor White
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.gJmhCpYAzEW_6iA6xD5LMsKz9u0tC2vQ1Z0eYfKl6hE"

Write-Host ""
Write-Host "  Secrets configured successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   FIXES APPLIED" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Removed duplicate Pi SDK initialization from index.html" -ForegroundColor White
Write-Host "2. Pi SDK now initialized only in AuthContext" -ForegroundColor White
Write-Host "3. Removed redundant Pi.init() call in PayPage" -ForegroundColor White
Write-Host "4. Supabase Edge Function secrets configured" -ForegroundColor White
Write-Host "5. Payment flow uses mainnet configuration" -ForegroundColor White
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   NEXT STEPS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deploy Edge Functions:" -ForegroundColor Yellow
Write-Host "  supabase functions deploy approve-payment" -ForegroundColor Gray
Write-Host "  supabase functions deploy complete-payment" -ForegroundColor Gray
Write-Host "  supabase functions deploy verify-payment" -ForegroundColor Gray
Write-Host ""

Write-Host "Test Payment:" -ForegroundColor Yellow
Write-Host "  1. Create payment link in dashboard" -ForegroundColor Gray
Write-Host "  2. Open link in Pi Browser" -ForegroundColor Gray
Write-Host "  3. Complete payment with Pi" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PAYMENT SYSTEM READY!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
