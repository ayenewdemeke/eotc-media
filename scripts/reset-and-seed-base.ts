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

async function resetAndSeedBase() {
  console.log("⚠️  WARNING: This will DELETE ALL USERS and authentication data!");
  console.log("🔄 Reset and Seed Base/Auth Tables\n");

  try {
    // STEP 1: Delete existing base/auth data (in correct order)
    console.log("🗑️  Step 1: Clearing existing base/auth data...");

    await prisma.contactUs.deleteMany({});
    console.log("   ✓ Contact messages cleared");

    await prisma.session.deleteMany({});
    console.log("   ✓ Sessions cleared");

    await prisma.account.deleteMany({});
    console.log("   ✓ Accounts cleared");

    await prisma.verificationToken.deleteMany({});
    console.log("   ✓ Verification tokens cleared");

    await prisma.roleUser.deleteMany({});
    console.log("   ✓ User roles cleared");

    await prisma.user.deleteMany({});
    console.log("   ✓ Users cleared");

    await prisma.role.deleteMany({});
    console.log("   ✓ Roles cleared");

    // STEP 2: Import full base data from JSON files
    console.log("\n🌱 Step 2: Importing base data from JSON files...\n");

    // 2a. Migrate Roles
    console.log("👥 Importing roles...");
    const rolesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../prisma/data/roles.json"), "utf-8")
    );

    for (const role of rolesData) {
      await prisma.role.create({
        data: {
          id: role.id,
          name: role.name,
          code: role.code ?? role.name.toLowerCase().replace(/\s+/g, '-'),
          createdAt: role.created_at ? new Date(role.created_at) : new Date(),
          updatedAt: role.updated_at ? new Date(role.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${rolesData.length} roles`);

    // 2b. Migrate Users
    console.log("\n👤 Importing users...");
    const usersData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../prisma/data/users.json"), "utf-8")
    );

    for (const user of usersData) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || null,
          emailVerified: user.email_verified_at ? new Date(user.email_verified_at) : null,
          password: user.password,
          accessToken: user.access_token,
          rememberToken: user.remember_token,
          createdAt: user.created_at ? new Date(user.created_at) : new Date(),
          updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${usersData.length} users`);

    // 2c. Migrate Role_User relationships
    console.log("\n🔗 Importing user-role relationships...");
    const roleUserData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../prisma/data/role_user.json"), "utf-8")
    );

    for (const roleUser of roleUserData) {
      await prisma.roleUser.create({
        data: {
          id: roleUser.id,
          userId: roleUser.user_id,
          roleId: roleUser.role_id,
          createdAt: roleUser.created_at ? new Date(roleUser.created_at) : new Date(),
          updatedAt: roleUser.updated_at ? new Date(roleUser.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${roleUserData.length} user-role relationships`);

    // 2d. Migrate Contact messages
    console.log("\n📧 Importing contact messages...");
    const contactData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../prisma/data/contact_us.json"), "utf-8")
    );

    for (const contact of contactData) {
      await prisma.contactUs.create({
        data: {
          name: contact.name || null,
          email: contact.email || null,
          phone: contact.phone || null,
          message: contact.body || null,
          createdAt: contact.created_at ? new Date(contact.created_at) : new Date(),
          updatedAt: contact.updated_at ? new Date(contact.updated_at) : new Date(),
        },
      });
    }
    console.log(`   ✓ Imported ${contactData.length} contact messages`);

    console.log("\n✅ Base tables reset and seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${rolesData.length} Roles`);
    console.log(`   - ${usersData.length} Users`);
    console.log(`   - ${roleUserData.length} User-Role relationships`);
    console.log(`   - ${contactData.length} Contact messages\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetAndSeedBase();
