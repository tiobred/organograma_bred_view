-- Fix Storage Bucket and Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop strict policies if they exist (to reset)
DROP POLICY IF EXISTS "Admins can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update avatars" ON storage.objects;

-- Create looser policies for avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Grant ADMIN role to your user (Anderson) by email to pass the Profile RLS checks
-- Replace with your exact email if different
UPDATE profiles
SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{role}', '"admin"')
WHERE email = 'aaamorim@tjba.jus.br';
