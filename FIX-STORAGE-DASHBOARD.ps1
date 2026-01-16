#!/usr/bin/env pwsh

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FIX STORAGE - DASHBOARD METHOD" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "SQL method requires elevated permissions." -ForegroundColor Red
Write-Host "Using Dashboard UI instead (easier)..." -ForegroundColor Green
Write-Host ""

Write-Host "STEP 1: Open Storage Settings" -ForegroundColor Yellow
Write-Host "   Opening browser..." -ForegroundColor Gray
Start-Process "https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/storage/buckets"
Start-Sleep -Seconds 2
Write-Host ""

Write-Host "STEP 2: Create Buckets (if not exist)" -ForegroundColor Yellow
Write-Host "   Click: New bucket" -ForegroundColor Gray
Write-Host ""
Write-Host "   Create these 5 buckets:" -ForegroundColor White
Write-Host "   1. payment-link-images  (Public, 50MB)" -ForegroundColor Cyan
Write-Host "   2. checkout-images      (Public, 50MB)" -ForegroundColor Cyan
Write-Host "   3. merchant-products    (Public, 100MB)" -ForegroundColor Cyan
Write-Host "   4. payment-content      (Private, 500MB)" -ForegroundColor Cyan
Write-Host "   5. user-uploads         (Public, 50MB)" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 3: Add Policies to Each Bucket" -ForegroundColor Yellow
Write-Host "   For EACH bucket above:" -ForegroundColor Gray
Write-Host "   - Click bucket name" -ForegroundColor Gray
Write-Host "   - Click Policies tab" -ForegroundColor Gray
Write-Host "   - Click New Policy" -ForegroundColor Gray
Write-Host "   - Select: Allow public read access" -ForegroundColor Gray
Write-Host "   - Click Review and Save" -ForegroundColor Gray
Write-Host "   - Repeat for all 5 buckets" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 4: Test Upload" -ForegroundColor Yellow
Write-Host "   Opening dashboard..." -ForegroundColor Gray
Start-Sleep -Seconds 1
Start-Process "https://droppay.space/dashboard"
Write-Host "   - Create Payment Link" -ForegroundColor Gray
Write-Host "   - Upload image" -ForegroundColor Gray
Write-Host "   - Should work now!" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  QUICK REFERENCE:" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If buckets already exist:" -ForegroundColor Yellow
Write-Host "   - Skip to STEP 3 (add policies only)" -ForegroundColor White
Write-Host ""
Write-Host "Policy template for public buckets:" -ForegroundColor Yellow
Write-Host "   - Policy: Allow public read access" -ForegroundColor White
Write-Host "   - Operations: SELECT" -ForegroundColor White
Write-Host ""
Write-Host "Estimated time: 5-10 minutes" -ForegroundColor Gray
Write-Host ""
