-- AlterTable: add language_id to qz_categories
ALTER TABLE "qz_categories" ADD COLUMN "language_id" INTEGER;

-- AddForeignKey
ALTER TABLE "qz_categories" ADD CONSTRAINT "qz_categories_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "qz_languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
