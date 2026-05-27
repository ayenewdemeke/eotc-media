"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { ScrollableSelect } from "@/components/ui/scrollable-select"
import { HmCategory, HmSubCategory, HmLanguage, HmSinger } from "@/types/models/hymn"
import { useLocale } from "@/lib/i18n/LocaleContext"

interface HymnSearchFiltersProps {
  categories: HmCategory[]
  subCategories: HmSubCategory[]
  languages: HmLanguage[]
  singers: HmSinger[]
  singersByLanguage: Record<string, number[]>
  basePath?: string
  hideSingerMode?: boolean
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
  const { t } = useLocale()
  const searchParams = useSearchParams()

  const activeLanguage = searchParams.get("language") ?? ""
  const activeCategory = searchParams.get("category") ?? ""
  const activeSubCategory = searchParams.get("subCategory") ?? ""
  const activeSinger = searchParams.get("singer") ?? ""
  const activeSearch = searchParams.get("search") ?? ""

  const isSingerMode = activeCategory === "singer"

  const [searchValue, setSearchValue] = useState(activeSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const composingRef = useRef(false)

  useEffect(() => {
    if (!composingRef.current) setSearchValue(activeSearch)
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
    if (key === "language") { extra.category = ""; extra.subCategory = ""; extra.singer = "" }
    if (key === "category") { extra.subCategory = ""; extra.singer = "" }
    router.push(`${basePath}?${buildParams(extra)}`)
  }

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (composingRef.current) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        router.push(`${basePath}?${buildParams({ search: value })}`)
      }, 400)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  )

  const visibleCategories = activeLanguage
    ? categories.filter(c => c.languageId === parseInt(activeLanguage))
    : []

  const visibleSubCategories = !isSingerMode && activeCategory
    ? subCategories.filter(sc => sc.categoryId === parseInt(activeCategory))
    : []

  const visibleSingers = isSingerMode
    ? activeLanguage
      ? singers.filter(s => (singersByLanguage[activeLanguage] ?? []).includes(s.id))
      : singers
    : []

  // Build option arrays
  const languageOptions = [
    { value: "_", label: t("hymn_select_language") },
    ...languages.map(l => ({ value: String(l.id), label: l.name })),
  ]

  const categoryOptions = [
    { value: "_", label: t("hymn_select_category") },
    ...(!hideSingerMode ? [{ value: "singer", label: t("hymn_by_singer") }] : []),
    ...visibleCategories.map(c => ({ value: String(c.id), label: c.name })),
  ]

  const thirdOptions = isSingerMode
    ? [{ value: "_", label: t("hymn_select_singer") }, ...visibleSingers.map(s => ({ value: String(s.id), label: s.name }))]
    : [{ value: "_", label: t("hymn_select_subcategory") }, ...visibleSubCategories.map(sc => ({ value: String(sc.id), label: sc.name }))]

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Search */}
      <div className="relative w-full sm:flex-1 sm:min-w-[150px] sm:max-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={t("hymn_search_placeholder")}
          value={searchValue}
          onChange={e => handleSearchChange(e.target.value)}
          onCompositionStart={() => { composingRef.current = true }}
          onCompositionEnd={e => { composingRef.current = false; handleSearchChange(e.currentTarget.value) }}
          className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400"
        />
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-3 gap-2 sm:contents">
        <ScrollableSelect
          value={activeLanguage || "_"}
          onValueChange={raw => applyFilter("language", raw === "_" ? "" : raw)}
          options={languageOptions}
          className="w-full sm:w-[145px]"
        />
        <ScrollableSelect
          value={activeCategory || "_"}
          onValueChange={raw => applyFilter("category", raw === "_" ? "" : raw)}
          options={categoryOptions}
          className="w-full sm:w-[185px]"
        />
        <ScrollableSelect
          value={(isSingerMode ? activeSinger : activeSubCategory) || "_"}
          onValueChange={raw => isSingerMode ? applyFilter("singer", raw === "_" ? "" : raw) : applyFilter("subCategory", raw === "_" ? "" : raw)}
          options={thirdOptions}
          className="w-full sm:w-[185px]"
        />
      </div>
    </div>
  )
}
