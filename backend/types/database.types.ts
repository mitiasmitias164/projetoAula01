export interface Campus {
    id: string
    nome: string
    created_at: string
}

export interface User {
    id: string
    nome: string
    email: string
    telefone: string
    campus_id?: string
    niveis_ensino: string[]
    role: 'PROFESSOR' | 'GESTOR'
    created_at: string
    updated_at: string
}

export interface Speaker {
    id: string
    name: string
    bio?: string
    avatar_url?: string
    linkedin_url?: string
    instagram_url?: string
    created_at: string
}

export interface TurmaSpeaker {
    turma_id: string
    speaker_id: string
    created_at: string
    speaker?: Speaker // Joined
}

export interface Turma {
    id: string
    campus_id: string
    nome?: string
    sobre?: string
    pdf_url?: string
    foto_capa?: string
    palestrantes?: string // Legacy simple text
    speakers?: Speaker[] // Flattened list for frontend convenience
    data: string
    data_limite_inscricao?: string
    hora_inicio: string
    hora_fim: string
    local: string
    capacidade: number
    status: 'ABERTA' | 'ENCERRADA' | 'CONCLUIDA'
    created_at: string
    updated_at: string
}

export interface TurmaDisponivel extends Omit<Turma, 'campus_id'> {
    campus_nome: string
    vagas_disponiveis: number
    total_inscritos: number
    data_limite_inscricao?: string
}

export interface Inscricao {
    id: string
    turma_id: string
    user_id: string
    status: 'ATIVA' | 'CANCELADA'
    created_at: string
    updated_at: string
}

export interface Presenca {
    id: string
    turma_id: string
    user_id: string
    presente: boolean
    marcado_por?: string
    marcado_em: string
}

export interface Avaliacao {
    id: string
    turma_id: string
    user_id: string
    respostas: Record<string, any>
    nps: number
    comentario?: string
    enviada_em: string
}

export interface CreateTurmaDTO {
    campus_id: string
    nome?: string
    sobre?: string
    pdf_url?: string
    foto_capa?: string
    palestrantes?: string
    data: string
    data_limite_inscricao?: string
    hora_inicio: string
    hora_fim: string
    local: string
    capacidade?: number
}

export interface CreateUserDTO {
    nome: string
    email: string
    telefone: string
    campus_id?: string
    niveis_ensino: string[]
    role?: 'PROFESSOR' | 'GESTOR'
}

export interface EnrollmentResult {
    success: boolean
    message: string
}
