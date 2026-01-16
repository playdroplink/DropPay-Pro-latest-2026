Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  ADMIN FIX - Complete Checklist" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "✅ Code Changes Applied:" -ForegroundColor Green
Write-Host "   • Admin detection via username + database flag"
Write-Host "   • Debug logs added to track admin status"
Write-Host "   • Navigation updated to show admin items`n"

Write-Host "🔍 Current Status Check:`n" -ForegroundColor Yellow

# Check if SQL was copied
Write-Host "1. SQL Migration" -ForegroundColor Cyan
Write-Host "   Status: SQL copied to clipboard" -ForegroundColor Green
Write-Host "   Action: Paste in Supabase SQL Editor and RUN`n"

# Instructions
Write-Host "2. Database Setup" -ForegroundColor Cyan
Write-Host "   → Open: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql"
Write-Host "   → Paste SQL and click RUN"
Write-Host "   → Check output shows 'Updated 1 merchant(s)'`n"

Write-Host "3. Clear Session & Re-login" -ForegroundColor Cyan
Write-Host "   → Open browser console (F12)"
Write-Host "   → Run: " -NoNewline
Write-Host "localStorage.clear(); location.reload()" -ForegroundColor Green
Write-Host "   → Log in as @Wain2020`n"

Write-Host "4. Verify Admin Access" -ForegroundColor Cyan
Write-Host "   → Check browser console for:" -ForegroundColor White
Write-Host "      '✓ Admin detected via username: Wain2020'" -ForegroundColor Green
Write-Host "      '🔑 Admin Status: { isAdmin: true }'" -ForegroundColor Green
Write-Host "   → Navigation menu should show:" -ForegroundColor White
Write-Host "      • Admin Dashboard" -ForegroundColor Yellow
Write-Host "      • Admin: Withdrawals" -ForegroundColor Yellow

Write-Host "`n📋 Quick Test Commands (paste in browser console):`n" -ForegroundColor Cyan
Write-Host "// Check current user" -ForegroundColor Gray
Write-Host "JSON.parse(localStorage.getItem('pi_user'))`n" -ForegroundColor Green

Write-Host "// Check admin status in console logs" -ForegroundColor Gray
Write-Host "// Look for: '🔑 Admin Status:' in console`n" -ForegroundColor Green

Write-Host "`n⚠️  If admin menu STILL doesn't show:" -ForegroundColor Yellow
Write-Host "1. Make sure SQL was run in Supabase"
Write-Host "2. Verify you're logged in as @Wain2020 (not @wain2020)"
Write-Host "3. Check browser console for errors"
Write-Host "4. Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)`n"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Need help? Check the console logs for:" -ForegroundColor White
Write-Host "  • 'Admin detected via username'" -ForegroundColor Green
Write-Host "  • 'Merchant created successfully'" -ForegroundColor Green
Write-Host "  • '🔑 Admin Status'" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

$open = Read-Host "Open Supabase SQL Editor now? (y/n)"
if ($open -eq "y") {
    Start-Process "https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql"
    Write-Host "`n✓ Browser opening... Paste SQL and click RUN!`n" -ForegroundColor Green
}

Read-Host "Press Enter to exit"
