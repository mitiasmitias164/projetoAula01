-- Sistema Inteligente de Gestão de Turmas de IA
-- Database Schema for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('PROFESSOR', 'GESTOR');
CREATE TYPE inscricao_status AS ENUM ('ATIVA', 'CANCELADA');
CREATE TYPE turma_status AS ENUM ('ABERTA', 'ENCERRADA');

-- Campus Table
CREATE TABLE campus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT NOT NULL,
  campus_id UUID REFERENCES campus(id),
  niveis_ensino TEXT[] NOT NULL, -- Multi-select array: ['Fundamental', 'Médio', 'Superior']
  role user_role NOT NULL DEFAULT 'PROFESSOR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_campus ON users(campus_id);

-- Turmas (Classes) Table
CREATE TABLE turmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID REFERENCES campus(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  local TEXT NOT NULL,
  capacidade INTEGER DEFAULT 20 CHECK (capacidade > 0),
  status turma_status DEFAULT 'ABERTA',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for turmas
CREATE INDEX idx_turmas_campus ON turmas(campus_id);
CREATE INDEX idx_turmas_data ON turmas(data);
CREATE INDEX idx_turmas_status ON turmas(status);

-- Inscricoes (Enrollments) Table
CREATE TABLE inscricoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status inscricao_status DEFAULT 'ATIVA',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(turma_id, user_id) -- Prevent duplicate enrollments
);

-- Indexes for inscricoes
CREATE INDEX idx_inscricoes_turma ON inscricoes(turma_id);
CREATE INDEX idx_inscricoes_user ON inscricoes(user_id);
CREATE INDEX idx_inscricoes_status ON inscricoes(status);

-- Presencas (Attendance) Table
CREATE TABLE presencas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  presente BOOLEAN NOT NULL,
  marcado_por UUID REFERENCES users(id),
  marcado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(turma_id, user_id) -- One attendance record per user per class
);

-- Indexes for presencas
CREATE INDEX idx_presencas_turma ON presencas(turma_id);
CREATE INDEX idx_presencas_user ON presencas(user_id);

-- Avaliacoes (Evaluations) Table
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  respostas JSONB NOT NULL, -- Store structured answers: {"q1": "answer1", "q2": "answer2"}
  nps INTEGER CHECK (nps >= 0 AND nps <= 10),
  comentario TEXT,
  enviada_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(turma_id, user_id) -- One evaluation per user per class
);

-- Indexes for avaliacoes
CREATE INDEX idx_avaliacoes_turma ON avaliacoes(turma_id);
CREATE INDEX idx_avaliacoes_user ON avaliacoes(user_id);
CREATE INDEX idx_avaliacoes_nps ON avaliacoes(nps);

-- Insert default campus (example data)
INSERT INTO campus (nome) VALUES
  ('Campus Centro'),
  ('Campus Norte'),
  ('Campus Sul'),
  ('Campus Leste'),
  ('Campus Oeste')
ON CONFLICT (nome) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON turmas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscricoes_updated_at
  BEFORE UPDATE ON inscricoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
