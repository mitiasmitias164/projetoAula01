-- Create a storage bucket for class materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('class-materials', 'class-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'class-materials' );

-- Policy to allow authenticated uploads (Professors/Managers)
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'class-materials' );
