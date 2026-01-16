#!/usr/bin/env pwsh
# Deploy Enhanced Edge Functions to Supabase

Write-Host "`n🚀 DEPLOYING EDGE FUNCTIONS..." -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install: npm install -g supabase`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green

# Ensure logged in
Write-Host "`n🔐 Checking Supabase login status..." -ForegroundColor Yellow
supabase projects list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Supabase" -ForegroundColor Red
    Write-Host "Run: supabase login`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Logged in to Supabase" -ForegroundColor Green

# Link to project
Write-Host "`n🔗 Linking to project..." -ForegroundColor Yellow
$PROJECT_REF = "xoofailhzhfyebzpzrfs"

try {
    supabase link --project-ref $PROJECT_REF 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Linked to project: $PROJECT_REF" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Already linked or connection issue" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Link warning (may already be linked)" -ForegroundColor Yellow
}

# Deploy approve-payment function
Write-Host "`n📦 Deploying approve-payment function..." -ForegroundColor Yellow
try {
    supabase functions deploy approve-payment --no-verify-jwt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ approve-payment deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to deploy approve-payment" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error deploying approve-payment: $_" -ForegroundColor Red
}

# Deploy complete-payment function
Write-Host "`n📦 Deploying complete-payment function..." -ForegroundColor Yellow
try {
    supabase functions deploy complete-payment --no-verify-jwt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ complete-payment deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to deploy complete-payment" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error deploying complete-payment: $_" -ForegroundColor Red
}

# Deploy verify-payment function
Write-Host "`n📦 Deploying verify-payment function..." -ForegroundColor Yellow
try {
    supabase functions deploy verify-payment --no-verify-jwt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ verify-payment deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to deploy verify-payment" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error deploying verify-payment: $_" -ForegroundColor Red
}

# Set secrets (if needed)
Write-Host "`n🔑 Edge function secrets configuration:" -ForegroundColor Yellow
Write-Host "Secrets should already be set. To update, run:" -ForegroundColor White
Write-Host ".\set-supabase-secrets.ps1`n" -ForegroundColor Gray

Write-Host "Or set manually:" -ForegroundColor White
Write-Host "supabase secrets set PI_API_KEY=a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq" -ForegroundColor Gray
Write-Host "supabase secrets set PI_VALIDATION_KEY=ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a" -ForegroundColor Gray
Write-Host "supabase secrets set ALLOW_ORIGIN=*" -ForegroundColor Gray

Write-Host ""
Write-Host "DEPLOYMENT PROCESS COMPLETE!" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test payment flow in Pi Browser" -ForegroundColor White
Write-Host "2. Check function logs: supabase functions list" -ForegroundColor White
Write-Host "3. Monitor edge function logs in Supabase Dashboard" -ForegroundColor White
Write-Host ""
