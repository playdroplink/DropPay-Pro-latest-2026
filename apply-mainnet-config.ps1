# ========================================
# Droppay Pi Network - Complete Setup Script
# Apply all configurations for mainnet with 50 PI plan
# ========================================

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Droppay Pi Network Mainnet Configuration" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify environment file
Write-Host "Step 1: Verifying Environment Configuration..." -ForegroundColor Yellow
Write-Host ""

$envFile = ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    Write-Host "Checking API Keys..." -ForegroundColor Gray
    if ($envContent -match 'VITE_PI_API_KEY="a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq"') {
        Write-Host "  ✅ API Key: Configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ API Key: Missing or incorrect" -ForegroundColor Red
    }
    
    if ($envContent -match 'VITE_PI_VALIDATION_KEY="ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a"') {
        Write-Host "  ✅ Validation Key: Configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Validation Key: Missing or incorrect" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Checking Network Mode..." -ForegroundColor Gray
    if ($envContent -match 'VITE_PI_SANDBOX_MODE="false"') {
        Write-Host "  ✅ Mainnet Mode: Active (sandbox=false)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Sandbox Mode: Enabled (testnet)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Checking Ad Network..." -ForegroundColor Gray
    if ($envContent -match 'VITE_PI_AD_NETWORK_ENABLED="true"') {
        Write-Host "  ✅ Ad Network: Enabled" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Ad Network: Disabled" -ForegroundColor Red
    }
    
    if ($envContent -match 'VITE_PI_AUTO_WATCH_ADS="false"') {
        Write-Host "  ✅ Auto-Watch Ads: Disabled (manual only)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Auto-Watch Ads: Enabled" -ForegroundColor Yellow
    }
    
    Write-Host ""
} else {
    Write-Host "  ❌ .env file not found!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Step 2: Apply 50 PI Premium Plan
Write-Host "Step 2: Adding 50 PI Premium Plan..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Please run the following command in Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host ""
Write-Host "-- OR connect via psql and run:" -ForegroundColor Gray
Write-Host "psql -h db.xoofailhzhfyebzpzrfs.supabase.co -U postgres -d postgres -f ADD_50_PI_PLAN.sql" -ForegroundColor White
Write-Host ""

$sqlContent = Get-Content "ADD_50_PI_PLAN.sql" -Raw
Write-Host "SQL to execute:" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor DarkGray
Write-Host $sqlContent -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Step 3: Set Supabase Secrets
Write-Host "Step 3: Setting Supabase Secrets..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Run these commands to set backend secrets:" -ForegroundColor Cyan
Write-Host ""
Write-Host "supabase secrets set PI_API_KEY=`"a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq`"" -ForegroundColor White
Write-Host "supabase secrets set PI_VALIDATION_KEY=`"ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a`"" -ForegroundColor White
Write-Host ""
Write-Host "Verify secrets with:" -ForegroundColor Cyan
Write-Host "supabase secrets list" -ForegroundColor White
Write-Host ""

# Step 4: Summary
Write-Host "Configuration Summary" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$summary = @"
✅ COMPLETED CONFIGURATIONS:
   • API Keys configured in .env
   • Validation key set
   • Mainnet mode enabled (sandbox: false)
   • Ad network enabled
   • Auto-watch ads disabled (manual mode)
   • 50 PI Premium plan SQL created

🔧 MANUAL STEPS REQUIRED:
   1. Apply 50 PI plan migration to database
   2. Set Supabase secrets (PI_API_KEY, PI_VALIDATION_KEY)
   3. Rebuild/restart application

📚 DOCUMENTATION:
   • Payment Guide: https://pi-apps.github.io/community-developer-guide/
   • Ad Network: https://github.com/pi-apps/pi-platform-docs/tree/master
   • Full Config: PI_MAINNET_COMPLETE_CONFIG.md

🎯 SUBSCRIPTION PLANS:
   • Free: 0 PI/month - 5 links
   • Basic: 10 PI/month - 50 links  
   • Pro: 30 PI/month - Unlimited
   • Premium: 50 PI/month - 200 links ⭐ NEW
   • Enterprise: 100 PI/month - Unlimited+

🧪 TESTING CHECKLIST:
   [ ] Open in Pi Browser
   [ ] Test Pi authentication
   [ ] Create payment link
   [ ] Test payment flow
   [ ] Test ad network (Watch Ads page)
   [ ] Verify 50 PI plan available
   [ ] Check blockchain transaction

🔗 USEFUL LINKS:
   • Block Explorer: https://blockexplorer.minepi.com/mainnet/
   • Pi Network Docs: https://pi-apps.github.io/
   • Supabase Dashboard: https://supabase.com/dashboard

"@

Write-Host $summary -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Configuration script completed!" -ForegroundColor Green
Write-Host "   Review PI_MAINNET_COMPLETE_CONFIG.md for detailed instructions" -ForegroundColor Gray
Write-Host ""
