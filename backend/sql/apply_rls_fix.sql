-- FIX RLS INFINITE RECURSION
-- Run this in Supabase SQL Editor

-- 1. Create a helper function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This query runs with the privileges of the function creator (postgres), bypassing RLS
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'GESTOR'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Managers have full access to users" ON users;
DROP POLICY IF EXISTS "Managers can manage campuses" ON campus;
DROP POLICY IF EXISTS "Managers can create classes" ON turmas;
DROP POLICY IF EXISTS "Managers can update classes" ON turmas;
DROP POLICY IF EXISTS "Managers can delete classes" ON turmas;
DROP POLICY IF EXISTS "Managers can delete enrollments" ON inscricoes;
DROP POLICY IF EXISTS "Managers can mark attendance" ON presencas;
DROP POLICY IF EXISTS "Managers can update attendance" ON presencas;
DROP POLICY IF EXISTS "Managers can delete attendance" ON presencas;
DROP POLICY IF EXISTS "Managers can update evaluations" ON avaliacoes;
DROP POLICY IF EXISTS "Managers can delete evaluations" ON avaliacoes;

-- 3. Re-create policies using the safe function

-- Users
CREATE POLICY "Managers have full access to users"
  ON users FOR ALL
  TO authenticated
  USING ( is_admin() );

-- Campus
CREATE POLICY "Managers can manage campuses"
  ON campus FOR ALL
  TO authenticated
  USING ( is_admin() );

-- Turmas
CREATE POLICY "Managers can create classes"
  ON turmas FOR INSERT
  TO authenticated
  WITH CHECK ( is_admin() );

CREATE POLICY "Managers can update classes"
  ON turmas FOR UPDATE
  TO authenticated
  USING ( is_admin() );

CREATE POLICY "Managers can delete classes"
  ON turmas FOR DELETE
  TO authenticated
  USING ( is_admin() );

-- Inscricoes
CREATE POLICY "Managers can delete enrollments"
  ON inscricoes FOR DELETE
  TO authenticated
  USING ( is_admin() );

-- Presencas
CREATE POLICY "Managers can mark attendance"
  ON presencas FOR INSERT
  TO authenticated
  WITH CHECK ( is_admin() );

CREATE POLICY "Managers can update attendance"
  ON presencas FOR UPDATE
  TO authenticated
  USING ( is_admin() );

CREATE POLICY "Managers can delete attendance"
  ON presencas FOR DELETE
  TO authenticated
  USING ( is_admin() );

-- Avaliacoes
CREATE POLICY "Managers can update evaluations"
  ON avaliacoes FOR UPDATE
  TO authenticated
  USING ( is_admin() );

CREATE POLICY "Managers can delete evaluations"
  ON avaliacoes FOR DELETE
  TO authenticated
  USING ( is_admin() );
