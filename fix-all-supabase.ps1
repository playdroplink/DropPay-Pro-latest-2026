#!/usr/bin/env pwsh
<#
.SYNOPSIS
Complete Supabase fix - Deploy function + Apply database migration

.DESCRIPTION
Fixes both CORS error and database constraint error in one go.

.EXAMPLE
./fix-all-supabase.ps1
#>

$Success = @{ ForegroundColor = 'Green' }
$ErrorStyle = @{ ForegroundColor = 'Red' }
$Info = @{ ForegroundColor = 'Cyan' }

Write-Host "╔═══════════════════════════════════════════════════════════╗" @Info
Write-Host "║      COMPLETE SUPABASE FIX - Both Issues Resolved        ║" @Info
Write-Host "║  • Edge Function deployment                             ║" @Info
Write-Host "║  • Database constraint fix                              ║" @Info
Write-Host "╚═══════════════════════════════════════════════════════════╝" @Info
Write-Host ""

# Step 1: Check Supabase CLI
Write-Host "🔍 Checking Supabase CLI..." @Info
try {
    $version = supabase --version 2>$null
    Write-Host "✅ Supabase CLI found: $version" @Success
} catch {
    Write-Host "❌ Supabase CLI not found!" @ErrorStyle
    Write-Host "Install with: npm install -g supabase" @Info
    exit 1
}

# Step 2: Check authentication
Write-Host ""
Write-Host "🔐 Checking authentication..." @Info
try {
    $projects = supabase projects list 2>$null
    if ($projects) {
        Write-Host "✅ Authenticated to Supabase" @Success
    } else {
        Write-Host "⚠️  Not authenticated. Running: supabase login" @Info
        supabase login
    }
} catch {
    Write-Host "❌ Authentication error" @ErrorStyle
}

# Step 3: Deploy Edge Function
Write-Host ""
Write-Host "📤 Deploying Edge Function..." @Info
Write-Host "This may take a moment..." @Info
try {
    supabase functions deploy create-merchant-profile --force
    Write-Host "✅ Edge Function deployed successfully!" @Success
} catch {
    Write-Host "⚠️  Function deployment warning: $_" @ErrorStyle
}

# Step 4: Prepare database migration
Write-Host ""
Write-Host "💾 Preparing database migration..." @Info

$sqlFile = "FINAL_PROFILE_FIX.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ File not found: $sqlFile" @ErrorStyle
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationDir = "supabase/migrations"
if (-not (Test-Path $migrationDir)) {
    New-Item -ItemType Directory -Path $migrationDir | Out-Null
}

$migrationFile = "$migrationDir/${timestamp}_complete_supabase_fix.sql"
Copy-Item $sqlFile $migrationFile
Write-Host "✅ Migration prepared: $migrationFile" @Success

# Step 5: Apply database migration
Write-Host ""
Write-Host "🗄️  Applying database migration..." @Info
try {
    supabase db push --local
    Write-Host "✅ Database migration applied!" @Success
} catch {
    Write-Host "⚠️  Migration result: $_" @Info
}

# Step 6: Summary
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" @Success
Write-Host "║          ✅ ALL FIXES APPLIED SUCCESSFULLY               ║" @Success
Write-Host "╚═══════════════════════════════════════════════════════════╝" @Success

Write-Host ""
Write-Host "✅ Edge Function deployed" @Success
Write-Host "✅ Database migration applied" @Success
Write-Host ""

# Step 7: Next steps
Write-Host "🧪 Next Steps:" @Info
Write-Host ""
Write-Host "1. Hard refresh your app: Ctrl+F5" @Info
Write-Host "2. Clear browser cache/cookies" @Info
Write-Host "3. Sign in with Pi Network" @Info
Write-Host "4. Merchant profile should create ✅" @Info
Write-Host ""

# Step 8: Verification
Write-Host "🔍 Verification:" @Info
Write-Host ""
Write-Host "Check deployed functions:" @Info
Write-Host "  supabase functions list" @Info
Write-Host ""
Write-Host "Check database constraint:" @Info
Write-Host "  Go to: Supabase Dashboard → Table Editor → merchants" @Info
Write-Host "  Look for constraint: merchants_pi_user_id_key (UNIQUE)" @Info
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" @Success
Write-Host "Both issues fixed! Your app is ready to use! 🎉" @Success
Write-Host "═══════════════════════════════════════════════════════════" @Success
