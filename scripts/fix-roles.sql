-- Fix role codes to match the new Next.js app role system
-- Run this against your live database to avoid wiping users

-- Step 1: Remove stale role_user entries for old roles that will be deleted
DELETE FROM role_user WHERE role_id IN (
  SELECT id FROM roles WHERE code NOT IN ('super_admin', 'admin', 'liturgy_admin', 'hymn_admin', 'sermon_admin', 'book_admin', 'quiz_admin')
);

-- Step 2: Remove old roles
DELETE FROM roles WHERE code NOT IN ('super_admin', 'admin', 'liturgy_admin', 'hymn_admin', 'sermon_admin', 'book_admin', 'quiz_admin');

-- Step 3: Fix the super-admin code (hyphen → underscore)
UPDATE roles SET code = 'super_admin', name = 'Super Admin', updated_at = NOW() WHERE code = 'super-admin';

-- Step 4: Upsert the new roles (insert if missing)
INSERT INTO roles (name, code, created_at, updated_at)
VALUES
  ('Admin',         'admin',         NOW(), NOW()),
  ('Liturgy Admin', 'liturgy_admin', NOW(), NOW()),
  ('Hymn Admin',    'hymn_admin',    NOW(), NOW()),
  ('Sermon Admin',  'sermon_admin',  NOW(), NOW()),
  ('Book Admin',    'book_admin',    NOW(), NOW()),
  ('Quiz Admin',    'quiz_admin',    NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Verify result
SELECT id, name, code FROM roles ORDER BY id;
