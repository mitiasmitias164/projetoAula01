
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectSpeakers() {
    console.log('--- Inspecting Speakers ---')

    // 1. Check all speakers
    const { data: allSpeakers, error: err1 } = await supabase.from('speakers').select('*')
    if (err1) console.error('Error fetching speakers:', err1)
    else {
        console.log(`Total unique speakers in 'speakers' table: ${allSpeakers?.length}`)
        const names = allSpeakers?.map(s => s.name)
        const duplicates = names?.filter((item, index) => names.indexOf(item) !== index)
        if (duplicates && duplicates.length > 0) {
            console.log('WARNING: Duplicate names in speakers table:', duplicates)
            // Detail the duplicates
            duplicates.forEach(dupName => {
                const dups = allSpeakers?.filter(s => s.name === dupName)
                console.log(`  "${dupName}":`, dups?.map(s => s.id))
            })
        } else {
            console.log('No duplicate names found in global speakers table.')
        }
    }

    // 2. Check turma_speakers
    const { data: links, error: err2 } = await supabase
        .from('turma_speakers')
        .select('turma_id, speaker:speakers(name, id)')

    if (err2) console.error('Error fetching links:', err2)
    else {
        // Group by turma
        const turmas: Record<string, any[]> = {}
        links?.forEach((l: any) => {
            if (!turmas[l.turma_id]) turmas[l.turma_id] = []
            turmas[l.turma_id].push(l.speaker)
        })

        Object.entries(turmas).forEach(([turmaId, speakers]) => {
            const names = speakers.map(s => s.name)
            const uniqueNames = new Set(names)
            if (names.length !== uniqueNames.size) {
                console.log(`\nTurma ${turmaId} has DUPLICATE speakers:`)
                console.log(names)
            }
        })
    }
}

inspectSpeakers()
