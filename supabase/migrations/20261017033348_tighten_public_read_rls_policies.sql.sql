/*
# Tighten public SELECT RLS policies to prevent data exposure

## Problem
The `products`, `collections`, and `announcement_messages` tables had public
SELECT policies with `USING (true)`, meaning anyone with the anon API key
(embedded in the frontend) could query ALL rows directly — including draft
products, unpublished collections, and disabled announcement messages.

## Fix
Split each table's public read policy into two:
1. An `anon`-scoped policy that only returns published/enabled rows.
2. An `authenticated`-scoped policy that returns all rows (for admin).

This way the public website and search engines only see published content,
while the admin panel (which runs as an authenticated Supabase user) can
still read and manage everything.

## Tables affected
- `products` — anon now sees only `status = 'published'`
- `collections` — anon now sees only `is_published = true`
- `announcement_messages` — anon now sees only `is_enabled = true`

## Security changes
- Drops and recreates SELECT policies on the three tables above.
- No data is modified or lost.
- Admin (authenticated) access is preserved via separate policies.
*/

-- PRODUCTS: tighten anon SELECT to published only
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "anon_read_published_products" ON products FOR SELECT
  TO anon USING (status = 'published');
CREATE POLICY "auth_read_all_products" ON products FOR SELECT
  TO authenticated USING (true);

-- COLLECTIONS: tighten anon SELECT to published only
DROP POLICY IF EXISTS "public_read_collections" ON collections;
CREATE POLICY "anon_read_published_collections" ON collections FOR SELECT
  TO anon USING (is_published = true);
CREATE POLICY "auth_read_all_collections" ON collections FOR SELECT
  TO authenticated USING (true);

-- ANNOUNCEMENT_MESSAGES: tighten anon SELECT to enabled only
DROP POLICY IF EXISTS "public_read_announcement_messages" ON announcement_messages;
CREATE POLICY "anon_read_enabled_announcements" ON announcement_messages FOR SELECT
  TO anon USING (is_enabled = true);
CREATE POLICY "auth_read_all_announcements" ON announcement_messages FOR SELECT
  TO authenticated USING (true);
