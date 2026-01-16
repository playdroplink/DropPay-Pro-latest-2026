#!/usr/bin/env pwsh
# =====================================================
# SET SUPABASE EDGE FUNCTION SECRETS
# =====================================================

Write-Host "`n🔐 SETTING SUPABASE SECRETS..." -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install: npm install -g supabase`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI found`n" -ForegroundColor Green

# Project configuration
$PROJECT_REF = "xoofailhzhfyebzpzrfs"

# Pi Network API Credentials (Mainnet)
$PI_API_KEY = "a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"
$PI_VALIDATION_KEY = "ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a"

# Supabase Configuration
$SUPABASE_URL = "https://xoofailhzhfyebzpzrfs.supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.gJmhCpYAzEW_6iA6xD5LMsKz9u0tC2vQ1Z0eYfKl6hE"

# Other secrets
$RESEND_API_KEY = "re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u"
$ALLOW_ORIGIN = "*"

Write-Host "📋 Secrets to set:" -ForegroundColor Yellow
Write-Host "   - PI_API_KEY (mainnet)" -ForegroundColor White
Write-Host "   - PI_VALIDATION_KEY" -ForegroundColor White
Write-Host "   - SUPABASE_URL" -ForegroundColor White
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "   - RESEND_API_KEY (for email notifications)" -ForegroundColor White
Write-Host "   - ALLOW_ORIGIN`n" -ForegroundColor White

# Ensure logged in
Write-Host "🔐 Checking Supabase login status..." -ForegroundColor Yellow
supabase projects list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Supabase" -ForegroundColor Red
    Write-Host "Run: supabase login`n" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Logged in to Supabase`n" -ForegroundColor Green

# Link to project
Write-Host "🔗 Linking to project $PROJECT_REF..." -ForegroundColor Yellow
try {
    supabase link --project-ref $PROJECT_REF 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Linked to project`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Already linked or connection issue`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Link warning (may already be linked)`n" -ForegroundColor Yellow
}

# Set secrets one by one
Write-Host "📝 Setting PI_API_KEY..." -ForegroundColor Yellow
supabase secrets set PI_API_KEY="$PI_API_KEY"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PI_API_KEY set`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set PI_API_KEY`n" -ForegroundColor Red
}

Write-Host "📝 Setting PI_VALIDATION_KEY..." -ForegroundColor Yellow
supabase secrets set PI_VALIDATION_KEY="$PI_VALIDATION_KEY"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PI_VALIDATION_KEY set`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set PI_VALIDATION_KEY`n" -ForegroundColor Red
}

Write-Host "📝 Setting SUPABASE_URL..." -ForegroundColor Yellow
supabase secrets set SUPABASE_URL="$SUPABASE_URL"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SUPABASE_URL set`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set SUPABASE_URL`n" -ForegroundColor Red
}

Write-Host "📝 Setting SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor Yellow
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SUPABASE_SERVICE_ROLE_KEY set`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set SUPABASE_SERVICE_ROLE_KEY`n" -ForegroundColor Red
}

Write-Host "📝 Setting RESEND_API_KEY..." -ForegroundColor Yellow
supabase secrets set RESEND_API_KEY="$RESEND_API_KEY"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ RESEND_API_KEY set`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set RESEND_API_KEY`n" -ForegroundColor Red
}

Write-Host "📝 Setting ALLOW_ORIGIN..." -ForegroundColor Yellow
supabase secrets set ALLOW_ORIGIN="$ALLOW_ORIGIN"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ALLOW_ORIGIN set`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set ALLOW_ORIGIN`n" -ForegroundColor Red
}

Write-Host "`n✅ ALL SECRETS SET!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

Write-Host "📋 Verify secrets with:" -ForegroundColor Cyan
Write-Host "   supabase secrets list`n" -ForegroundColor Gray

Write-Host "🚀 Next Step:" -ForegroundColor Yellow
Write-Host "   Run: .\deploy-edge-functions.ps1`n" -ForegroundColor White
