# EOTC Media - Quick Reference

## 📁 Project Files Overview

### Core Configuration
- `prisma/schema.prisma` - Complete database schema (50+ models)
- `prisma.config.ts` - Prisma 7 configuration
- `auth.ts` - NextAuth.js setup with credentials provider
- `middleware.ts` - Route protection for authenticated routes
- `.env` - Environment variables (DATABASE_URL, NEXTAUTH_SECRET)

### Key Directories
- `app/` - Next.js pages and API routes
- `lib/` - Shared utilities (Prisma client)
- `types/` - TypeScript type definitions
- `public/uploads/` - Local file storage (created on first upload)

## 🗄️ Database Schema Summary

### Authentication (4 models)
- `User` - Users with email/password
- `Role` - User roles (admin, user, etc.)
- `RoleUser` - Many-to-many relationship
- `Account`, `Session`, `VerificationToken` - NextAuth tables

### Bible Library - BL (10 models)
- `BlCategory`, `BlSubCategory` - Organization
- `BlBook` - Book metadata (5 language names)
- `BlAmharic1954Bible` - Amharic translation
- `BlEnglishKjvBible` - English KJV
- `BlGreekSeptuagintBible` - Greek Septuagint
- `BlGreekTextusReceptusBible` - Greek Textus Receptus
- `BlHebrewMasoreticBible` - Hebrew
- `BlOromifaBible` - Oromifa
- `BlHighlight` - User verse highlights

### Christian Books - CB (13 models)
- `CbBook` - Main book model
- `CbLanguage`, `CbCategory`, `CbSubCategory` - Metadata
- `CbAuthor` - Authors
- `CbApprovalStatus` - Approval workflow
- `CbLike`, `CbBookComment` - User interactions
- `CbCopyrightReport` - Content reports
- Junction tables for many-to-many relationships

### Hymns - HM (13 models)
- `HmHymn` - Main hymn model (YouTube integration)
- `HmLanguage`, `HmCategory`, `HmSubCategory` - Metadata
- `HmSinger`, `HmChannel` - Attribution
- `HmApprovalStatus` - Workflow
- `HmFavorite`, `HmComment` - User interactions
- Junction tables

### Sermons - SM (12 models)
- `SmSermon` - Main sermon model (YouTube)
- `SmLanguage`, `SmCategory`, `SmSubCategory` - Metadata
- `SmPreacher`, `SmChannel` - Attribution
- `SmApprovalStatus` - Workflow
- `SmFavorite` - User interactions
- Junction tables

### Quiz System - QZ (17 models)
- `QzQuestion` - Questions with choices
- `QzChoice` - Answer options
- `QzLanguage`, `QzCategory`, `QzSubCategory` - Metadata
- `QzDifficulty`, `QzQuestionType`, `QzApprovalStatus` - Settings
- `QzRoom` - Game rooms
- `QzRoomMember` - Players
- `QzRound` - Game rounds
- `QzRoundQuestion`, `QzRoundAnswer`, `QzRoundResult` - Gameplay
- Junction tables

### Utilities (3 models)
- `ContactUs` - Contact form submissions
- `DailyStat` - Daily visit tracking
- `FeaturedItem` - Featured content (polymorphic)

## 🔑 Common Prisma Queries

### Get User with Roles
```typescript
import { prisma } from '@/lib/prisma'

const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    roles: {
      include: { role: true }
    }
  }
})
```

### Get Bible Book with Verses
```typescript
const book = await prisma.blBook.findUnique({
  where: { slug: 'genesis' },
  include: {
    amharic1954: {
      where: { chapter: 1 }
    }
  }
})
```

### Get Approved Hymns
```typescript
const hymns = await prisma.hmHymn.findMany({
  where: {
    approvalStatus: {
      name: 'approved'
    }
  },
  include: {
    singers: {
      include: { singer: true }
    }
  }
})
```

### Create Quiz Room
```typescript
const room = await prisma.qzRoom.create({
  data: {
    hostUserId: userId,
    roomCode: generateRoomCode(),
    status: 'waiting',
    members: {
      create: {
        userId: userId
      }
    }
  }
})
```

## 🎯 NextAuth.js Usage

### Get Session (Server Component)
```typescript
import { auth } from '@/auth'

export default async function Page() {
  const session = await auth()
  
  if (!session) {
    return <div>Not logged in</div>
  }
  
  return <div>Hello {session.user.name}</div>
}
```

### Protect API Route
```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your API logic
}
```

### Check User Roles
```typescript
const session = await auth()
const isAdmin = session?.user.roles.includes('admin')
```

## 📝 File Upload Pattern

```typescript
// API Route for file upload
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const uploadDir = process.env.UPLOAD_DIR || './public/uploads'
  const filePath = join(uploadDir, file.name)
  
  await writeFile(filePath, buffer)
  
  return Response.json({ 
    success: true, 
    path: `/uploads/${file.name}` 
  })
}
```

## 🚀 Development Workflow

### Database Changes
```bash
# 1. Edit prisma/schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name add_new_field

# 3. Regenerate Prisma Client (automatic with migrate)
# Or manually:
npx prisma generate
```

### View Database
```bash
# Open Prisma Studio
npx prisma studio
# Opens at http://localhost:5555
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

## 📊 Useful Commands

```bash
# Format Prisma schema
npx prisma format

# Validate schema
npx prisma validate

# View migration status
npx prisma migrate status

# Seed database (after creating seed script)
npx prisma db seed
```

## 🔐 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Auth encryption key | `base64-random-string` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |
| `UPLOAD_DIR` | File upload directory | `./public/uploads` |
| `NODE_ENV` | Environment | `development` or `production` |

## 🎨 Module Prefixes

- `bl_` - Bible Library
- `cb_` - Christian Books
- `hm_` - Hymns
- `sm_` - Sermons
- `qz_` - Quiz

All table names use snake_case (e.g., `bible_books`), mapped from PascalCase Prisma models.

## 📖 Important Notes

1. **Prisma 7**: Uses `prisma.config.ts` for database URL (not in schema)
2. **NextAuth v5**: Uses `auth()` function, not `getServerSession()`
3. **App Router**: All routes in `app/` directory, not `pages/`
4. **Server Components**: Default in App Router, use `'use client'` only when needed
5. **File Storage**: Local filesystem for shared hosting compatibility

## 🔗 Helpful Links

- Prisma Client API: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- NextAuth.js: https://authjs.dev/
- Next.js App Router: https://nextjs.org/docs/app
- TypeScript: https://www.typescriptlang.org/docs/

---

**Quick Start**: Run `.\setup-database.ps1` to get started!
