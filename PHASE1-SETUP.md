# EOTC Media - Phase 1 Setup Complete ✅

## What's Been Set Up

### 1. ✅ Prisma ORM with PostgreSQL
- Complete database schema migrated from Laravel (82 migrations → 1 comprehensive Prisma schema)
- All 6 modules included:
  - **Bible Library (BL)** - 6 translations with categories & highlights
  - **Christian Books (CB)** - Books, authors, comments, likes
  - **Hymns (HM)** - YouTube videos, lyrics, singers, favorites
  - **Sermons (SM)** - YouTube videos, preachers, categories
  - **Quiz System (QZ)** - Questions, rooms, rounds, real-time gameplay
  - **Statistics** - Daily stats & featured items

### 2. ✅ NextAuth.js v5 Authentication
- Credentials provider (email/password)
- Role-based access control
- JWT session strategy
- PostgreSQL session storage via Prisma adapter
- Middleware for route protection

### 3. ✅ Project Structure
```
eotc-media/
├── prisma/
│   └── schema.prisma         # Complete database schema
├── app/
│   └── api/auth/[...nextauth]/route.ts
├── lib/
│   └── prisma.ts            # Prisma client singleton
├── types/
│   └── next-auth.d.ts       # TypeScript definitions
├── auth.ts                  # NextAuth configuration
├── middleware.ts            # Route protection
├── .env                     # Environment variables
└── .env.example             # Template for deployment
```

## Next Steps - Database Setup

### Option 1: PostgreSQL (Recommended for Production)

#### Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- During installation, remember your postgres user password

#### Create Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE eotc_media;

# Exit
\q
```

#### Update prisma.config.ts
The database URL is already configured in `prisma.config.ts` to read from `.env`.

Make sure your `.env` has:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/eotc_media"
```

#### Run Migrations
```powershell
cd "c:\User-Files\Spiritual\Service\Web Service\EOTC Media\eotc-media"
npx prisma migrate dev --name init
```

This will:
1. Create all tables in PostgreSQL
2. Generate the Prisma Client
3. Set up the database schema

### Option 2: Quick Start with Docker

```powershell
# Start PostgreSQL container
docker run -d `
  --name eotc-postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=eotc_media `
  -p 5432:5432 `
  postgres:16

# Then run migrations
npx prisma migrate dev --name init
```

## Important: Prisma 7 Configuration

This project uses **Prisma 7** which has a different configuration approach:
- Database connection is configured in `prisma.config.ts` (not in schema.prisma)
- The Prisma Client uses a database adapter pattern
- Environment variables are loaded via dotenv in prisma.config.ts

## Generate Secret Key

```powershell
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update the `NEXTAUTH_SECRET` in `.env` with the generated value.

## Development Server

```powershell
npm run dev
```

Visit: http://localhost:3000

## Key Features Configured

### Authentication
- ✅ Password hashing with bcryptjs
- ✅ JWT sessions
- ✅ Role-based access (from `roles` and `role_user` tables)
- ✅ Protected routes via middleware
- ✅ API route protection ready

### Database Models
All Laravel models converted to Prisma:
- ✅ 50+ models
- ✅ All relationships preserved
- ✅ Foreign key constraints
- ✅ Cascade deletes where appropriate
- ✅ Timestamps (created_at, updated_at)

### File Storage
- Configured for local filesystem (shared hosting compatible)
- Default upload directory: `./public/uploads`
- No external services required

### Quiz System
- ✅ Real-time room system (polling-based)
- ✅ Round management
- ✅ Score tracking
- ✅ Multiple difficulty levels

## Shared Hosting Deployment Notes

Since you're deploying to shared hosting:

1. **Database**: Your host should provide PostgreSQL access (or you can request it)
2. **Node.js**: Ensure your host supports Node.js 18+ 
3. **Build**: Run `npm run build` before deployment
4. **Start**: Use `npm start` to run production server
5. **Files**: Uploads go to `public/uploads` (no external storage needed)

## Migration from Laravel

The schema includes all features from your Laravel app:
- ✅ Multi-language support (Amharic, English, Geez, Oromifa, Tigrigna)
- ✅ YouTube video integration (hymns & sermons)
- ✅ PDF book storage
- ✅ User-generated content with approval workflow
- ✅ Comments, likes, favorites
- ✅ Featured items system

## Next Phase Preview

**Phase 2** will include:
- User registration & login pages
- Bible library UI (book browsing, reading, highlighting)
- User management dashboard
- Admin panel foundation

## Troubleshooting

### Prisma Generate Error
```powershell
npx prisma generate --schema=./prisma/schema.prisma
```

### Database Connection Error
Check your PostgreSQL is running:
```powershell
# Windows Services
services.msc
# Look for "postgresql" service
```

### Port Already in Use
```powershell
# Change port in package.json
"dev": "next dev -p 3001"
```

---

**Status**: Phase 1 Complete ✅
**Next**: Set up PostgreSQL and run migrations
**Time Estimate**: Phase 2 setup: 2-3 weeks
