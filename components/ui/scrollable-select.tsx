"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ScrollableSelectOption {
  value: string
  label: string
}

interface ScrollableSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: ScrollableSelectOption[]
  className?: string
  /** Show a search box inside the dropdown to filter options by label. */
  searchable?: boolean
  /** Placeholder for the search box (searchable only). */
  searchPlaceholder?: string
}

export function ScrollableSelect({
  value,
  onValueChange,
  options,
  className,
  searchable = false,
  searchPlaceholder = "Search…",
}: ScrollableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [open])

  // Reset the query whenever the dropdown closes; focus the search box on open.
  useEffect(() => {
    if (open) {
      if (searchable) inputRef.current?.focus()
    } else {
      setQuery("")
    }
  }, [open, searchable])

  const visibleOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query, searchable])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger — matches original SelectTrigger style */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="h-9 w-full flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 whitespace-nowrap cursor-pointer shadow-xs transition-colors hover:bg-white outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={cn("w-4 h-4 opacity-50 flex-shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {/* Dropdown — w-max so items never wrap, min-w-full so it's at least as wide as the trigger */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 w-max min-w-full rounded-md border border-slate-200 bg-white shadow-md">
          {searchable && (
            <div className="relative border-b border-slate-100 p-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-8 pr-2 text-sm bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400"
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto p-1">
            {visibleOptions.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-slate-400">No results</p>
            ) : (
              visibleOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onValueChange(opt.value); setOpen(false) }}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm whitespace-nowrap cursor-pointer transition-colors text-left",
                    opt.value === value
                      ? "bg-accent font-medium text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
