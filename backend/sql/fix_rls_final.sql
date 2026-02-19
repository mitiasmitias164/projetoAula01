-- Fix Infinite Recursion in RLS Policies

-- 1. Create a Security Definer function to check admin/gestor role
-- This bypasses RLS on the users table when checking the role
CREATE OR REPLACE FUNCTION public.is_gestor()
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

-- 2. Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Managers can manage campuses" ON campus;
DROP POLICY IF EXISTS "Managers have full access to users" ON users;
DROP POLICY IF EXISTS "Managers can create classes" ON turmas;
DROP POLICY IF EXISTS "Managers can update classes" ON turmas;
DROP POLICY IF EXISTS "Managers can delete classes" ON turmas;
DROP POLICY IF EXISTS "Managers can delete enrollments" ON inscricoes;
DROP POLICY IF EXISTS "Managers can mark attendance" ON presencas;
DROP POLICY IF EXISTS "Managers can update attendance" ON presencas;
DROP POLICY IF EXISTS "Managers can delete attendance" ON presencas;
DROP POLICY IF EXISTS "Managers can update evaluations" ON avaliacoes;
DROP POLICY IF EXISTS "Managers can delete evaluations" ON avaliacoes;

-- 3. Re-create policies using the secure function

-- CAMPUS
CREATE POLICY "Managers can manage campuses"
  ON campus FOR ALL
  TO authenticated
  USING ( is_gestor() );

-- USERS
CREATE POLICY "Managers have full access to users"
  ON users FOR ALL
  TO authenticated
  USING ( is_gestor() );

-- TURMAS
CREATE POLICY "Managers can create classes"
  ON turmas FOR INSERT
  TO authenticated
  WITH CHECK ( is_gestor() );

CREATE POLICY "Managers can update classes"
  ON turmas FOR UPDATE
  TO authenticated
  USING ( is_gestor() );

CREATE POLICY "Managers can delete classes"
  ON turmas FOR DELETE
  TO authenticated
  USING ( is_gestor() );

-- INSCRICOES
CREATE POLICY "Managers can delete enrollments"
  ON inscricoes FOR DELETE
  TO authenticated
  USING ( is_gestor() );

-- PRESENCAS
CREATE POLICY "Managers can mark attendance"
  ON presencas FOR INSERT
  TO authenticated
  WITH CHECK ( is_gestor() );

CREATE POLICY "Managers can update attendance"
  ON presencas FOR UPDATE
  TO authenticated
  USING ( is_gestor() );

CREATE POLICY "Managers can delete attendance"
  ON presencas FOR DELETE
  TO authenticated
  USING ( is_gestor() );

-- AVALIACOES
CREATE POLICY "Managers can update evaluations"
  ON avaliacoes FOR UPDATE
  TO authenticated
  USING ( is_gestor() );

CREATE POLICY "Managers can delete evaluations"
  ON avaliacoes FOR DELETE
  TO authenticated
  USING ( is_gestor() );

-- 4. Update mixed policies (OR conditions) to use the function for better performance/safety

-- Inscricoes
DROP POLICY IF EXISTS "Users can view their enrollments" ON inscricoes;
CREATE POLICY "Users can view their enrollments"
  ON inscricoes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_gestor()
  );

DROP POLICY IF EXISTS "Users can cancel their enrollment" ON inscricoes;
CREATE POLICY "Users can cancel their enrollment"
  ON inscricoes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR is_gestor()
  );

-- Presencas
DROP POLICY IF EXISTS "Users can view attendance" ON presencas;
CREATE POLICY "Users can view attendance"
  ON presencas FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_gestor()
  );

-- Avaliacoes
DROP POLICY IF EXISTS "Users can view evaluations" ON avaliacoes;
CREATE POLICY "Users can view evaluations"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_gestor()
  );

-- Users (Update self) - No change needed usually, but good to verify
-- "Users can update themselves" is usually strict on auth.uid() = id, so no recursion there unless it checks role.

