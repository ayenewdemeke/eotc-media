-- Change publishedAt from DATE to DATETIME on hymns and sermons
-- so that sort order reflects the exact YouTube publish timestamp,
-- not just the calendar day. Existing DATE values become midnight timestamps.
ALTER TABLE `hm_hymns` MODIFY `published_at` DATETIME(3) NULL;
ALTER TABLE `sm_sermons` MODIFY `published_at` DATETIME(3) NULL;
