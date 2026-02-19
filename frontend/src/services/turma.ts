import { supabase } from '@/lib/supabase'
import type { Turma, CreateTurmaDTO } from '@backend/types/database.types'

export const turmaService = {
    async getAll() {
        const { data, error } = await supabase
            .from('turmas')
            .select(`
                *,
                campus:campus_id (nome)
            `)
            .order('data', { ascending: true })
            .order('hora_inicio', { ascending: true })

        if (error) throw error
        return data
    },

    async create(turma: CreateTurmaDTO) {
        const { data, error } = await supabase
            .from('turmas')
            .insert(turma)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async update(id: string, updates: Partial<Turma>) {
        const { data, error } = await supabase
            .from('turmas')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('turmas')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async getDetails(id: string) {
        const { data, error } = await supabase
            .from('turmas')
            .select(`
        *,
        campus:campus_id (nome),
        turma_speakers:turma_speakers (
          speaker:speakers (*)
        ),
        inscricoes:inscricoes (
          id,
          status,
          created_at,
          user:user_id (
            id,
            nome,
            email,
            telefone
          )
        ),
        presencas:presencas (
            user_id,
            presente
        ),
        avaliacoes:avaliacoes (
            user_id
        )
      `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching class details:', error)
            throw error
        }

        // Flatten the nested structure for frontend consistency
        // From: turma_speakers: [{ speaker: { ... } }] 
        // To: speakers: [{ ... }]
        const speakers = data.turma_speakers?.map((ts: any) => ts.speaker).filter(Boolean) || []

        return { ...data, speakers }
    },

    async getPublicDetails(id: string) {
        const { data, error } = await supabase
            .from('turmas')
            .select(`
        *,
        campus:campus_id (nome),
        turma_speakers:turma_speakers (
          speaker:speakers (*)
        )
      `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching public class details:', error)
            throw error
        }

        const speakers = data.turma_speakers?.map((ts: any) => ts.speaker).filter(Boolean) || []

        // Return with empty restricted arrays to match the expected interface
        return {
            ...data,
            speakers,
            inscricoes: [],
            presencas: [],
            avaliacoes: []
        }
    },

    async enroll(turmaId: string, userId: string) {
        const { data, error } = await supabase
            .rpc('inscrever_em_turma', {
                p_turma_id: turmaId,
                p_user_id: userId
            })

        if (error) {
            console.error('Error enrolling in class:', error)
            throw error
        }

        return data
    },

    async submitEvaluation(avaliacao: {
        turma_id: string,
        user_id: string,
        nps: number,
        respostas: any,
        comentario?: string
    }) {
        const { data, error } = await supabase
            .from('avaliacoes')
            .insert({
                ...avaliacao,
                enviada_em: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data
    }
}
