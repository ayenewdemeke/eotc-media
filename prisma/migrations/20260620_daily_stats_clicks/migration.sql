-- Remove unused visits column and add hymn/sermon click tracking to daily_stats

ALTER TABLE "daily_stats" DROP COLUMN IF EXISTS "visits";

ALTER TABLE "daily_stats" ADD COLUMN "hymn_total_clicks"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "daily_stats" ADD COLUMN "hymn_daily_clicks"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "daily_stats" ADD COLUMN "sermon_total_clicks" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "daily_stats" ADD COLUMN "sermon_daily_clicks" INTEGER NOT NULL DEFAULT 0;
