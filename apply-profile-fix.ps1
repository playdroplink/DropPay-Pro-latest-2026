#!/usr/bin/env pwsh
<#
.SYNOPSIS
Applies the profile setup fix to Supabase database.

.DESCRIPTION
This script automatically applies the FINAL_PROFILE_FIX.sql to your Supabase database
using the Supabase CLI. It will:
1. Check if Supabase CLI is installed
2. Verify you're logged in to Supabase
3. Apply the migration
4. Verify the fix was applied

.EXAMPLE
./apply-profile-fix.ps1

.NOTES
Requires: Supabase CLI (https://supabase.com/docs/guides/cli)
#>

# Colors for output
$Success = @{ ForegroundColor = 'Green' }
$Error = @{ ForegroundColor = 'Red' }
$Warning = @{ ForegroundColor = 'Yellow' }
$Info = @{ ForegroundColor = 'Cyan' }

Write-Host "╔═══════════════════════════════════════════════════════════════╗" @Info
Write-Host "║           DROPPAY PROFILE SETUP FIX - AUTOMATION             ║" @Info
Write-Host "║         Applying database schema migration (42P10 fix)        ║" @Info
Write-Host "╚═══════════════════════════════════════════════════════════════╝" @Info
Write-Host ""

# Step 1: Check if Supabase CLI is installed
Write-Host "🔍 Step 1: Checking Supabase CLI..." @Info
try {
    $supabaseVersion = supabase --version 2>$null
    Write-Host "✅ Supabase CLI is installed: $supabaseVersion" @Success
} catch {
    Write-Host "❌ Supabase CLI not found!" @Error
    Write-Host ""
    Write-Host "To fix this, install the Supabase CLI:" @Warning
    Write-Host "  npm install -g supabase" @Warning
    Write-Host ""
    Write-Host "Then run this script again." @Warning
    exit 1
}

# Step 2: Check if logged in
Write-Host ""
Write-Host "🔐 Step 2: Checking Supabase authentication..." @Info
try {
    $status = supabase projects list 2>$null | Select-Object -First 1
    if ($status) {
        Write-Host "✅ You are logged in to Supabase" @Success
    } else {
        Write-Host "⚠️  Not logged in to Supabase" @Warning
        Write-Host "Run: supabase login" @Warning
        exit 1
    }
} catch {
    Write-Host "⚠️  Could not verify Supabase login status" @Warning
}

# Step 3: Check if FINAL_PROFILE_FIX.sql exists
Write-Host ""
Write-Host "📁 Step 3: Locating migration file..." @Info
$sqlFile = "FINAL_PROFILE_FIX.sql"
if (Test-Path $sqlFile) {
    Write-Host "✅ Found: $sqlFile" @Success
} else {
    Write-Host "❌ File not found: $sqlFile" @Error
    exit 1
}

# Step 4: Copy migration to migrations folder
Write-Host ""
Write-Host "📋 Step 4: Setting up migration..." @Info
$migrationsDir = "supabase/migrations"
if (-not (Test-Path $migrationsDir)) {
    Write-Host "Creating migrations directory..." @Info
    New-Item -ItemType Directory -Path $migrationsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationFile = "$migrationsDir/${timestamp}_profile_setup_fix.sql"

Copy-Item $sqlFile $migrationFile
Write-Host "✅ Migration file created: $migrationFile" @Success

# Step 5: Display the migration
Write-Host ""
Write-Host "📝 Step 5: Migration content:" @Info
Write-Host "─────────────────────────────────────────────────────────────" @Info
Get-Content $migrationFile | Select-Object -First 20
Write-Host "... (see $migrationFile for full content)" @Info
Write-Host "─────────────────────────────────────────────────────────────" @Info

# Step 6: Apply the migration
Write-Host ""
Write-Host "🚀 Step 6: Applying migration to Supabase..." @Info
Write-Host "This may take a moment..." @Warning
Write-Host ""

try {
    # Run the migration using supabase db push
    $output = & supabase db push --local 2>&1
    
    Write-Host "✅ Migration applied successfully!" @Success
    Write-Host ""
    Write-Host "📊 Output:" @Info
    Write-Host $output
} catch {
    Write-Host "⚠️  Supabase CLI output:" @Warning
    Write-Host $_
}

# Step 7: Verification
Write-Host ""
Write-Host "🔍 Step 7: Verifying the fix..." @Info
Write-Host ""
Write-Host "To verify the fix was applied correctly:" @Info
Write-Host "  1. Go to: https://supabase.com/dashboard" @Info
Write-Host "  2. Select your project" @Info
Write-Host "  3. Go to 'Table Editor' > 'merchants'" @Info
Write-Host "  4. Check that 'merchants_pi_user_id_key' constraint exists" @Info
Write-Host ""

# Step 8: Test instructions
Write-Host "✅ MIGRATION COMPLETE!" @Success
Write-Host ""
Write-Host "🧪 Next: Test your app" @Info
Write-Host "  1. Refresh your browser (Ctrl+F5)" @Info
Write-Host "  2. Sign out completely" @Info
Write-Host "  3. Clear browser cache/cookies" @Info
Write-Host "  4. Sign in again with Pi Network" @Info
Write-Host "  5. Merchant profile should create ✅" @Info
Write-Host ""

Write-Host "📚 For more help:" @Info
Write-Host "  - See: PROFILE_SETUP_FIX_GUIDE.md" @Info
Write-Host "  - See: QUICK_TROUBLESHOOTING.md" @Info
Write-Host "  - See: DROPPAY_COMPLETE_DOCUMENTATION.md" @Info
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" @Info
Write-Host "Need manual help? Run the SQL from FINAL_PROFILE_FIX.sql" @Info
Write-Host "directly in the Supabase SQL Editor." @Info
Write-Host "═══════════════════════════════════════════════════════════════" @Info
