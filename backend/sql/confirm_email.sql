-- CONFIRM USER EMAIL MANUALLY
-- Replace with the email that is having login issues

DO $$
DECLARE
  v_email TEXT := 'matheus164rodrigues@gmail.com'; -- <<< SEU EMAIL AQUI
BEGIN
  -- Update the confirmed_at timestamp effectively confirming the user
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE email = v_email;

  IF FOUND THEN
    RAISE NOTICE 'Email % confirmado com sucesso!', v_email;
  ELSE
    RAISE NOTICE 'Email % não encontrado.', v_email;
  END IF;
END $$;
