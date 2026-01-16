import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xoofailhzhfyebzpzrfs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODAzNzksImV4cCI6MjA4MTk1NjM3OX0.xkmeRvWTFKWrZFwse_whIVfTNtg6liJrZUxZOKsaXsY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test 1: Check connection
    console.log('Test 1: Basic connection test');
    const { data: healthCheck, error: healthError } = await supabase
      .from('merchants')
      .select('count')
      .limit(0);
    
    if (healthError) {
      console.log('❌ Connection failed:', healthError.message);
      return false;
    }
    console.log('✅ Connection successful\n');
    
    // Test 2: Check if constraint exists
    console.log('Test 2: Checking for unique constraint on merchants.pi_user_id');
    const { data: constraints, error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT constraint_name, constraint_type 
        FROM information_schema.table_constraints 
        WHERE table_name = 'merchants' 
          AND constraint_name = 'merchants_pi_user_id_key';
      `
    });
    
    if (constraints && constraints.length > 0) {
      console.log('✅ Constraint EXISTS - You applied the migration!');
      console.log('   Constraint:', constraints[0].constraint_name);
      console.log('\n🎉 Your database is ready! You can now authenticate.\n');
      return true;
    } else {
      console.log('❌ Constraint MISSING - You need to apply the migration');
      console.log('\n📝 Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql');
      console.log('   And run the SQL from your clipboard or the migration file\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // If rpc doesn't work, try direct query
    console.log('\nTrying alternative check...');
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('id')
        .limit(1);
      
      if (!error) {
        console.log('✅ Connection works, but constraint check unavailable');
        console.log('⚠️ Please verify the constraint manually in Supabase');
      }
    } catch (e) {
      console.log('❌ Connection issue:', e.message);
    }
    return false;
  }
}

testConnection();
