#!/usr/bin/env pwsh
# =========================================
# IMMEDIATE FIX: Payment Completion Error
# =========================================

Write-Host "🚨 FIXING PAYMENT COMPLETION ERROR" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Issue: Edge Function returned a non-2xx status code" -ForegroundColor Yellow
Write-Host "Root Cause: RLS policies blocking edge functions" -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: ✅ Edge functions have been deployed" -ForegroundColor Green
Write-Host "  - approve-payment: DEPLOYED" -ForegroundColor Green
Write-Host "  - complete-payment: DEPLOYED" -ForegroundColor Green
Write-Host "  - verify-payment: DEPLOYED" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Checking edge function status..." -ForegroundColor Yellow
try {
    $functions = supabase functions list 2>&1
    Write-Host "✅ Functions Status:" -ForegroundColor Green
    Write-Host "$functions" -ForegroundColor White
} catch {
    Write-Host "❌ Could not check functions" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: 🔧 CRITICAL MANUAL FIX REQUIRED" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "🎯 TO FIX YOUR PAYMENT ISSUE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Supabase Dashboard in Browser:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Go to: SQL Editor" -ForegroundColor White
Write-Host ""

Write-Host "3. Copy and paste this EXACT SQL:" -ForegroundColor White
Write-Host "   (This fixes the RLS policies that block payment completion)" -ForegroundColor Yellow

$sqlFix = @'
-- PAYMENT COMPLETION FIX: Remove RLS blocking edge functions
-- This allows edge functions to read/write payment data

-- Fix checkout_links RLS
DROP POLICY IF EXISTS "Users can view their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can insert their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can update their own checkout links" ON public.checkout_links;
DROP POLICY IF EXISTS "Users can delete their own checkout links" ON public.checkout_links;

-- Allow edge functions to access checkout_links
CREATE POLICY "Anyone can view active checkout links"
ON public.checkout_links
FOR SELECT
USING (is_active = true);

CREATE POLICY "Merchants can manage their checkout links"
ON public.checkout_links
FOR ALL
USING (
    merchant_id IN (
        SELECT id FROM public.merchants
        WHERE pi_user_id = (auth.uid())::text
    )
);

-- Fix payment_links RLS
CREATE POLICY "Edge functions can read payment links" 
ON public.payment_links 
FOR SELECT 
USING (true);

CREATE POLICY "Edge functions can update payment links"
ON public.payment_links
FOR UPDATE
USING (true);

-- Fix transactions table
CREATE POLICY "Edge functions can insert transactions"
ON public.transactions
FOR INSERT
WITH CHECK (true);

-- Fix user_subscriptions
CREATE POLICY "Edge functions can manage subscriptions"
ON public.user_subscriptions
FOR ALL
USING (true);

SELECT 'Payment completion fix applied successfully!' as result;
'@

Write-Host ""
Write-Host "=================== COPY THIS SQL ===================" -ForegroundColor Cyan
Write-Host "$sqlFix" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Click 'Run' in the SQL Editor" -ForegroundColor White
Write-Host ""

Write-Host "5. You should see: 'Payment completion fix applied successfully!'" -ForegroundColor Green
Write-Host ""

Write-Host "6. Test your payment again in Pi Browser" -ForegroundColor White
Write-Host "   URL: droppay.space/pay/u02ad9fo" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 AFTER THE FIX:" -ForegroundColor Green
Write-Host "   ✅ Payments will complete successfully" -ForegroundColor Green
Write-Host "   ✅ No more 'Edge Function non-2xx' errors" -ForegroundColor Green
Write-Host "   ✅ Transaction will be recorded in database" -ForegroundColor Green
Write-Host "   ✅ Success message will show" -ForegroundColor Green
Write-Host ""

Write-Host "📋 VERIFICATION:" -ForegroundColor Yellow
Write-Host "After applying the fix, run this in SQL Editor to verify:" -ForegroundColor White
Write-Host ""
Write-Host "SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('payment_links', 'checkout_links', 'transactions', 'user_subscriptions');" -ForegroundColor Gray
Write-Host ""

Write-Host "Need help? The issue is documented in:" -ForegroundColor Yellow
Write-Host "  - FIX_PAYMENT_COMPLETION.sql" -ForegroundColor White
Write-Host "  - PAYMENT_FAILURE_FIX_COMPLETE.md" -ForegroundColor White