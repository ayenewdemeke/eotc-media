-- =============================================================================
-- cb_fix_approval_statuses.sql
-- =============================================================================
-- PURPOSE:
--   1. Ensure the three required approval status rows exist in
--      cb_approval_statuses (Submitted, Accepted, Declined).
--   2. Mark every existing book as Accepted so that they are publicly visible.
--
-- Run this once against your PostgreSQL database.
-- Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- STEP 1: Seed the three status rows (no-op if they already exist by name)
-- ---------------------------------------------------------------------------

INSERT INTO public.cb_approval_statuses (name, created_at, updated_at)
VALUES
  ('Submitted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Accepted',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Declined',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- STEP 2: Set every book's approval_status_id to the "Accepted" row
-- ---------------------------------------------------------------------------

UPDATE public.cb_books
SET
  approval_status_id = (
    SELECT id FROM public.cb_approval_statuses WHERE name = 'Accepted' LIMIT 1
  ),
  updated_at = CURRENT_TIMESTAMP;

COMMIT;
