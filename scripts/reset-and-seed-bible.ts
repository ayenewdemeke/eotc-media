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

// Additional books for Ethiopic canon (15 books)
const ETHIOPIC_ADDITIONAL_BOOKS = [
  { osisCode: "1En", name: "1 Enoch", order: 67 },
  { osisCode: "Jub", name: "Jubilees", order: 68 },
  { osisCode: "1Meq", name: "1 Meqabyan", order: 69 },
  { osisCode: "2Meq", name: "2 Meqabyan", order: 70 },
  { osisCode: "3Meq", name: "3 Meqabyan", order: 71 },
  { osisCode: "1Esd", name: "1 Esdras", order: 72 },
  { osisCode: "2Esd", name: "2 Esdras", order: 73 },
  { osisCode: "PrMan", name: "Prayer of Manasseh", order: 74 },
  { osisCode: "Tob", name: "Tobit", order: 75 },
  { osisCode: "Jdt", name: "Judith", order: 76 },
  { osisCode: "Wis", name: "Wisdom of Solomon", order: 77 },
  { osisCode: "Sir", name: "Sirach", order: 78 },
  { osisCode: "Bar", name: "Baruch", order: 79 },
  { osisCode: "EpJer", name: "Letter of Jeremiah", order: 80 },
  { osisCode: "Sus", name: "Susanna", order: 81 },
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

    // STEP 2: Import full Bible data from JSON files
    console.log("\n🌱 Step 2: Importing Bible data from JSON files...\n");

    // 2a. Create Canons
    console.log("📖 Creating canons...");
    const canon66 = await prisma.blCanon.create({
      data: {
        name: "66-book",
        description: "Standard Protestant 66-book canon",
      },
    });

    const canonEthiopic = await prisma.blCanon.create({
      data: {
        name: "Ethiopic",
        description: "Ethiopian Orthodox Tewahedo canon with 81 books",
      },
    });
    console.log("   ✓ Created 2 canons");

    // 2b. Create Translations
    console.log("\n📚 Creating translations...");
    const translations: Record<string, any> = {};

    translations["am-1954"] = await prisma.blTranslation.create({
      data: {
        canonId: canonEthiopic.id,
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
        canonId: canonEthiopic.id,
        code: "om-ethiopic",
        name: "Oromifa",
        language: "om",
      },
    });

    translations["he-masoretic"] = await prisma.blTranslation.create({
      data: {
        canonId: canon66.id,
        code: "he-masoretic",
        name: "Hebrew Masoretic",
        language: "he",
      },
    });

    translations["el-lxx"] = await prisma.blTranslation.create({
      data: {
        canonId: canon66.id,
        code: "el-lxx",
        name: "Greek Septuagint",
        language: "el",
      },
    });

    translations["el-tr"] = await prisma.blTranslation.create({
      data: {
        canonId: canon66.id,
        code: "el-tr",
        name: "Greek Textus Receptus",
        language: "el",
      },
    });
    console.log("   ✓ Created 6 translations");

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

      // Add to 66-book canon
      await prisma.blCanonBook.create({
        data: {
          canonId: canon66.id,
          bookId: newBook.id,
          order: i + 1,
        },
      });

      // Add to Ethiopic canon too
      await prisma.blCanonBook.create({
        data: {
          canonId: canonEthiopic.id,
          bookId: newBook.id,
          order: i + 1,
        },
      });
    }

    // Add the 15 additional Ethiopic books
    for (const ethBook of ETHIOPIC_ADDITIONAL_BOOKS) {
      const newBook = await prisma.blBook.create({
        data: {
          osisCode: ethBook.osisCode,
          englishName: ethBook.name,
          slug: ethBook.osisCode.toLowerCase(),
        },
      });

      await prisma.blCanonBook.create({
        data: {
          canonId: canonEthiopic.id,
          bookId: newBook.id,
          order: ethBook.order,
        },
      });
    }
    console.log(`   ✓ Imported ${oldBooks.length} books + 15 Ethiopic books = ${oldBooks.length + 15} total`);

    // 2d. Migrate Verses and Texts
    console.log("\n📝 Importing verses and texts...");

    const translations_to_migrate = [
      { file: "bl_amharic_1954_bible.json", translationCode: "am-1954" },
      { file: "bl_english_kjv_bible.json", translationCode: "en-kjv" },
      { file: "bl_oromifa_bible.json", translationCode: "om-ethiopic" },
      { file: "bl_hebrew_masoretic_bible.json", translationCode: "he-masoretic" },
      { file: "bl_greek_septuagint_bible.json", translationCode: "el-lxx" },
      { file: "bl_greek_textus_receptus_bible.json", translationCode: "el-tr" },
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

    console.log("\n✅ Bible tables reset and seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - 2 Canons created`);
    console.log(`   - 6 Translations created`);
    console.log(`   - ${oldBooks.length + 15} Books created`);
    console.log(`   - ${Object.keys(verseMap).length} Unique verses created`);
    console.log(`   - Verse texts imported for all translations\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAndSeedBible();
