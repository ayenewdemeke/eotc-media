-- Change publishedAt from DATE to TIMESTAMP on hymns and sermons
-- so that sort order reflects the exact YouTube publish timestamp,
-- not just the calendar day. Existing DATE values become midnight timestamps.
ALTER TABLE hm_hymns ALTER COLUMN published_at TYPE TIMESTAMP(3) USING published_at::timestamp;
ALTER TABLE sm_sermons ALTER COLUMN published_at TYPE TIMESTAMP(3) USING published_at::timestamp;
