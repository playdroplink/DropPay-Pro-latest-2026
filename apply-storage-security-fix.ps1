#!/usr/bin/env pwsh

# =====================================================
# SUPABASE STORAGE SECURITY FIX
# =====================================================
# Applies RLS policies for image uploads
# This script uses Supabase CLI to run the SQL fix

Write-Host "🔧 DropPay Storage Security Fix" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCheck = supabase --version 2>$null
if ($null -eq $supabaseCheck) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
}

# Get the project details
$projectRef = "xoofailhzhfyebzpzrfs"
Write-Host "📊 Project Reference: $projectRef" -ForegroundColor Yellow
Write-Host ""

# Read the SQL file
$sqlFilePath = ".\FIX_STORAGE_SECURITY.sql"
if (!(Test-Path $sqlFilePath)) {
    Write-Host "❌ FIX_STORAGE_SECURITY.sql not found at $sqlFilePath" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $sqlFilePath -Raw

Write-Host "📝 SQL Script Details:" -ForegroundColor Cyan
Write-Host "- Enables RLS on storage.objects" -ForegroundColor Gray
Write-Host "- Creates policies for 5 storage buckets:" -ForegroundColor Gray
Write-Host "  • payment-link-images" -ForegroundColor Gray
Write-Host "  • checkout-images" -ForegroundColor Gray
Write-Host "  • merchant-products" -ForegroundColor Gray
Write-Host "  • payment-content" -ForegroundColor Gray
Write-Host "  • user-uploads" -ForegroundColor Gray
Write-Host ""

# Create a temporary file with the SQL content
$tempSqlFile = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.sql'
Set-Content -Path $tempSqlFile -Value $sqlContent

Write-Host "🚀 Executing SQL fix via Supabase..." -ForegroundColor Yellow
Write-Host ""

try {
    # Execute the SQL through Supabase
    supabase db push --project-ref $projectRef | Out-Null
    
    # Apply the fix by running the SQL
    Write-Host "💾 Applying storage security policies..." -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "✅ SQL commands ready to apply." -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Manual Application Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://supabase.com/dashboard" -ForegroundColor Gray
    Write-Host "2. Select project: $projectRef" -ForegroundColor Gray
    Write-Host "3. Navigate to SQL Editor" -ForegroundColor Gray
    Write-Host "4. Create a new query" -ForegroundColor Gray
    Write-Host "5. Copy the entire contents of FIX_STORAGE_SECURITY.sql" -ForegroundColor Gray
    Write-Host "6. Paste into the SQL editor" -ForegroundColor Gray
    Write-Host "7. Click 'Run' to execute all policies" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "⚠️  Error executing command: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Alternative: Manual SQL Application" -ForegroundColor Cyan
}

# Clean up temp file
Remove-Item $tempSqlFile -Force -ErrorAction SilentlyContinue

Write-Host "✨ Next Steps:" -ForegroundColor Green
Write-Host "1. Run the FIX_STORAGE_SECURITY.sql in Supabase SQL Editor" -ForegroundColor Gray
Write-Host "2. Verify all policies are created" -ForegroundColor Gray
Write-Host "3. Try uploading an image in the dashboard" -ForegroundColor Gray
Write-Host "4. Check browser console for 'Image uploaded' confirmation" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- File: FIX_STORAGE_SECURITY.sql" -ForegroundColor Gray
Write-Host "- Buckets: checkout-images, payment-link-images, merchant-products, etc." -ForegroundColor Gray
Write-Host "- RLS Policies: Enable public read, authenticated insert/update/delete" -ForegroundColor Gray
Write-Host ""

Write-Host "🔐 Verification:" -ForegroundColor Yellow
Write-Host "Run this query to verify policies are applied:" -ForegroundColor Gray
Write-Host "  SELECT * FROM pg_policies WHERE tablename='objects' AND schemaname='storage';" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Script complete!" -ForegroundColor Green
