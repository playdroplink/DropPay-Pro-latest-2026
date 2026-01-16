Write-Host "🔧 Applying Pi Ad Network Rewards Fix..." -ForegroundColor Cyan
Write-Host ""

# Instructions
Write-Host "STEP 1: Apply Database Trigger" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "1. Open Supabase SQL Editor:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Copy the entire content of:" -ForegroundColor White
Write-Host "   FIX_PI_AD_NETWORK_REWARDS.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Paste it in the SQL Editor and click 'Run'" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter when done..." -ForegroundColor Green
Read-Host

Write-Host ""
Write-Host "STEP 2: Deploy Edge Function" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "Deploying verify-ad-reward edge function..." -ForegroundColor White
Write-Host ""

try {
    # Deploy the edge function
    supabase functions deploy verify-ad-reward --no-verify-jwt
    
    Write-Host ""
    Write-Host "✅ Edge function deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "⚠️  Deployment failed. Try manually:" -ForegroundColor Yellow
    Write-Host "   supabase login" -ForegroundColor Cyan
    Write-Host "   supabase link --project-ref xoofailhzhfyebzpzrfs" -ForegroundColor Cyan
    Write-Host "   supabase functions deploy verify-ad-reward --no-verify-jwt" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "STEP 3: Verification" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "To verify the fixes worked:" -ForegroundColor White
Write-Host "1. Go to Watch Ads page in your app" -ForegroundColor White
Write-Host "2. Watch an ad (in Pi Browser)" -ForegroundColor White
Write-Host "3. Check that your balance increases" -ForegroundColor White
Write-Host ""
Write-Host "Run this SQL to check ad rewards:" -ForegroundColor White
Write-Host "   SELECT * FROM ad_rewards ORDER BY created_at DESC LIMIT 10;" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Ad Network Fix Complete!" -ForegroundColor Green
Write-Host ""
