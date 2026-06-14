-- Add an optional language to book categories so the book module can cascade
-- language -> category -> sub-category like the hymns and sermons modules.
ALTER TABLE "cb_categories" ADD COLUMN "language_id" INTEGER;

ALTER TABLE "cb_categories"
  ADD CONSTRAINT "cb_categories_language_id_fkey"
  FOREIGN KEY ("language_id") REFERENCES "cb_languages"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
