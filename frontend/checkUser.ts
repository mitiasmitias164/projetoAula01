
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ddulgykbyegjsgahvqsx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdWxneWtieWVnanNnYWh2cXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTczNzIsImV4cCI6MjA4NjQzMzM3Mn0.uepxUlY4o4p8-mfNIfmDgmK1eHNR0YqVY6Z85xZBdm4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
    const email = 'matheusmmgbilada@gmail.com'
    const password = 'Matias164!'

    console.log('1. Tentando login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError) {
        console.log('Login falhou:', loginError.message)
    } else {
        console.log('Login sucesso! User ID:', loginData.user.id)

        console.log('2. Verificando tabela public.users...')
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', loginData.user.id)
            .single()


        if (userError) {
            console.log('Erro ao ler public.users:', userError.message)
            if (userError.code === 'PGRST116') {
                console.log('Usuário não encontrado. Tentando criar com role padrão (PROFESSOR)...')
                const { error: createError } = await supabase
                    .from('users')
                    .insert({
                        id: loginData.user.id,
                        nome: 'Matheus Admin',
                        email: email,
                        telefone: '0000000000',
                        niveis_ensino: [],
                        // role: 'PROFESSOR' // Deixar default
                    })

                if (createError) {
                    console.log('Erro ao criar user (PROFESSOR):', createError.message, createError.details)
                } else {
                    console.log('Usuário criado como PROFESSOR. Tentando promover para GESTOR...')
                    const { error: upgradeError } = await supabase
                        .from('users')
                        .update({ role: 'GESTOR' })
                        .eq('id', loginData.user.id)

                    if (upgradeError) console.log('Erro ao promover:', upgradeError.message)
                    else console.log('Sucesso! Usuário promovido a GESTOR.')
                }
            }
        } else {

            console.log('Usuário encontrado na public.users:', userData)
            if (userData.role !== 'GESTOR') {
                console.log('Role incorreta. Tentando atualizar para GESTOR...')
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ role: 'GESTOR' })
                    .eq('id', loginData.user.id)

                if (updateError) console.log('Erro ao atualizar role:', updateError.message)
                else console.log('Role atualizada para GESTOR!')
            } else {
                console.log('Role já é GESTOR.')
            }
        }
    }
}

checkUser()
