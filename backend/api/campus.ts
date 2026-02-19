import { supabase } from '../config/supabase'
import type { Campus } from '../types/database.types'

export const campusAPI = {
    /**
     * Get all campuses
     */
    async getAll(): Promise<Campus[]> {
        const { data, error } = await supabase
            .from('campus')
            .select('*')
            .order('nome', { ascending: true })

        if (error) {
            console.error('Error fetching campuses:', error)
            throw error
        }

        return data || []
    },

    /**
     * Get campus by ID
     */
    async getById(id: string): Promise<Campus | null> {
        const { data, error } = await supabase
            .from('campus')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching campus:', error)
            throw error
        }

        return data
    }
}
