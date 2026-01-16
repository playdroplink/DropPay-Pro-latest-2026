# Apply checkout links migration
Write-Host "Applying checkout links migration..." -ForegroundColor Yellow

# Check if supabase CLI is available
if (!(Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Supabase CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Apply the migration
try {
    supabase db push
    Write-Host "Migration applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error applying migration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You may need to run this SQL manually in your Supabase dashboard:" -ForegroundColor Yellow
    Write-Host ""
    Get-Content "supabase\migrations\add_checkout_links_columns.sql"
    exit 1
}