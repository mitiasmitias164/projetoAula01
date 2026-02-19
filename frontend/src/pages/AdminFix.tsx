import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminFix() {
    const [status, setStatus] = useState('Waiting...')
    const [log, setLog] = useState<string[]>([])

    const addLog = (msg: string) => setLog(prev => [...prev, msg])

    const fixUser = async () => {
        setStatus('Processing...')
        addLog('Starting fix...')

        try {
            // 1. Check Session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                addLog('No active session. Please login first (even if it redirects).')
                // Try logging in programmatically if they provided creds? 
                // Better to ask them to login on this page.
                return
            }

            const userId = session.user.id
            addLog(`User ID: ${userId}`)

            // 2. Check public.users
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (userError && userError.code === 'PGRST116') {
                addLog('User record missing. Creating...')

                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        nome: 'Admin User',
                        email: session.user.email,
                        telefone: '000000000',
                        niveis_ensino: [],
                        role: 'GESTOR'
                    })

                if (insertError) {
                    addLog(`Insert failed: ${insertError.message}`)
                    // Fallback to PROFESSOR?
                    const { error: insertError2 } = await supabase
                        .from('users')
                        .insert({
                            id: userId,
                            nome: 'Admin User',
                            email: session.user.email,
                            telefone: '000000000',
                            niveis_ensino: [],
                            role: 'PROFESSOR'
                        })
                    if (insertError2) addLog(`Insert (Prof) failed: ${insertError2.message}`)
                    else addLog('Created as PROFESSOR.')
                } else {
                    addLog('User created successfully as GESTOR!')
                }
            } else if (user) {
                addLog(`User exists. Role: ${user.role}`)
                if (user.role !== 'GESTOR') {
                    addLog('Updating role to GESTOR...')
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ role: 'GESTOR' })
                        .eq('id', userId)

                    if (updateError) addLog(`Update failed: ${updateError.message}`)
                    else addLog('Role updated to GESTOR!')
                } else {
                    addLog('User is already GESTOR.')
                }
            } else {
                addLog(`Error checking user: ${userError?.message}`)
            }

        } catch (e: any) {
            addLog(`Exception: ${e.message}`)
        } finally {
            setStatus('Done')
        }
    }

    const manualLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        const email = 'matheusmmgbilada@gmail.com'
        const password = 'Matias164!'

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) addLog(`Login failed: ${error.message}`)
        else addLog('Login successful! Now click Fix User.')
    }

    return (
        <div className="p-8 bg-black min-h-screen text-white font-mono">
            <h1 className="text-2xl mb-4">Admin Fix Tool</h1>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={manualLogin}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                    1. Auto Login (Credentials)
                </button>
                <button
                    onClick={fixUser}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                >
                    2. Fix User Record
                </button>
            </div>

            <div className="mb-4 text-yellow-400">Status: {status}</div>

            <div className="bg-gray-900 p-4 rounded border border-gray-700">
                {log.map((l, i) => (
                    <div key={i} className="mb-1">{l}</div>
                ))}
            </div>
        </div>
    )
}
