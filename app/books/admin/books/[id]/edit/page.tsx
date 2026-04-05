"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

interface SelectOption { id: number; name: string }
interface SubCategory { id: number; name: string; categoryId: number }

export default function EditBookPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [approvalStatusId, setApprovalStatusId] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<number[]>([])
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([])
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([])

  const [categories, setCategories] = useState<SelectOption[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [languages, setLanguages] = useState<SelectOption[]>([])
  const [authors, setAuthors] = useState<SelectOption[]>([])
  const [approvalStatuses, setApprovalStatuses] = useState<SelectOption[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch(`/api/books/admin/books/${id}`).then(r => r.json()),
      fetch("/api/books/admin/categories").then(r => r.json()),
      fetch("/api/books/admin/sub-categories").then(r => r.json()),
      fetch("/api/books/admin/authors").then(r => r.json()),
      fetch("/api/books/admin/approval-statuses").then(r => r.json()),
      fetch("/api/books/admin/languages").then(r => r.json()),
    ]).then(([book, cats, subs, auths, statuses, langs]) => {
      setName(book.name ?? "")
      setAuthor(book.author ?? "")
      setDescription(book.description ?? "")
      setApprovalStatusId(String(book.approvalStatusId))
      setSelectedCategoryIds(book.categories?.map((c: { category: { id: number } }) => c.category.id) ?? [])
      setSelectedSubCategoryIds(book.subCategories?.map((s: { subCategory: { id: number } }) => s.subCategory.id) ?? [])
      setSelectedLanguageIds(book.languages?.map((l: { language: { id: number } }) => l.language.id) ?? [])
      setSelectedAuthorIds(book.authors?.map((a: { author: { id: number } }) => a.author.id) ?? [])
      setCategories(Array.isArray(cats) ? cats : [])
      setSubCategories(Array.isArray(subs) ? subs : [])
      setAuthors(Array.isArray(auths) ? auths : [])
      setApprovalStatuses(Array.isArray(statuses) ? statuses : [])
      setLanguages(Array.isArray(langs) ? langs : [])
      setLoading(false)
    })
  }, [id])

  function toggleId(list: number[], setList: (v: number[]) => void, idVal: number) {
    setList(list.includes(idVal) ? list.filter(x => x !== idVal) : [...list, idVal])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/books/admin/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          author: author.trim(),
          description: description.trim() || null,
          approvalStatusId,
          categoryIds: selectedCategoryIds,
          subCategoryIds: selectedSubCategoryIds,
          languageIds: selectedLanguageIds,
          authorIds: selectedAuthorIds,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to save"); return }
      router.push("/books/admin/books")
    } finally {
      setSaving(false)
    }
  }

  const filteredSubCategories = selectedCategoryIds.length
    ? subCategories.filter(sc => selectedCategoryIds.includes(sc.categoryId))
    : subCategories

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />Loading…
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit book</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Author (text)</label>
            <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Approval status</label>
          <select value={approvalStatusId} onChange={e => setApprovalStatusId(e.target.value)} className="h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white">
            {approvalStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Languages</label>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <button key={lang.id} type="button" onClick={() => toggleId(selectedLanguageIds, setSelectedLanguageIds, lang.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedLanguageIds.includes(lang.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat.id} type="button" onClick={() => toggleId(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedCategoryIds.includes(cat.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {filteredSubCategories.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sub-categories</label>
            <div className="flex flex-wrap gap-2">
              {filteredSubCategories.map(sc => (
                <button key={sc.id} type="button" onClick={() => toggleId(selectedSubCategoryIds, setSelectedSubCategoryIds, sc.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedSubCategoryIds.includes(sc.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                  {sc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {authors.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Linked author profiles</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {authors.map(a => (
                <button key={a.id} type="button" onClick={() => toggleId(selectedAuthorIds, setSelectedAuthorIds, a.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedAuthorIds.includes(a.id) ? "bg-slate-700 text-white border-slate-700" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-y" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
