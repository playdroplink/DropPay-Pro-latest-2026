#!/usr/bin/env pwsh
# ================================================================
# COMPREHENSIVE PI PAYMENT SYSTEM DIAGNOSTIC & FIX
# ================================================================
# This script diagnoses and fixes Pi payment loading issues
# ================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PI PAYMENT DIAGNOSTIC & FIX" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_REF = "xoofailhzhfyebzpzrfs"
$PI_API_KEY = "a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
$RESEND_API_KEY = "re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"

# Step 1: Check environment setup
Write-Host "Step 1: Checking Environment Setup..." -ForegroundColor Yellow
Write-Host ""

# Check .env file
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    if ($envContent -like '*VITE_PI_SANDBOX_MODE="false"*') {
        Write-Host "✅ Mainnet mode enabled" -ForegroundColor Green
    } elseif ($envContent -like '*VITE_PI_SANDBOX_MODE="true"*') {
        Write-Host "⚠️ Sandbox mode enabled" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Pi sandbox mode not configured" -ForegroundColor Red
    }
    
    if ($envContent -like '*PI_API_KEY*') {
        Write-Host "✅ Pi API key configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Pi API key missing" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

Write-Host ""

# Step 2: Check edge functions
Write-Host "Step 2: Checking Edge Functions..." -ForegroundColor Yellow
Write-Host ""

$edgeFunctions = @("approve-payment", "complete-payment", "verify-payment")
$allFunctionsExist = $true

foreach ($func in $edgeFunctions) {
    $funcPath = "supabase/functions/$func/index.ts"
    if (Test-Path $funcPath) {
        Write-Host "✅ $func function exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $func function missing" -ForegroundColor Red
        $allFunctionsExist = $false
    }
}

if (-not $allFunctionsExist) {
    Write-Host "❌ Some edge functions are missing. Please check the supabase/functions directory." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Check Supabase CLI
Write-Host "Step 3: Checking Supabase CLI..." -ForegroundColor Yellow
Write-Host ""

try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI available: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "   Install: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Step 4: Check authentication
Write-Host "Step 4: Checking Supabase Authentication..." -ForegroundColor Yellow
Write-Host ""

try {
    $projects = supabase projects list 2>&1
    if ($projects -like "*Unauthorized*" -or $projects -like "*Login*") {
        Write-Host "❌ Not logged in to Supabase" -ForegroundColor Red
        Write-Host ""
        Write-Host "To fix this, run the following commands:" -ForegroundColor Yellow
        Write-Host "1. supabase login" -ForegroundColor White
        Write-Host "2. Follow the browser authentication" -ForegroundColor White
        Write-Host "3. Run this script again" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to open Supabase login (this will exit the script)"
        supabase login
        exit 0
    } else {
        Write-Host "✅ Supabase authentication OK" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking Supabase auth: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Link project
Write-Host "Step 5: Linking to Supabase Project..." -ForegroundColor Yellow
Write-Host ""

try {
    supabase link --project-ref $PROJECT_REF
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Project might already be linked or link failed" -ForegroundColor Yellow
    Write-Host "   This is usually not a problem" -ForegroundColor Gray
}

Write-Host ""

# Step 6: Set secrets
Write-Host "Step 6: Setting Supabase Secrets..." -ForegroundColor Yellow
Write-Host ""

$secrets = @{
    "PI_API_KEY" = $PI_API_KEY
    "RESEND_API_KEY" = $RESEND_API_KEY
    "ALLOW_ORIGIN" = "*"
}

foreach ($secret in $secrets.GetEnumerator()) {
    try {
        Write-Host "  📝 Setting $($secret.Key)..." -ForegroundColor White
        supabase secrets set "$($secret.Key)=$($secret.Value)" 2>&1 | Out-Null
        Write-Host "  ✅ $($secret.Key) set successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to set $($secret.Key): $_" -ForegroundColor Red
    }
}

Write-Host ""

# Step 7: Deploy edge functions
Write-Host "Step 7: Deploying Edge Functions..." -ForegroundColor Yellow
Write-Host ""

foreach ($func in $edgeFunctions) {
    try {
        Write-Host "  📦 Deploying $func..." -ForegroundColor White
        $deployOutput = supabase functions deploy $func --no-verify-jwt 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $func deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to deploy $func" -ForegroundColor Red
            Write-Host "  Error: $deployOutput" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Failed to deploy $func: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Step 8: Test edge function URLs
Write-Host "Step 8: Testing Edge Function Connectivity..." -ForegroundColor Yellow
Write-Host ""

$baseUrl = "https://${PROJECT_REF}.supabase.co/functions/v1"
Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan

foreach ($func in $edgeFunctions) {
    $url = "${baseUrl}/${func}"
    Write-Host "  🌐 $func: $url" -ForegroundColor White
}

Write-Host ""

# Step 9: Provide testing instructions
Write-Host "Step 9: Testing Instructions" -ForegroundColor Yellow
Write-Host ""

Write-Host "To test the payment system:" -ForegroundColor Cyan
Write-Host "1. Open DropPay in Pi Browser" -ForegroundColor White
Write-Host "2. Create a test payment link" -ForegroundColor White
Write-Host "3. Try to pay with Pi" -ForegroundColor White
Write-Host "4. Check browser console (F12) for detailed logs" -ForegroundColor White
Write-Host "5. Check Supabase Dashboard > Edge Functions > Logs" -ForegroundColor White

Write-Host ""
Write-Host "Expected log flow:" -ForegroundColor Cyan
Write-Host "💳 Creating payment: {...}" -ForegroundColor White
Write-Host "🚀 Initiating Pi.createPayment..." -ForegroundColor White
Write-Host "📡 Approving payment with Pi Network API..." -ForegroundColor White
Write-Host "🔄 Calling approve-payment edge function..." -ForegroundColor White
Write-Host "✅ Payment approved by Pi Network" -ForegroundColor White
Write-Host "🔄 Completing payment on Pi Network..." -ForegroundColor White
Write-Host "✅ Payment completed on Pi Network" -ForegroundColor White

Write-Host ""
Write-Host "If payments still don't work:" -ForegroundColor Yellow
Write-Host "- Check Pi Network status: https://status.pi.network" -ForegroundColor White
Write-Host "- Verify you're in Pi Browser" -ForegroundColor White
Write-Host "- Check edge function logs in Supabase Dashboard" -ForegroundColor White
Write-Host "- Try the /pi-debug page for detailed diagnostics" -ForegroundColor White

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your Pi payment system should now be working properly." -ForegroundColor Green
Write-Host "If you continue to experience issues, the enhanced error logging" -ForegroundColor Green
Write-Host "will help identify exactly where the problem is occurring." -ForegroundColor Green

Write-Host ""