"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface MultiSelectProps {
  label: string
  required?: boolean
  value: number[]
  onChange: (v: number[]) => void
  options: { id: number; name: string }[]
  placeholder: string
  disabled?: boolean
}

export function MultiSelect({
  label, required, value, onChange, options, placeholder, disabled,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id])
  }

  const selected = options.filter(o => value.includes(o.id))

  return (
    <div className="space-y-1.5">
      <Label>
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => { if (!disabled) setOpen(o => !o) }}
          disabled={disabled}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors hover:border-ring/50 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={value.length === 0 ? "text-muted-foreground" : ""}>
            {value.length === 0 ? placeholder : `${value.length} selected`}
          </span>
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-input bg-popover shadow-md">
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">No options available</p>
            ) : options.map(opt => (
              <label key={opt.id} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                <input type="checkbox" checked={value.includes(opt.id)} onChange={() => toggle(opt.id)}
                  className="h-4 w-4 rounded border-input" />
                <span className="text-sm">{opt.name}</span>
              </label>
            ))}
          </div>
        )}
        {selected.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selected.map(opt => (
              <span key={opt.id} className="inline-flex items-center gap-1 rounded-full border border-input bg-muted px-2.5 py-0.5 text-xs font-medium">
                {opt.name}
                <button type="button" onClick={() => toggle(opt.id)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
