import { supabase } from '../config/supabase'
import type { TurmaDisponivel, Turma, CreateTurmaDTO } from '../types/database.types'

export const turmasAPI = {
    /**
     * Get all available classes (with vacancy count)
     */
    async getAvailable(): Promise<TurmaDisponivel[]> {
        const { data, error } = await supabase
            .rpc('get_turmas_disponiveis')

        if (error) {
            console.error('Error fetching available classes:', error)
            throw error
        }

        return data || []
    },

    /**
     * Get all classes (including closed)
     */
    async getAll(): Promise<Turma[]> {
        const { data, error } = await supabase
            .from('turmas')
            .select('*, campus:campus_id(nome)')
            .order('data', { ascending: true })
            .order('hora_inicio', { ascending: true })

        if (error) {
            console.error('Error fetching classes:', error)
            throw error
        }

        return data || []
    },

    /**
     * Get class by ID
     */
    async getById(id: string): Promise<Turma | null> {
        const { data, error } = await supabase
            .from('turmas')
            .select('*, campus:campus_id(nome)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching class:', error)
            throw error
        }

        return data
    },

    /**
     * Create new class (managers only)
     */
    async create(turma: CreateTurmaDTO): Promise<Turma> {
        const { data, error } = await supabase
            .from('turmas')
            .insert(turma)
            .select()
            .single()

        if (error) {
            console.error('Error creating class:', error)
            throw error
        }

        return data
    },

    /**
     * Update class
     */
    async update(id: string, updates: Partial<Turma>): Promise<Turma> {
        const { data, error } = await supabase
            .from('turmas')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating class:', error)
            throw error
        }

        return data
    },

    /**
     * Delete class
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('turmas')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting class:', error)
            throw error
        }
    },

    /**
     * Get class details with enrollments
     */
    async getDetails(id: string) {
        const { data, error } = await supabase
            .from('turmas')
            .select(`
        *,
        campus:campus_id (nome),
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
        turma_speakers (
          speaker:speakers (*)
        )
      `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching class details:', error)
            throw error
        }

        // Flatten speakers structure appropriately
        const formattedData = {
            ...data,
            speakers: data.turma_speakers
                ? data.turma_speakers.map((ts: any) => ts.speaker).filter(Boolean)
                : []
        }

        return formattedData
    }
}
