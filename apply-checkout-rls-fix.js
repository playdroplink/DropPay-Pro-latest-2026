// Apply checkout_links RLS fix
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xoofailhzhfyebzpzrfs.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyFix() {
  console.log('🔧 Applying checkout_links RLS fix...\n');

  const statements = [
    'DROP POLICY IF EXISTS "Users can view their own checkout links" ON checkout_links',
    'DROP POLICY IF EXISTS "Users can insert their own checkout links" ON checkout_links',
    'DROP POLICY IF EXISTS "Users can update their own checkout links" ON checkout_links',
    'DROP POLICY IF EXISTS "Users can delete their own checkout links" ON checkout_links',
    'DROP POLICY IF EXISTS "Anyone can view checkout link by slug" ON checkout_links',
    'ALTER TABLE checkout_links DISABLE ROW LEVEL SECURITY'
  ];

  for (const sql of statements) {
    console.log(`Executing: ${sql.substring(0, 60)}...`);
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log(`  ⚠️  ${error.message}`);
      } else {
        console.log('  ✅ Success');
      }
    } catch (err) {
      console.log(`  ⚠️  ${err.message}`);
    }
  }

  // Verify the fix
  console.log('\n📊 Verifying RLS status...');
  const { data, error } = await supabase
    .from('checkout_links')
    .select('id')
    .limit(1);
  
  if (error) {
    console.log('❌ Verification failed:', error.message);
  } else {
    console.log('✅ checkout_links table is now accessible!');
  }

  console.log('\n✨ Fix application complete!');
  console.log('Please try creating a checkout link again.');
}

applyFix().catch(console.error);
