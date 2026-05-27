"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { ScrollableSelect } from "@/components/ui/scrollable-select"
import { SmCategory, SmSubCategory, SmLanguage } from "@/types/models/sermon"

interface SermonSearchFiltersProps {
  categories: SmCategory[]
  subCategories: SmSubCategory[]
  languages: SmLanguage[]
  categoriesByLanguage: Record<string, number[]>
  basePath?: string
}

export default function SermonSearchFilters({
  categories,
  subCategories,
  languages,
  categoriesByLanguage,
  basePath = "/sermons",
}: SermonSearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeLanguage = searchParams.get("language") ?? ""
  const activeCategory = searchParams.get("category") ?? ""
  const activeSubCategory = searchParams.get("subCategory") ?? ""
  const activeSearch = searchParams.get("search") ?? ""

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
    if (key === "language") { extra.category = ""; extra.subCategory = "" }
    if (key === "category") { extra.subCategory = "" }
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
    ? categories.filter(c => (categoriesByLanguage[activeLanguage] ?? []).includes(c.id))
    : categories

  const visibleSubCategories = activeCategory
    ? subCategories.filter(sc => sc.categoryId === parseInt(activeCategory))
    : []

  const languageOptions = [
    { value: "_", label: "ቋንቋ ይምረጡ" },
    ...languages.map(l => ({ value: String(l.id), label: l.name })),
  ]

  const categoryOptions = [
    { value: "_", label: "የምድብ አይነት ይምረጡ" },
    ...visibleCategories.map(c => ({ value: String(c.id), label: c.name })),
  ]

  const subCategoryOptions = [
    { value: "_", label: "ምድብ ይምረጡ" },
    ...visibleSubCategories.map(sc => ({ value: String(sc.id), label: sc.name })),
  ]

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Search */}
      <div className="relative w-full sm:flex-1 sm:min-w-[150px] sm:max-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="ስብከት ፈልግ..."
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
          value={activeSubCategory || "_"}
          onValueChange={raw => applyFilter("subCategory", raw === "_" ? "" : raw)}
          options={subCategoryOptions}
          className="w-full sm:w-[185px]"
        />
      </div>
    </div>
  )
}
