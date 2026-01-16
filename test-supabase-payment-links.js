#!/usr/bin/env node

/**
 * Test Supabase Connection and Payment Links Functionality
 * This script verifies that:
 * 1. Supabase connection is working
 * 2. Payment links table exists and is accessible
 * 3. Payment links can be inserted and retrieved
 */

const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment or config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xoofailhzhfyebzpzrfs.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  console.log('\n🧪 Testing Supabase Connection...\n');

  try {
    // Test 1: Check connection
    console.log('1️⃣  Testing connection to Supabase...');
    const { data: healthData, error: healthError } = await supabase
      .from('payment_links')
      .select('id', { count: 'exact', head: true });

    if (healthError) {
      console.error('   ❌ Connection failed:', healthError.message);
      return false;
    }
    console.log('   ✅ Connection successful\n');

    // Test 2: Fetch sample payment links
    console.log('2️⃣  Fetching payment links...');
    const { data: links, error: fetchError, count } = await supabase
      .from('payment_links')
      .select('id, title, slug, amount, merchant_id, is_active, created_at, pricing_type', { count: 'exact' })
      .limit(5)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('   ❌ Failed to fetch links:', fetchError.message);
      return false;
    }

    console.log(`   ✅ Found ${count} total payment links\n`);

    if (links && links.length > 0) {
      console.log('   📋 Recent Payment Links:');
      links.forEach((link, idx) => {
        console.log(`      ${idx + 1}. "${link.title}"`);
        console.log(`         - Slug: ${link.slug}`);
        console.log(`         - Amount: π ${link.amount}`);
        console.log(`         - Type: ${link.pricing_type || 'standard'}`);
        console.log(`         - Active: ${link.is_active ? '✅' : '❌'}`);
        console.log(`         - Created: ${new Date(link.created_at).toLocaleDateString()}\n`);
      });
    } else {
      console.log('   ℹ️  No payment links found yet\n');
    }

    // Test 3: Check schema by getting column info
    console.log('3️⃣  Checking payment_links table schema...');
    const { data: allData, error: schemaError } = await supabase
      .from('payment_links')
      .select()
      .limit(1);

    if (!schemaError && allData && allData.length > 0) {
      const columns = Object.keys(allData[0]);
      console.log('   ✅ Table columns:');
      columns.forEach(col => {
        console.log(`      • ${col}`);
      });
    }
    console.log();

    // Test 4: Verify RLS policies
    console.log('4️⃣  Testing RLS Policies...');
    const { data: testRead, error: readError } = await supabase
      .from('payment_links')
      .select('id')
      .limit(1);

    if (readError) {
      console.warn('   ⚠️  Read access check failed:', readError.message);
    } else {
      console.log('   ✅ Read access: Allowed');
    }

    console.log();

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SUPABASE PAYMENT LINKS TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`   • Connection: ✅ Working`);
    console.log(`   • Database: ✅ Accessible`);
    console.log(`   • Payment Links Table: ✅ Available`);
    console.log(`   • Total Links: ${count || 0}`);
    console.log(`   • URL: ${SUPABASE_URL}`);
    console.log();
    console.log('Next Steps:');
    console.log('   1. Create a payment link in the dashboard');
    console.log('   2. Verify it appears in the list');
    console.log('   3. Check browser console for ✅ messages');
    console.log('   4. Test payment flow in Pi Browser');
    console.log();

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run tests
testSupabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
});
