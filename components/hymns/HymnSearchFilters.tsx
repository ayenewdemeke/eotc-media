"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HmCategory, HmSubCategory, HmLanguage, HmSinger } from "@/types/models/hymn"

interface HymnSearchFiltersProps {
  categories: HmCategory[]
  subCategories: HmSubCategory[]
  languages: HmLanguage[]
  singers: HmSinger[]
  singersByLanguage: Record<string, number[]>
  basePath?: string      // default "/hymns"
  hideSingerMode?: boolean  // hides "By Singer" option (used on singer page)
}

// Only the "By Singer" option label changes per language (keyed by language id)
const BY_SINGER_LABEL: Record<string, string> = {
  "1": "በዘማሪው",       // አማርኛ
  "2": "By the singer", // English
  "3": "በዘማሪው",       // ግዕዝ
  "4": "ብዘማሪ",        // ትግርኛ
  "5": "Faarfataa",    // Afaan-Oromoo
}

export default function HymnSearchFilters({
  categories,
  subCategories,
  languages,
  singers,
  singersByLanguage,
  basePath = "/hymns",
  hideSingerMode = false,
}: HymnSearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeLanguage = searchParams.get("language") ?? ""
  const activeCategory = searchParams.get("category") ?? ""  // "singer" is a special value
  const activeSubCategory = searchParams.get("subCategory") ?? ""
  const activeSinger = searchParams.get("singer") ?? ""
  const activeSearch = searchParams.get("search") ?? ""

  // When category="singer", the 3rd dropdown shows singers instead of sub-categories
  const isSingerMode = activeCategory === "singer"

  const [searchValue, setSearchValue] = useState(activeSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSearchValue(activeSearch)
  }, [activeSearch])

  function buildParams(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    return params.toString()
  }

  function applyFilter(key: string, value: string) {
    const extra: Record<string, string> = { [key]: value }
    // Changing language resets everything downstream
    if (key === "language") { extra.category = ""; extra.subCategory = ""; extra.singer = "" }
    // Changing the category/mode dropdown resets the 3rd dropdown
    if (key === "category") { extra.subCategory = ""; extra.singer = "" }
    router.push(`${basePath}?${buildParams(extra)}`)
  }

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        router.push(`${basePath}?${buildParams({ search: value })}`)
      }, 400)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  )

  const bySingerLabel = BY_SINGER_LABEL[activeLanguage] ?? "ዘማሪ"

  // Cascade: categories for the selected language
  const visibleCategories = activeLanguage
    ? categories.filter(c => c.languageId === parseInt(activeLanguage))
    : []

  // 3rd dropdown: sub-categories when in category mode
  const visibleSubCategories = !isSingerMode && activeCategory
    ? subCategories.filter(sc => sc.categoryId === parseInt(activeCategory))
    : []

  // Singers filtered to those with hymns in the selected language
  const visibleSingers = isSingerMode
    ? activeLanguage
      ? singers.filter(s => (singersByLanguage[activeLanguage] ?? []).includes(s.id))
      : singers
    : []

  // Radix forbids value="" on SelectItem — use "_" as the "clear/reset" sentinel
  const sel = (s: string) => s || "_"
  const apply = (key: string, raw: string) => applyFilter(key, raw === "_" ? "" : raw)

  const triggerCls = "h-9 text-sm bg-slate-50 border-slate-200 focus:ring-0 cursor-pointer"

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

      {/* Search — full width on mobile, flexible on sm+ */}
      <div className="relative w-full sm:flex-1 sm:min-w-[150px] sm:max-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search hymns…"
          value={searchValue}
          onChange={e => handleSearchChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400"
        />
      </div>

      {/* Dropdowns — 3-col grid on mobile, inline flex items on sm+ */}
      <div className="grid grid-cols-3 gap-2 sm:contents">

        {/* 1st: Language */}
        <Select value={sel(activeLanguage)} onValueChange={raw => apply("language", raw)}>
          <SelectTrigger className={`${triggerCls} w-full sm:w-[145px]`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">ቋንቋ ይምረጡ</SelectItem>
            {languages.map(lang => (
              <SelectItem key={lang.id} value={String(lang.id)}>{lang.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 2nd: Category type */}
        <Select value={sel(activeCategory)} onValueChange={raw => apply("category", raw)}>
          <SelectTrigger className={`${triggerCls} w-full sm:w-[185px]`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">የምድብ አይነት ይምረጡ</SelectItem>
            {!hideSingerMode && <SelectItem value="singer">{bySingerLabel}</SelectItem>}
            {visibleCategories.map(cat => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 3rd: Sub-category or Singer */}
        <Select
          value={isSingerMode ? sel(activeSinger) : sel(activeSubCategory)}
          onValueChange={raw => isSingerMode ? apply("singer", raw) : apply("subCategory", raw)}
        >
          <SelectTrigger className={`${triggerCls} w-full sm:w-[185px]`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">{isSingerMode ? "ዘማሪ ይምረጡ" : "ምድብ ይምረጡ"}</SelectItem>
            {isSingerMode
              ? visibleSingers.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))
              : visibleSubCategories.map(sc => (
                  <SelectItem key={sc.id} value={String(sc.id)}>{sc.name}</SelectItem>
                ))
            }
          </SelectContent>
        </Select>

      </div>
    </div>
  )
}
