import { PrismaClient } from "../generated/prisma/client/client";
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

async function resetAndSeedSermon() {
  console.log("🔄 Reset and Seed Sermon Tables\n");

  try {
    // STEP 1: Delete existing sermon data (in reverse dependency order)
    console.log("🗑️  Step 1: Clearing existing sermon data...");

    await prisma.smFavorite.deleteMany({});
    console.log("   ✓ Favorites cleared");

    await prisma.smPreacherSermon.deleteMany({});
    console.log("   ✓ Sermon-Preacher links cleared");

    await prisma.smSermonSubCategory.deleteMany({});
    console.log("   ✓ Sermon-SubCategory links cleared");

    await prisma.smLanguageSermon.deleteMany({});
    console.log("   ✓ Sermon-Language links cleared");

    await prisma.smCategorySermon.deleteMany({});
    console.log("   ✓ Sermon-Category links cleared");

    await prisma.smSermon.deleteMany({});
    console.log("   ✓ Sermons cleared");

    await prisma.smChannel.deleteMany({});
    console.log("   ✓ Channels cleared");

    await prisma.smPreacher.deleteMany({});
    console.log("   ✓ Preachers cleared");

    await prisma.smSubCategory.deleteMany({});
    console.log("   ✓ Sub-categories cleared");

    await prisma.smCategory.deleteMany({});
    console.log("   ✓ Categories cleared");

    await prisma.smLanguage.deleteMany({});
    console.log("   ✓ Languages cleared");

    await prisma.smApprovalStatus.deleteMany({});
    console.log("   ✓ Approval statuses cleared");

    // STEP 2: Import sermon data from JSON files
    console.log("\n🌱 Step 2: Importing sermon data from JSON files...\n");

    // 2a. Approval Statuses
    console.log("✅ Importing approval statuses...");
    const approvalStatuses = readJson("sm_approval_statuses.json");
    for (const s of approvalStatuses) {
      await prisma.smApprovalStatus.create({
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
    const languages = readJson("sm_languages.json");
    for (const l of languages) {
      await prisma.smLanguage.create({
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
    const categories = readJson("sm_categories.json");
    for (const c of categories) {
      await prisma.smCategory.create({
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
    const subCategories = readJson("sm_sub_categories.json");
    for (const s of subCategories) {
      await prisma.smSubCategory.create({
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

    // 2e. Preachers
    console.log("\n🎙️  Importing preachers...");
    const preachers = readJson("sm_preachers.json");
    for (const p of preachers) {
      await prisma.smPreacher.create({
        data: {
          id: p.id,
          name: p.name,
          createdAt: p.created_at ? new Date(p.created_at) : new Date(),
          updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${preachers.length} preachers`);

    // 2f. Channels
    console.log("\n📺 Importing channels...");
    const channels = readJson("sm_channels.json");
    for (const c of channels) {
      await prisma.smChannel.create({
        data: {
          id: c.id,
          name: c.title ?? c.name ?? "Unknown",
          slug: c.slug ?? null,
          ytChannelId: c.yt_channel_id ?? c.channel_id ?? null,
          handle: c.handle ?? "",
          description: c.description ?? null,
          thumbnailDefault: c.thumbnail_default ?? null,
          thumbnailMedium: c.thumbnail_medium ?? null,
          thumbnailHigh: c.thumbnail_high ?? null,
          coverImage: c.cover_image ?? null,
          country: c.country ?? null,
          publishedAt: c.published_at ? new Date(c.published_at) : null,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${channels.length} channels`);

    // 2g. Sermons
    console.log("\n🎬 Importing sermons...");
    const sermons = readJson("sm_sermons.json");
    for (const s of sermons) {
      await prisma.smSermon.create({
        data: {
          id: s.id,
          userId: s.user_id,
          approvalStatusId: s.approval_status_id,
          channelId: s.channel_id,
          slug: s.slug ?? String(s.id),
          videoId: s.video_id,
          publishedAt: s.published_at ? new Date(s.published_at) : null,
          preacher: s.preacher ?? null,
          title: s.title,
          description: s.description ?? null,
          thumbnailDefault: s.thumbnail_default,
          thumbnailMedium: s.thumbnail_medium,
          thumbnailHigh: s.thumbnail_high,
          thumbnailStandard: s.thumbnail_standard ?? null,
          thumbnailMaxres: s.thumbnail_maxres ?? null,
          clicksCount: s.clicks_count ?? 0,
          createdAt: s.created_at ? new Date(s.created_at) : new Date(),
          updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${sermons.length} sermons`);

    // 2h. Junction tables
    console.log("\n🔗 Importing sermon relationships...");

    const categorySermons = readJson("sm_category_sermon.json");
    for (const r of categorySermons) {
      await prisma.smCategorySermon.create({
        data: {
          id: r.id,
          categoryId: r.category_id,
          sermonId: r.sermon_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${categorySermons.length} sermon-category links`);

    const languageSermons = readJson("sm_language_sermon.json");
    for (const r of languageSermons) {
      await prisma.smLanguageSermon.create({
        data: {
          id: r.id,
          languageId: r.language_id,
          sermonId: r.sermon_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${languageSermons.length} sermon-language links`);

    const preacherSermons = readJson("sm_preacher_sermon.json");
    for (const r of preacherSermons) {
      await prisma.smPreacherSermon.create({
        data: {
          id: r.id,
          preacherId: r.preacher_id,
          sermonId: r.sermon_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${preacherSermons.length} sermon-preacher links`);

    const sermonSubCategories = readJson("sm_sermon_sub_category.json");
    for (const r of sermonSubCategories) {
      await prisma.smSermonSubCategory.create({
        data: {
          id: r.id,
          sermonId: r.sermon_id,
          subCategoryId: r.sub_category_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${sermonSubCategories.length} sermon-sub-category links`);

    // 2i. Favorites
    console.log("\n❤️  Importing favorites...");
    const favorites = readJson("sm_favorites.json");
    for (const f of favorites) {
      await prisma.smFavorite.create({
        data: {
          id: f.id,
          userId: f.user_id,
          sermonId: f.sermon_id,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
          updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${favorites.length} favorites`);

    console.log("\n✅ Sermon tables reset and seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${approvalStatuses.length} Approval statuses`);
    console.log(`   - ${languages.length} Languages`);
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${subCategories.length} Sub-categories`);
    console.log(`   - ${preachers.length} Preachers`);
    console.log(`   - ${channels.length} Channels`);
    console.log(`   - ${sermons.length} Sermons`);
    console.log(`   - ${categorySermons.length + languageSermons.length + preacherSermons.length + sermonSubCategories.length} Relationship links`);
    console.log(`   - ${favorites.length} Favorites\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAndSeedSermon();
