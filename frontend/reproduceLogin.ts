
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ddulgykbyegjsgahvqsx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdWxneWtieWVnanNnYWh2cXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTczNzIsImV4cCI6MjA4NjQzMzM3Mn0.uepxUlY4o4p8-mfNIfmDgmK1eHNR0YqVY6Z85xZBdm4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function reproduce() {
    console.log('--- REPRODUCING LOGIN FLOW ---')
    const email = 'matheusmmgbilada@gmail.com'
    const password = 'Matias164!'

    // 1. Sign In
    console.log('1. Attempting signInWithPassword...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (authError) {
        console.error('LOGIN FAILED:', authError)
        return
    }

    console.log('Login successful. User ID:', authData.user.id)
    console.log('Session access token:', authData.session.access_token.substring(0, 20) + '...')

    // 2. Select from public.users
    console.log('2. Attempting to select from public.users...')
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (userError) {
            console.error('SELECT FAILED:', userError)
            console.error('Details:', userError.details)
            console.error('Hint:', userError.hint)
            console.error('Code:', userError.code)
        } else {
            console.log('Select successful:', userData)
        }
    } catch (e) {
        console.error('EXCEPTION during select:', e)
    }
}

reproduce()
