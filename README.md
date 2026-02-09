# EOTC Media - Next.js Migration

A comprehensive Ethiopian Orthodox Church media platform migrated from Laravel/Vue to Next.js + TypeScript + PostgreSQL.

## 🎯 Project Overview

This is a complete rewrite of a Laravel/Vue application featuring:
- **Bible Library**: Multi-language Bible reader (6 translations)
- **Christian Books**: User-uploaded books with approval workflow
- **Hymns**: YouTube-based hymn collection with lyrics
- **Sermons**: Video sermon library
- **Quiz System**: Interactive Bible quiz with multiplayer rooms
- **Statistics & Analytics**: Daily visit tracking and featured content

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 18+

## 📦 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Run database setup (automated)
.\setup-database.ps1

# Or manually:
npx prisma migrate dev --name init

# Generate secret key for NextAuth
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Add the output to NEXTAUTH_SECRET in .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[PHASE1-COMPLETE.md](./PHASE1-COMPLETE.md)** - What's been done so far
- **[PHASE1-SETUP.md](./PHASE1-SETUP.md)** - Detailed setup instructions
- **[prisma/schema.prisma](./prisma/schema.prisma)** - Complete database schema

## 🗂️ Project Structure

```
eotc-media/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── auth/         # NextAuth endpoints
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/                   # Shared utilities
│   └── prisma.ts         # Prisma client
├── prisma/               # Database
│   └── schema.prisma     # Database schema
├── types/                # TypeScript definitions
├── auth.ts               # NextAuth configuration
└── middleware.ts         # Route protection
```

## 🔐 Authentication

Uses NextAuth.js v5 with:
- Email/password credentials
- Role-based access control
- JWT session strategy
- Protected routes via middleware

## 📊 Database

Complete PostgreSQL schema with:
- 50+ models
- Full relationship mapping
- Cascade deletes
- Timestamp tracking
- Multi-language support

### Key Models
- `User` - Authentication & user profiles
- `BlBook` - Bible books and verses
- `CbBook` - Christian books
- `HmHymn` - Hymn videos
- `SmSermon` - Sermon videos
- `QzRoom` - Quiz game rooms

## 🚦 Development Status

### ✅ Phase 1 Complete
- Database schema migrated
- Prisma ORM configured
- NextAuth.js authentication
- Project structure setup

### 🔄 Phase 2 (Next)
- Authentication UI pages
- Bible library interface
- User dashboard
- Admin panel foundation

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma migrate dev  # Run migrations
```

## 📝 Environment Variables

Required variables in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eotc_media"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
NODE_ENV="development"
```

## 🌐 Deployment

Designed for shared hosting environments:
- Local file storage (no S3)
- Standard PostgreSQL (no special features)
- Polling instead of WebSockets
- Node.js 18+ required

### Build for Production

```bash
npm run build
npm start
```

## 📋 Feature Parity

This rewrite maintains **100% feature parity** with the original Laravel app:
- ✅ Same functionality
- ✅ Same look and feel
- ✅ Same user experience
- ✅ Just different tech stack

## 🤝 Migration Strategy

1. **Phase 1**: Database & Auth ✅
2. **Phase 2**: Bible Library & User Pages
3. **Phase 3**: Christian Books Module
4. **Phase 4**: Hymns & Sermons
5. **Phase 5**: Quiz System
6. **Phase 6**: Admin Panel
7. **Phase 7**: Polish & Deploy

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

Same as original project

---

**Current Status**: Phase 1 Complete ✅  
**Next Milestone**: User Authentication & Bible Library UI
