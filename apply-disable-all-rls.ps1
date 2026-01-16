# =========================================
# Apply RLS Fix - Disable All Row Level Security
# =========================================

Write-Host "🔧 Disabling All Row Level Security (RLS)..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Error: Missing Supabase credentials in .env" -ForegroundColor Red
    Write-Host "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Configuration:" -ForegroundColor White
Write-Host "  Supabase URL: $supabaseUrl" -ForegroundColor Gray
Write-Host ""

# Read SQL file
$sqlContent = Get-Content -Path "DISABLE_ALL_RLS.sql" -Raw

# Split SQL into statements
$statements = $sqlContent -split ';' | Where-Object { $_.Trim() -ne '' -and $_.Trim() -notmatch '^--' }

Write-Host "📝 Executing SQL statements..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($statement in $statements) {
    $trimmedStatement = $statement.Trim()
    
    # Skip empty or comment-only statements
    if ($trimmedStatement -eq '' -or $trimmedStatement -match '^--') {
        continue
    }
    
    # Show what we're executing
    $preview = ($trimmedStatement -split "`n")[0]
    if ($preview.Length -gt 80) {
        $preview = $preview.Substring(0, 80) + "..."
    }
    Write-Host "  Executing: $preview" -ForegroundColor Gray
    
    # Execute SQL statement
    $body = @{
        query = $trimmedStatement
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" `
            -Method Post `
            -Headers @{
                "apikey" = $supabaseKey
                "Authorization" = "Bearer $supabaseKey"
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -ErrorAction Stop
        
        $successCount++
        Write-Host "    ✓ Success" -ForegroundColor Green
    }
    catch {
        # Try alternative method using PostgREST directly
        try {
            $psqlCommand = @"
psql "$supabaseUrl" -c "$($trimmedStatement.Replace('"', '\"'))"
"@
            Invoke-Expression $psqlCommand -ErrorAction Stop
            $successCount++
            Write-Host "    ✓ Success (alt method)" -ForegroundColor Green
        }
        catch {
            $errorCount++
            Write-Host "    ✗ Error: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor White
Write-Host "  ✓ Successful: $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  ✗ Failed: $errorCount" -ForegroundColor Red
}
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "✨ All RLS policies disabled successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Refresh your browser" -ForegroundColor White
    Write-Host "  2. Test merchant creation" -ForegroundColor White
    Write-Host "  3. Test payment link creation" -ForegroundColor White
    Write-Host "  4. Test checkout link creation" -ForegroundColor White
    Write-Host "  5. Test admin withdrawals page" -ForegroundColor White
} else {
    Write-Host "⚠️ Some statements failed. You may need to apply manually." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual application:" -ForegroundColor Yellow
    Write-Host "  1. Go to Supabase Dashboard > SQL Editor" -ForegroundColor White
    Write-Host "  2. Copy contents of DISABLE_ALL_RLS.sql" -ForegroundColor White
    Write-Host "  3. Paste and run in SQL Editor" -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
