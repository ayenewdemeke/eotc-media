import { NextRequest, NextResponse } from 'next/server'
import { searchBible } from '@/lib/api/bible'
import { BibleLanguage, BibleVersion } from '@/types/models/bible'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const bibleType = searchParams.get('bible_type') || 'amharic__1954'
    const scope = searchParams.get('scope') as any || 'whole_bible'
    const currentBookId = searchParams.get('book_id') ? parseInt(searchParams.get('book_id')!) : undefined

    if (!search) {
      return NextResponse.json({ verses: [] })
    }

    const [language, version] = bibleType.split('__') as [BibleLanguage, BibleVersion]
    
    const verses = await searchBible(search, language, version, scope, currentBookId)

    return NextResponse.json({ verses })
  } catch (error) {
    console.error('Error searching bible:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
