-- DropForeignKey
ALTER TABLE "lt_sections" DROP CONSTRAINT "lt_sections_anaphora_id_fkey";

-- AlterTable
ALTER TABLE "lt_liturgical_texts" ADD COLUMN     "remark" TEXT;

-- AlterTable
ALTER TABLE "lt_sections" DROP COLUMN "anaphora_id",
DROP COLUMN "is_common";

-- DropTable
DROP TABLE "lt_anaphoras";
