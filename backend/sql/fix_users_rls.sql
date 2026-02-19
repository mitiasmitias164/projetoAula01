-- FIX USERS TABLE RLS
-- The error "CORS policy" on fetch likely means the RLS is blocking the request (returning 406/404/403)
-- and the browser interprets it as a connection issue or the headers are missing on error.

-- 1. Ensure any authenticated user can read their OWN profile (minimum requirement for login)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
TO authenticated
USING (
  -- Users can see their own profile
  id = auth.uid() 
  -- OR they are a manager (handled by another policy, but safe to add here if needed)
  OR (SELECT public.is_gestor())
);

-- 2. Alternatively, restore "Allow all authenticated to view all users" if your app needs that
-- (Uncomment below if you want stricter privacy, otherwise keep the above)
DROP POLICY IF EXISTS "Authenticated users can view all users" ON public.users;
CREATE POLICY "Authenticated users can view all users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- 3. Explicitly Grant Select again
GRANT SELECT, UPDATE, INSERT ON TABLE public.users TO authenticated;
