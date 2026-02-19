-- CHECK USER STATUS AND PROMOTE TO GESTOR
-- Replace 'seu.email@exemplo.com' with the email you are using to log in.

DO $$
DECLARE
  v_email TEXT := 'matheusmmgbilada@gmail.com'; -- <<< COLOQUE SEU EMAIL AQUI
  v_user_id UUID;
  v_role user_role;
BEGIN
  -- 1. Get User ID from Auth
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado no sistema de autenticação.', v_email;
  END IF;

  RAISE NOTICE 'Usuário encontrado: % (ID: %)', v_email, v_user_id;

  -- 2. Check/Insert into public.users
  -- Tries to find the user profile. If not found, creates it.
  INSERT INTO public.users (id, nome, email, telefone, niveis_ensino, role)
  VALUES (
    v_user_id,
    'Gestor (Atualizado)',
    v_email,
    '000000000',
    ARRAY['Administrativo'],
    'GESTOR'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'GESTOR'; -- Force update to GESTOR

  RAISE NOTICE 'Permissões de GESTOR aplicadas com sucesso para %', v_email;
END $$;
