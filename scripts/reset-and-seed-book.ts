import { PrismaClient } from "../generated/prisma/client";
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

async function resetAndSeedBook() {
  console.log("🔄 Reset and Seed Book Tables\n");

  try {
    // STEP 1: Delete existing book data (in reverse dependency order)
    console.log("🗑️  Step 1: Clearing existing book data...");

    await prisma.cbCopyrightReport.deleteMany({});
    console.log("   ✓ Copyright reports cleared");

    await prisma.cbBookComment.deleteMany({});
    console.log("   ✓ Comments cleared");

    await prisma.cbLike.deleteMany({});
    console.log("   ✓ Likes cleared");

    await prisma.cbAuthorBook.deleteMany({});
    console.log("   ✓ Book-Author links cleared");

    await prisma.cbBookSubCategory.deleteMany({});
    console.log("   ✓ Book-SubCategory links cleared");

    await prisma.cbBookCategory.deleteMany({});
    console.log("   ✓ Book-Category links cleared");

    await prisma.cbBookLanguage.deleteMany({});
    console.log("   ✓ Book-Language links cleared");

    await prisma.cbBook.deleteMany({});
    console.log("   ✓ Books cleared");

    await prisma.cbAuthor.deleteMany({});
    console.log("   ✓ Authors cleared");

    await prisma.cbSubCategory.deleteMany({});
    console.log("   ✓ Sub-categories cleared");

    await prisma.cbCategory.deleteMany({});
    console.log("   ✓ Categories cleared");

    await prisma.cbLanguage.deleteMany({});
    console.log("   ✓ Languages cleared");

    await prisma.cbApprovalStatus.deleteMany({});
    console.log("   ✓ Approval statuses cleared");

    // STEP 2: Import book data from JSON files
    console.log("\n🌱 Step 2: Importing book data from JSON files...\n");

    // 2a. Approval Statuses
    console.log("✅ Importing approval statuses...");
    const approvalStatuses = readJson("cb_approval_statuses.json");
    for (const s of approvalStatuses) {
      await prisma.cbApprovalStatus.create({
        data: {
          id: s.id,
          name: s.name,
          createdAt: s.created_at ? new Date(s.created_at) : new Date(),
          updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${approvalStatuses.length} approval statuses`);

    // 2b. Languages
    console.log("\n🌐 Importing languages...");
    const languages = readJson("cb_languages.json");
    for (const l of languages) {
      await prisma.cbLanguage.create({
        data: {
          id: l.id,
          name: l.name,
          createdAt: l.created_at ? new Date(l.created_at) : new Date(),
          updatedAt: l.updated_at ? new Date(l.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${languages.length} languages`);

    // 2c. Categories
    console.log("\n🗂️  Importing categories...");
    const categories = readJson("cb_categories.json");
    for (const c of categories) {
      await prisma.cbCategory.create({
        data: {
          id: c.id,
          name: c.name,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${categories.length} categories`);

    // 2d. Sub-Categories
    console.log("\n🗂️  Importing sub-categories...");
    const subCategories = readJson("cb_sub_categories.json");
    for (const s of subCategories) {
      await prisma.cbSubCategory.create({
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

    // 2e. Authors
    console.log("\n✍️  Importing authors...");
    const authors = readJson("cb_authors.json");
    for (const a of authors) {
      await prisma.cbAuthor.create({
        data: {
          id: a.id,
          name: a.name,
          createdAt: a.created_at ? new Date(a.created_at) : new Date(),
          updatedAt: a.updated_at ? new Date(a.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${authors.length} authors`);

    // 2f. Books
    console.log("\n📚 Importing books...");
    const books = readJson("cb_books.json");
    for (const b of books) {
      await prisma.cbBook.create({
        data: {
          id: b.id,
          userId: b.user_id,
          approvalStatusId: b.approval_status_id,
          name: b.name,
          slug: b.slug ?? String(b.id),
          author: b.author,
          description: b.description ?? null,
          image: b.image ?? null,
          file: b.file,
          createdAt: b.created_at ? new Date(b.created_at) : new Date(),
          updatedAt: b.updated_at ? new Date(b.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${books.length} books`);

    // 2g. Junction tables
    console.log("\n🔗 Importing book relationships...");

    const bookLanguages = readJson("cb_book_language.json");
    for (const r of bookLanguages) {
      await prisma.cbBookLanguage.create({
        data: {
          id: r.id,
          bookId: r.book_id,
          languageId: r.language_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${bookLanguages.length} book-language links`);

    const bookCategories = readJson("cb_book_category.json");
    for (const r of bookCategories) {
      await prisma.cbBookCategory.create({
        data: {
          id: r.id,
          bookId: r.book_id,
          categoryId: r.category_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${bookCategories.length} book-category links`);

    const bookSubCategories = readJson("cb_book_sub_category.json");
    for (const r of bookSubCategories) {
      await prisma.cbBookSubCategory.create({
        data: {
          id: r.id,
          bookId: r.book_id,
          subCategoryId: r.sub_category_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${bookSubCategories.length} book-sub-category links`);

    const authorBooks = readJson("cb_author_book.json");
    for (const r of authorBooks) {
      await prisma.cbAuthorBook.create({
        data: {
          id: r.id,
          authorId: r.author_id,
          bookId: r.book_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${authorBooks.length} book-author links`);

    // 2h. Likes
    console.log("\n❤️  Importing likes...");
    const likes = readJson("cb_likes.json");
    const { count: likesCount } = await prisma.cbLike.createMany({
      data: likes.map((l: any) => ({
        id: l.id,
        userId: l.user_id,
        bookId: l.book_id ?? l.likable_id,
        createdAt: l.created_at ? new Date(l.created_at) : new Date(),
        updatedAt: l.updated_at ? new Date(l.updated_at) : new Date(),
      })),
      skipDuplicates: true,
    });
    console.log(`   ✓ Imported ${likesCount} likes`);

    // 2i. Comments
    console.log("\n💬 Importing comments...");
    const comments = readJson("cb_book_comments.json");
    for (const c of comments) {
      await prisma.cbBookComment.create({
        data: {
          id: c.id,
          userId: c.user_id,
          bookId: c.book_id,
          comment: c.comment ?? c.body,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${comments.length} comments`);

    // 2j. Copyright Reports
    console.log("\n⚠️  Importing copyright reports...");
    const copyrightReports = readJson("cb_copyright_reports.json");
    for (const r of copyrightReports) {
      await prisma.cbCopyrightReport.create({
        data: {
          id: r.id,
          userId: r.user_id,
          bookId: r.book_id,
          reason: r.reason,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${copyrightReports.length} copyright reports`);

    console.log("\n✅ Book tables reset and seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${approvalStatuses.length} Approval statuses`);
    console.log(`   - ${languages.length} Languages`);
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${subCategories.length} Sub-categories`);
    console.log(`   - ${authors.length} Authors`);
    console.log(`   - ${books.length} Books`);
    console.log(`   - ${bookLanguages.length + bookCategories.length + bookSubCategories.length + authorBooks.length} Relationship links`);
    console.log(`   - ${likes.length} Likes`);
    console.log(`   - ${comments.length} Comments`);
    console.log(`   - ${copyrightReports.length} Copyright reports\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAndSeedBook();
