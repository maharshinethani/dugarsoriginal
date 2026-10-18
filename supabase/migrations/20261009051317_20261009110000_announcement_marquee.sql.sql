/*
# Add announcement marquee content management

1. Overview
   Adds a slim, CMS-managed announcement strip that appears above the public navbar.
   Administrators can manage individual bilingual messages and switch the complete strip on or off.

2. New Tables
   - `announcement_messages`
   - `id`: UUID primary key.
   - `text_en`: English announcement text.
   - `text_ar`: Arabic announcement text.
   - `display_order`: Integer ordering value; lower values appear first.
   - `is_enabled`: Whether the message is included in the public marquee.
   - `created_at`, `updated_at`: Timestamps.

3. Modified Tables
   - `website_settings`
   - `announcement_bar_enabled`: Boolean master switch for the public announcement strip.

4. Security
   - Row-level security is enabled on `announcement_messages`.
   - Anonymous and authenticated visitors can read enabled or disabled messages because the public client needs to render the configured list safely.
   - Authenticated administrators can insert, update, and delete messages.
   - Existing authenticated website-settings update access covers the new master switch.

5. Important Notes
   - This is a single-tenant website, so messages are shared site content rather than user-owned records.
   - No existing columns or user data are removed or changed.
*/

ALTER TABLE website_settings
  ADD COLUMN IF NOT EXISTS announcement_bar_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS announcement_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_en text NOT NULL,
  text_ar text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE announcement_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_announcement_messages" ON announcement_messages;
CREATE POLICY "public_read_announcement_messages"
  ON announcement_messages FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_insert_announcement_messages" ON announcement_messages;
CREATE POLICY "auth_insert_announcement_messages"
  ON announcement_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_announcement_messages" ON announcement_messages;
CREATE POLICY "auth_update_announcement_messages"
  ON announcement_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_announcement_messages" ON announcement_messages;
CREATE POLICY "auth_delete_announcement_messages"
  ON announcement_messages FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_announcement_messages_order
  ON announcement_messages(display_order, created_at);

INSERT INTO announcement_messages (text_en, text_ar, display_order, is_enabled)
SELECT * FROM (VALUES
  ('Timeless Elegance, Crafted to Last', 'أناقة خالدة، صُنعت لتدوم', 1, true),
  ('Discover the Art of Fine Jewellery', 'اكتشفوا فن المجوهرات الراقية', 2, true),
  ('Your Story, Our Craftsmanship', 'قصتكم، وحرفيتنا', 3, true),
  ('Book Your Private Jewellery Appointment', 'احجزوا موعدكم الخاص للمجوهرات', 4, true)
) AS defaults(text_en, text_ar, display_order, is_enabled)
WHERE NOT EXISTS (SELECT 1 FROM announcement_messages);