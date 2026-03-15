-- Add YouTube channel metadata fields to sm_channels
ALTER TABLE "sm_channels" ADD COLUMN "slug" TEXT;
ALTER TABLE "sm_channels" ADD COLUMN "yt_channel_id" TEXT;
ALTER TABLE "sm_channels" ADD COLUMN "handle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "sm_channels" ADD COLUMN "description" TEXT;
ALTER TABLE "sm_channels" ADD COLUMN "thumbnail_default" TEXT;
ALTER TABLE "sm_channels" ADD COLUMN "thumbnail_medium" TEXT;
ALTER TABLE "sm_channels" ADD COLUMN "thumbnail_high" TEXT;
ALTER TABLE "sm_channels" ADD COLUMN "cover_image" TEXT;
ALTER TABLE "sm_channels" ADD COLUMN "country" TEXT;
ALTER TABLE "sm_channels" ADD COLUMN "published_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "sm_channels_slug_key" ON "sm_channels"("slug");
CREATE UNIQUE INDEX "sm_channels_yt_channel_id_key" ON "sm_channels"("yt_channel_id");
