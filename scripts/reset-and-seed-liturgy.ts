import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ROLES = [
  { key: "priest", nameAm: "ካህን", nameEn: "Priest", order: 1 },
  { key: "deacon", nameAm: "ዲያቆን", nameEn: "Deacon", order: 2 },
  { key: "assistant_priest", nameAm: "ንፍቅ ካህን", nameEn: "Assistant Priest", order: 3 },
  { key: "people", nameAm: "ሕዝብ", nameEn: "People", order: 4 },
];

const SECTIONS = Array.from({ length: 20 }, (_, i) => ({
  nameGeez: `ክፍል ${i + 1}`,
  nameAmharic: `ክፍል ${i + 1}`,
  nameEnglish: `Part ${i + 1}`,
  order: i + 1,
}));

async function resetAndSeed() {
  console.log("🔄 Reset and Seed Liturgy Tables\n");

  try {
    // STEP 1: Delete existing data
    console.log("🗑️  Step 1: Clearing existing data...");
    await prisma.ltLiturgicalText.deleteMany({});
    console.log("   ✓ Liturgical texts cleared");

    await prisma.ltSection.deleteMany({});
    console.log("   ✓ Sections cleared");

    await prisma.ltRole.deleteMany({});
    console.log("   ✓ Roles cleared");

    console.log("\n🌱 Step 2: Seeding fresh data...\n");

    // STEP 2: Seed Roles
    console.log("Seeding Roles:");
    for (const r of ROLES) {
      await prisma.ltRole.create({
        data: {
          roleKey: r.key,
          nameAmharic: r.nameAm,
          nameEnglish: r.nameEn,
          orderIndex: r.order,
        },
      });
      console.log(`   ✓ ${r.nameEn}`);
    }

    // STEP 3: Seed Sections
    console.log("\nSeeding Sections:");
    for (const s of SECTIONS) {
      await prisma.ltSection.create({
        data: {
          nameGeez: s.nameGeez,
          nameAmharic: s.nameAmharic,
          nameEnglish: s.nameEnglish,
          orderIndex: s.order,
        },
      });
      console.log(`   ✓ ${s.nameEnglish}`);
    }

    console.log("\n✅ Liturgy tables reset and seeded successfully!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAndSeed();
