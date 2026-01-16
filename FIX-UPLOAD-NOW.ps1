#!/usr/bin/env pwsh

# =====================================================
# FIX IMAGE UPLOAD - QUICK GUIDE
# =====================================================

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  FIX IMAGE UPLOAD ERROR" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Error: Storage security not configured" -ForegroundColor Red
Write-Host ""

Write-Host "SOLUTION (5 minutes):" -ForegroundColor Green
Write-Host ""

Write-Host "STEP 1: Open Supabase SQL Editor" -ForegroundColor Yellow
Write-Host "   Opening browser..." -ForegroundColor Gray
Start-Process "https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql/new"
Write-Host ""

Write-Host "STEP 2: Run CREATE_BUCKETS_ONLY.sql" -ForegroundColor Yellow
Write-Host "   - Copy ALL content from: CREATE_BUCKETS_ONLY.sql" -ForegroundColor Gray
Write-Host "   - Paste into Supabase SQL Editor" -ForegroundColor Gray
Write-Host "   - Click RUN button" -ForegroundColor Gray
Write-Host "   - Wait for: 5 buckets created" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 3: Run FIX_STORAGE_SECURITY.sql" -ForegroundColor Yellow
Write-Host "   - Click New Query in Supabase" -ForegroundColor Gray
Write-Host "   - Copy ALL content from: FIX_STORAGE_SECURITY.sql" -ForegroundColor Gray
Write-Host "   - Paste into Supabase SQL Editor" -ForegroundColor Gray
Write-Host "   - Click RUN button" -ForegroundColor Gray
Write-Host "   - Wait for completion" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 4: Test Upload" -ForegroundColor Yellow
Write-Host "   - Go to: https://droppay.space/dashboard" -ForegroundColor Gray
Write-Host "   - Create Payment Link" -ForegroundColor Gray
Write-Host "   - Upload image" -ForegroundColor Gray
Write-Host "   - Success!" -ForegroundColor Green
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  FILES YOU NEED:" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. CREATE_BUCKETS_ONLY.sql (currently open)" -ForegroundColor White
Write-Host "2. FIX_STORAGE_SECURITY.sql" -ForegroundColor White
Write-Host ""
Write-Host "Both files are in:" -ForegroundColor Gray
Write-Host "   $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

Write-Host "For detailed help, read:" -ForegroundColor Yellow
Write-Host "   QUICK_FIX_IMAGE_UPLOAD.md" -ForegroundColor Cyan
Write-Host ""
