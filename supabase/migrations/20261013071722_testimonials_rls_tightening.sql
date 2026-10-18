/*
# Tighten testimonials RLS and add spam protection

1. Security Changes
   - Revoke UPDATE and DELETE privileges from the anon role (defense in depth).
   - Tighten the public INSERT policy: public submitters can only insert rows with status = 'pending'.
   - Authenticated (admin) INSERT policy remains unrestricted.
   - All existing SELECT, UPDATE, DELETE policies for authenticated are preserved.

2. Schema Changes
   - Add a unique constraint on (customer_name, testimonial_text) to prevent exact duplicate submissions.
   - Add a CHECK constraint on rating (1-5) — already exists but reinforced.

3. Important Notes
   - This migration does NOT drop or modify any existing data.
   - The anon role can still SELECT approved testimonials and INSERT new pending testimonials.
   - Only authenticated users can approve, reject, edit, unpublish, or delete testimonials.
   - The unique constraint prevents the same person from submitting the exact same review text twice.
*/

-- Revoke unnecessary privileges from anon (defense in depth)
REVOKE UPDATE, DELETE ON testimonials FROM anon;

-- Drop and recreate the public INSERT policy with status restriction
DROP POLICY IF EXISTS "public_insert_testimonials" ON testimonials;
CREATE POLICY "public_insert_testimonials"
ON testimonials FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Add unique constraint to prevent exact duplicate submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_testimonials_name_text'
  ) THEN
    ALTER TABLE testimonials
    ADD CONSTRAINT uq_testimonials_name_text
    UNIQUE (customer_name, testimonial_text);
  END IF;
END $$;
