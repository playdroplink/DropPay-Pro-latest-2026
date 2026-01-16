-- Check if RLS is enabled on storage.objects
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Count total storage policies
SELECT 
    '📊 Total Storage Policies' as info,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 20 THEN '✅ All 20 policies created'
        WHEN COUNT(*) > 0 THEN '⚠️ Only ' || COUNT(*) || ' policies (need 20)'
        ELSE '❌ No policies found'
    END as status
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Show all existing storage policies grouped by bucket
SELECT 
    CASE 
        WHEN policyname LIKE '%payment-link-images%' THEN 'payment-link-images'
        WHEN policyname LIKE '%checkout-images%' THEN 'checkout-images'
        WHEN policyname LIKE '%merchant-products%' THEN 'merchant-products'
        WHEN policyname LIKE '%payment-content%' THEN 'payment-content'
        WHEN policyname LIKE '%user-uploads%' THEN 'user-uploads'
        ELSE 'unknown'
    END as bucket,
    COUNT(*) as policy_count,
    STRING_AGG(cmd::text, ', ') as operations
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
GROUP BY 
    CASE 
        WHEN policyname LIKE '%payment-link-images%' THEN 'payment-link-images'
        WHEN policyname LIKE '%checkout-images%' THEN 'checkout-images'
        WHEN policyname LIKE '%merchant-products%' THEN 'merchant-products'
        WHEN policyname LIKE '%payment-content%' THEN 'payment-content'
        WHEN policyname LIKE '%user-uploads%' THEN 'user-uploads'
        ELSE 'unknown'
    END
ORDER BY bucket;

-- Show detailed policy information
SELECT 
    policyname as "Policy Name",
    cmd::text as "Operation",
    roles::text[] as "Roles",
    qual as "USING Expression",
    with_check as "WITH CHECK Expression"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- Check which buckets exist
SELECT 
    id as bucket_name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY id;
