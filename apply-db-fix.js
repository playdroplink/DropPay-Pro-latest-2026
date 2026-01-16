// Apply database migration using Supabase REST API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xoofailhzhfyebzpzrfs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.gJmhCpYAzEW_6iA6xD5LMsKz9u0tC2vQ1Z0eYfKl6hE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔧 Applying database migration...');
  
  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Ensure merchants.pi_user_id can be used with ON CONFLICT/upsert
        ALTER TABLE public.merchants
        DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key CASCADE;

        ALTER TABLE public.merchants
        ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);

        CREATE INDEX IF NOT EXISTS idx_merchants_pi_user_id 
        ON public.merchants(pi_user_id);
      `
    });

    if (error) {
      console.error('❌ Error applying migration:', error);
      console.log('\n📝 Please apply the migration manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql');
      console.log('2. Run the SQL from: supabase/migrations/20260105_fix_merchants_unique_constraint.sql');
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('✅ The ON CONFLICT error should now be fixed.');
  } catch (err) {
    console.error('❌ Error:', err);
    console.log('\n📝 Please apply the migration manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/xoofailhzhfyebzpzrfs/sql');
    console.log('2. Run the SQL from: supabase/migrations/20260105_fix_merchants_unique_constraint.sql');
    process.exit(1);
  }
}

applyMigration();
