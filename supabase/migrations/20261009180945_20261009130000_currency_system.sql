/*
# International Country & Multi-Currency System

## Overview
Creates a complete country/currency management system with exchange rates, country-specific product pricing, and shipping settings.

## New Tables

1. **currencies** — Stores all supported currencies with formatting rules
   - code (text, PK): ISO 4217 currency code (USD, SAR, etc.)
   - name (text): Full currency name
   - symbol (text): Currency symbol ($, ر.س, etc.)
   - decimal_places (int): Number of decimal places (2 for most, 3 for KWD/BHD/OMR)
   - symbol_position (text): 'before' or 'after' the amount
   - is_base (bool): Whether this is the base/store currency
   - is_enabled (bool): Whether customers can select this currency
   - sort_order (int): Display order

2. **countries** — Stores countries with their default currency mappings
   - code (text, PK): ISO 3166 country code (SA, KW, etc.)
   - name (text): Country name
   - flag_emoji (text): Flag emoji for display
   - default_currency_code (text, FK): Default currency for this country
   - is_enabled (bool): Whether this country is selectable
   - sort_order (int): Display order

3. **exchange_rates** — Stores exchange rates from base currency
   - id (uuid, PK)
   - currency_code (text, FK): Target currency
   - rate (numeric): Exchange rate from base currency to target
   - updated_at (timestamptz): When the rate was last updated
   - source (text): 'manual' or 'automatic'
   - Unique constraint on currency_code (one active rate per currency)

4. **product_country_prices** — Country-specific pricing (Mode B)
   - id (uuid, PK)
   - product_id (uuid, FK): Product reference
   - currency_code (text, FK): Currency for this price
   - price (bigint): Price in minor units (cents/fils)
   - sale_price (bigint, nullable): Sale price in minor units
   - Unique constraint on (product_id, currency_code)

5. **shipping_country_settings** — Shipping configuration per country
   - id (uuid, PK)
   - country_code (text, FK): Country
   - is_shippable (bool): Whether shipping is available
   - shipping_fee (bigint, nullable): Flat shipping fee in base currency minor units
   - delivery_estimate_en (text): English delivery estimate
   - delivery_estimate_ar (text): Arabic delivery estimate
   - tax_note_en (text, nullable): English tax/duty note
   - tax_note_ar (text, nullable): Arabic tax/duty note

## Seed Data
- 8 currencies (USD, SAR, KWD, QAR, OMR, BHD, AED, INR)
- 8 countries mapped to their currencies
- Exchange rates with approximate values
- USD as base currency with rate 1.0

## Security
- RLS enabled on all tables
- SELECT open to anon+authenticated (customer-facing data)
- INSERT/UPDATE/DELETE restricted to authenticated (admin operations)
- Uses TO anon, authenticated for reads, TO authenticated for writes
*/

-- ============================================================
-- CURRENCIES
-- ============================================================
CREATE TABLE IF NOT EXISTS currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  decimal_places int NOT NULL DEFAULT 2,
  symbol_position text NOT NULL DEFAULT 'before' CHECK (symbol_position IN ('before', 'after')),
  is_base boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_currencies" ON currencies;
CREATE POLICY "anon_select_currencies" ON currencies FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_currencies" ON currencies;
CREATE POLICY "auth_insert_currencies" ON currencies FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_currencies" ON currencies;
CREATE POLICY "auth_update_currencies" ON currencies FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_currencies" ON currencies;
CREATE POLICY "auth_delete_currencies" ON currencies FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- COUNTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS countries (
  code text PRIMARY KEY,
  name text NOT NULL,
  flag_emoji text NOT NULL DEFAULT '',
  default_currency_code text NOT NULL REFERENCES currencies(code),
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_countries" ON countries;
CREATE POLICY "anon_select_countries" ON countries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_countries" ON countries;
CREATE POLICY "auth_insert_countries" ON countries FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_countries" ON countries;
CREATE POLICY "auth_update_countries" ON countries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_countries" ON countries;
CREATE POLICY "auth_delete_countries" ON countries FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- EXCHANGE RATES
-- ============================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code text NOT NULL REFERENCES currencies(code),
  rate numeric(20,8) NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'automatic')),
  UNIQUE(currency_code)
);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_exchange_rates" ON exchange_rates;
CREATE POLICY "anon_select_exchange_rates" ON exchange_rates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_exchange_rates" ON exchange_rates;
CREATE POLICY "auth_insert_exchange_rates" ON exchange_rates FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_exchange_rates" ON exchange_rates;
CREATE POLICY "auth_update_exchange_rates" ON exchange_rates FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_exchange_rates" ON exchange_rates;
CREATE POLICY "auth_delete_exchange_rates" ON exchange_rates FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- PRODUCT COUNTRY PRICES (Mode B — country-specific pricing)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_country_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  currency_code text NOT NULL REFERENCES currencies(code),
  price bigint NOT NULL,
  sale_price bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, currency_code)
);

