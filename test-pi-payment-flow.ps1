# Test Pi Payment Flow
# This script checks if all necessary components are configured correctly

Write-Host "🔍 Testing Pi Payment Configuration..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "1️⃣ Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Supabase CLI installed: $supabaseVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Supabase CLI not found" -ForegroundColor Red
    Write-Host "   Install from: https://supabase.com/docs/guides/cli" -ForegroundColor Gray
}
Write-Host ""

# Check environment variables
Write-Host "2️⃣ Checking Environment Variables..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
    
    $envContent = Get-Content $envFile -Raw
    
    # Check required variables
    $requiredVars = @(
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY",
        "VITE_PI_SANDBOX_MODE"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=") {
            Write-Host "   ✅ $var configured" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $var missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
}
Write-Host ""

# Check Edge Functions
Write-Host "3️⃣ Checking Edge Functions..." -ForegroundColor Yellow
$functions = @("approve-payment", "complete-payment")
foreach ($func in $functions) {
    $funcPath = "supabase\functions\$func\index.ts"
    if (Test-Path $funcPath) {
        Write-Host "   ✅ $func function exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $func function missing" -ForegroundColor Red
    }
}
Write-Host ""

# Check Supabase secrets
Write-Host "4️⃣ Checking Supabase Secrets..." -ForegroundColor Yellow
Write-Host "   Run this command to check PI_API_KEY:" -ForegroundColor Gray
Write-Host "   supabase secrets list" -ForegroundColor Cyan
Write-Host ""

# Deployment status
Write-Host "5️⃣ Edge Function Deployment Status..." -ForegroundColor Yellow
Write-Host "   To deploy edge functions, run:" -ForegroundColor Gray
Write-Host "   supabase functions deploy approve-payment" -ForegroundColor Cyan
Write-Host "   supabase functions deploy complete-payment" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Ensure PI_API_KEY is set in Supabase secrets" -ForegroundColor White
Write-Host "   supabase secrets set PI_API_KEY=your_mainnet_key" -ForegroundColor Gray
Write-Host "2. Deploy edge functions if not already deployed" -ForegroundColor White
Write-Host "3. Check browser console for detailed error messages" -ForegroundColor White
Write-Host "4. Verify Pi Browser SDK is properly initialized" -ForegroundColor White
Write-Host ""
Write-Host "✅ Configuration check complete!" -ForegroundColor Green
