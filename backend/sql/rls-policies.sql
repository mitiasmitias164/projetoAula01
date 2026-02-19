-- Row Level Security (RLS) Policies
-- These policies enforce authorization at the database level

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- ================================================
-- HELPER FUNCTIONS
-- ================================================
-- Create a Security Definer function to check admin/gestor role
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

-- ================================================
-- CAMPUS POLICIES
-- ================================================
-- Everyone can view all campuses
CREATE POLICY "Anyone can view campuses"
  ON campus FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only managers can manage campuses
CREATE POLICY "Managers can manage campuses"
  ON campus FOR ALL
  TO authenticated
  USING ( is_gestor() );

-- ================================================
-- USERS POLICIES
-- ================================================
-- Users can view all users (for enrollment lists, etc.)
CREATE POLICY "Authenticated users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- New users can insert their own profile (signup)
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Managers have full access to all users
CREATE POLICY "Managers have full access to users"
  ON users FOR ALL
  TO authenticated
  USING ( is_gestor() );

-- ================================================
-- TURMAS POLICIES
-- ================================================
-- Everyone (including anonymous) can view open classes
CREATE POLICY "Anyone can view open classes"
  ON turmas FOR SELECT
  TO authenticated, anon
  USING (status = 'ABERTA');

-- Authenticated users can view all classes (including closed)
CREATE POLICY "Authenticated users can view all classes"
  ON turmas FOR SELECT
  TO authenticated
  USING (true);

-- Managers can create classes
CREATE POLICY "Managers can create classes"
  ON turmas FOR INSERT
  TO authenticated
  WITH CHECK ( is_gestor() );

-- Managers can update classes
CREATE POLICY "Managers can update classes"
  ON turmas FOR UPDATE
  TO authenticated
  USING ( is_gestor() );

-- Managers can delete classes
CREATE POLICY "Managers can delete classes"
  ON turmas FOR DELETE
  TO authenticated
  USING ( is_gestor() );

-- ================================================
-- INSCRICOES POLICIES
-- ================================================
-- Users can view their own enrollments
CREATE POLICY "Users can view their enrollments"
  ON inscricoes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_gestor()
  );

-- Users can enroll themselves (use function for safety)
CREATE POLICY "Users can enroll themselves"
  ON inscricoes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can cancel their own enrollment
CREATE POLICY "Users can cancel their enrollment"
  ON inscricoes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR is_gestor()
  );

-- Managers can delete enrollments
CREATE POLICY "Managers can delete enrollments"
  ON inscricoes FOR DELETE
  TO authenticated
  USING ( is_gestor() );

-- ================================================
-- PRESENCAS POLICIES
-- ================================================
-- Users can view their own attendance
-- Managers can view all attendance
CREATE POLICY "Users can view attendance"
  ON presencas FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_gestor()
  );

-- Only managers can mark attendance
CREATE POLICY "Managers can mark attendance"
  ON presencas FOR INSERT
  TO authenticated
  WITH CHECK ( is_gestor() );

-- Only managers can update attendance
CREATE POLICY "Managers can update attendance"
  ON presencas FOR UPDATE
  TO authenticated
  USING ( is_gestor() );

-- Only managers can delete attendance records
CREATE POLICY "Managers can delete attendance"
  ON presencas FOR DELETE
  TO authenticated
  USING ( is_gestor() );

-- ================================================
-- AVALIACOES POLICIES
-- ================================================
-- Users can view their own evaluations
-- Managers can view all evaluations
CREATE POLICY "Users can view evaluations"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_gestor()
  );

-- Users can submit evaluations ONLY if they were present
CREATE POLICY "Users can submit evaluations if present"
  ON avaliacoes FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM presencas
      WHERE turma_id = avaliacoes.turma_id
        AND user_id = auth.uid()
        AND presente = true
    )
  );

-- Users cannot update evaluations (one-time submission)
-- Managers can update if needed
CREATE POLICY "Managers can update evaluations"
  ON avaliacoes FOR UPDATE
  TO authenticated
  USING ( is_gestor() );

-- Only managers can delete evaluations
CREATE POLICY "Managers can delete evaluations"
  ON avaliacoes FOR DELETE
  TO authenticated
  USING ( is_gestor() );
