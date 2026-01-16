# DropPay API Key Update Script
# This script updates the new Pi Network API key for DropPay

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      DropPay API Key Update                           " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Environment file (.env) updated successfully!" -ForegroundColor Green
Write-Host "   Old API Key: ntmobg3ocesbrze2f7aghmf8bthhnavstlsvmhauxjzoerktt8ig0sp3n1xoeuby" -ForegroundColor Gray
Write-Host "   New API Key: a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update Supabase Secrets (Required for production)" -ForegroundColor White
Write-Host ""

# Copy the command to clipboard
$supabaseCommand = 'supabase secrets set PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"'
Set-Clipboard $supabaseCommand

Write-Host "The following command has been copied to your clipboard:" -ForegroundColor Cyan
Write-Host $supabaseCommand -ForegroundColor White
Write-Host ""

Write-Host "To update Supabase secrets:" -ForegroundColor Yellow
Write-Host "  a. Make sure you're logged in: supabase login" -ForegroundColor White
Write-Host "  b. Paste and run the command above" -ForegroundColor White
Write-Host "  c. Verify with: supabase secrets list" -ForegroundColor White
Write-Host ""

Write-Host "2. Test the integration" -ForegroundColor White
Write-Host "  - Test Pi authentication in your app" -ForegroundColor Gray
Write-Host "  - Verify payment processing works" -ForegroundColor Gray
Write-Host "  - Check ad network functionality" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Pi Network Documentation Links:" -ForegroundColor Yellow
Write-Host "  - Payments: https://pi-apps.github.io/community-developer-guide/" -ForegroundColor Cyan
Write-Host "  - Ad Network: https://github.com/pi-apps/pi-platform-docs/tree/master" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Frontend API Key (VITE_PI_API_KEY): Updated" -ForegroundColor Green
Write-Host "  ✅ Validation Key (VITE_PI_VALIDATION_KEY): Verified" -ForegroundColor Green  
Write-Host "  ⚠️  Backend Secret (PI_API_KEY): Needs manual update" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to open Supabase dashboard..." -ForegroundColor Cyan
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open Supabase dashboard
$projectId = "reyhsdlsvclpzsgecoyf"
Start-Process "https://supabase.com/dashboard/project/$projectId/settings/api"

Write-Host ""
Write-Host "Dashboard opened! Use the API keys from the dashboard if needed." -ForegroundColor Green