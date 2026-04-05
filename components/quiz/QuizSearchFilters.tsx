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
import { QzCategory, QzSubCategory, QzLanguage, QzDifficulty } from "@/types/models/quiz"

interface QuizSearchFiltersProps {
  categories: QzCategory[]
  subCategories: QzSubCategory[]
  languages: QzLanguage[]
  difficulties: QzDifficulty[]
  basePath?: string
}

export default function QuizSearchFilters({
  categories,
  subCategories,
  languages,
  difficulties,
  basePath = "/quiz",
}: QuizSearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeLanguage = searchParams.get("language") ?? ""
  const activeCategory = searchParams.get("category") ?? ""
  const activeSubCategory = searchParams.get("subCategory") ?? ""
  const activeDifficulty = searchParams.get("difficulty") ?? ""
  const activeSearch = searchParams.get("search") ?? ""

  const [searchValue, setSearchValue] = useState(activeSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setSearchValue(activeSearch) }, [activeSearch])

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
    if (key === "category") extra.subCategory = ""
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

  const visibleCategories = activeLanguage
    ? categories.filter(c => c.languageId == null || c.languageId === parseInt(activeLanguage))
    : categories

  const visibleSubCategories = activeCategory
    ? subCategories.filter(sc => sc.categoryId === parseInt(activeCategory))
    : []

  const sel = (s: string) => s || "_"
  const apply = (key: string, raw: string) => applyFilter(key, raw === "_" ? "" : raw)

  const triggerCls = "h-9 text-sm bg-slate-50 border-slate-200 focus:ring-0 cursor-pointer"

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Search */}
      <div className="relative w-full sm:flex-1 sm:min-w-[150px] sm:max-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search questions…"
          value={searchValue}
          onChange={e => handleSearchChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:contents">
        {/* Language */}
        <Select value={sel(activeLanguage)} onValueChange={raw => apply("language", raw)}>
          <SelectTrigger className={`${triggerCls} w-full sm:w-[140px]`}>
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">All Languages</SelectItem>
            {languages.map(l => (
              <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select value={sel(activeCategory)} onValueChange={raw => apply("category", raw)}>
          <SelectTrigger className={`${triggerCls} w-full sm:w-[160px]`}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">All Categories</SelectItem>
            {visibleCategories.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sub-category */}
        <Select
          value={sel(activeSubCategory)}
          onValueChange={raw => apply("subCategory", raw)}
          disabled={visibleSubCategories.length === 0}
        >
          <SelectTrigger className={`${triggerCls} w-full sm:w-[160px]`}>
            <SelectValue placeholder="Sub-category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">All Sub-categories</SelectItem>
            {visibleSubCategories.map(sc => (
              <SelectItem key={sc.id} value={String(sc.id)}>{sc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty */}
        <Select value={sel(activeDifficulty)} onValueChange={raw => apply("difficulty", raw)}>
          <SelectTrigger className={`${triggerCls} w-full sm:w-[130px]`}>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">All Levels</SelectItem>
            {difficulties.map(d => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
