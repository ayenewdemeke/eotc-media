# EOTC Media

A media platform for the Ethiopian Orthodox Tewahedo Church (EOTC), providing access to spiritual content including the Bible, hymns, sermons, books, liturgy, and interactive quizzes.

## What the App Offers

- **Bible** — Browse scripture in multiple languages and translations. Save verses to personal collections.
- **Hymns** — Stream hymns from YouTube with lyrics. Browse by singer or category, save favorites.
- **Sermons** — Watch sermons organized by preacher, category, and channel. Save favorites.
- **Books** — Download Christian books submitted by the community and approved by admins.
- **Liturgy** — Read and listen to Orthodox liturgy texts organized by role and section.
- **Quiz** — Test your Bible knowledge in solo practice or multiplayer rooms.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database connection and secret keys

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

See `.env.example` for the full list. The essentials:

```env
DATABASE_URL="postgresql://user:password@host-pooler.region.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-key"

# Cloudflare R2 (uploads: book files/covers, liturgy audio, profile pictures)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="eotc-media-uploads"
```

Generate a secret key with:
```bash
openssl rand -base64 32
```

## Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server (next start)
npm run lint          # Run ESLint
npx prisma studio     # Open database GUI
npx prisma migrate dev  # Run database migrations
```

## Deployment

The app is built for **Vercel** with:

- **Neon** for PostgreSQL (use the pooled connection string in `DATABASE_URL`)
- **Cloudflare R2** for uploaded files (book PDFs/covers, liturgy audio, profile pictures)
- **Vercel Cron** (`vercel.json`) for the daily stats job

Set the environment variables from `.env.example` in the Vercel project settings.

## How to Collaborate

Contributions are welcome. Here's how to get involved:

### Reporting Issues

Open an issue describing the bug or feature request. Include steps to reproduce for bugs, or a clear use case for features.

### Submitting Changes

1. Fork the repository and create a branch from `main`.
2. Make your changes with clear, focused commits.
3. Ensure the app builds without errors (`npm run build`).
4. Open a pull request with a description of what changed and why.

### Code Guidelines

- Use TypeScript — avoid `any` types where possible.
- Follow the existing file and folder conventions under `app/`.
- API routes live in `app/api/`, page components in `app/[module]/`.
- Shared utilities go in `lib/`, reusable UI components in `components/`.

### Database Changes

If your change requires a schema update, include a Prisma migration:

```bash
npx prisma migrate dev --name describe-your-change
```

## Project Structure

```
eotc-media/
├── app/               # Pages and API routes (Next.js App Router)
│   ├── api/           # REST API endpoints
│   ├── bible/         # Bible module
│   ├── hymns/         # Hymns module
│   ├── sermons/       # Sermons module
│   ├── books/         # Books module
│   ├── liturgy/       # Liturgy module
│   └── quiz/          # Quiz module
├── components/        # Shared UI components
├── lib/               # Utilities and helpers (incl. storage.ts for R2)
└── prisma/            # Database schema and migrations
```

## License

Same as original project.
