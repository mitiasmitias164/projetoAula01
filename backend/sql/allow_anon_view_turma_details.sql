-- Allow anonymous (unauthenticated) users to view inscricoes data
-- This is needed so the public turma details page can show vacancy counts
-- Without this, the getDetails query fails for anon users because of the inscricoes join

-- Policy: Anon can only SELECT inscricoes (read-only, for vacancy count display)
CREATE POLICY "Anon can view inscricoes for public pages"
  ON inscricoes FOR SELECT
  TO anon
  USING (true);

-- Policy: Anon can view basic user info (needed for the inscricoes join in getDetails)
CREATE POLICY "Anon can view basic user info"
  ON users FOR SELECT
  TO anon
  USING (true);
