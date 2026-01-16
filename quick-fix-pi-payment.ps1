# Quick Fix for Pi Payment Issues
# This script deploys edge functions and checks configuration

Write-Host "🔧 Quick Fix for Pi Payment System" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Supabase CLI
Write-Host "1️⃣ Checking Supabase CLI..." -ForegroundColor Yellow
$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabase) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "   Install from: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor Gray
    exit 1
}
Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Step 2: Check if logged in
Write-Host "2️⃣ Checking Supabase login status..." -ForegroundColor Yellow
supabase projects list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Supabase" -ForegroundColor Red
    Write-Host "   Run: supabase login" -ForegroundColor Gray
    exit 1
}
Write-Host "✅ Logged in to Supabase" -ForegroundColor Green
Write-Host ""

# Step 3: Link project
Write-Host "3️⃣ Linking Supabase project..." -ForegroundColor Yellow
supabase link --project-ref your-project-ref 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Project linked" -ForegroundColor Green
} else {
    Write-Host "⚠️ Project may not be linked. Continuing..." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Deploy Edge Functions
Write-Host "4️⃣ Deploying Edge Functions..." -ForegroundColor Yellow

Write-Host "   📦 Deploying approve-payment..." -ForegroundColor Cyan
supabase functions deploy approve-payment --no-verify-jwt
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ approve-payment deployed" -ForegroundColor Green
} else {
    Write-Host "   ❌ approve-payment deployment failed" -ForegroundColor Red
}

Write-Host "   📦 Deploying complete-payment..." -ForegroundColor Cyan
supabase functions deploy complete-payment --no-verify-jwt
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ complete-payment deployed" -ForegroundColor Green
} else {
    Write-Host "   ❌ complete-payment deployment failed" -ForegroundColor Red
}
Write-Host ""

# Step 5: Check Secrets
Write-Host "5️⃣ Checking Supabase Secrets..." -ForegroundColor Yellow
$secrets = supabase secrets list 2>&1
if ($secrets -match "PI_API_KEY") {
    Write-Host "✅ PI_API_KEY is configured" -ForegroundColor Green
} else {
    Write-Host "❌ PI_API_KEY not found!" -ForegroundColor Red
    Write-Host "   Set it with: supabase secrets set PI_API_KEY=your_mainnet_key" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   ⚠️ IMPORTANT: Use your MAINNET Pi API key (not sandbox)" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Test Functions
Write-Host "6️⃣ Testing Edge Function URLs..." -ForegroundColor Yellow
Write-Host "   Your edge functions should be available at:" -ForegroundColor Gray
Write-Host "   https://your-project.supabase.co/functions/v1/approve-payment" -ForegroundColor Cyan
Write-Host "   https://your-project.supabase.co/functions/v1/complete-payment" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test a payment in Pi Browser" -ForegroundColor White
Write-Host "2. Check browser console for detailed logs" -ForegroundColor White
Write-Host "3. Monitor edge function logs:" -ForegroundColor White
Write-Host "   supabase functions logs approve-payment --tail" -ForegroundColor Gray
Write-Host "   supabase functions logs complete-payment --tail" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Troubleshooting Guide: PI_PAYMENT_TROUBLESHOOTING.md" -ForegroundColor Cyan
