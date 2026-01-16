# Apply Checkout Template Migration
# Run this script to add the checkout_template column to your Supabase database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Add Checkout Template Column" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This migration adds the 'checkout_template' column to the payment_links table." -ForegroundColor Yellow
Write-Host ""

# Read the SQL file
$sqlFile = Join-Path $PSScriptRoot "supabase\migrations\20251231_add_checkout_template.sql"

if (Test-Path $sqlFile) {
    Write-Host "SQL Migration file found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Migration SQL:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Get-Content $sqlFile | ForEach-Object { Write-Host $_ -ForegroundColor White }
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To apply this migration:" -ForegroundColor Yellow
    Write-Host "1. Go to your Supabase Dashboard (https://supabase.com/dashboard)" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Go to SQL Editor" -ForegroundColor White
    Write-Host "4. Copy and paste the SQL above" -ForegroundColor White
    Write-Host "5. Click 'Run'" -ForegroundColor White
    Write-Host ""
    Write-Host "OR run via Supabase CLI:" -ForegroundColor Yellow
    Write-Host "  supabase db push" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Error: Migration file not found at $sqlFile" -ForegroundColor Red
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
