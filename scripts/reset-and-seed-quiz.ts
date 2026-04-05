import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function readJson(filename: string): any[] {
  const filePath = path.join(__dirname, "../prisma/data", filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function resetAndSeedQuiz() {
  console.log("🔄 Reset and Seed Quiz Tables\n");

  try {
    // STEP 1: Delete existing quiz data (in reverse dependency order)
    console.log("🗑️  Step 1: Clearing existing quiz data...");

    await prisma.qzRoundResult.deleteMany({});
    console.log("   ✓ Round results cleared");

    await prisma.qzRoundAnswer.deleteMany({});
    console.log("   ✓ Round answers cleared");

    await prisma.qzRoundQuestion.deleteMany({});
    console.log("   ✓ Round questions cleared");

    await prisma.qzRoomMemberRound.deleteMany({});
    console.log("   ✓ Room-member-round links cleared");

    await prisma.qzRound.deleteMany({});
    console.log("   ✓ Rounds cleared");

    await prisma.qzRoomMember.deleteMany({});
    console.log("   ✓ Room members cleared");

    await prisma.qzRoom.deleteMany({});
    console.log("   ✓ Rooms cleared");

    await prisma.qzQuestionSubCategory.deleteMany({});
    console.log("   ✓ Question-SubCategory links cleared");

    await prisma.qzCategoryQuestion.deleteMany({});
    console.log("   ✓ Question-Category links cleared");

    await prisma.qzLanguageQuestion.deleteMany({});
    console.log("   ✓ Question-Language links cleared");

    await prisma.qzChoice.deleteMany({});
    console.log("   ✓ Choices cleared");

    await prisma.qzQuestion.deleteMany({});
    console.log("   ✓ Questions cleared");

    await prisma.qzSubCategory.deleteMany({});
    console.log("   ✓ Sub-categories cleared");

    await prisma.qzCategory.deleteMany({});
    console.log("   ✓ Categories cleared");

    await prisma.qzLanguage.deleteMany({});
    console.log("   ✓ Languages cleared");

    await prisma.qzDifficulty.deleteMany({});
    console.log("   ✓ Difficulties cleared");

    await prisma.qzQuestionType.deleteMany({});
    console.log("   ✓ Question types cleared");

    await prisma.qzApprovalStatus.deleteMany({});
    console.log("   ✓ Approval statuses cleared");

    // STEP 2: Import quiz data from JSON files
    console.log("\n🌱 Step 2: Importing quiz data from JSON files...\n");

    // 2a. Approval Statuses
    console.log("✅ Importing approval statuses...");
    const approvalStatuses = readJson("qz_approval_statuses.json");
    for (const s of approvalStatuses) {
      await prisma.qzApprovalStatus.create({
        data: {
          id: s.id,
          name: s.name,
          createdAt: s.created_at ? new Date(s.created_at) : new Date(),
          updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${approvalStatuses.length} approval statuses`);

    // 2b. Question Types
    console.log("\n📋 Importing question types...");
    const questionTypes = readJson("qz_question_types.json");
    for (const t of questionTypes) {
      await prisma.qzQuestionType.create({
        data: {
          id: t.id,
          name: t.name,
          createdAt: t.created_at ? new Date(t.created_at) : new Date(),
          updatedAt: t.updated_at ? new Date(t.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${questionTypes.length} question types`);

    // 2c. Difficulties
    console.log("\n⚡ Importing difficulties...");
    const difficulties = readJson("qz_difficulties.json");
    for (const d of difficulties) {
      await prisma.qzDifficulty.create({
        data: {
          id: d.id,
          name: d.name,
          createdAt: d.created_at ? new Date(d.created_at) : new Date(),
          updatedAt: d.updated_at ? new Date(d.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${difficulties.length} difficulties`);

    // 2d. Languages
    console.log("\n🌐 Importing languages...");
    const languages = readJson("qz_languages.json");
    for (const l of languages) {
      await prisma.qzLanguage.create({
        data: {
          id: l.id,
          name: l.name,
          createdAt: l.created_at ? new Date(l.created_at) : new Date(),
          updatedAt: l.updated_at ? new Date(l.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${languages.length} languages`);

    // 2e. Categories
    console.log("\n🗂️  Importing categories...");
    const categories = readJson("qz_categories.json");
    for (const c of categories) {
      await prisma.qzCategory.create({
        data: {
          id: c.id,
          name: c.name,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${categories.length} categories`);

    // 2f. Sub-Categories
    console.log("\n🗂️  Importing sub-categories...");
    const subCategories = readJson("qz_sub_categories.json");
    for (const s of subCategories) {
      await prisma.qzSubCategory.create({
        data: {
          id: s.id,
          categoryId: s.category_id,
          name: s.name,
          createdAt: s.created_at ? new Date(s.created_at) : new Date(),
          updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${subCategories.length} sub-categories`);

    // 2g. Questions
    console.log("\n❓ Importing questions...");
    const questions = readJson("qz_questions.json");
    for (const q of questions) {
      await prisma.qzQuestion.create({
        data: {
          id: q.id,
          userId: q.user_id,
          approvalStatusId: q.approval_status_id,
          typeId: q.type_id,
          difficultyId: q.qz_difficulty_id ?? null,
          questionText: q.question_text,
          createdAt: q.created_at ? new Date(q.created_at) : new Date(),
          updatedAt: q.updated_at ? new Date(q.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${questions.length} questions`);

    // 2h. Choices
    console.log("\n🔘 Importing choices...");
    const choices = readJson("qz_choices.json");
    for (const c of choices) {
      await prisma.qzChoice.create({
        data: {
          id: c.id,
          questionId: c.question_id,
          choiceText: c.choice_text,
          isCorrect: Boolean(c.is_correct),
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${choices.length} choices`);

    // 2i. Junction tables
    console.log("\n🔗 Importing question relationships...");

    const languageQuestions = readJson("qz_language_question.json");
    for (const r of languageQuestions) {
      await prisma.qzLanguageQuestion.create({
        data: {
          id: r.id,
          languageId: r.language_id,
          questionId: r.question_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${languageQuestions.length} question-language links`);

    const categoryQuestions = readJson("qz_category_question.json");
    for (const r of categoryQuestions) {
      await prisma.qzCategoryQuestion.create({
        data: {
          id: r.id,
          categoryId: r.category_id,
          questionId: r.question_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${categoryQuestions.length} question-category links`);

    const questionSubCategories = readJson("qz_question_sub_category.json");
    for (const r of questionSubCategories) {
      await prisma.qzQuestionSubCategory.create({
        data: {
          id: r.id,
          questionId: r.question_id,
          subCategoryId: r.sub_category_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${questionSubCategories.length} question-sub-category links`);

    console.log("\n✅ Quiz tables reset and seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${approvalStatuses.length} Approval statuses`);
    console.log(`   - ${questionTypes.length} Question types`);
    console.log(`   - ${difficulties.length} Difficulties`);
    console.log(`   - ${languages.length} Languages`);
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${subCategories.length} Sub-categories`);
    console.log(`   - ${questions.length} Questions`);
    console.log(`   - ${choices.length} Choices`);
    console.log(`   - ${languageQuestions.length + categoryQuestions.length + questionSubCategories.length} Relationship links\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAndSeedQuiz();
