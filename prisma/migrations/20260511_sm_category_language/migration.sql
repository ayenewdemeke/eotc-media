-- Add language_id to sm_categories so sermon categories can be
-- filtered by language in the submission form, mirroring hm_categories.
ALTER TABLE `sm_categories`
  ADD COLUMN `language_id` INT NULL,
  ADD CONSTRAINT `sm_categories_language_id_fkey`
    FOREIGN KEY (`language_id`) REFERENCES `sm_languages`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
