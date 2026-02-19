import { supabase } from '../config/supabase'
import type { Avaliacao } from '../types/database.types'

export const avaliacoesAPI = {
    /**
     * Submit evaluation (only if user was present)
     */
    async submit(turmaId: string, userId: string, respostas: Record<string, any>, nps: number, comentario?: string): Promise<Avaliacao> {
        const { data, error } = await supabase
            .from('avaliacoes')
            .insert({
                turma_id: turmaId,
                user_id: userId,
                respostas,
                nps,
                comentario
            })
            .select()
            .single()

        if (error) {
            console.error('Error submitting evaluation:', error)
            throw error
        }

        return data
    },

    /**
     * Get evaluations for a class
     */
    async getByTurma(turmaId: string): Promise<Avaliacao[]> {
        const { data, error } = await supabase
            .from('avaliacoes')
            .select(`
        *,
        user:user_id (
          nome,
          email
        )
      `)
            .eq('turma_id', turmaId)
            .order('enviada_em', { ascending: false })

        if (error) {
            console.error('Error fetching evaluations:', error)
            throw error
        }

        return data || []
    },

    /**
     * Check if user can submit evaluation (must be present)
     */
    async canSubmit(turmaId: string, userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('presencas')
            .select('presente')
            .eq('turma_id', turmaId)
            .eq('user_id', userId)
            .single()

        if (error) return false

        return data?.presente === true
    },

    /**
     * Check if user already submitted evaluation
     */
    async hasSubmitted(turmaId: string, userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('avaliacoes')
            .select('id')
            .eq('turma_id', turmaId)
            .eq('user_id', userId)
            .maybeSingle()

        if (error) return false

        return data !== null
    }
}
