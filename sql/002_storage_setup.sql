-- ==============================================================================
-- 002_storage_setup.sql: Supabase Storage Configuration (product-images bucket)
-- Step 5 Migration - Image Storage
-- ==============================================================================

-- 1. Create the 'product-images' bucket if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public Read Access (Anyone can view/download images)
DROP POLICY IF EXISTS "Public Read Access on product-images" ON storage.objects;
CREATE POLICY "Public Read Access on product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 4. Policy: Upload/Insert (Open for testing phase - will be restricted to authenticated admins in production step)
DROP POLICY IF EXISTS "Allow Upload on product-images (Testing Mode)" ON storage.objects;
CREATE POLICY "Allow Upload on product-images (Testing Mode)"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- 5. Policy: Update/Delete (Open for testing phase)
DROP POLICY IF EXISTS "Allow Update/Delete on product-images (Testing Mode)" ON storage.objects;
CREATE POLICY "Allow Update/Delete on product-images (Testing Mode)"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Delete on product-images (Testing Mode)" ON storage.objects;
CREATE POLICY "Allow Delete on product-images (Testing Mode)"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
