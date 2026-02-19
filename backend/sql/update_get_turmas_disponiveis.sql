-- Drop the function first because we are changing the return type
DROP FUNCTION IF EXISTS get_turmas_disponiveis();

-- Update get_turmas_disponiveis to include all necessary columns
-- Specifically added: nome, sobre, pdf_url, foto_capa, palestrantes

CREATE OR REPLACE FUNCTION get_turmas_disponiveis()
RETURNS TABLE (
  id UUID,
  campus_id UUID,
  campus_nome TEXT,
  nome TEXT,
  sobre TEXT,
  pdf_url TEXT,
  foto_capa TEXT,
  palestrantes TEXT,
  data DATE,
  hora_inicio TIME,
  hora_fim TIME,
  local TEXT,
  capacidade INTEGER,
  vagas_disponiveis INTEGER,
  total_inscritos INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.campus_id,
    c.nome as campus_nome,
    t.nome,
    t.sobre,
    t.pdf_url,
    t.foto_capa,
    t.palestrantes,
    t.data,
    t.hora_inicio,
    t.hora_fim,
    t.local,
    t.capacidade,
    (t.capacidade - COALESCE(COUNT(i.id), 0)::INTEGER) as vagas_disponiveis,
    COALESCE(COUNT(i.id), 0)::INTEGER as total_inscritos,
    t.status::TEXT
  FROM turmas t
  JOIN campus c ON t.campus_id = c.id
  LEFT JOIN inscricoes i ON t.id = i.turma_id AND i.status = 'ATIVA'
  WHERE t.status = 'ABERTA'
  GROUP BY t.id, c.nome, t.data, t.hora_inicio, t.hora_fim, t.local, t.capacidade, t.nome, t.sobre, t.pdf_url, t.foto_capa, t.palestrantes, t.status
  HAVING COUNT(i.id) < t.capacidade
  ORDER BY t.data ASC, t.hora_inicio ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
