"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BibleLanguage, BibleVersion, BlBook, BlVerse } from "@/types/models/bible"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface BibleReaderProps {
  currentBook: BlBook;
  currentChapter: number;
  currentBookName: string;
  books: BlBook[];
  language: BibleLanguage;
  version: BibleVersion;
  verses: BlVerse[];
  chapterNumbers: number[];
  dir: 'ltr' | 'rtl';
  selectedVerse?: string;
  user: any;
}

export default function BibleReader({
  currentBook,
  currentChapter,
  currentBookName,
  books,
  language,
  version,
  verses,
  chapterNumbers,
  dir,
  selectedVerse,
  user
}: BibleReaderProps) {
  const router = useRouter()
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null)
  const [showChapterSelector, setShowChapterSelector] = useState(false)
  const [bookSearch, setBookSearch] = useState('')
  const chapterSelectorRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chapterSelectorRef.current && !chapterSelectorRef.current.contains(event.target as Node)) {
        setShowChapterSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getBookName = (book: BlBook) => {
    if (language === 'amharic') return book.amharicName
    if (language === 'oromifa') return book.oromifaName
    return book.englishName
  }

  const filteredBooks = books.filter(book =>
    getBookName(book)?.toLowerCase().includes(bookSearch.toLowerCase())
  )

  // Group books into Old Testament and New Testament
  const oldTestamentBooks = filteredBooks.filter(book => book.id <= 39)
  const newTestamentBooks = filteredBooks.filter(book => book.id > 39)

  const handleVerseClick = (verseNum: number) => {
    setSelectedVerseNum(verseNum)
    if (user) {
      setShowHighlightMenu(true)
    }
  }

  const handleHighlight = async (color: string) => {
    if (!user || !selectedVerseNum) return

    try {
      const response = await fetch('/api/bible/highlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: currentBook.id,
          chapter: currentChapter,
          verse: selectedVerseNum,
          color
        })
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error highlighting verse:', error)
    }

    setShowHighlightMenu(false)
    setSelectedVerseNum(null)
  }

  const parsedSelectedVerse = selectedVerse ? Number.parseInt(selectedVerse, 10) : null
  const activeVerse = selectedVerseNum ?? (Number.isNaN(parsedSelectedVerse) ? null : parsedSelectedVerse)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="pt-16">
        {/* Top Reading Bar */}
        <div className="sticky top-14 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Holy Bible</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-900">{currentBookName}</h1>
                  <span className="text-sm font-medium text-slate-500">Chapter {currentChapter}</span>
                </div>
              </div>

              {/* Version Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Language</span>
                <Select
                  value={`${language}__${version}`}
                  onValueChange={(value) => {
                    const [newLang, newVer] = value.split('__')
                    router.push(`/bible/${newLang}/${newVer}/${currentBook.id}/${currentChapter}`)
                  }}
                >
                  <SelectTrigger className="h-9 min-w-[200px] bg-white/90 border-slate-200/80 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end" sideOffset={8}>
                    <SelectItem value="amharic__1954">Amharic 1954</SelectItem>
                    <SelectItem value="english__kjv">English KJV</SelectItem>
                    <SelectItem value="oromifa__v1">Oromifa</SelectItem>
                    <SelectItem value="hebrew-greek__masoretic-textus-receptus">Hebrew/Greek</SelectItem>
                    <SelectItem value="greek__septuagint">Greek Septuagint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1.05fr_2.2fr_1.25fr] gap-6">
          {/* Left: Books */}
          <aside className="order-2 lg:order-1">
            <div className="lg:sticky lg:top-28 space-y-4">
              <Card className="border-slate-200/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Books</CardTitle>
                  <CardDescription className="text-xs">Search and select a book to read.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Search books..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                  />
                  <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-slate-100/80 bg-white/70">
                    {oldTestamentBooks.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                          Old Testament
                        </div>
                        {oldTestamentBooks.map((book) => (
                          <Link
                            key={book.id}
                            href={`/bible/${language}/${version}/${book.id}/1`}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              book.id === currentBook.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {getBookName(book)}
                          </Link>
                        ))}
                      </div>
                    )}
                    {newTestamentBooks.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                          New Testament
                        </div>
                        {newTestamentBooks.map((book) => (
                          <Link
                            key={book.id}
                            href={`/bible/${language}/${version}/${book.id}/1`}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              book.id === currentBook.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {getBookName(book)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Center: Verses */}
          <section className="order-1 lg:order-2">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_12px_40px_-22px_rgba(15,23,42,0.5)]">
              <div className="px-6 py-5 border-b border-slate-100/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Reading</p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {currentBookName} <span className="text-slate-400">•</span> Chapter {currentChapter}
                  </h2>
                </div>
                <div className="relative" ref={chapterSelectorRef}>
                  <button
                    onClick={() => setShowChapterSelector(!showChapterSelector)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Jump to chapter
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showChapterSelector && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Select Chapter</span>
                      </div>
                      <div className="p-3 max-h-80 overflow-y-auto">
                        <div className="grid grid-cols-6 gap-2">
                          {chapterNumbers.map((chap) => (
                            <Link
                              key={chap}
                              href={`/bible/${language}/${version}/${currentBook.id}/${chap}`}
                              className={`flex items-center justify-center w-10 h-10 text-sm rounded-lg transition-all ${
                                chap === currentChapter
                                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                                  : 'bg-slate-50 text-slate-700 hover:bg-blue-100 hover:text-blue-700'
                              }`}
                              onClick={() => setShowChapterSelector(false)}
                            >
                              {chap}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-6" dir={dir}>
                {verses.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-slate-500 text-lg">No verses found for this chapter.</p>
                    <p className="text-slate-400 text-sm mt-2">Try selecting a different chapter or translation.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verses.map((verse) => (
                      <div
                        key={verse.id}
                        id={`verse-${verse.verse}`}
                        className={`group flex gap-4 p-3 -mx-3 rounded-xl transition-colors ${
                          activeVerse === verse.verse
                            ? 'bg-amber-50 border border-amber-200'
                            : 'hover:bg-slate-50'
                        }`}
                        style={verse.highlight ? { backgroundColor: verse.highlight } : undefined}
                      >
                        <button
                          type="button"
                          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center text-sm font-bold rounded-full transition-colors ${
                            user ? 'hover:bg-blue-100 hover:text-blue-700' : ''
                          } ${
                            activeVerse === verse.verse
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                          onClick={() => handleVerseClick(verse.verse)}
                          title={user ? "Click to highlight" : "Sign in to highlight"}
                        >
                          {verse.verse}
                        </button>
                        <p className="flex-1 text-[17px] leading-8 text-slate-900 font-medium">
                          {verse.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-6 py-5 border-t border-slate-100">
                {currentChapter > 1 ? (
                  <Link
                    href={`/bible/${language}/${version}/${currentBook.id}/${currentChapter - 1}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Chapter {currentChapter - 1}</span>
                  </Link>
                ) : (
                  <div></div>
                )}

                <span className="text-xs text-slate-400">
                  {currentChapter} of {chapterNumbers.length}
                </span>

                {currentChapter < chapterNumbers.length ? (
                  <Link
                    href={`/bible/${language}/${version}/${currentBook.id}/${currentChapter + 1}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <span>Chapter {currentChapter + 1}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </section>

          {/* Right: Explanation */}
          <aside className="order-3">
            <div className="lg:sticky lg:top-28 space-y-4">
              <Card className="border-slate-200/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Explanation</CardTitle>
                    {activeVerse && (
                      <span className="text-xs font-medium text-slate-400">Verse {activeVerse}</span>
                    )}
                  </div>
                  <CardDescription>Notes, cross references, and explanations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    No commentary is available yet. When explanations or cross references exist, they will appear here.
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    Click a verse number to focus it.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reading Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Highlight verses by clicking the verse number. Sign in to save highlights.
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {/* Highlight Menu Modal */}
      {showHighlightMenu && user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Highlight Verse {selectedVerseNum}</h3>
              <p className="text-sm text-gray-500 mt-1">Choose a color to highlight this verse</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-3 mb-6">
                <button
                  onClick={() => handleHighlight('#fef08a')}
                  className="h-12 rounded-xl border-2 border-transparent hover:border-yellow-400 hover:scale-105 transition-all shadow-sm"
                  style={{ backgroundColor: '#fef08a' }}
                  title="Yellow"
                />
                <button
                  onClick={() => handleHighlight('#bfdbfe')}
                  className="h-12 rounded-xl border-2 border-transparent hover:border-blue-400 hover:scale-105 transition-all shadow-sm"
                  style={{ backgroundColor: '#bfdbfe' }}
                  title="Blue"
                />
                <button
                  onClick={() => handleHighlight('#bbf7d0')}
                  className="h-12 rounded-xl border-2 border-transparent hover:border-green-400 hover:scale-105 transition-all shadow-sm"
                  style={{ backgroundColor: '#bbf7d0' }}
                  title="Green"
                />
                <button
                  onClick={() => handleHighlight('#fecaca')}
                  className="h-12 rounded-xl border-2 border-transparent hover:border-red-400 hover:scale-105 transition-all shadow-sm"
                  style={{ backgroundColor: '#fecaca' }}
                  title="Red"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleHighlight('')}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Remove Highlight
                </button>
                <button
                  onClick={() => {
                    setShowHighlightMenu(false)
                    setSelectedVerseNum(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
