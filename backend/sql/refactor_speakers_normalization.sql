-- 1. Create the new 'speakers' table (Global Registry)
CREATE TABLE IF NOT EXISTS public.speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the pivot table 'turma_speakers' (Many-to-Many relation)
CREATE TABLE IF NOT EXISTS public.turma_speakers (
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    speaker_id UUID REFERENCES public.speakers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (turma_id, speaker_id)
);

-- 3. Migrate existing data from 'class_speakers' to 'speakers' and 'turma_speakers'
DO $$
DECLARE
    r RECORD;
    new_speaker_id UUID;
BEGIN
    FOR r IN SELECT * FROM public.class_speakers LOOP
        -- Check if speaker with this name already exists in new table
        SELECT id INTO new_speaker_id FROM public.speakers WHERE name = r.name LIMIT 1;
        
        -- If not, create it
        IF new_speaker_id IS NULL THEN
            INSERT INTO public.speakers (name, bio, avatar_url, linkedin_url)
            VALUES (r.name, r.bio, r.avatar_url, r.linkedin_url)
            RETURNING id INTO new_speaker_id;
        END IF;

        -- Create the link in pivot table
        INSERT INTO public.turma_speakers (turma_id, speaker_id)
        VALUES (r.turma_id, new_speaker_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 4. Enable RLS on new tables
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma_speakers ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies (Assuming public read, authenticated insert/update)
CREATE POLICY "Public speakers are viewable by everyone" ON public.speakers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert speakers" ON public.speakers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update speakers" ON public.speakers FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Public turma_speakers are viewable by everyone" ON public.turma_speakers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage turma_speakers" ON public.turma_speakers FOR ALL USING (auth.role() = 'authenticated');

-- 6. Grant permissions
GRANT ALL ON public.speakers TO authenticated;
GRANT SELECT ON public.speakers TO anon;
GRANT ALL ON public.turma_speakers TO authenticated;
GRANT SELECT ON public.turma_speakers TO anon;

-- Note: We are NOT dropping 'class_speakers' yet to prevent immediate breakage, 
-- but the frontend effectively stops using it after code updates.
