-- =====================================================
-- Adicionar coluna data_limite_inscricao à tabela turmas
-- =====================================================

-- 1. Adicionar a coluna (nullable, sem data limite = inscrições sempre abertas)
ALTER TABLE public.turmas
ADD COLUMN IF NOT EXISTS data_limite_inscricao DATE;

COMMENT ON COLUMN public.turmas.data_limite_inscricao IS 'Data limite para inscrição na turma. NULL = sem limite.';

-- =====================================================
-- 2. Atualizar function inscrever_em_turma para checar data limite
-- =====================================================
DROP FUNCTION IF EXISTS inscrever_em_turma(UUID, UUID);

CREATE OR REPLACE FUNCTION inscrever_em_turma(
  p_turma_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_capacidade INTEGER;
  v_total_inscritos INTEGER;
  v_status turma_status;
  v_data_limite DATE;
BEGIN
  -- Lock the row to prevent concurrent enrollments (FOR UPDATE)
  SELECT capacidade, status, data_limite_inscricao 
  INTO v_capacidade, v_status, v_data_limite
  FROM turmas
  WHERE id = p_turma_id
  FOR UPDATE;
  
  -- Check if class exists
  IF v_capacidade IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Turma não encontrada'
    );
  END IF;
  
  -- Check if class is open
  IF v_status != 'ABERTA' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Turma não está aberta para inscrições'
    );
  END IF;

  -- Check enrollment deadline (falls back to turma date if no explicit deadline)
  IF CURRENT_DATE > COALESCE(v_data_limite, (SELECT data FROM turmas WHERE id = p_turma_id)) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'O prazo para inscrição nesta turma já encerrou'
    );
  END IF;
  
  -- Count active enrollments
  SELECT COUNT(*) INTO v_total_inscritos
  FROM inscricoes
  WHERE turma_id = p_turma_id AND status = 'ATIVA';
  
  -- Check capacity
  IF v_total_inscritos >= v_capacidade THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Turma lotada'
    );
  END IF;
  
  -- Check for duplicate enrollment
  IF EXISTS (
    SELECT 1 FROM inscricoes
    WHERE turma_id = p_turma_id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Você já está inscrito nesta turma'
    );
  END IF;
  
  -- Insert enrollment
  INSERT INTO inscricoes (turma_id, user_id, status)
  VALUES (p_turma_id, p_user_id, 'ATIVA');
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Inscrição realizada com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao processar inscrição'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. Atualizar function get_turmas_disponiveis para incluir data_limite_inscricao
-- =====================================================
DROP FUNCTION IF EXISTS get_turmas_disponiveis();

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
  status TEXT,
  data_limite_inscricao DATE
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
    t.status::TEXT,
    t.data_limite_inscricao
  FROM turmas t
  JOIN campus c ON t.campus_id = c.id
  LEFT JOIN inscricoes i ON t.id = i.turma_id AND i.status = 'ATIVA'
  WHERE t.status = 'ABERTA'
    AND CURRENT_DATE <= COALESCE(t.data_limite_inscricao, t.data)
  GROUP BY t.id, c.nome, t.data, t.hora_inicio, t.hora_fim, t.local, t.capacidade, t.nome, t.sobre, t.pdf_url, t.foto_capa, t.palestrantes, t.status, t.data_limite_inscricao
  HAVING COUNT(i.id) < t.capacidade
  ORDER BY t.data ASC, t.hora_inicio ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
