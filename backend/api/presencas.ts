import { supabase } from '../config/supabase'
import type { Presenca } from '../types/database.types'

export const presencasAPI = {
    /**
     * Mark attendance for a user in a class
     */
    async mark(turmaId: string, userId: string, presente: boolean, marcadoPor: string): Promise<Presenca> {
        const { data, error } = await supabase
            .from('presencas')
            .upsert({
                turma_id: turmaId,
                user_id: userId,
                presente,
                marcado_por: marcadoPor
            })
            .select()
            .single()

        if (error) {
            console.error('Error marking attendance:', error)
            throw error
        }

        return data
    },

    /**
     * Get attendance for a class
     */
    async getByTurma(turmaId: string): Promise<Presenca[]> {
        const { data, error } = await supabase
            .from('presencas')
            .select(`
        *,
        user:user_id (
          nome,
          email
        ),
        marcador:marcado_por (
          nome
        )
      `)
            .eq('turma_id', turmaId)

        if (error) {
            console.error('Error fetching attendance:', error)
            throw error
        }

        return data || []
    },

    /**
     * Get user's attendance records
     */
    async getByUser(userId: string): Promise<Presenca[]> {
        const { data, error } = await supabase
            .from('presencas')
            .select('*')
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching user attendance:', error)
            throw error
        }

        return data || []
    }
}
