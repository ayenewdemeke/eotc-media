import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rows = await prisma.$queryRaw<{ category_id: number; language_id: number }[]>`
    SELECT DISTINCT sc.category_id, ls.language_id
    FROM sm_category_sermon sc
    INNER JOIN sm_language_sermon ls ON sc.sermon_id = ls.sermon_id
  `
  const categoriesByLanguage: Record<string, number[]> = {}
  for (const { category_id, language_id } of rows) {
    const key = String(language_id)
    if (!categoriesByLanguage[key]) categoriesByLanguage[key] = []
    if (!categoriesByLanguage[key].includes(category_id)) categoriesByLanguage[key].push(category_id)
  }
  return NextResponse.json({ categoriesByLanguage })
}
