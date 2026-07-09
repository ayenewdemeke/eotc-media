import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'
import { confirmStillUnavailable } from '@/lib/youtube-refresh'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
  }
  const idList = ids.map((n: unknown) => Number(n)).filter(Number.isInteger)

  const rows = await prisma.hmHymn.findMany({
    where: { id: { in: idList } },
    select: { id: true, videoId: true },
  })

  // Re-verify against YouTube; only delete videos that are still missing.
  let toDelete: number[]
  try {
    toDelete = await confirmStillUnavailable(rows)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `YouTube re-check failed: ${msg}` }, { status: 502 })
  }

  if (toDelete.length > 0) {
    // Junction rows cascade on delete (see schema).
    await prisma.hmHymn.deleteMany({ where: { id: { in: toDelete } } })
  }

  return NextResponse.json({
    deleted: toDelete.length,
    skipped: rows.length - toDelete.length,
  })
}
