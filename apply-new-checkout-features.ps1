# Apply Checkout Links New Features Migration
# Adds cancel_redirect_url and checkout_image columns

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Checkout Links - New Features" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This migration adds:" -ForegroundColor Yellow
Write-Host "  1. cancel_redirect_url - Redirect when payment fails" -ForegroundColor White
Write-Host "  2. checkout_image - Optional image for checkout page" -ForegroundColor White
Write-Host ""

# Read the SQL file
$sqlFile = Join-Path $PSScriptRoot "ADD_CHECKOUT_CANCEL_AND_IMAGE.sql"

if (Test-Path $sqlFile) {
    Write-Host "SQL Migration file found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Migration SQL:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Get-Content $sqlFile | ForEach-Object { Write-Host $_ -ForegroundColor White }
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To apply this migration:" -ForegroundColor Yellow
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
    Write-Host "5. Copy ALL the SQL above" -ForegroundColor White
    Write-Host ""
    Write-Host "6. Paste into SQL Editor" -ForegroundColor White
    Write-Host ""
    Write-Host "7. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
    Write-Host ""
    Write-Host "8. Wait for success message" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Create Storage Bucket:" -ForegroundColor White
    Write-Host "   - Go to Storage in Supabase Dashboard" -ForegroundColor Gray
    Write-Host "   - Click 'New Bucket'" -ForegroundColor Gray
    Write-Host "   - Name: checkout-images" -ForegroundColor Cyan
    Write-Host "   - Make it Public" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Test the new features:" -ForegroundColor White
    Write-Host "   - Create a checkout link" -ForegroundColor Gray
    Write-Host "   - Toggle 'Cancel redirect'" -ForegroundColor Gray
    Write-Host "   - Upload an image" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
    Write-Host "NEW_CHECKOUT_FEATURES_GUIDE.md" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "ERROR: SQL file not found!" -ForegroundColor Red
    Write-Host "Expected: $sqlFile" -ForegroundColor Yellow
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
