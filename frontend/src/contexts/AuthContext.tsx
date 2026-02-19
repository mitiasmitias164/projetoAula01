import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@backend/config/supabase'
import type { User } from '@backend/types/database.types'

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<User>
    signUp: (email: string, password: string, userData: any) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadUserData(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadUserData(session.user.id)
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function loadUserData(userId: string) {
        try {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            setUser(data)
        } catch (error) {
            console.error('Error loading user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const signIn = async (email: string, password: string): Promise<User> => {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error

        // Load user data immediately so caller can use it for navigation
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (userData) {
            setUser(userData)
        }

        return userData as User
    }

    const signUp = async (email: string, password: string, userData: any) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        })

        if (error) throw error

        // Profile is now created by Database Trigger (on_auth_user_created)
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
