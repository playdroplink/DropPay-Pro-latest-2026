#!/usr/bin/env pwsh

# =====================================================
# FIX IMAGE UPLOAD - APPLY SQL SCRIPTS
# =====================================================

Write-Host ""
Write-Host "🔧 FIXING IMAGE UPLOAD ISSUE" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Error: Storage security not configured" -ForegroundColor Yellow
Write-Host "Solution: Run 2 SQL scripts in Supabase" -ForegroundColor Green
Write-Host ""

# Get current directory
$currentDir = Get-Location

Write-Host "📂 SQL Files Location:" -ForegroundColor Cyan
Write-Host "   $currentDir" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 STEP 1: Create Storage Buckets" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Opening Supabase Dashboard..." -ForegroundColor White
Start-Process "https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql/new"
Start-Sleep -Seconds 2

Write-Host "2. Open this file in your editor:" -ForegroundColor White
Write-Host "   CREATE_BUCKETS_ONLY.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Copy the ENTIRE contents of CREATE_BUCKETS_ONLY.sql" -ForegroundColor White
Write-Host ""
Write-Host "4. Paste into Supabase SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "5. Click the green 'RUN' button" -ForegroundColor White
Write-Host ""
Write-Host "6. Wait for success - you should see 5 buckets created" -ForegroundColor White
Write-Host ""

Read-Host "Press ENTER when Step 1 is complete"

Write-Host ""
Write-Host "📋 STEP 2: Create Security Policies" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Click 'New Query' in Supabase SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "2. Open this file in your editor:" -ForegroundColor White
Write-Host "   FIX_STORAGE_SECURITY.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Copy the ENTIRE contents of FIX_STORAGE_SECURITY.sql" -ForegroundColor White
Write-Host ""
Write-Host "4. Paste into Supabase SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "5. Click the green 'RUN' button" -ForegroundColor White
Write-Host ""
Write-Host "6. Wait for completion (no errors)" -ForegroundColor White
Write-Host ""

Read-Host "Press ENTER when Step 2 is complete"

Write-Host ""
Write-Host "📋 STEP 3: Test Upload" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to DropPay Dashboard..." -ForegroundColor White
Start-Process "https://droppay.space/dashboard"
Write-Host ""
Write-Host "2. Create a Payment Link" -ForegroundColor White
Write-Host ""
Write-Host "3. Try uploading an image" -ForegroundColor White
Write-Host ""
Write-Host "4. Should see: ✅ Payment link created successfully!" -ForegroundColor White
Write-Host ""

Write-Host ""
Write-Host "✅ FIX COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "If you still have issues:" -ForegroundColor Cyan
Write-Host "- Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor Gray
Write-Host "- Logout and login again" -ForegroundColor Gray
Write-Host "- Check browser console (F12) for errors" -ForegroundColor Gray
Write-Host "- Read the QUICK_FIX_IMAGE_UPLOAD.md file" -ForegroundColor Gray
Write-Host ""
