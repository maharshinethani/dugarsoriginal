/*
# Add Celestial Collection (8th Collection)

1. Purpose
   The hero carousel on the homepage references a "Celestial Collection" but it
   does not exist in the database. This adds it as the 8th collection so the
   collections page, sitemap, and collection routing all work correctly.

2. Changes
   - Inserts one row into `collections` with slug `celestial`.
   - Uses INSERT ... ON CONFLICT (slug) DO NOTHING so the migration is
     idempotent and will not duplicate or overwrite if re-run.

3. Security
   - No RLS policy changes. The existing `public_read_collections` policy
     already allows anon + authenticated SELECT, and `auth_insert_collections`
     allows authenticated INSERT. No new policies needed.
*/

INSERT INTO collections (slug, name_en, name_ar, description_en, description_ar, hero_image_url, story_en, story_ar, display_order, is_published)
VALUES (
  'celestial',
  'Celestial',
  'سماوية',
  'Sapphire and diamond masterpieces, inspired by the cosmos and crafted with celestial precision.',
  'تحف الياقوت والألماس، مستوحاة من الكون ومصنوعة بدقة سماوية.',
  'https://images.pexels.com/photos/32988651/pexels-photo-32988651.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'Inspired by the night sky, the Celestial collection captures the wonder of the cosmos in every piece. Each creation is a testament to the beauty of the universe, crafted with celestial precision.',
  'مستوحاة من السماء الليلية، تلتقط مجموعة سماوية عجائب الكون في كل قطعة. كل إبداع هو دليل على جمال الكون، مصنوع بدقة سماوية.',
  8,
  true
)
ON CONFLICT (slug) DO NOTHING;
