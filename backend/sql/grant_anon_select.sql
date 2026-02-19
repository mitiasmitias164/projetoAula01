-- Grant SELECT permission to anon role on tables needed for public turma details page
-- RLS policies already exist allowing anon SELECT, but the table-level GRANT was missing

GRANT SELECT ON public.turmas TO anon;
GRANT SELECT ON public.inscricoes TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.campus TO anon;
GRANT SELECT ON public.speakers TO anon;
GRANT SELECT ON public.turma_speakers TO anon;
