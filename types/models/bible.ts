// Bible Types

export interface BlBook {
  id: number
  categoryId: number
  subCategoryId: number
  englishName: string
  geezName: string
  amharicName: string
  oromifaName: string
  tigrignaName: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface BlCategory {
  id: number
  englishName: string
  geezName: string
  amharicName: string
  oromifaName: string
  tigrignaName: string
  createdAt: Date
  updatedAt: Date
}

export interface BlSubCategory {
  id: number
  categoryId: number
  englishName: string
  geezName: string
  amharicName: string
  oromifaName: string
  tigrignaName: string
  createdAt: Date
  updatedAt: Date
}

export interface BlVerse {
  id: number
  bookId: number
  chapter: number
  verse: number
  text: string
  createdAt: Date
  updatedAt: Date
  highlight?: string | null
  book?: BlBook
}

export interface BlHighlight {
  id: number
  userId: number
  bookId: number
  chapter: number
  verse: number
  color: string | null
  createdAt: Date
  updatedAt: Date
}

export type BibleLanguage = 'amharic' | 'english' | 'oromifa' | 'hebrew-greek' | 'greek'
export type BibleVersion = '1954' | 'kjv' | 'v1' | 'masoretic-textus-receptus' | 'septuagint'

export interface BibleChapterData {
  currentBook: BlBook
  currentChapter: number
  currentBookName: string
  oldTestamentBooks: BlBook[]
  newTestamentBooks: BlBook[]
  language: BibleLanguage
  version: BibleVersion
  verses: BlVerse[]
  chapterNumbers: number[]
  dir: 'ltr' | 'rtl'
  selectedVerse?: string
}
