#!/usr/bin/env pwsh
# Quick verification script for Pi Payment configuration

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PI PAYMENT CONFIGURATION CHECK" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check .env file
Write-Host "1. Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -like '*VITE_PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"*') {
        Write-Host "   Pi API Key: OK" -ForegroundColor Green
    } else {
        Write-Host "   Pi API Key: MISSING or WRONG" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($envContent -like '*VITE_PI_SANDBOX_MODE="false"*') {
        Write-Host "   Mainnet Mode: ENABLED" -ForegroundColor Green
    } else {
        Write-Host "   Mainnet Mode: DISABLED" -ForegroundColor Yellow
    }
    
    if ($envContent -like '*VITE_PI_PAYMENTS_ENABLED="true"*') {
        Write-Host "   Payments: ENABLED" -ForegroundColor Green
    } else {
        Write-Host "   Payments: DISABLED" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   .env file: NOT FOUND" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check Edge Functions
Write-Host "2. Checking Edge Functions..." -ForegroundColor Yellow
$functions = @("approve-payment", "complete-payment", "verify-payment")
foreach ($func in $functions) {
    $path = "supabase/functions/$func/index.ts"
    if (Test-Path $path) {
        Write-Host "   $func OK" -ForegroundColor Green
    } else {
        Write-Host "   $func MISSING" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Check Supabase CLI
Write-Host "3. Checking Supabase CLI..." -ForegroundColor Yellow
$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabase) {
    Write-Host "   Supabase CLI: INSTALLED" -ForegroundColor Green
    
    # Try to check if logged in
    $loginStatus = supabase projects list 2>&1
    if ($loginStatus -match "not logged in") {
        Write-Host "   Authentication: NOT LOGGED IN" -ForegroundColor Yellow
        Write-Host "   Run: supabase login" -ForegroundColor Gray
    } else {
        Write-Host "   Authentication: LOGGED IN" -ForegroundColor Green
    }
} else {
    Write-Host "   Supabase CLI: NOT INSTALLED" -ForegroundColor Red
    Write-Host "   Install: npm install -g supabase" -ForegroundColor Gray
    $allGood = $false
}

Write-Host ""

# Check if dev server is running
Write-Host "4. Checking Development Server..." -ForegroundColor Yellow
$viteProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
if ($viteProcess) {
    Write-Host "   Dev Server: RUNNING" -ForegroundColor Green
} else {
    Write-Host "   Dev Server: NOT RUNNING" -ForegroundColor Yellow
    Write-Host "   Start with: npm run dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "   STATUS: READY TO DEPLOY" -ForegroundColor Green
} else {
    Write-Host "   STATUS: CONFIGURATION ISSUES" -ForegroundColor Red
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. supabase login" -ForegroundColor White
    Write-Host "  2. supabase link --project-ref xoofailhzhfyebzpzrfs" -ForegroundColor White
    Write-Host "  3. supabase secrets set PI_API_KEY='a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq'" -ForegroundColor White
    Write-Host "  4. supabase functions deploy approve-payment --no-verify-jwt" -ForegroundColor White
    Write-Host "  5. supabase functions deploy complete-payment --no-verify-jwt" -ForegroundColor White
    Write-Host ""
    Write-Host "See EDGE_FUNCTIONS_DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "Fix the issues above before deploying" -ForegroundColor Red
}

Write-Host ""
