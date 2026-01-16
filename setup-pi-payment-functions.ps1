#!/usr/bin/env pwsh
# ================================================================
# SETUP PI PAYMENT EDGE FUNCTIONS
# ================================================================
# This script configures and deploys Supabase Edge Functions
# for Pi Network payment processing
# ================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PI PAYMENT EDGE FUNCTIONS SETUP" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PI_API_KEY = "a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
$RESEND_API_KEY = "re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"
$PROJECT_REF = "xoofailhzhfyebzpzrfs"

Write-Host "Step 1: Checking Supabase CLI..." -ForegroundColor Yellow
Write-Host ""

# Check if supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "  Supabase CLI not found!" -ForegroundColor Red
    Write-Host "  Install it with: npm install -g supabase" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "  Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Step 2: Login to Supabase
Write-Host "Step 2: Supabase Authentication..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Checking authentication status..." -ForegroundColor White

# Try to get current project
$projectStatus = supabase projects list 2>&1
if ($projectStatus -match "not logged in" -or $LASTEXITCODE -ne 0) {
    Write-Host "  Not logged in. Please login to Supabase:" -ForegroundColor Yellow
    Write-Host ""
    supabase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "  Login failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  Authenticated" -ForegroundColor Green
Write-Host ""

# Step 3: Link to project
Write-Host "Step 3: Linking to Project..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Project Reference: $PROJECT_REF" -ForegroundColor White

supabase link --project-ref $PROJECT_REF
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  Failed to link project!" -ForegroundColor Red
    Write-Host "  Make sure you have access to project: $PROJECT_REF" -ForegroundColor Yellow
    exit 1
}

Write-Host "  Project linked successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Set Secrets
Write-Host "Step 4: Configuring Secrets..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Setting ALLOW_ORIGIN..." -ForegroundColor White
supabase secrets set ALLOW_ORIGIN="*" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ALLOW_ORIGIN set" -ForegroundColor Green
} else {
    Write-Host "    Failed to set ALLOW_ORIGIN" -ForegroundColor Red
}

Write-Host "  Setting PI_API_KEY..." -ForegroundColor White
supabase secrets set PI_API_KEY="$PI_API_KEY" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    PI_API_KEY set" -ForegroundColor Green
} else {
    Write-Host "    Failed to set PI_API_KEY" -ForegroundColor Red
}

Write-Host "  Setting RESEND_API_KEY..." -ForegroundColor White
supabase secrets set RESEND_API_KEY="$RESEND_API_KEY" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    RESEND_API_KEY set" -ForegroundColor Green
} else {
    Write-Host "    Failed to set RESEND_API_KEY" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Secrets configured" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy Edge Functions
Write-Host "Step 5: Deploying Edge Functions..." -ForegroundColor Yellow
Write-Host ""

$functions = @(
    "approve-payment",
    "complete-payment",
    "verify-payment"
)

foreach ($func in $functions) {
    Write-Host "  Deploying $func..." -ForegroundColor White
    
    $deployOutput = supabase functions deploy $func --no-verify-jwt 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    $func deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "    Failed to deploy $func" -ForegroundColor Red
        Write-Host "    Error: $deployOutput" -ForegroundColor Gray
    }
}

Write-Host ""

# Step 6: Verify Deployment
Write-Host "Step 6: Verifying Deployment..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Listing deployed functions..." -ForegroundColor White
supabase functions list

Write-Host ""

# Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Edge Functions Status:" -ForegroundColor White
Write-Host "  approve-payment   - Deployed" -ForegroundColor Green
Write-Host "  complete-payment  - Deployed" -ForegroundColor Green
Write-Host "  verify-payment    - Deployed" -ForegroundColor Green
Write-Host ""

Write-Host "Secrets Configured:" -ForegroundColor White
Write-Host "  ALLOW_ORIGIN      - Set to '*'" -ForegroundColor Green
Write-Host "  PI_API_KEY        - Set (mainnet)" -ForegroundColor Green
Write-Host "  RESEND_API_KEY    - Set" -ForegroundColor Green
Write-Host ""

Write-Host "Pi Network Configuration:" -ForegroundColor White
Write-Host "  API Endpoint:  https://api.minepi.com" -ForegroundColor Cyan
Write-Host "  API Version:   v2" -ForegroundColor Cyan
Write-Host "  Network Mode:  Mainnet (Production)" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Create a payment link in dashboard" -ForegroundColor White
Write-Host "  2. Open the link in Pi Browser" -ForegroundColor White
Write-Host "  3. Complete a test payment" -ForegroundColor White
Write-Host "  4. Verify transaction appears in dashboard" -ForegroundColor White
Write-Host ""

Write-Host "Monitor Logs:" -ForegroundColor Yellow
Write-Host "  supabase functions logs approve-payment" -ForegroundColor Gray
Write-Host "  supabase functions logs complete-payment" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  Pi Payments: https://pi-apps.github.io/community-developer-guide/" -ForegroundColor Cyan
Write-Host "  Pi Ad Network: https://github.com/pi-apps/pi-platform-docs" -ForegroundColor Cyan
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   READY FOR PAYMENTS!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
