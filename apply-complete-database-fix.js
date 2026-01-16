import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://xoofailhzhfyebzpzrfs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.gJmhCpYAzEW_6iA6xD5LMsKz9u0tC2vQ1Z0eYfKl6hE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDatabaseFixes() {
  console.log('🔧 Applying complete database fixes...\n');

  try {
    // Fix 1: Add unique constraint on merchants.pi_user_id
    console.log('1. Adding unique constraint on merchants.pi_user_id...');
    const constraintSQL = `
      DO $$ 
      BEGIN
        -- Drop existing constraint if it exists
        ALTER TABLE public.merchants
        DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key CASCADE;

        -- Add the unique constraint
        ALTER TABLE public.merchants
        ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
        ON public.merchants(pi_user_id);

        RAISE NOTICE 'Added unique constraint on pi_user_id';
      END $$;
    `;
    
    const { error: constraintError } = await supabase.rpc('exec_sql', { sql: constraintSQL });
    if (constraintError) {
      console.log('❌ Constraint error:', constraintError);
    } else {
      console.log('✅ Unique constraint added\n');
    }

    // Fix 2: Add is_admin column if missing
    console.log('2. Adding is_admin column...');
    const adminColumnSQL = `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'merchants' 
          AND column_name = 'is_admin'
        ) THEN
          ALTER TABLE merchants ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Added is_admin column';
        ELSE
          RAISE NOTICE 'is_admin column already exists';
        END IF;
      END $$;
    `;
    
    const { error: columnError } = await supabase.rpc('exec_sql', { sql: adminColumnSQL });
    if (columnError) {
      console.log('❌ Column error:', columnError);
    } else {
      console.log('✅ is_admin column ensured\n');
    }

    // Fix 3: Set Wain2020 as admin
    console.log('3. Setting admin privileges...');
    const { error: updateError } = await supabase
      .from('merchants')
      .update({ is_admin: true })
      .ilike('pi_username', '%wain2020%');
    
    if (updateError) {
      console.log('❌ Admin update error:', updateError);
    } else {
      console.log('✅ Admin privileges set\n');
    }

    // Fix 4: Ensure all required tables exist
    console.log('4. Checking required tables...');
    const tables = ['merchants', 'payment_links', 'transactions', 'withdrawals', 'subscription_plans'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table} has issues:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists and accessible`);
      }
    }

    // Fix 5: Test merchant creation functionality
    console.log('\n5. Testing merchant creation...');
    const testUser = {
      pi_user_id: 'test-' + Date.now(),
      pi_username: 'TestUser' + Math.floor(Math.random() * 1000),
      business_name: 'Test Business'
    };

    const { data: newMerchant, error: createError } = await supabase
      .from('merchants')
      .insert(testUser)
      .select()
      .single();

    if (createError) {
      console.log('❌ Test merchant creation failed:', createError);
    } else {
      console.log('✅ Test merchant creation successful');
      
      // Clean up test merchant
      await supabase
        .from('merchants')
        .delete()
        .eq('id', newMerchant.id);
      console.log('✅ Test merchant cleaned up\n');
    }

    // Final verification
    console.log('6. Final verification...');
    const { data: merchantCount } = await supabase
      .from('merchants')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Database status:');
    console.log(`   - Total merchants: ${merchantCount || 0}`);
    
    const { data: constraints } = await supabase.rpc('exec_sql', {
      sql: "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'merchants' AND constraint_name = 'merchants_pi_user_id_key';"
    });

    if (constraints && constraints.length > 0) {
      console.log('   - Unique constraint: ✅ Present');
    } else {
      console.log('   - Unique constraint: ❌ Missing');
    }

    console.log('\n🎉 Database fixes completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh your browser');
    console.log('   2. Try logging in with Pi Network');
    console.log('   3. Merchant profile should create successfully');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.log('\n🔧 Manual fix required:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql');
    console.log('   2. Run the SQL from COMPLETE_FIX.sql file');
  }
}

applyDatabaseFixes();