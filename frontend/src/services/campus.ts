import { supabase } from '@/lib/supabase'
import type { Campus } from '@backend/types/database.types'

export const campusService = {
    async getAll() {
        const { data, error } = await supabase
            .from('campus')
            .select('*')
            .order('nome')

        if (error) throw error
        return data as Campus[]
    },

    async create(nome: string) {
        const { data, error } = await supabase
            .from('campus')
            .insert([{ nome }])
            .select()
            .single()

        if (error) throw error
        return data as Campus
    },

    async update(id: string, nome: string) {
        const { data, error } = await supabase
            .from('campus')
            .update({ nome })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Campus
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('campus')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
