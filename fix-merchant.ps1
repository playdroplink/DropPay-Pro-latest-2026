Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  FIX: Merchant Profile Error" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "The error means your merchant profile wasn't created properly.`n" -ForegroundColor Yellow

Write-Host "Quick Fix - Choose an option:`n" -ForegroundColor White

Write-Host "[1] " -NoNewline -ForegroundColor Green
Write-Host "Clear session and show login instructions"

Write-Host "[2] " -NoNewline -ForegroundColor Yellow  
Write-Host "Open Supabase to check/fix merchant manually"

Write-Host "[3] " -NoNewline -ForegroundColor Cyan
Write-Host "Show troubleshooting guide`n"

$choice = Read-Host "Enter choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`n✓ STEP 1: Clear localStorage" -ForegroundColor Green
        Write-Host "Open your browser DevTools (F12) → Console`n" -ForegroundColor White
        Write-Host "Copy and paste this command:" -ForegroundColor Yellow
        Write-Host "localStorage.clear(); location.reload()" -ForegroundColor Cyan
        
        Set-Clipboard "localStorage.clear(); location.reload()"
        Write-Host "`n✓ Command copied to clipboard!" -ForegroundColor Green
        
        Write-Host "`n✓ STEP 2: After page reloads" -ForegroundColor Green
        Write-Host "- Click 'Connect with Pi Network'" -ForegroundColor White
        Write-Host "- Wait for authentication" -ForegroundColor White
        Write-Host "- Look for 'Merchant created successfully' in console`n" -ForegroundColor White
        
        Write-Host "✓ STEP 3: Try creating payment link again`n" -ForegroundColor Green
    }
    "2" {
        Write-Host "`n✓ Opening Supabase Dashboard..." -ForegroundColor Green
        Start-Process "https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/editor"
        
        Write-Host "`nCheck merchants table:" -ForegroundColor Yellow
        Write-Host "1. Click 'merchants' table" -ForegroundColor White
        Write-Host "2. Look for your username '@Wain2020'" -ForegroundColor White
        Write-Host "3. If missing, insert a new row:`n" -ForegroundColor White
        
        Write-Host "   pi_user_id: demo_" -NoNewline -ForegroundColor Cyan
        Write-Host (Get-Date -Format "yyyyMMddHHmmss") -ForegroundColor Cyan
        Write-Host "   pi_username: Wain2020" -ForegroundColor Cyan
        Write-Host "   business_name: Wain2020's Business" -ForegroundColor Cyan
        Write-Host "   is_admin: true`n" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "`n=== TROUBLESHOOTING ===" -ForegroundColor Cyan
        Get-Content "MERCHANT_FIX.md" -ErrorAction SilentlyContinue
        
        if (-not $?) {
            Write-Host "Full guide: MERCHANT_FIX.md" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "`n❌ Invalid choice`n" -ForegroundColor Red
    }
}

Write-Host "`nNeed more help? Check MERCHANT_FIX.md`n" -ForegroundColor Yellow
Read-Host "Press Enter to exit"
