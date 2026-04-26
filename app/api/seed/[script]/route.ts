import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

export const maxDuration = 300; // 5 minutes

function readJson(filename: string): any[] {
  const filePath = path.join(process.cwd(), "prisma", "data", filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// ─── SEEDERS ────────────────────────────────────────────────────────────────

async function seedBase() {
  const log: string[] = [];

  // Clear
  await prisma.contactUs.deleteMany({});        log.push("✓ Contact messages cleared");
  await prisma.session.deleteMany({});           log.push("✓ Sessions cleared");
  await prisma.account.deleteMany({});           log.push("✓ Accounts cleared");
  await prisma.verificationToken.deleteMany({}); log.push("✓ Verification tokens cleared");
  await prisma.roleUser.deleteMany({});          log.push("✓ User roles cleared");
  await prisma.user.deleteMany({});              log.push("✓ Users cleared");
  await prisma.role.deleteMany({});              log.push("✓ Roles cleared");

  // Roles
  const rolesData = readJson("roles.json");
  for (const r of rolesData) {
    await prisma.role.create({
      data: {
        id: r.id,
        name: r.name,
        code: r.code,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
      },
    });
  }
  log.push(`✓ Imported ${rolesData.length} roles`);

  // Users
  const usersData = readJson("users.json");
  for (const u of usersData) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image || null,
        emailVerified: u.email_verified_at ? new Date(u.email_verified_at) : null,
        password: u.password,
        accessToken: u.access_token,
        rememberToken: u.remember_token,
        createdAt: u.created_at ? new Date(u.created_at) : new Date(),
        updatedAt: u.updated_at ? new Date(u.updated_at) : new Date(),
      },
    });
  }
  log.push(`✓ Imported ${usersData.length} users`);

  // Role-User
  const roleUserData = readJson("role_user.json");
  for (const r of roleUserData) {
    await prisma.roleUser.create({
      data: {
        id: r.id,
        userId: r.user_id,
        roleId: r.role_id,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
      },
    });
  }
  log.push(`✓ Imported ${roleUserData.length} user-role relationships`);

  // Contact messages
  const contactData = readJson("contact_us.json");
  for (const c of contactData) {
    await prisma.contactUs.create({
      data: {
        name: c.name || null,
        email: c.email || null,
        phone: c.phone || null,
        message: c.message || null,
        createdAt: c.created_at ? new Date(c.created_at) : new Date(),
        updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
      },
    });
  }
  log.push(`✓ Imported ${contactData.length} contact messages`);

  return log;
}

async function seedLiturgy() {
  const log: string[] = [];

  const ROLES = [
    { key: "priest",           nameAm: "ካህን",      nameEn: "Priest",           order: 1 },
    { key: "deacon",           nameAm: "ዲያቆን",     nameEn: "Deacon",           order: 2 },
    { key: "assistant_priest", nameAm: "ንፍቅ ካህን", nameEn: "Assistant Priest", order: 3 },
    { key: "people",           nameAm: "ሕዝብ",      nameEn: "People",           order: 4 },
  ];
  const SECTIONS = Array.from({ length: 20 }, (_, i) => ({
    nameGeez: `ክፍል ${i + 1}`,
    nameAmharic: `ክፍል ${i + 1}`,
    nameEnglish: `Part ${i + 1}`,
    order: i + 1,
  }));

  // Clear
  await prisma.ltLiturgicalText.deleteMany({}); log.push("✓ Liturgical texts cleared");
  await prisma.ltSection.deleteMany({});         log.push("✓ Sections cleared");
  await prisma.ltRole.deleteMany({});            log.push("✓ Roles cleared");

  // Roles
  for (const r of ROLES) {
    await prisma.ltRole.create({
      data: { roleKey: r.key, nameAmharic: r.nameAm, nameEnglish: r.nameEn, orderIndex: r.order },
    });
  }
  log.push(`✓ Seeded ${ROLES.length} roles`);

  // Sections
  for (const s of SECTIONS) {
    await prisma.ltSection.create({
      data: { nameGeez: s.nameGeez, nameAmharic: s.nameAmharic, nameEnglish: s.nameEnglish, orderIndex: s.order },
    });
  }
  log.push(`✓ Seeded ${SECTIONS.length} sections`);

  return log;
}

