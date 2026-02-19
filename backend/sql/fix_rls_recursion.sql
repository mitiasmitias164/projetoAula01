-- Fix Infinite Recursion in RLS Policies

-- 1. Create a Security Definer function to check admin role
-- This bypasses RLS on the users table when checking the role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'GESTOR'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing recursive policies on 'users'
DROP POLICY IF EXISTS "Managers have full access to users" ON users;

-- 3. Re-create user policies using the function
CREATE POLICY "Managers have full access to users"
  ON users FOR ALL
  TO authenticated
  USING ( is_admin() );

-- 4. Update other policies to use the function (Optimization)

-- Campus
DROP POLICY IF EXISTS "Managers can manage campuses" ON campus;
CREATE POLICY "Managers can manage campuses"
  ON campus FOR ALL
  TO authenticated
  USING ( is_admin() );

-- Turmas
DROP POLICY IF EXISTS "Managers can create classes" ON turmas;
CREATE POLICY "Managers can create classes"
  ON turmas FOR INSERT
  TO authenticated
  WITH CHECK ( is_admin() );

DROP POLICY IF EXISTS "Managers can update classes" ON turmas;
CREATE POLICY "Managers can update classes"
  ON turmas FOR UPDATE
  TO authenticated
  USING ( is_admin() );

DROP POLICY IF EXISTS "Managers can delete classes" ON turmas;
CREATE POLICY "Managers can delete classes"
  ON turmas FOR DELETE
  TO authenticated
  USING ( is_admin() );

-- Inscricoes
DROP POLICY IF EXISTS "Managers can delete enrollments" ON inscricoes;
CREATE POLICY "Managers can delete enrollments"
  ON inscricoes FOR DELETE
  TO authenticated
  USING ( is_admin() );

-- Presencas
DROP POLICY IF EXISTS "Managers can mark attendance" ON presencas;
CREATE POLICY "Managers can mark attendance"
  ON presencas FOR INSERT
  TO authenticated
  WITH CHECK ( is_admin() );

DROP POLICY IF EXISTS "Managers can update attendance" ON presencas;
CREATE POLICY "Managers can update attendance"
  ON presencas FOR UPDATE
  TO authenticated
  USING ( is_admin() );

DROP POLICY IF EXISTS "Managers can delete attendance" ON presencas;
CREATE POLICY "Managers can delete attendance"
  ON presencas FOR DELETE
  TO authenticated
  USING ( is_admin() );

-- Avaliacoes
DROP POLICY IF EXISTS "Managers can update evaluations" ON avaliacoes;
CREATE POLICY "Managers can update evaluations"
  ON avaliacoes FOR UPDATE
  TO authenticated
  USING ( is_admin() );

DROP POLICY IF EXISTS "Managers can delete evaluations" ON avaliacoes;
CREATE POLICY "Managers can delete evaluations"
  ON avaliacoes FOR DELETE
  TO authenticated
  USING ( is_admin() );

-- Also update policies that used the subquery for SELECT visibility (if any)
-- "Users can view their enrollments" check "OR is_admin()"

DROP POLICY IF EXISTS "Users can view their enrollments" ON inscricoes;
CREATE POLICY "Users can view their enrollments"
  ON inscricoes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_admin()
  );

DROP POLICY IF EXISTS "Users can cancel their enrollment" ON inscricoes;
CREATE POLICY "Users can cancel their enrollment"
  ON inscricoes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR is_admin()
  );

DROP POLICY IF EXISTS "Users can view attendance" ON presencas;
CREATE POLICY "Users can view attendance"
  ON presencas FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_admin()
  );

DROP POLICY IF EXISTS "Users can view evaluations" ON avaliacoes;
CREATE POLICY "Users can view evaluations"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_admin()
  );
