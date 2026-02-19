-- Database Functions for Atomic Operations
-- These functions prevent race conditions and ensure data integrity

-- Function: Enroll in a class (atomic operation with vacancy check)
CREATE OR REPLACE FUNCTION inscrever_em_turma(
  p_turma_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_capacidade INTEGER;
  v_total_inscritos INTEGER;
  v_status turma_status;
BEGIN
  -- Lock the row to prevent concurrent enrollments (FOR UPDATE)
  SELECT capacidade, status INTO v_capacidade, v_status
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

-- Function: Get available classes (with vacancy calculation)
CREATE OR REPLACE FUNCTION get_turmas_disponiveis()
RETURNS TABLE (
  id UUID,
  campus_id UUID,
  campus_nome TEXT,
  data DATE,
  hora_inicio TIME,
  hora_fim TIME,
  local TEXT,
  capacidade INTEGER,
  vagas_disponiveis INTEGER,
  total_inscritos INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.campus_id,
    c.nome as campus_nome,
    t.data,
    t.hora_inicio,
    t.hora_fim,
    t.local,
    t.capacidade,
    (t.capacidade - COALESCE(COUNT(i.id), 0)::INTEGER) as vagas_disponiveis,
    COALESCE(COUNT(i.id), 0)::INTEGER as total_inscritos
  FROM turmas t
  JOIN campus c ON t.campus_id = c.id
  LEFT JOIN inscricoes i ON t.id = i.turma_id AND i.status = 'ATIVA'
  WHERE t.status = 'ABERTA'
  GROUP BY t.id, c.nome, t.data, t.hora_inicio, t.hora_fim, t.local, t.capacidade
  HAVING COUNT(i.id) < t.capacidade
  ORDER BY t.data ASC, t.hora_inicio ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get class details with enrollments
CREATE OR REPLACE FUNCTION get_turma_detalhes(p_turma_id UUID)
RETURNS TABLE (
  turma_id UUID,
  campus_nome TEXT,
  data DATE,
  hora_inicio TIME,
  hora_fim TIME,
  local TEXT,
  capacidade INTEGER,
  status turma_status,
  total_inscritos INTEGER,
  vagas_disponiveis INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as turma_id,
    c.nome as campus_nome,
    t.data,
    t.hora_inicio,
    t.hora_fim,
    t.local,
    t.capacidade,
    t.status,
    COUNT(i.id)::INTEGER as total_inscritos,
    (t.capacidade - COUNT(i.id)::INTEGER) as vagas_disponiveis
  FROM turmas t
  JOIN campus c ON t.campus_id = c.id
  LEFT JOIN inscricoes i ON t.id = i.turma_id AND i.status = 'ATIVA'
  WHERE t.id = p_turma_id
  GROUP BY t.id, c.nome, t.data, t.hora_inicio, t.hora_fim, t.local, t.capacidade, t.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's enrollments
CREATE OR REPLACE FUNCTION get_user_inscricoes(p_user_id UUID)
RETURNS TABLE (
  inscricao_id UUID,
  turma_id UUID,
  campus_nome TEXT,
  data DATE,
  hora_inicio TIME,
  hora_fim TIME,
  local TEXT,
  status inscricao_status,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as inscricao_id,
    t.id as turma_id,
    c.nome as campus_nome,
    t.data,
    t.hora_inicio,
    t.hora_fim,
    t.local,
    i.status,
    i.created_at
  FROM inscricoes i
  JOIN turmas t ON i.turma_id = t.id
  JOIN campus c ON t.campus_id = c.id
  WHERE i.user_id = p_user_id
  ORDER BY t.data DESC, t.hora_inicio DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
