Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      Applying Database Fix...                         " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$migration = @'
ALTER TABLE public.merchants
DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key CASCADE;

ALTER TABLE public.merchants
ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
ON public.merchants(pi_user_id);
'@

Write-Host "Opening Supabase SQL Editor..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql"

Write-Host ""
Write-Host "The SQL has been copied to your clipboard!" -ForegroundColor Green
Write-Host ""
Write-Host "Now:" -ForegroundColor Yellow
Write-Host "  1. Paste (Ctrl+V) in the SQL Editor that just opened" -ForegroundColor White
Write-Host "  2. Click the green 'RUN' button" -ForegroundColor White
Write-Host "  3. Wait for 'Success. No rows returned'" -ForegroundColor White
Write-Host ""
Write-Host ""

# Copy to clipboard
Set-Clipboard -Value $migration

Write-Host "Waiting for you to apply the fix..." -ForegroundColor Yellow
Write-Host "(Press any key after you've run the SQL in Supabase)" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Great! Now refreshing your app..." -ForegroundColor Green
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      Done! Try logging in again.                      " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
