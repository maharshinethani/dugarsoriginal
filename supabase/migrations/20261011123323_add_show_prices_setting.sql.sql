/*
# Add Product Price Visibility setting to website_settings

1. Modified Tables
- `website_settings` — adds `show_prices` boolean column (default false)
  so product prices are hidden by default until the admin enables them.

2. Security
- No policy changes needed. The existing RLS policies on website_settings
  already allow public SELECT and authenticated INSERT/UPDATE, which is
  exactly what this feature requires: admin writes the setting,
  all visitors read it.
*/

ALTER TABLE website_settings
  ADD COLUMN IF NOT EXISTS show_prices boolean NOT NULL DEFAULT false;
