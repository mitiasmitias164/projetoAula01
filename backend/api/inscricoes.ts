import { supabase } from '../config/supabase'
import type { Inscricao, EnrollmentResult } from '../types/database.types'

export const inscricoesAPI = {
    /**
     * Enroll in a class (uses atomic database function)
     */
    async enroll(turmaId: string, userId: string): Promise<EnrollmentResult> {
        const { data, error } = await supabase
            .rpc('inscrever_em_turma', {
                p_turma_id: turmaId,
                p_user_id: userId
            })

        if (error) {
            console.error('Error enrolling in class:', error)
            return {
                success: false,
                message: 'Erro ao processar inscrição'
            }
        }

        return data as EnrollmentResult
    },

    /**
     * Cancel enrollment
     */
    async cancel(inscricaoId: string): Promise<Inscricao> {
        const { data, error } = await supabase
            .from('inscricoes')
            .update({ status: 'CANCELADA' })
            .eq('id', inscricaoId)
            .select()
            .single()

        if (error) {
            console.error('Error canceling enrollment:', error)
            throw error
        }

        return data
    },

    /**
     * Get user's enrollments
     */
    async getByUser(userId: string): Promise<any[]> {
        const { data, error } = await supabase
            .rpc('get_user_inscricoes', {
                p_user_id: userId
            })

        if (error) {
            console.error('Error fetching user enrollments:', error)
            throw error
        }

        return data || []
    },

    /**
     * Get enrollments for a specific class
     */
    async getByTurma(turmaId: string): Promise<Inscricao[]> {
        const { data, error } = await supabase
            .from('inscricoes')
            .select(`
        *,
        user:user_id (
          nome,
          email,
          telefone
        )
      `)
            .eq('turma_id', turmaId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching class enrollments:', error)
            throw error
        }

        return data || []
    }
}
