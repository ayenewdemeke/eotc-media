-- Add per-round question filters to qz_rounds

ALTER TABLE "qz_rounds" ADD COLUMN "category_id"   INTEGER REFERENCES "qz_categories"("id")  ON DELETE SET NULL;
ALTER TABLE "qz_rounds" ADD COLUMN "difficulty_id"  INTEGER REFERENCES "qz_difficulties"("id") ON DELETE SET NULL;
ALTER TABLE "qz_rounds" ADD COLUMN "language_id"    INTEGER REFERENCES "qz_languages"("id")    ON DELETE SET NULL;
