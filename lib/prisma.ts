import { PrismaClient } from '../generated/prisma/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create PostgreSQL connection pool.
// On serverless each function instance keeps its own small pool behind the
// provider's connection pooler, so cap connections per instance and fail fast
// (rather than hang) if the pool is momentarily saturated. Point DATABASE_URL
// at the POOLED connection string (Supabase: the Supavisor pooler URL).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})
const adapter = new PrismaPg(pool)

// Create Prisma client with adapter
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
