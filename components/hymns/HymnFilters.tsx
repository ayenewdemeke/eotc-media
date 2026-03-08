"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { HmCategory, HmLanguage } from "@/types/models/hymn"

interface HymnFiltersProps {
  categories: HmCategory[]
  languages: HmLanguage[]
}

export default function HymnFilters({ categories, languages }: HymnFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get("category")
  const activeLanguage = searchParams.get("language")

  function applyFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`/hymns?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyFilter("category", null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              !activeCategory
                ? "bg-blue-600 text-white border-blue-600"
                : "text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => applyFilter("category", String(cat.id))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                activeCategory === String(cat.id)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Language filters */}
      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyFilter("language", null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              !activeLanguage
                ? "bg-violet-600 text-white border-violet-600"
                : "text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            All Languages
          </button>
          {languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => applyFilter("language", String(lang.id))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                activeLanguage === String(lang.id)
                  ? "bg-violet-600 text-white border-violet-600"
                  : "text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
