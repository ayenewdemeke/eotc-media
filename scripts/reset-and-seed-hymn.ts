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
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "../prisma/data", filename), "utf-8")
  );
}

async function resetAndSeedHymn() {
  console.log("🔄 Reset and Seed Hymn Tables\n");

  try {
    // STEP 1: Delete existing hymn data (in reverse dependency order)
    console.log("🗑️  Step 1: Clearing existing hymn data...");

    await prisma.hmComment.deleteMany({});
    console.log("   ✓ Comments cleared");

    await prisma.hmFavorite.deleteMany({});
    console.log("   ✓ Favorites cleared");

    await prisma.hmHymnSinger.deleteMany({});
    console.log("   ✓ Hymn-Singer links cleared");

    await prisma.hmHymnSubCategory.deleteMany({});
    console.log("   ✓ Hymn-SubCategory links cleared");

    await prisma.hmHymnLanguage.deleteMany({});
    console.log("   ✓ Hymn-Language links cleared");

    await prisma.hmCategoryHymn.deleteMany({});
    console.log("   ✓ Hymn-Category links cleared");

    await prisma.hmHymn.deleteMany({});
    console.log("   ✓ Hymns cleared");

    await prisma.hmChannel.deleteMany({});
    console.log("   ✓ Channels cleared");

    await prisma.hmSinger.deleteMany({});
    console.log("   ✓ Singers cleared");

    await prisma.hmSubCategory.deleteMany({});
    console.log("   ✓ Sub-categories cleared");

    await prisma.hmCategory.deleteMany({});
    console.log("   ✓ Categories cleared");

    await prisma.hmLanguage.deleteMany({});
    console.log("   ✓ Languages cleared");

    await prisma.hmApprovalStatus.deleteMany({});
    console.log("   ✓ Approval statuses cleared");

    // STEP 2: Import hymn data from JSON files
    console.log("\n🌱 Step 2: Importing hymn data from JSON files...\n");

    // 2a. Approval Statuses
    console.log("✅ Importing approval statuses...");
    const approvalStatuses = readJson("hm_approval_statuses.json");
    for (const s of approvalStatuses) {
      await prisma.hmApprovalStatus.create({
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
    const languages = readJson("hm_languages.json");
    for (const l of languages) {
      await prisma.hmLanguage.create({
        data: {
          id: l.id,
          userId: l.user_id ?? null,
          name: l.name,
          slug: l.slug ?? null,
          createdAt: l.created_at ? new Date(l.created_at) : new Date(),
          updatedAt: l.updated_at ? new Date(l.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${languages.length} languages`);

    // 2c. Categories
    console.log("\n🗂️  Importing categories...");
    const categories = readJson("hm_categories.json");
    for (const c of categories) {
      await prisma.hmCategory.create({
        data: {
          id: c.id,
          userId: c.user_id ?? null,
          languageId: c.language_id ?? null,
          name: c.name,
          slug: c.slug ?? null,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${categories.length} categories`);

    // 2d. Sub-Categories
    console.log("\n🗂️  Importing sub-categories...");
    const subCategories = readJson("hm_sub_categories.json");
    for (const s of subCategories) {
      await prisma.hmSubCategory.create({
        data: {
          id: s.id,
          userId: s.user_id ?? null,
          categoryId: s.category_id,
          name: s.name,
          slug: s.slug ?? null,
          createdAt: s.created_at ? new Date(s.created_at) : new Date(),
          updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${subCategories.length} sub-categories`);

    // 2e. Singers
    console.log("\n🎤 Importing singers...");
    const singers = readJson("hm_singers.json");
    for (const s of singers) {
      await prisma.hmSinger.create({
        data: {
          id: s.id,
          name: s.name,
          createdAt: s.created_at ? new Date(s.created_at) : new Date(),
          updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${singers.length} singers`);

    // 2f. Channels
    console.log("\n📺 Importing channels...");
    const channels = readJson("hm_channels.json");
    for (const c of channels) {
      await prisma.hmChannel.create({
        data: {
          id: c.id,
          title: c.title ?? "Unknown",
          slug: c.slug ?? String(c.id),
          ytChannelId: c.channel_id ?? null,
          handle: c.handle ?? "",
          description: c.description || null,
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

    // 2g. Hymns
    console.log("\n🎵 Importing hymns...");
    const hymns = readJson("hm_hymns.json");
    let hymnCount = 0;
    for (const h of hymns) {
      await prisma.hmHymn.create({
        data: {
          id: h.id,
          userId: h.user_id,
          approvalStatusId: h.approval_status_id,
          channelId: h.channel_id,
          slug: h.slug ?? String(h.id),
          videoId: h.video_id,
          publishedAt: h.published_at ? new Date(h.published_at) : null,
          singer: h.singer ?? null,
          title: h.title,
          lyrics: h.lyrics ?? null,
          lyricsSuggestion: h.lyrics_suggestion ?? null,
          description: h.description ?? null,
          thumbnailDefault: h.thumbnail_default,
          thumbnailMedium: h.thumbnail_medium,
          thumbnailHigh: h.thumbnail_high,
          thumbnailStandard: h.thumbnail_standard ?? null,
          thumbnailMaxres: h.thumbnail_maxres ?? null,
          clicksCount: h.clicks_count ?? 0,
          createdAt: h.created_at ? new Date(h.created_at) : new Date(),
          updatedAt: h.updated_at ? new Date(h.updated_at) : new Date(),
        },
      });
      hymnCount++;
    }
    console.log(`   ✓ Imported ${hymnCount} hymns`);

    // 2h. Junction tables
    console.log("\n🔗 Importing hymn relationships...");

    const categoryHymns = readJson("hm_category_hymn.json");
    for (const r of categoryHymns) {
      await prisma.hmCategoryHymn.create({
        data: {
          id: r.id,
          categoryId: r.category_id,
          hymnId: r.hymn_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${categoryHymns.length} hymn-category links`);

    const hymnLanguages = readJson("hm_hymn_language.json");
    for (const r of hymnLanguages) {
      await prisma.hmHymnLanguage.create({
        data: {
          id: r.id,
          hymnId: r.hymn_id,
          languageId: r.language_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${hymnLanguages.length} hymn-language links`);

    const hymnSingers = readJson("hm_hymn_singer.json");
    for (const r of hymnSingers) {
      await prisma.hmHymnSinger.create({
        data: {
          id: r.id,
          hymnId: r.hymn_id,
          singerId: r.singer_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${hymnSingers.length} hymn-singer links`);

    const hymnSubCategories = readJson("hm_hymn_sub_category.json");
    for (const r of hymnSubCategories) {
      await prisma.hmHymnSubCategory.create({
        data: {
          id: r.id,
          hymnId: r.hymn_id,
          subCategoryId: r.sub_category_id,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ ${hymnSubCategories.length} hymn-sub-category links`);

    // 2i. Favorites
    console.log("\n❤️  Importing favorites...");
    const favorites = readJson("hm_favorites.json");
    for (const f of favorites) {
      await prisma.hmFavorite.create({
        data: {
          id: f.id,
          userId: f.user_id,
          hymnId: f.hymn_id,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
          updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${favorites.length} favorites`);

    // 2j. Comments
    console.log("\n💬 Importing comments...");
    const comments = readJson("hm_comments.json");
    for (const c of comments) {
      await prisma.hmComment.create({
        data: {
          id: c.id,
          userId: c.user_id,
          hymnId: c.hymn_id,
          comment: c.body,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${comments.length} comments`);

    console.log("\n✅ Hymn tables reset and seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${approvalStatuses.length} Approval statuses`);
    console.log(`   - ${languages.length} Languages`);
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${subCategories.length} Sub-categories`);
    console.log(`   - ${singers.length} Singers`);
    console.log(`   - ${channels.length} Channels`);
    console.log(`   - ${hymnCount} Hymns`);
    console.log(`   - ${categoryHymns.length + hymnLanguages.length + hymnSingers.length + hymnSubCategories.length} Relationship links`);
    console.log(`   - ${favorites.length} Favorites`);
    console.log(`   - ${comments.length} Comments\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAndSeedHymn();
