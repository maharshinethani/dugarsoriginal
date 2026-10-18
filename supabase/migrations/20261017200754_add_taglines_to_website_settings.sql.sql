/*
# Add tagline columns to website_settings

1. Changes
   - Adds `tagline_en` (text, nullable) for the English tagline
   - Adds `tagline_ar` (text, nullable) for the Arabic tagline
   - Uses IF NOT EXISTS via DO block to make it idempotent

2. Security
   - No RLS changes needed; existing policies already cover these new columns.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'website_settings' AND column_name = 'tagline_en') THEN
    ALTER TABLE website_settings ADD COLUMN tagline_en text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'website_settings' AND column_name = 'tagline_ar') THEN
    ALTER TABLE website_settings ADD COLUMN tagline_ar text;
  END IF;
END $$;