ALTER TABLE product_country_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_product_country_prices" ON product_country_prices;
CREATE POLICY "anon_select_product_country_prices" ON product_country_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_product_country_prices" ON product_country_prices;
CREATE POLICY "auth_insert_product_country_prices" ON product_country_prices FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_product_country_prices" ON product_country_prices;
CREATE POLICY "auth_update_product_country_prices" ON product_country_prices FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_product_country_prices" ON product_country_prices;
CREATE POLICY "auth_delete_product_country_prices" ON product_country_prices FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SHIPPING COUNTRY SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS shipping_country_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES countries(code),
  is_shippable boolean NOT NULL DEFAULT true,
  shipping_fee bigint,
  delivery_estimate_en text,
  delivery_estimate_ar text,
  tax_note_en text,
  tax_note_ar text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(country_code)
);

ALTER TABLE shipping_country_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_shipping_settings" ON shipping_country_settings;
CREATE POLICY "anon_select_shipping_settings" ON shipping_country_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_shipping_settings" ON shipping_country_settings;
CREATE POLICY "auth_insert_shipping_settings" ON shipping_country_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_shipping_settings" ON shipping_country_settings;
CREATE POLICY "auth_update_shipping_settings" ON shipping_country_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_shipping_settings" ON shipping_country_settings;
CREATE POLICY "auth_delete_shipping_settings" ON shipping_country_settings FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SEED DATA: CURRENCIES
-- ============================================================
INSERT INTO currencies (code, name, symbol, decimal_places, symbol_position, is_base, is_enabled, sort_order) VALUES
  ('USD', 'US Dollar', '$', 2, 'before', true, true, 7),
  ('SAR', 'Saudi Riyal', 'SAR ', 2, 'before', false, true, 1),
  ('KWD', 'Kuwaiti Dinar', 'KWD ', 3, 'before', false, true, 2),
  ('QAR', 'Qatari Riyal', 'QAR ', 2, 'before', false, true, 3),
  ('OMR', 'Omani Rial', 'OMR ', 3, 'before', false, true, 4),
  ('BHD', 'Bahraini Dinar', 'BHD ', 3, 'before', false, true, 5),
  ('AED', 'UAE Dirham', 'AED ', 2, 'before', false, true, 6),
  ('INR', 'Indian Rupee', '₹', 2, 'before', false, true, 8)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SEED DATA: EXCHANGE RATES (approximate, relative to USD)
-- ============================================================
INSERT INTO exchange_rates (currency_code, rate, source) VALUES
  ('USD', 1.0, 'manual'),
  ('SAR', 3.75, 'manual'),
  ('KWD', 0.31, 'manual'),
  ('QAR', 3.64, 'manual'),
  ('OMR', 0.385, 'manual'),
  ('BHD', 0.376, 'manual'),
  ('AED', 3.67, 'manual'),
  ('INR', 83.0, 'manual')
ON CONFLICT (currency_code) DO NOTHING;

-- ============================================================
-- SEED DATA: COUNTRIES
-- ============================================================
INSERT INTO countries (code, name, flag_emoji, default_currency_code, is_enabled, sort_order) VALUES
  ('SA', 'Saudi Arabia', '🇸🇦', 'SAR', true, 1),
  ('KW', 'Kuwait', '🇰🇼', 'KWD', true, 2),
  ('QA', 'Qatar', '🇶🇦', 'QAR', true, 3),
  ('OM', 'Oman', '🇴🇲', 'OMR', true, 4),
  ('BH', 'Bahrain', '🇧🇭', 'BHD', true, 5),
  ('AE', 'United Arab Emirates', '🇦🇪', 'AED', true, 6),
  ('US', 'United States', '🇺🇸', 'USD', true, 7),
  ('IN', 'India', '🇮🇳', 'INR', true, 8)
ON CONFLICT (code) DO NOTHING;
