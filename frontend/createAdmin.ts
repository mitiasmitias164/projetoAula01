
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ddulgykbyegjsgahvqsx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdWxneWtieWVnanNnYWh2cXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTczNzIsImV4cCI6MjA4NjQzMzM3Mn0.uepxUlY4o4p8-mfNIfmDgmK1eHNR0YqVY6Z85xZBdm4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
    console.log('Criando usuário administrador...')

    const email = 'matheusmmgbilada@gmail.com'
    const password = 'Matias164!'

    // 1. Sign Up User
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.error('Erro ao criar usuário auth:', error.message)
        return
    }

    if (!data.user) {
        console.error('Usuário não retornado após create')
        return
    }

    console.log('Usuário Auth criado:', data.user.id)

    // 2. Create User Profile in public.users table with GESTOR role
    const { error: profileError } = await supabase
        .from('users')
        .insert({
            id: data.user.id,
            nome: 'Matheus Admin',
            email: email,
            telefone: '0000000000',
            niveis_ensino: [],
            role: 'GESTOR'
        })
        .select()
        .single()

    if (profileError) {
        console.error('Erro ao criar perfil:', profileError.message)
    } else {
        console.log('Perfil de administrador criado com sucesso!')
    }
}

createAdmin()
