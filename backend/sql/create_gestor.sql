-- 1. Create the user in Supabase Dashboard -> Authentication first!
-- 2. Run this script to link that user to a GESTOR profile.

DO $$
DECLARE
  v_email TEXT := 'gestor@escola.edu.br'; -- CHANGE THIS TO YOUR GESTOR EMAIL
  v_user_id UUID;
BEGIN
  -- Find the user in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users. Please create the user in the Dashboard first.', v_email;
  END IF;

  -- Insert into public.users
  INSERT INTO public.users (
    id,
    nome,
    email,
    telefone,
    niveis_ensino,
    role
  ) VALUES (
    v_user_id,
    'Gestor do Sistema',
    v_email,
    '(00) 00000-0000',
    ARRAY['Administrativo'],
    'GESTOR'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'GESTOR'; -- If profile exists, just promote to GESTOR

  RAISE NOTICE 'User % (ID: %) is now a GESTOR.', v_email, v_user_id;
END $$;
