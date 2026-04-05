// Bible Types

export interface BlBook {
  id: number
  osisCode: string
  englishName: string
  geezName: string | null
  amharicName: string | null
  oromifaName: string | null
  tigrignaName: string | null
  slug: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BlTranslation {
  id: number
  canonId: number
  code: string     // e.g. "am-1954", "en-kjv"
  name: string     // e.g. "Amharic 1954", "King James Version"
  language: string // e.g. "am", "en"
  createdAt: Date
  updatedAt: Date
}

export interface BlVerse {
  id: number
  bookId: number
  chapter: number
  verse: number
  text: string              // computed — flattened from texts[0].text
  createdAt: Date
  updatedAt: Date
  highlight?: string | null // computed — from BlHighlight.color
  book?: BlBook
  texts?: Array<{ text: string }> // raw Prisma include before flattening
}

export interface BlHighlight {
  id: number
  userId: number
  verseId: number
  color: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BlCollection {
  id: number
  userId: number
  name: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
  _count?: { verses: number }
}

export interface BlCollectionVerse {
  id: number
  collectionId: number
  verseId: number
  createdAt: Date
}

export interface BibleSearchResult {
  verseId: number
  bookId: number
  bookName: string
  chapter: number
  verse: number
  text: string
}

export type BibleLanguage = 'amharic' | 'english' | 'oromifa'
export type BibleVersion = '1954' | 'kjv' | 'v1'
