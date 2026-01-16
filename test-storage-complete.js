// ================================================================
// COMPLETE STORAGE POLICY FIX - RUN IN BROWSER CONSOLE
// ================================================================
// 1. Open your DropPay app in browser
// 2. Sign in as a user
// 3. Press F12 to open console
// 4. Paste this entire script and press Enter
// ================================================================

console.log('🔍 Starting Storage Diagnostics...\n');

(async function() {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        console.error('❌ NOT LOGGED IN - You must be signed in first!');
        console.log('Steps:');
        console.log('1. Go to your DropPay app');
        console.log('2. Sign in with your account');
        console.log('3. Come back here and run this script again');
        return;
    }
    
    console.log(`✅ Logged in as: ${user.email}\n`);
    
    // Test all buckets
    const buckets = [
        'payment-link-images',
        'checkout-images',
        'merchant-products',
        'payment-content',
        'user-uploads'
    ];
    
    const results = {
        working: [],
        failing: [],
        missing: []
    };
    
    for (const bucket of buckets) {
        console.log(`\n📦 Testing bucket: ${bucket}`);
        console.log('─'.repeat(50));
        
        // Create test file
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const fileName = `test-${Date.now()}.txt`;
        
        // Test upload
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, testFile);
        
        if (error) {
            console.error(`❌ UPLOAD FAILED: ${error.message}`);
            
            if (error.message.includes('row-level security')) {
                results.failing.push({
                    bucket,
                    issue: 'MISSING INSERT POLICY',
                    fix: `Create INSERT policy for ${bucket}`
                });
                console.log(`🔧 FIX NEEDED: Create INSERT policy for bucket: ${bucket}`);
            } else if (error.message.includes('not found')) {
                results.missing.push(bucket);
                console.log(`🔧 FIX NEEDED: Bucket doesn't exist: ${bucket}`);
            } else {
                results.failing.push({
                    bucket,
                    issue: error.message,
                    fix: 'Check error message above'
                });
            }
        } else {
            console.log(`✅ Upload successful: ${data.path}`);
            
            // Test public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);
            console.log(`📎 Public URL: ${urlData.publicUrl}`);
            
            // Clean up
            await supabase.storage.from(bucket).remove([fileName]);
            console.log(`🗑️ Cleaned up test file`);
            
            results.working.push(bucket);
        }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    
    if (results.working.length > 0) {
        console.log(`\n✅ WORKING BUCKETS (${results.working.length}/5):`);
        results.working.forEach(b => console.log(`   ✓ ${b}`));
    }
    
    if (results.failing.length > 0) {
        console.log(`\n❌ FAILING BUCKETS (${results.failing.length}/5):`);
        results.failing.forEach(r => {
            console.log(`   ✗ ${r.bucket}`);
            console.log(`     Issue: ${r.issue}`);
            console.log(`     Fix: ${r.fix}`);
        });
    }
    
    if (results.missing.length > 0) {
        console.log(`\n⚠️ MISSING BUCKETS (${results.missing.length}):`);
        results.missing.forEach(b => console.log(`   ! ${b}`));
    }
    
    // Provide specific fix instructions
    if (results.failing.length > 0 || results.missing.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('🔧 HOW TO FIX:');
        console.log('='.repeat(70));
        
        if (results.missing.length > 0) {
            console.log('\n1. CREATE MISSING BUCKETS:');
            console.log('   Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/storage/buckets');
            console.log('   Click "New bucket" and create:');
            results.missing.forEach(b => console.log(`   - ${b}`));
        }
        
        if (results.failing.length > 0) {
            console.log('\n2. CREATE MISSING POLICIES:');
            console.log('   For each failing bucket, create these 4 policies:');
            console.log('   (Use Dashboard > Storage > Click bucket > Policies tab > New Policy)\n');
            
            results.failing.forEach(r => {
                console.log(`   ${r.bucket}:`);
                console.log(`   ├─ Policy 1: "Public read ${r.bucket}"`);
                console.log(`   │  Operation: SELECT, Roles: public`);
                console.log(`   │  USING: bucket_id = '${r.bucket}'`);
                console.log(`   │`);
                console.log(`   ├─ Policy 2: "Authenticated insert ${r.bucket}"`);
                console.log(`   │  Operation: INSERT, Roles: authenticated`);
                console.log(`   │  WITH CHECK: bucket_id = '${r.bucket}'`);
                console.log(`   │`);
                console.log(`   ├─ Policy 3: "Authenticated update ${r.bucket}"`);
                console.log(`   │  Operation: UPDATE, Roles: authenticated`);
                console.log(`   │  USING: bucket_id = '${r.bucket}'`);
                console.log(`   │  WITH CHECK: bucket_id = '${r.bucket}'`);
                console.log(`   │`);
                console.log(`   └─ Policy 4: "Authenticated delete ${r.bucket}"`);
                console.log(`      Operation: DELETE, Roles: authenticated`);
                console.log(`      USING: bucket_id = '${r.bucket}'`);
                console.log('');
            });
        }
        
        console.log('\n3. AFTER CREATING POLICIES:');
        console.log('   Run this script again to verify all buckets work.');
    } else {
        console.log('\n🎉 ALL BUCKETS WORKING! Storage is properly configured.');
    }
    
    console.log('\n' + '='.repeat(70));
})();
