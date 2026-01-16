-- Fix checkout_links RLS issue
-- The app uses Pi Network authentication, not Supabase auth.uid()
-- Disable RLS for checkout_links like other tables (payment_links, merchants, etc.)

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own checkout links" ON checkout_links;
DROP POLICY IF EXISTS "Users can insert their own checkout links" ON checkout_links;
DROP POLICY IF EXISTS "Users can update their own checkout links" ON checkout_links;
DROP POLICY IF EXISTS "Users can delete their own checkout links" ON checkout_links;
DROP POLICY IF EXISTS "Anyone can view checkout link by slug" ON checkout_links;

-- Disable RLS
ALTER TABLE checkout_links DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'checkout_links';