async function seedSermon() {
  const log: string[] = [];

  // Clear
  await prisma.smFavorite.deleteMany({});         log.push("✓ Favorites cleared");
  await prisma.smPreacherSermon.deleteMany({});   log.push("✓ Sermon-Preacher links cleared");
  await prisma.smSermonSubCategory.deleteMany({}); log.push("✓ Sermon-SubCategory links cleared");
  await prisma.smLanguageSermon.deleteMany({});   log.push("✓ Sermon-Language links cleared");
  await prisma.smCategorySermon.deleteMany({});   log.push("✓ Sermon-Category links cleared");
  await prisma.smSermon.deleteMany({});            log.push("✓ Sermons cleared");
  await prisma.smChannel.deleteMany({});           log.push("✓ Channels cleared");
  await prisma.smPreacher.deleteMany({});          log.push("✓ Preachers cleared");
  await prisma.smSubCategory.deleteMany({});       log.push("✓ Sub-categories cleared");
  await prisma.smCategory.deleteMany({});          log.push("✓ Categories cleared");
  await prisma.smLanguage.deleteMany({});          log.push("✓ Languages cleared");
  await prisma.smApprovalStatus.deleteMany({});   log.push("✓ Approval statuses cleared");

  // Approval Statuses
  const approvalStatuses = readJson("sm_approval_statuses.json");
  for (const s of approvalStatuses) {
    await prisma.smApprovalStatus.create({ data: { id: s.id, name: s.name, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${approvalStatuses.length} approval statuses`);

  // Languages
  const languages = readJson("sm_languages.json");
  for (const l of languages) {
    await prisma.smLanguage.create({ data: { id: l.id, name: l.name, createdAt: l.created_at ? new Date(l.created_at) : new Date(), updatedAt: l.updated_at ? new Date(l.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${languages.length} languages`);

  // Categories
  const categories = readJson("sm_categories.json");
  for (const c of categories) {
    await prisma.smCategory.create({ data: { id: c.id, name: c.name, createdAt: c.created_at ? new Date(c.created_at) : new Date(), updatedAt: c.updated_at ? new Date(c.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${categories.length} categories`);

  // Sub-Categories
  const subCategories = readJson("sm_sub_categories.json");
  for (const s of subCategories) {
    await prisma.smSubCategory.create({ data: { id: s.id, categoryId: s.category_id, name: s.name, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${subCategories.length} sub-categories`);

  // Preachers
  const preachers = readJson("sm_preachers.json");
  for (const p of preachers) {
    await prisma.smPreacher.create({ data: { id: p.id, name: p.name, createdAt: p.created_at ? new Date(p.created_at) : new Date(), updatedAt: p.updated_at ? new Date(p.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${preachers.length} preachers`);

  // Channels
  const channels = readJson("sm_channels.json");
  for (const c of channels) {
    await prisma.smChannel.create({ data: { id: c.id, name: c.title ?? c.name ?? "Unknown", slug: c.slug ?? null, ytChannelId: c.yt_channel_id ?? c.channel_id ?? null, handle: c.handle ?? "", description: c.description ?? null, thumbnailDefault: c.thumbnail_default ?? null, thumbnailMedium: c.thumbnail_medium ?? null, thumbnailHigh: c.thumbnail_high ?? null, coverImage: c.cover_image ?? null, country: c.country ?? null, publishedAt: c.published_at ? new Date(c.published_at) : null, createdAt: c.created_at ? new Date(c.created_at) : new Date(), updatedAt: c.updated_at ? new Date(c.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${channels.length} channels`);

  // Sermons
  const sermons = readJson("sm_sermons.json");
  const SCHUNK = 500;
  let sInserted = 0;
  for (let i = 0; i < sermons.length; i += SCHUNK) {
    const chunk = sermons.slice(i, i + SCHUNK);
    const { count } = await prisma.smSermon.createMany({
      data: chunk.map((s: any) => ({ id: s.id, userId: s.user_id, approvalStatusId: s.approval_status_id, channelId: s.channel_id, slug: s.slug ?? String(s.id), videoId: s.video_id, publishedAt: s.published_at ? new Date(s.published_at) : null, preacher: s.preacher ?? null, title: s.title, description: s.description ?? null, thumbnailDefault: s.thumbnail_default, thumbnailMedium: s.thumbnail_medium, thumbnailHigh: s.thumbnail_high, thumbnailStandard: s.thumbnail_standard ?? null, thumbnailMaxres: s.thumbnail_maxres ?? null, clicksCount: s.clicks_count ?? 0, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() })),
      skipDuplicates: true,
    });
    sInserted += count;
  }
  log.push(`✓ Imported ${sInserted} sermons`);

  // Junctions
  const categorySermons = readJson("sm_category_sermon.json");
  const { count: csCount } = await prisma.smCategorySermon.createMany({
    data: categorySermons.map((r: any) => ({ id: r.id, categoryId: r.category_id, sermonId: r.sermon_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${csCount} sermon-category links`);

  const languageSermons = readJson("sm_language_sermon.json");
  const { count: lsCount } = await prisma.smLanguageSermon.createMany({
    data: languageSermons.map((r: any) => ({ id: r.id, languageId: r.language_id, sermonId: r.sermon_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${lsCount} sermon-language links`);

  const preacherSermons = readJson("sm_preacher_sermon.json");
  const { count: psCount } = await prisma.smPreacherSermon.createMany({
    data: preacherSermons.map((r: any) => ({ id: r.id, preacherId: r.preacher_id, sermonId: r.sermon_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${psCount} sermon-preacher links`);

  const sermonSubCategories = readJson("sm_sermon_sub_category.json");
  const { count: sscCount } = await prisma.smSermonSubCategory.createMany({
    data: sermonSubCategories.map((r: any) => ({ id: r.id, sermonId: r.sermon_id, subCategoryId: r.sub_category_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${sscCount} sermon-sub-category links`);

  const favorites = readJson("sm_favorites.json");
  const { count: sfCount } = await prisma.smFavorite.createMany({
    data: favorites.map((f: any) => ({ id: f.id, userId: f.user_id, sermonId: f.sermon_id, createdAt: f.created_at ? new Date(f.created_at) : new Date(), updatedAt: f.updated_at ? new Date(f.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ Imported ${sfCount} favorites`);

  return log;
}

// Hymn is split into 2 endpoints to avoid server timeout:
// hymn-setup → hymn-data

async function seedHymnSetup() {
  const log: string[] = [];

  // Clear all hymn tables
  await prisma.hmComment.deleteMany({});           log.push("✓ Comments cleared");
  await prisma.hmFavorite.deleteMany({});           log.push("✓ Favorites cleared");
  await prisma.hmHymnSinger.deleteMany({});         log.push("✓ Hymn-Singer links cleared");
  await prisma.hmHymnSubCategory.deleteMany({});    log.push("✓ Hymn-SubCategory links cleared");
  await prisma.hmHymnLanguage.deleteMany({});       log.push("✓ Hymn-Language links cleared");
  await prisma.hmCategoryHymn.deleteMany({});       log.push("✓ Hymn-Category links cleared");
  await prisma.hmHymn.deleteMany({});               log.push("✓ Hymns cleared");
  await prisma.hmChannel.deleteMany({});            log.push("✓ Channels cleared");
  await prisma.hmSinger.deleteMany({});             log.push("✓ Singers cleared");
  await prisma.hmSubCategory.deleteMany({});        log.push("✓ Sub-categories cleared");
  await prisma.hmCategory.deleteMany({});           log.push("✓ Categories cleared");
  await prisma.hmLanguage.deleteMany({});           log.push("✓ Languages cleared");
  await prisma.hmApprovalStatus.deleteMany({});     log.push("✓ Approval statuses cleared");

  const approvalStatuses = readJson("hm_approval_statuses.json");
  for (const s of approvalStatuses) {
    await prisma.hmApprovalStatus.create({ data: { id: s.id, name: s.name, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${approvalStatuses.length} approval statuses`);

  const languages = readJson("hm_languages.json");
  for (const l of languages) {
    await prisma.hmLanguage.create({ data: { id: l.id, userId: l.user_id ?? null, name: l.name, slug: l.slug ?? null, createdAt: l.created_at ? new Date(l.created_at) : new Date(), updatedAt: l.updated_at ? new Date(l.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${languages.length} languages`);

  const categories = readJson("hm_categories.json");
  for (const c of categories) {
    await prisma.hmCategory.create({ data: { id: c.id, userId: c.user_id ?? null, languageId: c.language_id ?? null, name: c.name, slug: c.slug ?? null, createdAt: c.created_at ? new Date(c.created_at) : new Date(), updatedAt: c.updated_at ? new Date(c.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${categories.length} categories`);

  const subCategories = readJson("hm_sub_categories.json");
  for (const s of subCategories) {
    await prisma.hmSubCategory.create({ data: { id: s.id, userId: s.user_id ?? null, categoryId: s.category_id, name: s.name, slug: s.slug ?? null, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${subCategories.length} sub-categories`);

  const singers = readJson("hm_singers.json");
  for (const s of singers) {
    await prisma.hmSinger.create({ data: { id: s.id, name: s.name, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${singers.length} singers`);

  const channels = readJson("hm_channels.json");
  for (const c of channels) {
    await prisma.hmChannel.create({ data: { id: c.id, title: c.title ?? "Unknown", slug: c.slug ?? String(c.id), ytChannelId: c.channel_id ?? null, handle: c.handle ?? "", description: c.description || null, thumbnailDefault: c.thumbnail_default ?? null, thumbnailMedium: c.thumbnail_medium ?? null, thumbnailHigh: c.thumbnail_high ?? null, coverImage: c.cover_image ?? null, country: c.country ?? null, publishedAt: c.published_at ? new Date(c.published_at) : null, createdAt: c.created_at ? new Date(c.created_at) : new Date(), updatedAt: c.updated_at ? new Date(c.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${channels.length} channels`);

  return log;
}

async function seedHymnData(half: 1 | 2) {
  const log: string[] = [];

  const all = readJson("hm_hymns.json");
  const mid = Math.ceil(all.length / 2);
  const hymns = half === 1 ? all.slice(0, mid) : all.slice(mid);

  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < hymns.length; i += CHUNK) {
    const chunk = hymns.slice(i, i + CHUNK);
    const { count } = await prisma.hmHymn.createMany({
      data: chunk.map((h: any) => ({
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
      })),
      skipDuplicates: true,
    });
    inserted += count;
  }
  log.push(`✓ Imported ${inserted} hymns (part ${half} of 2)`);

  return log;
}

async function seedHymnLinks(half: 1 | 2) {
  const log: string[] = [];

  const all = readJson("hm_category_hymn.json");
  const mid = Math.ceil(all.length / 2);
  const rows = half === 1 ? all.slice(0, mid) : all.slice(mid);

  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { count } = await prisma.hmCategoryHymn.createMany({
      data: chunk.map((r: any) => ({
        id: r.id,
        categoryId: r.category_id,
        hymnId: r.hymn_id,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
      })),
      skipDuplicates: true,
    });
    inserted += count;
  }
  log.push(`✓ ${inserted} hymn-category links (part ${half} of 2)`);

  return log;
}

async function seedHymnExtras1() {
  const log: string[] = [];

  const CHUNK = 500;

  const hymnLanguages = readJson("hm_hymn_language.json");
  let langInserted = 0;
  for (let i = 0; i < hymnLanguages.length; i += CHUNK) {
    const chunk = hymnLanguages.slice(i, i + CHUNK);
    const { count } = await prisma.hmHymnLanguage.createMany({
      data: chunk.map((r: any) => ({
        id: r.id, hymnId: r.hymn_id, languageId: r.language_id,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
      })),
      skipDuplicates: true,
    });
    langInserted += count;
  }
  log.push(`✓ ${langInserted} hymn-language links`);

  const hymnSingers = readJson("hm_hymn_singer.json");
  let singerInserted = 0;
  for (let i = 0; i < hymnSingers.length; i += CHUNK) {
    const chunk = hymnSingers.slice(i, i + CHUNK);
    const { count } = await prisma.hmHymnSinger.createMany({
      data: chunk.map((r: any) => ({
        id: r.id, hymnId: r.hymn_id, singerId: r.singer_id,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
      })),
      skipDuplicates: true,
    });
    singerInserted += count;
  }
  log.push(`✓ ${singerInserted} hymn-singer links`);

  return log;
}

async function seedHymnExtras2() {
  const log: string[] = [];

  const CHUNK = 500;
  const all = readJson("hm_hymn_sub_category.json");
  const mid = Math.ceil(all.length / 2);
  const rows = all.slice(0, mid);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { count } = await prisma.hmHymnSubCategory.createMany({
      data: chunk.map((r: any) => ({
        id: r.id, hymnId: r.hymn_id, subCategoryId: r.sub_category_id,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
      })),
      skipDuplicates: true,
    });
    inserted += count;
  }
  log.push(`✓ ${inserted} hymn-sub-category links (part 1 of 2)`);

  return log;
}

async function seedHymnExtras3() {
  const log: string[] = [];

  const CHUNK = 500;

  const all = readJson("hm_hymn_sub_category.json");
  const mid = Math.ceil(all.length / 2);
  const rows = all.slice(mid);
  let subCatInserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { count } = await prisma.hmHymnSubCategory.createMany({
      data: chunk.map((r: any) => ({
        id: r.id, hymnId: r.hymn_id, subCategoryId: r.sub_category_id,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
      })),
      skipDuplicates: true,
    });
    subCatInserted += count;
  }
  log.push(`✓ ${subCatInserted} hymn-sub-category links (part 2 of 2)`);

  const favorites = readJson("hm_favorites.json");
  const { count: favCount } = await prisma.hmFavorite.createMany({
    data: favorites.map((f: any) => ({
      id: f.id, userId: f.user_id, hymnId: f.hymn_id,
      createdAt: f.created_at ? new Date(f.created_at) : new Date(),
      updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
    })),
    skipDuplicates: true,
  });
  log.push(`✓ Imported ${favCount} favorites`);

  const comments = readJson("hm_comments.json");
  const { count: commCount } = await prisma.hmComment.createMany({
    data: comments.map((c: any) => ({
      id: c.id, userId: c.user_id, hymnId: c.hymn_id, comment: c.body,
      createdAt: c.created_at ? new Date(c.created_at) : new Date(),
      updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(),
    })),
    skipDuplicates: true,
  });
  log.push(`✓ Imported ${commCount} comments`);

  return log;
}

async function seedBook() {
  const log: string[] = [];

  // Clear
  await prisma.cbCopyrightReport.deleteMany({}); log.push("✓ Copyright reports cleared");
  await prisma.cbBookComment.deleteMany({});      log.push("✓ Comments cleared");
  await prisma.cbLike.deleteMany({});             log.push("✓ Likes cleared");
  await prisma.cbAuthorBook.deleteMany({});       log.push("✓ Book-Author links cleared");
  await prisma.cbBookSubCategory.deleteMany({}); log.push("✓ Book-SubCategory links cleared");
  await prisma.cbBookCategory.deleteMany({});    log.push("✓ Book-Category links cleared");
  await prisma.cbBookLanguage.deleteMany({});    log.push("✓ Book-Language links cleared");
  await prisma.cbBook.deleteMany({});            log.push("✓ Books cleared");
  await prisma.cbAuthor.deleteMany({});          log.push("✓ Authors cleared");
  await prisma.cbSubCategory.deleteMany({});     log.push("✓ Sub-categories cleared");
  await prisma.cbCategory.deleteMany({});        log.push("✓ Categories cleared");
  await prisma.cbLanguage.deleteMany({});        log.push("✓ Languages cleared");
  await prisma.cbApprovalStatus.deleteMany({}); log.push("✓ Approval statuses cleared");

  const approvalStatuses = readJson("cb_approval_statuses.json");
  for (const s of approvalStatuses) {
    await prisma.cbApprovalStatus.create({ data: { id: s.id, name: s.name, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${approvalStatuses.length} approval statuses`);

  const languages = readJson("cb_languages.json");
  for (const l of languages) {
    await prisma.cbLanguage.create({ data: { id: l.id, name: l.name, createdAt: l.created_at ? new Date(l.created_at) : new Date(), updatedAt: l.updated_at ? new Date(l.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${languages.length} languages`);

  const categories = readJson("cb_categories.json");
  for (const c of categories) {
    await prisma.cbCategory.create({ data: { id: c.id, name: c.name, createdAt: c.created_at ? new Date(c.created_at) : new Date(), updatedAt: c.updated_at ? new Date(c.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${categories.length} categories`);

  const subCategories = readJson("cb_sub_categories.json");
  for (const s of subCategories) {
    await prisma.cbSubCategory.create({ data: { id: s.id, categoryId: s.category_id, name: s.name, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${subCategories.length} sub-categories`);

  const authors = readJson("cb_authors.json");
  for (const a of authors) {
    await prisma.cbAuthor.create({ data: { id: a.id, name: a.name, createdAt: a.created_at ? new Date(a.created_at) : new Date(), updatedAt: a.updated_at ? new Date(a.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${authors.length} authors`);

  const BCHUNK = 500;

  const books = readJson("cb_books.json");
  let bInserted = 0;
  for (let i = 0; i < books.length; i += BCHUNK) {
    const { count } = await prisma.cbBook.createMany({
      data: books.slice(i, i + BCHUNK).map((b: any) => ({ id: b.id, userId: b.user_id, approvalStatusId: b.approval_status_id, name: b.name, slug: b.slug ?? String(b.id), author: b.author, description: b.description ?? null, image: b.image ?? null, file: b.file, createdAt: b.created_at ? new Date(b.created_at) : new Date(), updatedAt: b.updated_at ? new Date(b.updated_at) : new Date() })),
      skipDuplicates: true,
    });
    bInserted += count;
  }
  log.push(`✓ Imported ${bInserted} books`);

  const bookLanguages = readJson("cb_book_language.json");
  const { count: blCount } = await prisma.cbBookLanguage.createMany({
    data: bookLanguages.map((r: any) => ({ id: r.id, bookId: r.book_id, languageId: r.language_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${blCount} book-language links`);

  const bookCategories = readJson("cb_book_category.json");
  const { count: bcCount } = await prisma.cbBookCategory.createMany({
    data: bookCategories.map((r: any) => ({ id: r.id, bookId: r.book_id, categoryId: r.category_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${bcCount} book-category links`);

  const bookSubCategories = readJson("cb_book_sub_category.json");
  const { count: bscCount } = await prisma.cbBookSubCategory.createMany({
    data: bookSubCategories.map((r: any) => ({ id: r.id, bookId: r.book_id, subCategoryId: r.sub_category_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${bscCount} book-sub-category links`);

  const authorBooks = readJson("cb_author_book.json");
  const { count: abCount } = await prisma.cbAuthorBook.createMany({
    data: authorBooks.map((r: any) => ({ id: r.id, authorId: r.author_id, bookId: r.book_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${abCount} book-author links`);

  const likes = readJson("cb_likes.json");
  const { count: likesCount } = await prisma.cbLike.createMany({
    data: likes.map((l: any) => ({ id: l.id, userId: l.user_id, bookId: l.book_id ?? l.likable_id, createdAt: l.created_at ? new Date(l.created_at) : new Date(), updatedAt: l.updated_at ? new Date(l.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ Imported ${likesCount} likes`);

  const comments = readJson("cb_book_comments.json");
  const { count: cbcCount } = await prisma.cbBookComment.createMany({
    data: comments.map((c: any) => ({ id: c.id, userId: c.user_id, bookId: c.book_id, comment: c.comment ?? c.body, createdAt: c.created_at ? new Date(c.created_at) : new Date(), updatedAt: c.updated_at ? new Date(c.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ Imported ${cbcCount} comments`);

  const copyrightReports = readJson("cb_copyright_reports.json");
  const { count: crCount } = await prisma.cbCopyrightReport.createMany({
    data: copyrightReports.map((r: any) => ({ id: r.id, userId: r.user_id, bookId: r.book_id, reason: r.reason, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ Imported ${crCount} copyright reports`);

  return log;
}

// Bible is split into 5 endpoints to avoid server timeout:
// bible-setup → bible-amharic → bible-kjv → bible-oromifa → bible-highlights

const BOOK_OSIS_CODES = [
  "Gen","Exod","Lev","Num","Deut","Josh","Judg","Ruth","1Sam","2Sam",
  "1Kgs","2Kgs","1Chr","2Chr","Ezra","Neh","Esth","Job","Ps","Prov",
  "Eccl","Song","Isa","Jer","Lam","Ezek","Dan","Hos","Joel","Amos",
  "Obad","Jonah","Mic","Nah","Hab","Zeph","Hag","Zech","Mal",
  "Matt","Mark","Luke","John","Acts","Rom","1Cor","2Cor","Gal","Eph",
  "Phil","Col","1Thess","2Thess","1Tim","2Tim","Titus","Phlm","Heb",
  "Jas","1Pet","2Pet","1John","2John","3John","Jude","Rev",
];

async function seedBibleSetup() {
  const log: string[] = [];

  // Clear all bible tables
  await prisma.blHighlight.deleteMany({});   log.push("✓ Highlights cleared");
  await prisma.blVerseText.deleteMany({});   log.push("✓ Verse texts cleared");
  await prisma.blVerse.deleteMany({});       log.push("✓ Verses cleared");
  await prisma.blCanonBook.deleteMany({});   log.push("✓ Canon books cleared");
  await prisma.blBook.deleteMany({});        log.push("✓ Books cleared");
  await prisma.blTranslation.deleteMany({}); log.push("✓ Translations cleared");
  await prisma.blCanon.deleteMany({});       log.push("✓ Canons cleared");

  await prisma.$executeRaw`ALTER SEQUENCE bl_books_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE bl_canon_books_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE bl_canons_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE bl_translations_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE bl_verses_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE bl_verse_texts_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE bl_highlights_id_seq RESTART WITH 1`;
  log.push("✓ Sequences reset");

  // Canon
  const canon66 = await prisma.blCanon.create({ data: { name: "66-book", description: "66-book canon" } });
  log.push("✓ Created canon");

  // Translations
  await prisma.blTranslation.create({ data: { canonId: canon66.id, code: "am-1954",     name: "Amharic 1954",      language: "am" } });
  await prisma.blTranslation.create({ data: { canonId: canon66.id, code: "en-kjv",      name: "King James Version", language: "en" } });
  await prisma.blTranslation.create({ data: { canonId: canon66.id, code: "om-ethiopic", name: "Oromifa",            language: "om" } });
  log.push("✓ Created 3 translations");

  // Books (sequences reset to 1, so new IDs match old IDs 1-66)
  const oldBooks = readJson("bl_books.json");
  for (let i = 0; i < oldBooks.length && i < 66; i++) {
    const oldBook = oldBooks[i];
    const newBook = await prisma.blBook.create({
      data: { osisCode: BOOK_OSIS_CODES[i], englishName: oldBook.english_name, geezName: oldBook.geez_name, amharicName: oldBook.amharic_name, oromifaName: oldBook.oromifa_name, tigrignaName: oldBook.tigrigna_name, slug: oldBook.slug },
    });
    await prisma.blCanonBook.create({ data: { canonId: canon66.id, bookId: newBook.id, order: i + 1 } });
  }
  log.push("✓ Imported 66 books");

  return log;
}

async function seedBibleTranslation(file: string, translationCode: string, fromBook: number, toBook: number) {
  const log: string[] = [];
  const CHUNK = 500;

  const translation = await prisma.blTranslation.findFirstOrThrow({ where: { code: translationCode } });
  const allVerses = readJson(file);
  const verses = allVerses.filter((v: any) => v.book_id >= fromBook && v.book_id <= toBook);

  // Step 1: Ensure all verse coordinates exist (shared across translations)
  // Deduplicate by book+chapter+verse key
  const coordMap = new Map<string, { bookId: number; chapter: number; verse: number }>();
  for (const v of verses) {
    const key = `${v.book_id}:${v.chapter}:${v.verse}`;
    if (!coordMap.has(key)) coordMap.set(key, { bookId: v.book_id, chapter: v.chapter, verse: v.verse });
  }
  const uniqueCoords = Array.from(coordMap.values());
  for (let i = 0; i < uniqueCoords.length; i += CHUNK) {
    await prisma.blVerse.createMany({ data: uniqueCoords.slice(i, i + CHUNK), skipDuplicates: true });
  }

  // Step 2: Load all verse IDs for this book range into a Map
  const existingVerses = await prisma.blVerse.findMany({
    where: { bookId: { gte: fromBook, lte: toBook } },
    select: { id: true, bookId: true, chapter: true, verse: true },
  });
  const verseIdMap = new Map<string, number>();
  for (const v of existingVerses) {
    verseIdMap.set(`${v.bookId}:${v.chapter}:${v.verse}`, v.id);
  }

  // Step 3: Batch-insert all verse texts
  let count = 0;
  for (let i = 0; i < verses.length; i += CHUNK) {
    const chunk = verses.slice(i, i + CHUNK);
    const data = chunk
      .map((v: any) => {
        const verseId = verseIdMap.get(`${v.book_id}:${v.chapter}:${v.verse}`);
        if (!verseId) return null;
        return { verseId, translationId: translation.id, text: v.text };
      })
      .filter(Boolean) as any[];
    if (data.length > 0) {
      const { count: c } = await prisma.blVerseText.createMany({ data, skipDuplicates: true });
      count += c;
    }
  }

  log.push(`✓ Imported ${count} verse texts for ${translationCode} (books ${fromBook}–${toBook})`);
  return log;
}

async function seedBibleHighlights() {
  const log: string[] = [];

  await prisma.blHighlight.deleteMany({});
  const highlightsData = readJson("bl_highlights.json");
  let count = 0;

  for (const h of highlightsData) {
    const verseRow = await prisma.blVerse.findFirst({ where: { bookId: h.book_id, chapter: h.chapter, verse: h.verse } });
    if (!verseRow) continue;
    await prisma.blHighlight.create({ data: { userId: h.user_id, verseId: verseRow.id, color: h.color || null } });
    count++;
  }

  log.push(`✓ Imported ${count} highlights`);
  return log;
}

async function seedQuiz() {
  const log: string[] = [];

  // Clear
  await prisma.qzRoundResult.deleteMany({});        log.push("✓ Round results cleared");
  await prisma.qzRoundAnswer.deleteMany({});         log.push("✓ Round answers cleared");
  await prisma.qzRoundQuestion.deleteMany({});       log.push("✓ Round questions cleared");
  await prisma.qzRoomMemberRound.deleteMany({});     log.push("✓ Room-member-round links cleared");
  await prisma.qzRound.deleteMany({});               log.push("✓ Rounds cleared");
  await prisma.qzRoomMember.deleteMany({});          log.push("✓ Room members cleared");
  await prisma.qzRoom.deleteMany({});                log.push("✓ Rooms cleared");
  await prisma.qzQuestionSubCategory.deleteMany({}); log.push("✓ Question-SubCategory links cleared");
  await prisma.qzCategoryQuestion.deleteMany({});    log.push("✓ Question-Category links cleared");
  await prisma.qzLanguageQuestion.deleteMany({});    log.push("✓ Question-Language links cleared");
  await prisma.qzChoice.deleteMany({});              log.push("✓ Choices cleared");
  await prisma.qzQuestion.deleteMany({});            log.push("✓ Questions cleared");
  await prisma.qzSubCategory.deleteMany({});         log.push("✓ Sub-categories cleared");
  await prisma.qzCategory.deleteMany({});            log.push("✓ Categories cleared");
  await prisma.qzLanguage.deleteMany({});            log.push("✓ Languages cleared");
  await prisma.qzDifficulty.deleteMany({});          log.push("✓ Difficulties cleared");
  await prisma.qzQuestionType.deleteMany({});        log.push("✓ Question types cleared");
  await prisma.qzApprovalStatus.deleteMany({});      log.push("✓ Approval statuses cleared");

  const approvalStatuses = readJson("qz_approval_statuses.json");
  for (const s of approvalStatuses) {
    await prisma.qzApprovalStatus.create({ data: { id: s.id, name: s.name, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${approvalStatuses.length} approval statuses`);

  const questionTypes = readJson("qz_question_types.json");
  for (const t of questionTypes) {
    await prisma.qzQuestionType.create({ data: { id: t.id, name: t.name, createdAt: t.created_at ? new Date(t.created_at) : new Date(), updatedAt: t.updated_at ? new Date(t.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${questionTypes.length} question types`);

  const difficulties = readJson("qz_difficulties.json");
  for (const d of difficulties) {
    await prisma.qzDifficulty.create({ data: { id: d.id, name: d.name, createdAt: d.created_at ? new Date(d.created_at) : new Date(), updatedAt: d.updated_at ? new Date(d.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${difficulties.length} difficulties`);

  const languages = readJson("qz_languages.json");
  for (const l of languages) {
    await prisma.qzLanguage.create({ data: { id: l.id, name: l.name, createdAt: l.created_at ? new Date(l.created_at) : new Date(), updatedAt: l.updated_at ? new Date(l.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${languages.length} languages`);

  const categories = readJson("qz_categories.json");
  for (const c of categories) {
    await prisma.qzCategory.create({ data: { id: c.id, name: c.name, createdAt: c.created_at ? new Date(c.created_at) : new Date(), updatedAt: c.updated_at ? new Date(c.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${categories.length} categories`);

  const subCategories = readJson("qz_sub_categories.json");
  for (const s of subCategories) {
    await prisma.qzSubCategory.create({ data: { id: s.id, categoryId: s.category_id, name: s.name, createdAt: s.created_at ? new Date(s.created_at) : new Date(), updatedAt: s.updated_at ? new Date(s.updated_at) : new Date() } });
  }
  log.push(`✓ Imported ${subCategories.length} sub-categories`);

  const CHUNK = 500;

  const questions = readJson("qz_questions.json");
  let qInserted = 0;
  for (let i = 0; i < questions.length; i += CHUNK) {
    const chunk = questions.slice(i, i + CHUNK);
    const { count } = await prisma.qzQuestion.createMany({
      data: chunk.map((q: any) => ({ id: q.id, userId: q.user_id, approvalStatusId: q.approval_status_id, typeId: q.type_id, difficultyId: q.qz_difficulty_id ?? null, questionText: q.question_text, createdAt: q.created_at ? new Date(q.created_at) : new Date(), updatedAt: q.updated_at ? new Date(q.updated_at) : new Date() })),
      skipDuplicates: true,
    });
    qInserted += count;
  }
  log.push(`✓ Imported ${qInserted} questions`);

  const choices = readJson("qz_choices.json");
  let cInserted = 0;
  for (let i = 0; i < choices.length; i += CHUNK) {
    const chunk = choices.slice(i, i + CHUNK);
    const { count } = await prisma.qzChoice.createMany({
      data: chunk.map((c: any) => ({ id: c.id, questionId: c.question_id, choiceText: c.choice_text, isCorrect: Boolean(c.is_correct), createdAt: c.created_at ? new Date(c.created_at) : new Date(), updatedAt: c.updated_at ? new Date(c.updated_at) : new Date() })),
      skipDuplicates: true,
    });
    cInserted += count;
  }
  log.push(`✓ Imported ${cInserted} choices`);

  const languageQuestions = readJson("qz_language_question.json");
  const { count: lqCount } = await prisma.qzLanguageQuestion.createMany({
    data: languageQuestions.map((r: any) => ({ id: r.id, languageId: r.language_id, questionId: r.question_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${lqCount} question-language links`);

  const categoryQuestions = readJson("qz_category_question.json");
  const { count: cqCount } = await prisma.qzCategoryQuestion.createMany({
    data: categoryQuestions.map((r: any) => ({ id: r.id, categoryId: r.category_id, questionId: r.question_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${cqCount} question-category links`);

  const questionSubCategories = readJson("qz_question_sub_category.json");
  const { count: qscCount } = await prisma.qzQuestionSubCategory.createMany({
    data: questionSubCategories.map((r: any) => ({ id: r.id, questionId: r.question_id, subCategoryId: r.sub_category_id, createdAt: r.created_at ? new Date(r.created_at) : new Date(), updatedAt: r.updated_at ? new Date(r.updated_at) : new Date() })),
    skipDuplicates: true,
  });
  log.push(`✓ ${qscCount} question-sub-category links`);

  return log;
}

// ─── ROUTE HANDLER ──────────────────────────────────────────────────────────

const SEEDERS: Record<string, () => Promise<string[]>> = {
  base:             seedBase,
  liturgy:          seedLiturgy,
  sermon:           seedSermon,
  "hymn-setup":     seedHymnSetup,
  "hymn-data-1":    () => seedHymnData(1),
  "hymn-data-2":    () => seedHymnData(2),
  "hymn-links-1":   () => seedHymnLinks(1),
  "hymn-links-2":   () => seedHymnLinks(2),
  "hymn-extras-1":  seedHymnExtras1,
  "hymn-extras-2":  seedHymnExtras2,
  "hymn-extras-3":  seedHymnExtras3,
  book:             seedBook,
  quiz:             seedQuiz,
  "bible-setup":        seedBibleSetup,
  "bible-amharic-ot1a": () => seedBibleTranslation("bl_amharic_1954_bible.json", "am-1954",      1,   5),
  "bible-amharic-ot1b": () => seedBibleTranslation("bl_amharic_1954_bible.json", "am-1954",      6,  15),
  "bible-amharic-ot2a": () => seedBibleTranslation("bl_amharic_1954_bible.json", "am-1954",     16,  22),
  "bible-amharic-ot2b": () => seedBibleTranslation("bl_amharic_1954_bible.json", "am-1954",     23,  39),
  "bible-amharic-nt":   () => seedBibleTranslation("bl_amharic_1954_bible.json", "am-1954",     40,  66),
  "bible-kjv-ot1a":     () => seedBibleTranslation("bl_english_kjv_bible.json",  "en-kjv",       1,   5),
  "bible-kjv-ot1b":     () => seedBibleTranslation("bl_english_kjv_bible.json",  "en-kjv",       6,  15),
  "bible-kjv-ot2a":     () => seedBibleTranslation("bl_english_kjv_bible.json",  "en-kjv",      16,  22),
  "bible-kjv-ot2b":     () => seedBibleTranslation("bl_english_kjv_bible.json",  "en-kjv",      23,  39),
  "bible-kjv-nt":       () => seedBibleTranslation("bl_english_kjv_bible.json",  "en-kjv",      40,  66),
  "bible-oromifa-ot1a": () => seedBibleTranslation("bl_oromifa_bible.json",      "om-ethiopic",  1,   5),
  "bible-oromifa-ot1b": () => seedBibleTranslation("bl_oromifa_bible.json",      "om-ethiopic",  6,  15),
  "bible-oromifa-ot2a": () => seedBibleTranslation("bl_oromifa_bible.json",      "om-ethiopic", 16,  22),
  "bible-oromifa-ot2b": () => seedBibleTranslation("bl_oromifa_bible.json",      "om-ethiopic", 23,  39),
  "bible-oromifa-nt":   () => seedBibleTranslation("bl_oromifa_bible.json",      "om-ethiopic", 40,  66),
  "bible-highlights":   seedBibleHighlights,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ script: string }> }
) {
  const { script } = await params;
  const seeder = SEEDERS[script];

  if (!seeder) {
    return NextResponse.json(
      { error: `Unknown script "${script}". Available: ${Object.keys(SEEDERS).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const log = await seeder();
    return NextResponse.json({ ok: true, script, log });
  } catch (error: any) {
    return NextResponse.json({ ok: false, script, error: error.message }, { status: 500 });
  }
}
