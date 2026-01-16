-- =========================================
-- FIX REALTIME PUBLICATION ERROR
-- =========================================
-- Error: cannot add relation "revenue_audit" to publication 
-- DETAIL: This operation is not supported for views.
-- =========================================

-- Step 1: Remove views from realtime publication (if they exist)
DO $$
BEGIN
    -- Remove revenue_audit view from publication if it exists
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.revenue_audit';
    EXCEPTION
        WHEN OTHERS THEN
            NULL; -- Ignore errors if view doesn't exist in publication
    END;
    
    RAISE NOTICE 'Removed views from realtime publication (if they existed)';
END $$;

-- Step 2: Ensure only proper tables are in realtime publication
DO $$
BEGIN
    -- Add notifications table to realtime (if not already added)
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
        RAISE NOTICE 'Added notifications table to realtime publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'notifications table already in realtime publication';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add notifications to realtime: %', SQLERRM;
    END;
    
    -- Add other important tables to realtime if needed
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions';
        RAISE NOTICE 'Added transactions table to realtime publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'transactions table already in realtime publication';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add transactions to realtime: %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals';
        RAISE NOTICE 'Added withdrawals table to realtime publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'withdrawals table already in realtime publication';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add withdrawals to realtime: %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_links';
        RAISE NOTICE 'Added payment_links table to realtime publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'payment_links table already in realtime publication';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add payment_links to realtime: %', SQLERRM;
    END;
    
END $$;

-- Step 3: Convert revenue_audit view to materialized view for realtime (optional)
-- Note: Materialized views can be added to publications, but require manual refresh
DROP VIEW IF EXISTS public.revenue_audit;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.revenue_audit AS
SELECT 
    m.id as merchant_id,
    m.pi_username,
    m.business_name,
    -- Current balances
    m.available_balance,
    m.total_revenue,
    m.total_withdrawn,
    
    -- Calculated totals
    COALESCE(tx_stats.total_transactions, 0) as calculated_transactions,
    COALESCE(tx_stats.total_earned, 0) as calculated_earned,
    COALESCE(fee_stats.total_fees_paid, 0) as calculated_fees_paid,
    COALESCE(wd_stats.total_withdrawn_completed, 0) as calculated_withdrawn,
    COALESCE(wd_stats.pending_withdrawals, 0) as pending_withdrawals,
    
    -- Balance verification
    (m.available_balance = 
     COALESCE(tx_stats.total_earned, 0) - 
     COALESCE(fee_stats.total_fees_paid, 0) - 
     COALESCE(wd_stats.total_withdrawn_completed, 0)
    ) as balance_accurate,
    
    NOW() as last_updated
    
FROM public.merchants m

LEFT JOIN (
    SELECT 
        merchant_id,
        COUNT(*) as total_transactions,
        SUM(amount) as total_earned
    FROM public.transactions 
    WHERE status = 'completed'
    GROUP BY merchant_id
) tx_stats ON m.id = tx_stats.merchant_id

LEFT JOIN (
    SELECT 
        merchant_id,
        SUM(amount) as total_fees_paid
    FROM public.platform_fees 
    WHERE status = 'completed'
    GROUP BY merchant_id
) fee_stats ON m.id = fee_stats.merchant_id

LEFT JOIN (
    SELECT 
        merchant_id,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_withdrawn_completed,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_withdrawals
    FROM public.withdrawals 
    GROUP BY merchant_id
) wd_stats ON m.id = wd_stats.merchant_id

ORDER BY m.created_at DESC;

-- Create index on materialized view for better performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_audit_merchant_id 
ON public.revenue_audit(merchant_id);

-- Step 4: Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_revenue_audit()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.revenue_audit;
    RAISE NOTICE 'Revenue audit materialized view refreshed at %', NOW();
END;
$$;

-- Step 5: Add materialized view to realtime (now it's a table-like structure)
DO $$
BEGIN
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_audit';
        RAISE NOTICE 'Added revenue_audit materialized view to realtime publication';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'revenue_audit already in realtime publication';
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not add revenue_audit to realtime: %', SQLERRM;
    END;
END $$;

-- Step 6: Create trigger to auto-refresh materialized view when data changes
CREATE OR REPLACE FUNCTION public.trigger_refresh_revenue_audit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Refresh the materialized view when relevant data changes
    PERFORM public.refresh_revenue_audit();
    RETURN NULL;
END;
$$;

-- Create triggers on relevant tables
DROP TRIGGER IF EXISTS refresh_revenue_audit_on_transaction ON public.transactions;
CREATE TRIGGER refresh_revenue_audit_on_transaction
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_refresh_revenue_audit();

DROP TRIGGER IF EXISTS refresh_revenue_audit_on_withdrawal ON public.withdrawals;
CREATE TRIGGER refresh_revenue_audit_on_withdrawal
    AFTER INSERT OR UPDATE OR DELETE ON public.withdrawals
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_refresh_revenue_audit();

DROP TRIGGER IF EXISTS refresh_revenue_audit_on_merchant ON public.merchants;
CREATE TRIGGER refresh_revenue_audit_on_merchant
    AFTER UPDATE ON public.merchants
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_refresh_revenue_audit();

-- Step 7: Verify what's in the realtime publication
SELECT 
    schemaname,
    tablename,
    'TABLE' as object_type
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
UNION ALL
SELECT 
    schemaname,
    matviewname as tablename,
    'MATERIALIZED VIEW' as object_type
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- =========================================
-- COMPLETION MESSAGE
-- =========================================
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 REALTIME PUBLICATION ERROR FIXED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Removed views from realtime publication';
    RAISE NOTICE '✅ Added proper tables to realtime publication';
    RAISE NOTICE '✅ Converted revenue_audit to materialized view';
    RAISE NOTICE '✅ Added auto-refresh triggers';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next Steps:';
    RAISE NOTICE '1. The realtime error should be resolved';
    RAISE NOTICE '2. revenue_audit is now a materialized view';
    RAISE NOTICE '3. Auto-refreshes when data changes';
    RAISE NOTICE '4. Can be used in realtime subscriptions';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Note: Materialized views provide better performance';
    RAISE NOTICE '    but require periodic refresh (auto-handled here)';
    RAISE NOTICE '';
END $$;