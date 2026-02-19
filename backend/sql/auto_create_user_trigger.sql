-- AUTO CREATE USER PROFILE ON SIGNUP
-- This trigger will automatically create a row in public.users when a new user signs up via auth.users

-- 1. Create the function that handles the new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    nome,
    telefone,
    campus_id,
    niveis_ensino,
    role
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'telefone',
    (new.raw_user_meta_data->>'campus_id')::uuid,
    ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'niveis_ensino')),
    (new.raw_user_meta_data->>'role')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
