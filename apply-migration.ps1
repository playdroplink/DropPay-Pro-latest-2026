# =========================================
# Apply Admin Migration to Supabase
# =========================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  DROPPAY - Apply Admin Migration" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "📋 Migration file: " -NoNewline
Write-Host "apply-admin-fix.sql`n" -ForegroundColor Yellow

Write-Host "Choose how to apply the migration:`n" -ForegroundColor White

Write-Host "Option 1: " -NoNewline -ForegroundColor Green
Write-Host "Copy SQL to clipboard (Recommended)"
Write-Host "  → Then paste in Supabase Dashboard SQL Editor`n"

Write-Host "Option 2: " -NoNewline -ForegroundColor Yellow
Write-Host "Open Supabase Dashboard in browser"
Write-Host "  → You can manually paste the SQL there`n"

Write-Host "Option 3: " -NoNewline -ForegroundColor Cyan
Write-Host "Show SQL content"
Write-Host "  → Display the SQL to review`n"

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`n✓ Copying SQL to clipboard..." -ForegroundColor Green
        Get-Content "apply-admin-fix.sql" -Raw | Set-Clipboard
        Write-Host "✓ SQL copied to clipboard!`n" -ForegroundColor Green
        
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql"
        Write-Host "2. Paste the SQL (Ctrl+V)"
        Write-Host "3. Click 'RUN'"
        Write-Host "4. Check output shows: 'Updated 1 merchant(s) to admin'`n"
        
        $openBrowser = Read-Host "Open Supabase SQL Editor now? (y/n)"
        if ($openBrowser -eq "y") {
            Start-Process "https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql"
            Write-Host "`n✓ Browser opened! Paste the SQL and click RUN." -ForegroundColor Green
        }
    }
    "2" {
        Write-Host "`n✓ Opening Supabase Dashboard..." -ForegroundColor Green
        Start-Process "https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql"
        Write-Host "`nManually copy the SQL from 'apply-admin-fix.sql' and paste it there.`n" -ForegroundColor Yellow
    }
    "3" {
        Write-Host "`n--- SQL Content ---`n" -ForegroundColor Cyan
        Get-Content "apply-admin-fix.sql"
        Write-Host "`n--- End of SQL ---`n" -ForegroundColor Cyan
    }
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again.`n" -ForegroundColor Red
    }
}

Write-Host "`nAfter applying the migration:" -ForegroundColor Yellow
Write-Host "→ Refresh your app"
Write-Host "→ Go to /admin/withdrawals"
Write-Host "→ Payment links should work without errors`n"

Write-Host "Press Enter to exit..."
Read-Host
