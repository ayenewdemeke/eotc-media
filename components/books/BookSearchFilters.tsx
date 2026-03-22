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
import { CbLanguage, CbCategory, CbSubCategory } from "@/types/models/book"

interface BookSearchFiltersProps {
  categories: CbCategory[]
  subCategories: CbSubCategory[]
  languages: CbLanguage[]
  categoriesByLanguage: Record<string, number[]>
  basePath?: string
}

export default function BookSearchFilters({
  categories,
  subCategories,
  languages,
  categoriesByLanguage,
  basePath = "/books",
}: BookSearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeLanguage = searchParams.get("language") ?? ""
  const activeCategory = searchParams.get("category") ?? ""
  const activeSubCategory = searchParams.get("subCategory") ?? ""
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
    if (key === "category") { extra.subCategory = "" }
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
    ? categories.filter(c => (categoriesByLanguage[activeLanguage] ?? []).includes(c.id))
    : categories

  const visibleSubCategories = activeCategory
    ? subCategories.filter(sc => sc.categoryId === parseInt(activeCategory))
    : []

  const sel = (s: string) => s || "_"
  const apply = (key: string, raw: string) => applyFilter(key, raw === "_" ? "" : raw)
  const triggerCls = "h-9 text-sm bg-slate-50 border-slate-200 focus:ring-0 cursor-pointer"

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:flex-1 sm:min-w-[150px] sm:max-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search books…"
          value={searchValue}
          onChange={e => handleSearchChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:contents">
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

        <Select value={sel(activeCategory)} onValueChange={raw => apply("category", raw)}>
          <SelectTrigger className={`${triggerCls} w-full sm:w-[185px]`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">የምድብ አይነት ይምረጡ</SelectItem>
            {visibleCategories.map(cat => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sel(activeSubCategory)} onValueChange={raw => apply("subCategory", raw)}>
          <SelectTrigger className={`${triggerCls} w-full sm:w-[185px]`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_">ምድብ ይምረጡ</SelectItem>
            {visibleSubCategories.map(sc => (
              <SelectItem key={sc.id} value={String(sc.id)}>{sc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
