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

// OSIS codes for the 66 standard books
const BOOK_OSIS_CODES = [
  "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam",
  "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov",
  "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos",
  "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal",
  "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph",
  "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb",
  "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"
];


async function resetAndSeedBible() {
  console.log("🔄 Reset and Seed Bible Tables\n");

  try {
    // STEP 1: Delete existing Bible data (in correct order due to foreign keys)
    console.log("🗑️  Step 1: Clearing existing Bible data...");

    await prisma.blHighlight.deleteMany({});
    console.log("   ✓ Highlights cleared");

    await prisma.blVerseText.deleteMany({});
    console.log("   ✓ Verse texts cleared");

    await prisma.blVerse.deleteMany({});
    console.log("   ✓ Verses cleared");

    await prisma.blCanonBook.deleteMany({});
    console.log("   ✓ Canon books cleared");

    await prisma.blBook.deleteMany({});
    console.log("   ✓ Books cleared");

    await prisma.blTranslation.deleteMany({});
    console.log("   ✓ Translations cleared");

    await prisma.blCanon.deleteMany({});
    console.log("   ✓ Canons cleared");

    // Reset sequences so IDs always start from 1
    await prisma.$executeRaw`ALTER SEQUENCE bl_books_id_seq RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE bl_canon_books_id_seq RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE bl_canons_id_seq RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE bl_translations_id_seq RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE bl_verses_id_seq RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE bl_verse_texts_id_seq RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE bl_highlights_id_seq RESTART WITH 1`;
    console.log("   ✓ Sequences reset to 1");

    // STEP 2: Import full Bible data from JSON files
    console.log("\n🌱 Step 2: Importing Bible data from JSON files...\n");

    // 2a. Create Canon
    console.log("📖 Creating canon...");
    const canon66 = await prisma.blCanon.create({
      data: {
        name: "66-book",
        description: "66-book canon",
      },
    });
    console.log("   ✓ Created 1 canon");

    // 2b. Create Translations
    console.log("\n📚 Creating translations...");
    const translations: Record<string, any> = {};

    translations["am-1954"] = await prisma.blTranslation.create({
      data: {
        canonId: canon66.id,
        code: "am-1954",
        name: "Amharic 1954",
        language: "am",
      },
    });

    translations["en-kjv"] = await prisma.blTranslation.create({
      data: {
        canonId: canon66.id,
        code: "en-kjv",
        name: "King James Version",
        language: "en",
      },
    });

    translations["om-ethiopic"] = await prisma.blTranslation.create({
      data: {
        canonId: canon66.id,
        code: "om-ethiopic",
        name: "Oromifa",
        language: "om",
      },
    });

    console.log("   ✓ Created 3 translations");

    // 2c. Migrate Books
    console.log("\n📕 Importing books...");
    const oldBooks = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../prisma/data/bl_books.json"), "utf-8")
    );

    const bookIdMap: Record<number, number> = {};

    for (let i = 0; i < oldBooks.length && i < 66; i++) {
      const oldBook = oldBooks[i];
      const osisCode = BOOK_OSIS_CODES[i];

      const newBook = await prisma.blBook.create({
        data: {
          osisCode: osisCode,
          englishName: oldBook.english_name,
          geezName: oldBook.geez_name,
          amharicName: oldBook.amharic_name,
          oromifaName: oldBook.oromifa_name,
          tigrignaName: oldBook.tigrigna_name,
          slug: oldBook.slug,
        },
      });

      bookIdMap[oldBook.id] = newBook.id;

      await prisma.blCanonBook.create({
        data: {
          canonId: canon66.id,
          bookId: newBook.id,
          order: i + 1,
        },
      });
    }
    console.log(`   ✓ Imported 66 books`);

    // 2d. Migrate Verses and Texts
    console.log("\n📝 Importing verses and texts...");

    const translations_to_migrate = [
      { file: "bl_amharic_1954_bible.json", translationCode: "am-1954" },
      { file: "bl_english_kjv_bible.json", translationCode: "en-kjv" },
      { file: "bl_oromifa_bible.json", translationCode: "om-ethiopic" },
    ];

    const verseMap: Record<string, number> = {};

    for (const trans of translations_to_migrate) {
      console.log(`   → ${trans.translationCode}...`);
      const verses = JSON.parse(
        fs.readFileSync(path.join(__dirname, `../prisma/data/${trans.file}`), "utf-8")
      );

      for (const verse of verses) {
        const newBookId = bookIdMap[verse.book_id];
        if (!newBookId) continue; // Skip if book not found

        const verseKey = `${newBookId}-${verse.chapter}-${verse.verse}`;

        // Create verse if it doesn't exist
        if (!verseMap[verseKey]) {
          const newVerse = await prisma.blVerse.create({
            data: {
              bookId: newBookId,
              chapter: verse.chapter,
              verse: verse.verse,
            },
          });
          verseMap[verseKey] = newVerse.id;
        }

        // Create verse text
        await prisma.blVerseText.create({
          data: {
            verseId: verseMap[verseKey],
            translationId: translations[trans.translationCode].id,
            text: verse.text,
          },
        });
      }
    }
    console.log("   ✓ Imported all verses and texts");

    // 2e. Seed Highlights
    console.log("\n🎨 Importing highlights...");
    const highlightsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../prisma/data/bl_highlights.json"), "utf-8")
    );

    let highlightCount = 0;
    for (const h of highlightsData) {
      const newBookId = bookIdMap[h.book_id];
      if (!newBookId) continue;
      const verseKey = `${newBookId}-${h.chapter}-${h.verse}`;
      const verseId = verseMap[verseKey];
      if (!verseId) continue;
      await prisma.blHighlight.create({
        data: {
          userId: h.user_id,
          verseId,
          color: h.color || null,
        },
      });
      highlightCount++;
    }
    console.log(`   ✓ Imported ${highlightCount} highlights`);

    console.log("\n✅ Bible tables reset and seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - 1 Canon created`);
    console.log(`   - 3 Translations created`);
    console.log(`   - 66 Books created`);
    console.log(`   - ${Object.keys(verseMap).length} Unique verses created`);
    console.log(`   - Verse texts imported for all translations`);
    console.log(`   - ${highlightCount} Highlights imported\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAndSeedBible();
