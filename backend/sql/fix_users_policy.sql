-- FIX READ PERMISSIONS ON USERS TABLE
-- Run this in Supabase SQL Editor

-- 1. Ensure the policy for reading users exists and is correct
DROP POLICY IF EXISTS "Authenticated users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- 2. Create a broad read policy (simplest for now to unblock login)
CREATE POLICY "Authenticated users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- 3. Ensure RLS is enabled (just in case)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Verify grants (sometimes needed)
GRANT SELECT ON users TO authenticated;
