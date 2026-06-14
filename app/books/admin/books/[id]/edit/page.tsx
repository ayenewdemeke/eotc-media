"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface SelectOption { id: number; name: string }
interface SubCategory { id: number; name: string; categoryId: number }

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

function chipClass(active: boolean, variant: "primary" | "secondary" = "primary") {
  if (active)
    return variant === "primary"
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-secondary text-secondary-foreground border-transparent"
  return "text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
}

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

  const chip = "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all"

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />Loading…
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader title="Edit book" description="Update book details and taxonomy." />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Author (text)</Label>
                <Input value={author} onChange={e => setAuthor(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Approval status</Label>
              <select value={approvalStatusId} onChange={e => setApprovalStatusId(e.target.value)} className={cn(selectClass, "w-full sm:w-auto")}>
                {approvalStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2">
                {languages.map(lang => (
                  <button key={lang.id} type="button" onClick={() => toggleId(selectedLanguageIds, setSelectedLanguageIds, lang.id)}
                    className={cn(chip, chipClass(selectedLanguageIds.includes(lang.id)))}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => toggleId(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                    className={cn(chip, chipClass(selectedCategoryIds.includes(cat.id)))}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {filteredSubCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Sub-categories</Label>
                <div className="flex flex-wrap gap-2">
                  {filteredSubCategories.map(sc => (
                    <button key={sc.id} type="button" onClick={() => toggleId(selectedSubCategoryIds, setSelectedSubCategoryIds, sc.id)}
                      className={cn(chip, chipClass(selectedSubCategoryIds.includes(sc.id)))}>
                      {sc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {authors.length > 0 && (
              <div className="space-y-2">
                <Label>Linked author profiles</Label>
                <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                  {authors.map(a => (
                    <button key={a.id} type="button" onClick={() => toggleId(selectedAuthorIds, setSelectedAuthorIds, a.id)}
                      className={cn(chip, chipClass(selectedAuthorIds.includes(a.id), "secondary"))}>
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="resize-y" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
