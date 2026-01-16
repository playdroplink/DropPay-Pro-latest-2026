#!/usr/bin/env pwsh
# ========================================
# APPLY RLS POLICY FIXES
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   APPLYING RLS POLICY FIXES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will fix:" -ForegroundColor Yellow
Write-Host "  1. File upload RLS policies" -ForegroundColor White
Write-Host "  2. Merchant profile access" -ForegroundColor White
Write-Host "  3. Payment link creation" -ForegroundColor White
Write-Host "  4. Storage bucket configuration" -ForegroundColor White
Write-Host ""

# Check if Supabase CLI is available
$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabase) {
    Write-Host "Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "Checking authentication..." -ForegroundColor Yellow
$projectStatus = supabase projects list 2>&1
if ($projectStatus -match "not logged in") {
    Write-Host "Not logged in. Running login..." -ForegroundColor Yellow
    supabase login
}

Write-Host ""
Write-Host "Applying RLS fixes..." -ForegroundColor Yellow
Write-Host ""

# Apply the SQL script
Write-Host "Executing FIX_RLS_POLICIES.sql..." -ForegroundColor White
$sqlContent = Get-Content "FIX_RLS_POLICIES.sql" -Raw

# Execute via Supabase CLI
supabase db execute --file "FIX_RLS_POLICIES.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   RLS POLICIES FIXED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Fixed Issues:" -ForegroundColor Green
    Write-Host "  File uploads now work" -ForegroundColor White
    Write-Host "  Merchant profiles accessible" -ForegroundColor White
    Write-Host "  Payment links can be created" -ForegroundColor White
    Write-Host "  Storage bucket configured" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Refresh your browser" -ForegroundColor White
    Write-Host "  2. Try creating a payment link with a file" -ForegroundColor White
    Write-Host "  3. Watch ads should now work" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Failed to apply fixes!" -ForegroundColor Red
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "  1. Open Supabase Dashboard > SQL Editor" -ForegroundColor White
    Write-Host "  2. Paste contents of FIX_RLS_POLICIES.sql" -ForegroundColor White
    Write-Host "  3. Run the query" -ForegroundColor White
    Write-Host ""
}
