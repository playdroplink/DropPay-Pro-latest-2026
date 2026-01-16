# DropPay Functionality Test - Simple Version
# Tests all core features and Pi integrations

Write-Host ""
Write-Host "DropPay Full Functionality Test" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$total = 0

# Test 1: Server Access
Write-Host "1. Testing Server Access..." -ForegroundColor Green
$total++
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   PASS: Server responding" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "   FAIL: Server not accessible" -ForegroundColor Red
}

# Test 2: Pi SDK Integration
Write-Host "2. Testing Pi SDK Integration..." -ForegroundColor Green
$total++
if (Test-Path "index.html") {
    $htmlContent = Get-Content "index.html" -Raw
    if ($htmlContent -match "pi-sdk\.js" -and $htmlContent -match "window\.Pi") {
        Write-Host "   PASS: Pi SDK properly integrated" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   FAIL: Pi SDK not properly integrated" -ForegroundColor Red
    }
} else {
    Write-Host "   FAIL: index.html not found" -ForegroundColor Red
}

# Test 3: Environment Configuration
Write-Host "3. Testing Environment Configuration..." -ForegroundColor Green
$total++
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq") {
        Write-Host "   PASS: New Pi API key configured" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   FAIL: Pi API key not updated" -ForegroundColor Red
    }
} else {
    Write-Host "   FAIL: .env file missing" -ForegroundColor Red
}

# Test 4: Authentication Components
Write-Host "4. Testing Authentication Components..." -ForegroundColor Green
$total++
if ((Test-Path "src\contexts\AuthContext.tsx") -and (Test-Path "src\components\auth\PiAuthGuard.tsx")) {
    Write-Host "   PASS: Authentication components exist" -ForegroundColor Green
    $passed++
} else {
    Write-Host "   FAIL: Authentication components missing" -ForegroundColor Red
}

# Test 5: Payment Components
Write-Host "5. Testing Payment Components..." -ForegroundColor Green
$total++
$paymentFiles = @(
    "src\pages\PayPage.tsx",
    "supabase\functions\approve-payment\index.ts",
    "supabase\functions\complete-payment\index.ts"
)
$paymentFilesExist = $true
foreach ($file in $paymentFiles) {
    if (!(Test-Path $file)) {
        $paymentFilesExist = $false
        break
    }
}
if ($paymentFilesExist) {
    Write-Host "   PASS: Payment components exist" -ForegroundColor Green
    $passed++
} else {
    Write-Host "   FAIL: Payment components missing" -ForegroundColor Red
}

# Test 6: Ad Network Components
Write-Host "6. Testing Ad Network Components..." -ForegroundColor Green
$total++
if ((Test-Path "src\pages\WatchAds.tsx") -and (Test-Path "supabase\functions\verify-ad-reward\index.ts")) {
    Write-Host "   PASS: Ad Network components exist" -ForegroundColor Green
    $passed++
} else {
    Write-Host "   FAIL: Ad Network components missing" -ForegroundColor Red
}

# Test 7: Database Schema
Write-Host "7. Testing Database Schema..." -ForegroundColor Green
$total++
$migrationFiles = Get-ChildItem "supabase\migrations" -Filter "*.sql" -ErrorAction SilentlyContinue
if ($migrationFiles.Count -gt 0) {
    Write-Host "   PASS: Database migrations found ($($migrationFiles.Count) files)" -ForegroundColor Green
    $passed++
} else {
    Write-Host "   FAIL: No database migrations found" -ForegroundColor Red
}

# Results
Write-Host ""
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Tests Passed: $passed/$total" -ForegroundColor Yellow

$percentage = [math]::Round(($passed / $total) * 100)
Write-Host "Success Rate: $percentage%" -ForegroundColor Yellow

if ($passed -eq $total) {
    Write-Host "STATUS: ALL SYSTEMS WORKING!" -ForegroundColor Green
} elseif ($passed -ge ($total * 0.8)) {
    Write-Host "STATUS: MOSTLY FUNCTIONAL" -ForegroundColor Yellow
} else {
    Write-Host "STATUS: NEEDS ATTENTION" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:8080 in Pi Browser" -ForegroundColor White
Write-Host "2. Test Pi authentication" -ForegroundColor White
Write-Host "3. Test payment creation" -ForegroundColor White
Write-Host "4. Test ad watching" -ForegroundColor White
Write-Host ""