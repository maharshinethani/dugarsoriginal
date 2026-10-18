/*
# Contact Management & Product Media Enhancement

1. New Tables
- `contact_emails`: Multiple email addresses with labels, enabled/disabled, primary selection
- `contact_phones`: Multiple phone numbers with labels, enabled/disabled, primary selection
- `whatsapp_numbers`: Multiple WhatsApp numbers with labels, country codes, purpose assignment, enabled/disabled, primary selection
- `product_media`: Product images and videos with position, media_type, primary flag, alt text

2. Modified Tables
- `products`: Adds `video_urls` (text array) for multiple video URLs alongside existing `video_url`
  (existing `video_url` column is preserved for backward compatibility)

3. Security
- Public SELECT on contact_emails, contact_phones, whatsapp_numbers (only enabled rows shown publicly)
- Authenticated full CRUD on all new tables
- Product media inherits product visibility (public read, authenticated write)

4. Important Notes
- Contact tables seed from existing website_settings singleton values
- whatsapp_numbers supports purpose-based routing (product_enquiry, buy_now, general, order)
- product_media supports both images and videos via media_type column
- Existing product_images table remains for backward compatibility; product_media is the new primary media table
*/

-- ============ CONTACT EMAILS ============
CREATE TABLE IF NOT EXISTS contact_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  label text,
  is_enabled boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_contact_emails" ON contact_emails;
CREATE POLICY "public_read_contact_emails" ON contact_emails FOR SELECT
  TO anon, authenticated USING (is_enabled = true);

DROP POLICY IF EXISTS "auth_insert_contact_emails" ON contact_emails;
CREATE POLICY "auth_insert_contact_emails" ON contact_emails FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_contact_emails" ON contact_emails;
CREATE POLICY "auth_update_contact_emails" ON contact_emails FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contact_emails" ON contact_emails;
CREATE POLICY "auth_delete_contact_emails" ON contact_emails FOR DELETE
  TO authenticated USING (true);

-- ============ CONTACT PHONES ============
CREATE TABLE IF NOT EXISTS contact_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  label text,
  is_enabled boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_phones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_contact_phones" ON contact_phones;
CREATE POLICY "public_read_contact_phones" ON contact_phones FOR SELECT
  TO anon, authenticated USING (is_enabled = true);

DROP POLICY IF EXISTS "auth_insert_contact_phones" ON contact_phones;
CREATE POLICY "auth_insert_contact_phones" ON contact_phones FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_contact_phones" ON contact_phones;
CREATE POLICY "auth_update_contact_phones" ON contact_phones FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contact_phones" ON contact_phones;
CREATE POLICY "auth_delete_contact_phones" ON contact_phones FOR DELETE
  TO authenticated USING (true);

-- ============ WHATSAPP NUMBERS ============
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL,
  label text,
  country_code text,
  is_enabled boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  purpose_product_enquiry boolean NOT NULL DEFAULT false,
  purpose_buy_now boolean NOT NULL DEFAULT false,
  purpose_general boolean NOT NULL DEFAULT false,
  purpose_order boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_whatsapp_numbers" ON whatsapp_numbers;
CREATE POLICY "public_read_whatsapp_numbers" ON whatsapp_numbers FOR SELECT
  TO anon, authenticated USING (is_enabled = true);

DROP POLICY IF EXISTS "auth_insert_whatsapp_numbers" ON whatsapp_numbers;
CREATE POLICY "auth_insert_whatsapp_numbers" ON whatsapp_numbers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_whatsapp_numbers" ON whatsapp_numbers;
CREATE POLICY "auth_update_whatsapp_numbers" ON whatsapp_numbers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_whatsapp_numbers" ON whatsapp_numbers;
CREATE POLICY "auth_delete_whatsapp_numbers" ON whatsapp_numbers FOR DELETE
  TO authenticated USING (true);

-- ============ PRODUCT MEDIA ============
CREATE TABLE IF NOT EXISTS product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  url text NOT NULL,
  storage_path text,
  file_name text,
  file_size bigint,
  mime_type text,
  alt_en text,
  alt_ar text,
  position integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_position ON product_media(product_id, position);

ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_product_media" ON product_media;
CREATE POLICY "public_read_product_media" ON product_media FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_product_media" ON product_media;
CREATE POLICY "auth_insert_product_media" ON product_media FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_product_media" ON product_media;
CREATE POLICY "auth_update_product_media" ON product_media FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_product_media" ON product_media;
CREATE POLICY "auth_delete_product_media" ON product_media FOR DELETE
  TO authenticated USING (true);

-- ============ ADD video_urls TO products (preserve existing video_url) ============
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'video_urls') THEN
    ALTER TABLE products ADD COLUMN video_urls text[] DEFAULT '{}';
  END IF;
END $$;

-- ============ SEED: Migrate existing website_settings contacts ============
DO $$
DECLARE
  ws_record RECORD;
BEGIN
  SELECT whatsapp_number, phone, email INTO ws_record FROM website_settings WHERE id = 1 LIMIT 1;

  IF ws_record IS NOT NULL THEN
    -- Seed primary email
    IF ws_record.email IS NOT NULL AND ws_record.email != '' THEN
      INSERT INTO contact_emails (email, label, is_enabled, is_primary, display_order)
      VALUES (ws_record.email, 'General', true, true, 0)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Seed primary phone
    IF ws_record.phone IS NOT NULL AND ws_record.phone != '' THEN
      INSERT INTO contact_phones (phone, label, is_enabled, is_primary, display_order)
      VALUES (ws_record.phone, 'Store', true, true, 0)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Seed primary WhatsApp
    IF ws_record.whatsapp_number IS NOT NULL AND ws_record.whatsapp_number != '' THEN
      INSERT INTO whatsapp_numbers (number, label, is_enabled, is_primary, purpose_product_enquiry, purpose_buy_now, purpose_general, purpose_order, display_order)
      VALUES (ws_record.whatsapp_number, 'General', true, true, true, true, true, true, 0)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- ============ Storage bucket for product videos ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-videos', 'product-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for product-videos bucket
DROP POLICY IF EXISTS "public_read_product_videos" ON storage.objects;
CREATE POLICY "public_read_product_videos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-videos');

-- Authenticated upload/update/delete for product-videos
DROP POLICY IF EXISTS "auth_upload_product_videos" ON storage.objects;
CREATE POLICY "auth_upload_product_videos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-videos');

DROP POLICY IF EXISTS "auth_update_product_videos" ON storage.objects;
CREATE POLICY "auth_update_product_videos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-videos') WITH CHECK (bucket_id = 'product-videos');

DROP POLICY IF EXISTS "auth_delete_product_videos" ON storage.objects;
CREATE POLICY "auth_delete_product_videos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-videos');
