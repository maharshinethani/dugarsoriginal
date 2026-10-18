/*
# DUGARS Jewellery — Initial Database Schema

1. Overview
   Complete schema for the DUGARS luxury jewellery platform including:
   - products + product_images (catalogue with multiple images)
   - categories + collections (classification)
   - collection_products (join table)
   - website_settings (global business config like WhatsApp number)
   - homepage_sections (CMS-driven homepage content)
   - enquiries (contact form + product enquiries)
   - appointments (booking system)
   - newsletter_subscribers (email signups)

2. New Tables
   - products: id, slug, name_en, name_ar, sku, description_en, description_ar, short_description_en, short_description_ar, price, sale_price, compare_price, currency, category, collection_id, material, metal, stone, carat, weight, sizes, colours, stock_status, quantity, is_featured, is_bestseller, is_new_arrival, is_signature, is_bridal, is_limited, status, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar, keywords, created_at, updated_at
   - product_images: id, product_id, url, alt_en, alt_ar, position
   - categories: id, slug, name_en, name_ar, description_en, description_ar, image_url, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar, display_order, is_published
   - collections: id, slug, name_en, name_ar, description_en, description_ar, hero_image_url, story_en, story_ar, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar, display_order, is_published
   - collection_products: collection_id, product_id, position
   - website_settings: id (singleton), brand_name, logo_url, favicon_url, whatsapp_number, phone, email, address_en, address_ar, instagram, facebook, pinterest, youtube, google_maps_url, currency, default_language, updated_at
   - homepage_sections: id, section_key, is_enabled, display_order, content (jsonb), updated_at
   - enquiries: id, customer_name, phone, email, message, product_name, source, status, created_at
   - appointments: id, customer_name, phone, email, country, appointment_date, appointment_time, appointment_type, collection_interest, message, status, created_at
   - newsletter_subscribers: id, email, locale, created_at

3. Security
   - RLS enabled on every table.
   - Public read access (anon, authenticated) for: products, product_images, categories, collections, collection_products, website_settings, homepage_sections, newsletter_subscribers (insert only).
   - Public insert for enquiries, appointments, newsletter_subscribers.
   - Full CRUD for authenticated users on all management tables (admin manages everything).

4. Important Notes
   - website_settings is a singleton (id = 1).
   - Products use a stock_status enum-like text field with values: in_stock, low_stock, out_of_stock, made_to_order.
   - All timestamps are timestamptz with defaults.
   - Indexes on frequently queried columns (slug, category, collection_id, status, is_featured, etc.).
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text,
  description_en text,
  description_ar text,
  image_url text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  display_order int DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text,
  description_en text,
  description_ar text,
  hero_image_url text,
  story_en text,
  story_ar text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  display_order int DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_collections" ON collections;
CREATE POLICY "public_read_collections" ON collections FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_collections" ON collections;
CREATE POLICY "auth_insert_collections" ON collections FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_collections" ON collections;
CREATE POLICY "auth_update_collections" ON collections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_collections" ON collections;
CREATE POLICY "auth_delete_collections" ON collections FOR DELETE TO authenticated USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text,
  sku text,
  description_en text,
  description_ar text,
  short_description_en text,
  short_description_ar text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  sale_price numeric(12,2),
  compare_price numeric(12,2),
  currency text DEFAULT 'USD',
  category text,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  material text,
  metal text,
  stone text,
  carat text,
  weight text,
  sizes text[] DEFAULT '{}',
  colours text[] DEFAULT '{}',
  stock_status text DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order')),
  quantity int DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_new_arrival boolean DEFAULT false,
  is_signature boolean DEFAULT false,
  is_bridal boolean DEFAULT false,
  is_limited boolean DEFAULT false,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  thumbnail_url text,
  video_url text,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection_id ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON products(is_new_arrival);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_en text,
  alt_ar text,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_product_images" ON product_images;
CREATE POLICY "auth_insert_product_images" ON product_images FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_product_images" ON product_images;
CREATE POLICY "auth_update_product_images" ON product_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_product_images" ON product_images;
CREATE POLICY "auth_delete_product_images" ON product_images FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- Collection Products (join table)
CREATE TABLE IF NOT EXISTS collection_products (
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position int DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_collection_products" ON collection_products;
CREATE POLICY "public_read_collection_products" ON collection_products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_collection_products" ON collection_products;
CREATE POLICY "auth_insert_collection_products" ON collection_products FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_collection_products" ON collection_products;
CREATE POLICY "auth_update_collection_products" ON collection_products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_collection_products" ON collection_products;
CREATE POLICY "auth_delete_collection_products" ON collection_products FOR DELETE TO authenticated USING (true);

-- Website Settings (singleton)
CREATE TABLE IF NOT EXISTS website_settings (
  id int PRIMARY KEY DEFAULT 1,
  brand_name text DEFAULT 'DUGARS',
  logo_url text,
  favicon_url text,
  whatsapp_number text DEFAULT '+971501234567',
  phone text DEFAULT '+971 4 123 4567',
  email text DEFAULT 'concierge@dugarsjewellery.com',
  address_en text,
  address_ar text,
  instagram text,
  facebook text,
  pinterest text,
  youtube text,
  google_maps_url text,
  currency text DEFAULT 'USD',
  default_language text DEFAULT 'en',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT singleton_only CHECK (id = 1)
);
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_website_settings" ON website_settings;
CREATE POLICY "public_read_website_settings" ON website_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_website_settings" ON website_settings;
CREATE POLICY "auth_update_website_settings" ON website_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_insert_website_settings" ON website_settings;
CREATE POLICY "auth_insert_website_settings" ON website_settings FOR INSERT TO authenticated WITH CHECK (true);

-- Homepage Sections (CMS)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL,
  is_enabled boolean DEFAULT true,
  display_order int DEFAULT 0,
  content jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_homepage_sections" ON homepage_sections;
CREATE POLICY "public_read_homepage_sections" ON homepage_sections FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_insert_homepage_sections" ON homepage_sections FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_update_homepage_sections" ON homepage_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_homepage_sections" ON homepage_sections;
CREATE POLICY "auth_delete_homepage_sections" ON homepage_sections FOR DELETE TO authenticated USING (true);

-- Enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text,
  email text,
  message text,
  product_name text,
  source text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_enquiries" ON enquiries;
CREATE POLICY "public_insert_enquiries" ON enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_enquiries" ON enquiries;
CREATE POLICY "auth_read_enquiries" ON enquiries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_enquiries" ON enquiries;
CREATE POLICY "auth_update_enquiries" ON enquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_enquiries" ON enquiries;
CREATE POLICY "auth_delete_enquiries" ON enquiries FOR DELETE TO authenticated USING (true);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text,
  email text,
  country text,
  appointment_date date,
  appointment_time text,
  appointment_type text,
  collection_interest text,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_appointments" ON appointments;
CREATE POLICY "public_insert_appointments" ON appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_appointments" ON appointments;
CREATE POLICY "auth_read_appointments" ON appointments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_appointments" ON appointments;
CREATE POLICY "auth_update_appointments" ON appointments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_appointments" ON appointments;
CREATE POLICY "auth_delete_appointments" ON appointments FOR DELETE TO authenticated USING (true);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  locale text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_newsletter" ON newsletter_subscribers;
CREATE POLICY "auth_read_newsletter" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_delete_newsletter" ON newsletter_subscribers;
CREATE POLICY "auth_delete_newsletter" ON newsletter_subscribers FOR DELETE TO authenticated USING (true);
