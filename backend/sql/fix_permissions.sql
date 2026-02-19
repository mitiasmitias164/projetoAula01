-- FIX TABLE PERMISSIONS AND RE-VERIFY RLS

-- 1. Grant explicit permissions to the authenticated role
-- Sometimes explicit GRANTS are missing even if RLS is on.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.campus TO authenticated;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.turmas TO authenticated;
GRANT ALL ON TABLE public.inscricoes TO authenticated;
GRANT ALL ON TABLE public.presencas TO authenticated;
GRANT ALL ON TABLE public.avaliacoes TO authenticated;

-- 2. Confirm the is_gestor function (Safety Check)
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'GESTOR'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the policy uses the function correctly
DROP POLICY IF EXISTS "Managers can manage campuses" ON campus;
CREATE POLICY "Managers can manage campuses"
  ON campus FOR ALL
  TO authenticated
  USING ( public.is_gestor() );

-- 4. Enable RLS (just in case it was disabled)
ALTER TABLE campus ENABLE ROW LEVEL SECURITY;
