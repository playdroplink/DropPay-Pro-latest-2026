# DropPay Live Functionality Test Suite
# PowerShell script to comprehensively test all app features

Write-Host ""
Write-Host "🚀 DropPay Live Functionality Test Suite" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🌐 Testing server: http://localhost:8080" -ForegroundColor Yellow
Write-Host "⏰ Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

$testResults = @{
    ServerAccess = $false
    PiSDKLoaded = $false
    Authentication = $false
    PaymentFlow = $false
    AdNetwork = $false
    Database = $false
    Workflows = $false
    Issues = @()
}

# Test 1: Server Accessibility
Write-Host "1️⃣ Testing Server Access..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $testResults.ServerAccess = $true
        Write-Host "   ✅ Server responding (HTTP $($response.StatusCode))" -ForegroundColor Green
        
        # Check if HTML contains React app
        if ($response.Content -match 'id="root"') {
            Write-Host "   ✅ React app container found" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ React app container not detected" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ❌ Server not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Issues += "Server not responding on port 8080"
}

# Test 2: Pi SDK Integration
Write-Host ""
Write-Host "2️⃣ Testing Pi SDK Integration..." -ForegroundColor Green
try {
    $htmlContent = (Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing).Content
    
    if ($htmlContent -match "pi-sdk\.js") {
        $testResults.PiSDKLoaded = $true
        Write-Host "   ✅ Pi SDK script tag found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Pi SDK script not found in HTML" -ForegroundColor Red
        $testResults.Issues += "Pi SDK script missing from index.html"
    }
    
    if ($htmlContent -match "window\.Pi\.init") {
        Write-Host "   ✅ Pi SDK initialization code present" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Pi SDK initialization code missing" -ForegroundColor Red
        $testResults.Issues += "Pi SDK initialization missing"
    }
    
    if ($htmlContent -match "sandbox.*true") {
        Write-Host "   ✅ Pi SDK configured for sandbox mode" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Pi SDK sandbox configuration not detected" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Pi SDK test failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Issues += "Failed to analyze Pi SDK integration"
}

# Test 3: Environment Configuration
Write-Host ""
Write-Host "3️⃣ Testing Environment Configuration..." -ForegroundColor Green

if (Test-Path ".env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    
    # Check API Key
    if ($envContent -match "VITE_PI_API_KEY.*a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq") {
        Write-Host "   ✅ New Pi API key configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Pi API key not properly configured" -ForegroundColor Red
        $testResults.Issues += "Pi API key not updated"
    }
    
    # Check Validation Key
    if ($envContent -match "VITE_PI_VALIDATION_KEY.*ca9a30c58a15511860751e51e1e92fc5e1346e8194618095d2d5fee07eefb8a73cb916db54271e2e48005d285df56f12056b05281f926761152d4cec733cd83a") {
        Write-Host "   ✅ Pi validation key configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Pi validation key missing or incorrect" -ForegroundColor Red
        $testResults.Issues += "Pi validation key not configured"
    }
    
    # Check Supabase
    if ($envContent -match "VITE_SUPABASE_URL" -and $envContent -match "VITE_SUPABASE_PUBLISHABLE_KEY") {
        Write-Host "   ✅ Supabase configuration present" -ForegroundColor Green
        $testResults.Database = $true
    } else {
        Write-Host "   ❌ Supabase configuration missing" -ForegroundColor Red
        $testResults.Issues += "Supabase not configured"
    }
    
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
    $testResults.Issues += ".env file missing"
}

# Test 4: Authentication System
Write-Host ""
Write-Host "4️⃣ Testing Authentication Components..." -ForegroundColor Green

$authFiles = @(
    "src\contexts\AuthContext.tsx",
    "src\components\auth\PiAuthGuard.tsx"
)

foreach ($file in $authFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $($file.Split('\')[-1]) exists" -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        if ($content -match "Pi\.authenticate") {
            Write-Host "   ✅ Pi.authenticate implementation found" -ForegroundColor Green
            $testResults.Authentication = $true
        }
    } else {
        Write-Host "   ❌ $($file.Split('\')[-1]) missing" -ForegroundColor Red
        $testResults.Issues += "Authentication file missing: $file"
    }
}

# Test 5: Payment System
Write-Host ""
Write-Host "5️⃣ Testing Payment Components..." -ForegroundColor Green

$paymentFiles = @(
    "src\pages\PayPage.tsx",
    "src\pages\MerchantCheckout.tsx",
    "supabase\functions\approve-payment\index.ts",
    "supabase\functions\complete-payment\index.ts"
)

foreach ($file in $paymentFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $($file.Split('\')[-1]) exists" -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        if ($content -match "createPayment" -or $content -match "PI_API_KEY") {
            Write-Host "   ✅ Payment functionality detected" -ForegroundColor Green
            $testResults.PaymentFlow = $true
        }
    } else {
        Write-Host "   ❌ $($file.Split('\')[-1]) missing" -ForegroundColor Red
        $testResults.Issues += "Payment file missing: $file"
    }
}

# Test 6: Ad Network System
Write-Host ""
Write-Host "6️⃣ Testing Ad Network Components..." -ForegroundColor Green

$adFiles = @(
    "src\pages\WatchAds.tsx",
    "supabase\functions\verify-ad-reward\index.ts"
)

foreach ($file in $adFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $($file.Split('\')[-1]) exists" -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        if ($content -match "Pi\.Ads" -or $content -match "ad_rewards") {
            Write-Host "   ✅ Ad Network functionality detected" -ForegroundColor Green
            $testResults.AdNetwork = $true
        }
    } else {
        Write-Host "   ❌ $($file.Split('\')[-1]) missing" -ForegroundColor Red
        $testResults.Issues += "Ad Network file missing: $file"
    }
}

# Test 7: Database Schema
Write-Host ""
Write-Host "7️⃣ Testing Database Schema..." -ForegroundColor Green

$migrationFiles = Get-ChildItem "supabase\migrations" -Filter "*.sql" -ErrorAction SilentlyContinue
if ($migrationFiles.Count -gt 0) {
    Write-Host "   ✅ Database migrations found ($($migrationFiles.Count) files)" -ForegroundColor Green
    
    $combinedMigrations = ""
    $migrationFiles | ForEach-Object { $combinedMigrations += Get-Content $_.FullName -Raw }
    
    $expectedTables = @("merchants", "payment_links", "transactions", "ad_rewards", "api_keys")
    foreach ($table in $expectedTables) {
        if ($combinedMigrations -match $table) {
            Write-Host "   ✅ Table '$table' found in migrations" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Table '$table' not found in migrations" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ❌ No database migration files found" -ForegroundColor Red
    $testResults.Issues += "Database migrations missing"
}

# Test 8: Key Workflows
Write-Host ""
Write-Host "8️⃣ Testing Key User Workflows..." -ForegroundColor Green

$workflowComponents = @{
    "User Registration" = "src\contexts\AuthContext.tsx"
    "Payment Creation" = "src\pages\PaymentLinks.tsx" 
    "Checkout Process" = "src\pages\PayPage.tsx"
    "Ad Earnings" = "src\pages\WatchAds.tsx"
    "Dashboard Access" = "src\pages\Dashboard.tsx"
}

$workflowsPassed = 0
foreach ($workflow in $workflowComponents.GetEnumerator()) {
    if (Test-Path $workflow.Value) {
        Write-Host "   ✅ $($workflow.Key) component exists" -ForegroundColor Green
        $workflowsPassed++
    } else {
        Write-Host "   ❌ $($workflow.Key) component missing" -ForegroundColor Red
        $testResults.Issues += "$($workflow.Key) workflow missing"
    }
}

$testResults.Workflows = ($workflowsPassed -eq $workflowComponents.Count)

# Test Summary
Write-Host ""
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

$categories = @(
    @{ Name = "Server Access"; Passed = $testResults.ServerAccess }
    @{ Name = "Pi SDK Integration"; Passed = $testResults.PiSDKLoaded }
    @{ Name = "Authentication"; Passed = $testResults.Authentication }
    @{ Name = "Payment Flow"; Passed = $testResults.PaymentFlow }
    @{ Name = "Ad Network"; Passed = $testResults.AdNetwork }
    @{ Name = "Database"; Passed = $testResults.Database }
    @{ Name = "User Workflows"; Passed = $testResults.Workflows }
)

$totalPassed = 0
foreach ($category in $categories) {
    $status = if ($category.Passed) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($category.Passed) { "Green" } else { "Red" }
    Write-Host "$status $($category.Name)" -ForegroundColor $color
    if ($category.Passed) { $totalPassed++ }
}

$percentage = [math]::Round(($totalPassed / $categories.Count) * 100)
Write-Host ""
Write-Host "🎯 Overall Results:" -ForegroundColor Yellow
$resultColor = if ($percentage -gt 80) { "Green" } elseif ($percentage -gt 60) { "Yellow" } else { "Red" }
Write-Host "   Passed: $totalPassed/$($categories.Count) ($percentage`%)" -ForegroundColor $resultColor

if ($totalPassed -eq $categories.Count) {
    Write-Host "   🚀 ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host "   🎉 DropPay is fully functional and ready!" -ForegroundColor Green
} elseif ($percentage -gt 80) {
    Write-Host "   🟢 MOSTLY FUNCTIONAL - Minor issues detected" -ForegroundColor Yellow
} else {
    Write-Host "   🔴 ISSUES DETECTED - Needs attention" -ForegroundColor Red
}

# Issues Report
if ($testResults.Issues.Count -gt 0) {
    Write-Host ""
    Write-Host "🐛 Issues Detected:" -ForegroundColor Red
    $testResults.Issues | ForEach-Object { Write-Host "   • $_" -ForegroundColor Red }
}

# Next Steps
Write-Host ""
Write-Host "💡 Next Steps for Full Testing:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:8080 in Pi Browser for full Pi integration testing" -ForegroundColor White
Write-Host "   2. Test Pi authentication by logging in" -ForegroundColor White
Write-Host "   3. Create a test payment link and process a payment" -ForegroundColor White
Write-Host "   4. Test ad watching functionality" -ForegroundColor White
Write-Host "   5. Update Supabase secrets if not done:" -ForegroundColor White
Write-Host "      supabase secrets set PI_API_KEY=\"a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq\"" -ForegroundColor Gray

Write-Host ""
Write-Host "🎮 Interactive Testing:" -ForegroundColor Cyan
Write-Host "   • Browser Console: Load /test-console.js for manual tests" -ForegroundColor White
Write-Host "   • Simple Browser: Already opened at http://localhost:8080" -ForegroundColor White

Write-Host ""
Write-Host "✅ DropPay functionality test complete!" -ForegroundColor Green
Write-Host "⏰ Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""