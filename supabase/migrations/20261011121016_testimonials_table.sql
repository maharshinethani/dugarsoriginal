/*
# Create testimonials table

1. New Tables
- `testimonials`
  - `id` (uuid, primary key)
  - `customer_name` (text, not null) — display name of the customer
  - `testimonial_text` (text, not null) — the review text
  - `rating` (integer, 1-5, default 5) — star rating
  - `product_ref` (text, nullable) — optional product reference
  - `status` (text, default 'pending') — 'pending', 'approved', 'rejected'
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `testimonials`.
- Public (anon + authenticated) can INSERT new testimonials (submissions).
- Public (anon + authenticated) can SELECT only approved testimonials.
- Authenticated (admin) can SELECT, UPDATE, DELETE all testimonials.

3. Notes
- New submissions default to 'pending' status.
- Only approved testimonials are visible publicly.
- Admin users (authenticated) can view, approve, reject, edit, and delete.
*/

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  testimonial_text text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  product_ref text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read only approved testimonials
DROP POLICY IF EXISTS "public_read_approved_testimonials" ON testimonials;
CREATE POLICY "public_read_approved_testimonials"
ON testimonials FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- Authenticated (admin) can read all testimonials
DROP POLICY IF EXISTS "auth_read_all_testimonials" ON testimonials;
CREATE POLICY "auth_read_all_testimonials"
ON testimonials FOR SELECT
TO authenticated
USING (true);

-- Public can insert new testimonials (submissions)
DROP POLICY IF EXISTS "public_insert_testimonials" ON testimonials;
CREATE POLICY "public_insert_testimonials"
ON testimonials FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Authenticated (admin) can update testimonials (approve/reject/edit)
DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;
CREATE POLICY "auth_update_testimonials"
ON testimonials FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- Authenticated (admin) can delete testimonials
DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
CREATE POLICY "auth_delete_testimonials"
ON testimonials FOR DELETE
TO authenticated
USING (true);

-- Index for querying approved testimonials sorted by date
CREATE INDEX IF NOT EXISTS idx_testimonials_status_created ON testimonials (status, created_at DESC);
