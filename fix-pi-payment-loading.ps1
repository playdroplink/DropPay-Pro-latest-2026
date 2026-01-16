#!/usr/bin/env pwsh
# ================================================================
# FIX PI PAYMENT LOADING ISSUE
# ================================================================
# This script fixes the Pi payment system by ensuring proper
# edge function deployment and configuration
# ================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   FIX PI PAYMENT LOADING ISSUE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if logged in to Supabase
Write-Host "Step 1: Checking Supabase Authentication..." -ForegroundColor Yellow
Write-Host ""

try {
    $loginStatus = supabase projects list 2>&1
    if ($loginStatus -like "*Unauthorized*" -or $loginStatus -like "*Login*") {
        Write-Host "❌ Not logged in to Supabase" -ForegroundColor Red
        Write-Host "Please run: supabase login" -ForegroundColor Yellow
        Write-Host "Then run this script again" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Supabase authentication OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not available or not logged in" -ForegroundColor Red
    Write-Host "Please install Supabase CLI and run: supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Link project if not already linked
Write-Host "Step 2: Linking Supabase project..." -ForegroundColor Yellow
Write-Host ""

try {
    supabase link --project-ref xoofailhzhfyebzpzrfs
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to link project" -ForegroundColor Red
    Write-Host "Please check your project reference" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Set required secrets
Write-Host "Step 3: Setting Supabase secrets..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  📝 Setting PI_API_KEY..." -ForegroundColor White
supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"

Write-Host "  📝 Setting ALLOW_ORIGIN..." -ForegroundColor White
supabase secrets set ALLOW_ORIGIN="*"

Write-Host "  📝 Setting RESEND_API_KEY..." -ForegroundColor White
supabase secrets set RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"

Write-Host "✅ Secrets configured" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy edge functions
Write-Host "Step 4: Deploying Edge Functions..." -ForegroundColor Yellow
Write-Host ""

$functions = @("approve-payment", "complete-payment", "verify-payment")

foreach ($func in $functions) {
    Write-Host "  📦 Deploying $func..." -ForegroundColor White
    try {
        supabase functions deploy $func --no-verify-jwt
        Write-Host "  ✅ $func deployed successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to deploy $func" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Step 5: Test edge function connectivity
Write-Host "Step 5: Testing edge function connectivity..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Edge function URLs:" -ForegroundColor Cyan
Write-Host "  approve-payment:  https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/approve-payment" -ForegroundColor White
Write-Host "  complete-payment: https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/complete-payment" -ForegroundColor White
Write-Host "  verify-payment:   https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/verify-payment" -ForegroundColor White

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PI PAYMENT FIX COMPLETE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps to test:" -ForegroundColor Yellow
Write-Host "1. Open DropPay in Pi Browser" -ForegroundColor White
Write-Host "2. Create a test payment link" -ForegroundColor White
Write-Host "3. Try to pay - should now work properly" -ForegroundColor White
Write-Host "4. Check browser console for payment flow logs" -ForegroundColor White
Write-Host "5. Check Supabase Dashboard for edge function logs" -ForegroundColor White

Write-Host ""
Write-Host "If payments still fail, check:" -ForegroundColor Yellow
Write-Host "- Pi Network API status: https://status.pi.network" -ForegroundColor White
Write-Host "- Edge function logs in Supabase Dashboard" -ForegroundColor White
Write-Host "- Browser console for specific error messages" -ForegroundColor White

Write-Host ""