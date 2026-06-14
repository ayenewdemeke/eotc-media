"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, CheckCircle, ChevronDown, X } from "lucide-react"
import Navbar from "@/components/Navbar"
import BookSidebar from "@/components/books/BookSidebar"

interface Language { id: number; name: string }
interface Category { id: number; name: string; languageId?: number | null }
interface SubCategory { id: number; name: string; categoryId: number }

function MultiSelect({
  label, required, value, onChange, options, placeholder, disabled,
}: {
  label: string; required?: boolean; value: number[]; onChange: (v: number[]) => void
  options: { id: number; name: string }[]; placeholder: string; disabled?: boolean
}) {
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

  const selectedOptions = options.filter(o => value.includes(o.id))

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div ref={ref} className="relative">
        <button type="button" onClick={() => { if (!disabled) setOpen(o => !o) }} disabled={disabled}
          className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white text-left flex items-center justify-between disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-colors hover:border-slate-300 focus:outline-none focus:border-blue-400">
          <span className={value.length === 0 ? "text-slate-400" : "text-slate-900"}>
            {value.length === 0 ? placeholder : `${value.length} selected`}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto max-h-52">
            {options.length === 0
              ? <p className="px-3 py-2.5 text-sm text-slate-400">No options available</p>
              : options.map(opt => (
                <label key={opt.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" checked={value.includes(opt.id)} onChange={() => toggle(opt.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer" />
                  <span className="text-sm text-slate-700">{opt.name}</span>
                </label>
              ))}
          </div>
        )}
        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedOptions.map(opt => (
              <span key={opt.id} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                {opt.name}
                <button type="button" onClick={() => toggle(opt.id)} className="hover:text-blue-900 flex-shrink-0"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = "w-full h-10 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white transition-colors"

export default function SubmitBookPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [name, setName] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<number[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [languages, setLanguages] = useState<Language[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/books/admin/languages").then(r => r.json()),
      fetch("/api/books/admin/categories").then(r => r.json()),
      fetch("/api/books/admin/sub-categories").then(r => r.json()),
    ]).then(([langs, cats, subs]) => {
      setLanguages(Array.isArray(langs) ? langs : [])
      setAllCategories(Array.isArray(cats) ? cats : [])
      setAllSubCategories(Array.isArray(subs) ? subs : [])
    })
  }, [])

  const visibleCategories = selectedLanguageIds.length > 0
    ? allCategories.filter(c => c.languageId != null && selectedLanguageIds.includes(c.languageId))
    : []

  const visibleSubCategories = selectedCategoryIds.length > 0
    ? allSubCategories.filter(sc => selectedCategoryIds.includes(sc.categoryId))
    : []

  function handleLanguageChange(ids: number[]) {
    setSelectedLanguageIds(ids)
    setSelectedCategoryIds([])
    setSelectedSubCategoryIds([])
  }

  function handleCategoryChange(ids: number[]) {
    setSelectedCategoryIds(ids)
    setSelectedSubCategoryIds([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("Book name is required."); return }
    if (!author.trim()) { setError("Author name is required."); return }
    if (selectedLanguageIds.length === 0) { setError("Please select at least one language."); return }
    if (selectedCategoryIds.length === 0) { setError("Please select at least one category."); return }
    if (selectedSubCategoryIds.length === 0) { setError("Please select at least one sub-category."); return }
    if (!pdfFile) { setError("PDF file is required."); return }
    if (!imageFile) { setError("Cover image is required."); return }

    setSaving(true)
    setError("")
    try {
      const formData = new FormData()
      formData.set("name", name.trim())
      formData.set("author", author.trim())
      formData.set("description", description.trim())
      formData.set("languageIds", JSON.stringify(selectedLanguageIds))
      formData.set("categoryIds", JSON.stringify(selectedCategoryIds))
      formData.set("subCategoryIds", JSON.stringify(selectedSubCategoryIds))
      formData.set("file", pdfFile)
      formData.set("image", imageFile)

      const res = await fetch("/api/books/submit", { method: "POST", body: formData })
      if (res.status === 401) { router.push("/auth/login"); return }
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to submit"); return }
      setSubmitted(true)
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-sm px-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Book submitted!</h1>
            <p className="text-slate-500 mb-6">Your book has been submitted and is pending review. Thank you!</p>
            <button onClick={() => router.push("/books/my-books")}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              View my books
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <BookSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-3xl">
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-slate-900">Upload new book</h1>
                <p className="text-sm text-slate-400 mt-0.5">Submit a book for review</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Book details */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Book details</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Book Name <span className="text-red-500">*</span>
                      </label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Book name" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Author <span className="text-red-500">*</span>
                      </label>
                      <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author full name" className={inputCls} />
                    </div>
                  </div>
                </section>

                {/* Classification */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classification</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MultiSelect label="Language" required value={selectedLanguageIds} onChange={handleLanguageChange} options={languages} placeholder="Select language…" />
                    <MultiSelect label="Category" required value={selectedCategoryIds} onChange={handleCategoryChange}
                      options={visibleCategories}
                      placeholder={selectedLanguageIds.length > 0 ? "Select category…" : "Select language first"}
                      disabled={selectedLanguageIds.length === 0} />
                    <MultiSelect label="Sub-category" required value={selectedSubCategoryIds} onChange={setSelectedSubCategoryIds}
                      options={visibleSubCategories}
                      placeholder={selectedCategoryIds.length > 0 ? "Select sub-category…" : "Select category first"}
                      disabled={selectedCategoryIds.length === 0} />
                  </div>
                </section>

                {/* Files */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Files</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Book PDF <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-slate-400 mb-1.5">Max 30MB. PDF format only.</p>
                      <input type="file" accept=".pdf,application/pdf" onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
                        className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Cover Image <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-slate-400 mb-1.5">Max 10MB. JPG or PNG.</p>
                      <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                        className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    </div>
                  </div>
                </section>

                {/* Description */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Description <span className="normal-case font-normal text-slate-400">(optional)</span>
                    </h2>
                  </div>
                  <div className="p-5">
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                      placeholder="Brief description of the book…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-y" />
                  </div>
                </section>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
                )}

                <div className="flex items-center justify-end gap-3 pb-4">
                  <button type="button" onClick={() => router.push("/books/my-books")}
                    className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Upload book
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
