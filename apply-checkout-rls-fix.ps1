# Apply checkout_links RLS fix
Write-Host "🔧 Applying checkout_links RLS fix..." -ForegroundColor Cyan

# Load environment variables
$envContent = Get-Content .env
$SUPABASE_URL = ($envContent | Select-String "VITE_SUPABASE_URL" | ForEach-Object { $_ -replace "VITE_SUPABASE_URL=","" }).Trim()
$SUPABASE_SERVICE_KEY = ($envContent | Select-String "VITE_SUPABASE_SERVICE_ROLE_KEY" | ForEach-Object { $_ -replace "VITE_SUPABASE_SERVICE_ROLE_KEY=","" }).Trim()

Write-Host "📡 Supabase URL: $SUPABASE_URL" -ForegroundColor Gray

# Read SQL file
$sqlContent = Get-Content -Path "FIX_CHECKOUT_LINKS_RLS.sql" -Raw

# Split SQL into individual statements
$statements = $sqlContent -split ";" | Where-Object { $_.Trim() -and $_ -notmatch "^--" }

foreach ($statement in $statements) {
    $cleanStatement = $statement.Trim()
    if ([string]::IsNullOrWhiteSpace($cleanStatement) -or $cleanStatement -match "^--") {
        continue
    }
    
    Write-Host "Executing: $($cleanStatement.Substring(0, [Math]::Min(50, $cleanStatement.Length)))..." -ForegroundColor Yellow
    
    # Use REST API to execute SQL
    $body = @{
        query = $cleanStatement
    } | ConvertTo-Json
    
    $headers = @{
        "apikey" = $SUPABASE_SERVICE_KEY
        "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
        "Content-Type" = "application/json"
    }
    
    try {
        # Suppress output from web request
        [void](Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/rpc/query" -Method Post -Headers $headers -Body $body -ErrorAction Stop)
        Write-Host "  ✅ Success" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ Note: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✨ RLS fix application complete!" -ForegroundColor Green
Write-Host "Please try creating a checkout link again." -ForegroundColor Cyan
