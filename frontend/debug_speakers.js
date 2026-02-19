
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ddulgykbyegjsgahvqsx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdWxneWtieWVnanNnYWh2cXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTczNzIsImV4cCI6MjA4NjQzMzM3Mn0.uepxUlY4o4p8-mfNIfmDgmK1eHNR0YqVY6Z85xZBdm4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectTurmas() {
    console.log('--- Inspecting Turmas Columns ---')

    const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]))
        console.log('Full First Row:', JSON.stringify(data[0], null, 2))
    } else {
        console.log('No turmas found')
    }
}

inspectTurmas()
