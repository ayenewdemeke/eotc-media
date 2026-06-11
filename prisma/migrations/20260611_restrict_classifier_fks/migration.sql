-- Change classifier FKs from CASCADE to RESTRICT on all join tables.
-- Prevents accidental deletion of languages/categories/sub-categories/singers/
-- preachers/authors from wiping content assignments silently.

-- Books
ALTER TABLE "cb_book_language"    DROP CONSTRAINT "cb_book_language_language_id_fkey";
ALTER TABLE "cb_book_language"    ADD CONSTRAINT "cb_book_language_language_id_fkey"
  FOREIGN KEY ("language_id") REFERENCES "cb_languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cb_book_category"    DROP CONSTRAINT "cb_book_category_category_id_fkey";
ALTER TABLE "cb_book_category"    ADD CONSTRAINT "cb_book_category_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "cb_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cb_book_sub_category" DROP CONSTRAINT "cb_book_sub_category_sub_category_id_fkey";
ALTER TABLE "cb_book_sub_category" ADD CONSTRAINT "cb_book_sub_category_sub_category_id_fkey"
  FOREIGN KEY ("sub_category_id") REFERENCES "cb_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cb_author_book"      DROP CONSTRAINT "cb_author_book_author_id_fkey";
ALTER TABLE "cb_author_book"      ADD CONSTRAINT "cb_author_book_author_id_fkey"
  FOREIGN KEY ("author_id") REFERENCES "cb_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Hymns
ALTER TABLE "hm_hymn_language"    DROP CONSTRAINT "hm_hymn_language_language_id_fkey";
ALTER TABLE "hm_hymn_language"    ADD CONSTRAINT "hm_hymn_language_language_id_fkey"
  FOREIGN KEY ("language_id") REFERENCES "hm_languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hm_category_hymn"    DROP CONSTRAINT "hm_category_hymn_category_id_fkey";
ALTER TABLE "hm_category_hymn"    ADD CONSTRAINT "hm_category_hymn_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "hm_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hm_hymn_sub_category" DROP CONSTRAINT "hm_hymn_sub_category_sub_category_id_fkey";
ALTER TABLE "hm_hymn_sub_category" ADD CONSTRAINT "hm_hymn_sub_category_sub_category_id_fkey"
  FOREIGN KEY ("sub_category_id") REFERENCES "hm_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hm_hymn_singer"      DROP CONSTRAINT "hm_hymn_singer_singer_id_fkey";
ALTER TABLE "hm_hymn_singer"      ADD CONSTRAINT "hm_hymn_singer_singer_id_fkey"
  FOREIGN KEY ("singer_id") REFERENCES "hm_singers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Sermons
ALTER TABLE "sm_language_sermon"  DROP CONSTRAINT "sm_language_sermon_language_id_fkey";
ALTER TABLE "sm_language_sermon"  ADD CONSTRAINT "sm_language_sermon_language_id_fkey"
  FOREIGN KEY ("language_id") REFERENCES "sm_languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sm_category_sermon"  DROP CONSTRAINT "sm_category_sermon_category_id_fkey";
ALTER TABLE "sm_category_sermon"  ADD CONSTRAINT "sm_category_sermon_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "sm_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sm_sermon_sub_category" DROP CONSTRAINT "sm_sermon_sub_category_sub_category_id_fkey";
ALTER TABLE "sm_sermon_sub_category" ADD CONSTRAINT "sm_sermon_sub_category_sub_category_id_fkey"
  FOREIGN KEY ("sub_category_id") REFERENCES "sm_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sm_preacher_sermon"  DROP CONSTRAINT "sm_preacher_sermon_preacher_id_fkey";
ALTER TABLE "sm_preacher_sermon"  ADD CONSTRAINT "sm_preacher_sermon_preacher_id_fkey"
  FOREIGN KEY ("preacher_id") REFERENCES "sm_preachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Quiz
ALTER TABLE "qz_language_question" DROP CONSTRAINT "qz_language_question_language_id_fkey";
ALTER TABLE "qz_language_question" ADD CONSTRAINT "qz_language_question_language_id_fkey"
  FOREIGN KEY ("language_id") REFERENCES "qz_languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "qz_category_question" DROP CONSTRAINT "qz_category_question_category_id_fkey";
ALTER TABLE "qz_category_question" ADD CONSTRAINT "qz_category_question_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "qz_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "qz_question_sub_category" DROP CONSTRAINT "qz_question_sub_category_sub_category_id_fkey";
ALTER TABLE "qz_question_sub_category" ADD CONSTRAINT "qz_question_sub_category_sub_category_id_fkey"
  FOREIGN KEY ("sub_category_id") REFERENCES "qz_sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
