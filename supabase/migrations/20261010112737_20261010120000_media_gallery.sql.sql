/*
# Create media gallery table and storage bucket

1. New Tables
- `media` — stores all uploaded/gallery images for reuse across the site
  - `id` (uuid, primary key)
  - `url` (text, not null) — public URL of the image in storage
  - `storage_path` (text, not null) — path within the storage bucket
  - `file_name` (text, not null) — original file name
  - `file_size` (bigint) — file size in bytes
  - `mime_type` (text) — MIME type of the image
  - `alt_en` (text) — English alt text
  - `alt_ar` (text) — Arabic alt text
  - `width` (int) — image width in pixels
  - `height` (int) — image height in pixels
  - `category` (text) — optional grouping tag (e.g. 'products', 'categories', 'collections', 'banners')
  - `created_at` (timestamptz, default now())
  - `created_by` (uuid, references auth.users) — who uploaded it

2. Storage
- Create a public bucket named `media` for image uploads
- Public read access for all files
- Authenticated users can upload, update, delete

3. Security
- Enable RLS on `media`
- Public read (anon, authenticated) — gallery images are visible to all
- Only authenticated users can insert, update, delete
- Storage policies: public read, authenticated write
*/
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  alt_en text,
  alt_ar text,
  width int,
  height int,
  category text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_public_read" ON media;
CREATE POLICY "media_public_read"
ON media FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "media_auth_insert" ON media;
CREATE POLICY "media_auth_insert"
ON media FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "media_auth_update" ON media;
CREATE POLICY "media_auth_update"
ON media FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "media_auth_delete" ON media;
CREATE POLICY "media_auth_delete"
ON media FOR DELETE
TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- Create the media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "media_bucket_public_read" ON storage.objects;
CREATE POLICY "media_bucket_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_auth_insert" ON storage.objects;
CREATE POLICY "media_bucket_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_auth_update" ON storage.objects;
CREATE POLICY "media_bucket_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_auth_delete" ON storage.objects;
CREATE POLICY "media_bucket_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
