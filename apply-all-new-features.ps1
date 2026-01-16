# Apply Both Migrations - Checkout Links & Payment Links
# Adds cancel_redirect_url and checkout_image to both tables

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  New Features for All Links!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This applies new features to BOTH:" -ForegroundColor Yellow
Write-Host "  - Checkout Links" -ForegroundColor White
Write-Host "  - Payment Links" -ForegroundColor White
Write-Host ""

Write-Host "New Features:" -ForegroundColor Green
Write-Host "  1. Cancel Redirect URL" -ForegroundColor White
Write-Host "  2. Checkout Image Upload" -ForegroundColor White
Write-Host ""

# Check for SQL files
$checkoutSql = Join-Path $PSScriptRoot "ADD_CHECKOUT_CANCEL_AND_IMAGE.sql"
$paymentSql = Join-Path $PSScriptRoot "ADD_PAYMENT_LINK_CANCEL_AND_IMAGE.sql"

$filesFound = $true

if (-not (Test-Path $checkoutSql)) {
    Write-Host "ERROR: Checkout Links SQL file not found!" -ForegroundColor Red
    $filesFound = $false
}

if (-not (Test-Path $paymentSql)) {
    Write-Host "ERROR: Payment Links SQL file not found!" -ForegroundColor Red
    $filesFound = $false
}

if ($filesFound) {
    Write-Host "SQL Migration files found!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "=== MIGRATION 1: Checkout Links ===" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Get-Content $checkoutSql | ForEach-Object { Write-Host $_ -ForegroundColor White }
    Write-Host ""
    
    Write-Host "=== MIGRATION 2: Payment Links ===" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Get-Content $paymentSql | ForEach-Object { Write-Host $_ -ForegroundColor White }
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "To apply these migrations:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to Supabase Dashboard:" -ForegroundColor White
    Write-Host "   https://supabase.com/dashboard" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Go to SQL Editor (left sidebar)" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Click 'New Query'" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Copy & paste MIGRATION 1 (Checkout Links)" -ForegroundColor White
    Write-Host ""
    Write-Host "6. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
    Write-Host ""
    Write-Host "7. Create another 'New Query'" -ForegroundColor White
    Write-Host ""
    Write-Host "8. Copy & paste MIGRATION 2 (Payment Links)" -ForegroundColor White
    Write-Host ""
    Write-Host "9. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Storage Bucket Setup:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to Storage in Supabase Dashboard" -ForegroundColor White
    Write-Host ""
    Write-Host "2. If 'checkout-images' bucket doesn't exist:" -ForegroundColor White
    Write-Host "   - Click 'New Bucket'" -ForegroundColor Gray
    Write-Host "   - Name: checkout-images" -ForegroundColor Cyan
    Write-Host "   - Make it Public" -ForegroundColor Gray
    Write-Host "   - Click 'Create'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. If bucket already exists, you're all set!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After Setup:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "✓ Create Checkout Links with new features" -ForegroundColor Green
    Write-Host "✓ Create Payment Links with new features" -ForegroundColor Green
    Write-Host "✓ Upload images for better branding" -ForegroundColor Green
    Write-Host "✓ Set cancel redirect URLs" -ForegroundColor Green
    Write-Host ""
    Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
    Write-Host "  - PAYMENT_LINKS_NEW_FEATURES.md" -ForegroundColor Cyan
    Write-Host "  - NEW_CHECKOUT_FEATURES_GUIDE.md" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
