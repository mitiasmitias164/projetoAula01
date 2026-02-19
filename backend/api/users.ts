import { supabase } from '../config/supabase'
import type { User, CreateUserDTO } from '../types/database.types'

export const usersAPI = {
    /**
     * Get current authenticated user
     */
    async getCurrent(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('Error fetching current user:', error)
            return null
        }

        return data
    },

    /**
     * Create new user
     */
    async create(user: CreateUserDTO): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .insert(user)
            .select()
            .single()

        if (error) {
            console.error('Error creating user:', error)
            throw error
        }

        return data
    },

    /**
     * Update user
     */
    async update(id: string, updates: Partial<User>): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating user:', error)
            throw error
        }

        return data
    }
}
