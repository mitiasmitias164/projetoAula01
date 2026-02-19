-- Adicionar colunas para detalhes da turma
ALTER TABLE public.turmas
ADD COLUMN IF NOT EXISTS nome TEXT,
ADD COLUMN IF NOT EXISTS sobre TEXT,
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS palestrantes TEXT;

-- Adicionar comentários (opcional)
COMMENT ON COLUMN public.turmas.nome IS 'Nome personalizado da turma';
COMMENT ON COLUMN public.turmas.sobre IS 'Descrição detalhada sobre o conteúdo da turma';
COMMENT ON COLUMN public.turmas.pdf_url IS 'URL para o arquivo PDF do cronograma';
COMMENT ON COLUMN public.turmas.palestrantes IS 'Lista de nomes dos palestrantes ou convidados';
