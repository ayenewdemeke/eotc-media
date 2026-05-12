"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Language { id: number; name: string }
interface Category { id: number; name: string; languageId: number | null }

export default function AdminSermonCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editLanguageId, setEditLanguageId] = useState<number | null>(null)
  const [newName, setNewName] = useState("")
  const [newLanguageId, setNewLanguageId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const [catRes, langRes] = await Promise.all([
      fetch("/api/sermons/admin/categories"),
      fetch("/api/sermons/admin/languages"),
    ])
    if (catRes.ok) setCategories(await catRes.json())
    if (langRes.ok) setLanguages(await langRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create() {
    if (!newName.trim()) return
    setSaving(true)
    await fetch("/api/sermons/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), languageId: newLanguageId }),
    })
    setNewName("")
    setNewLanguageId(null)
    setSaving(false)
    load()
  }

  async function update(id: number) {
    if (!editName.trim()) return
    setSaving(true)
    await fetch(`/api/sermons/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), languageId: editLanguageId }),
    })
    setEditId(null)
    setSaving(false)
    load()
  }

  async function remove(id: number) {
    if (!confirm("Delete this category?")) return
    await fetch(`/api/sermons/admin/categories/${id}`, { method: "DELETE" })
    load()
  }

  function languageName(id: number | null) {
    if (!id) return "—"
    return languages.find(l => l.id === id)?.name ?? "—"
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Categories</h1>

      <div className="flex gap-2 mb-6">
        <select
          value={newLanguageId ?? ""}
          onChange={e => setNewLanguageId(e.target.value ? parseInt(e.target.value) : null)}
          className="h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white"
        >
          <option value="">Language…</option>
          {languages.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && create()}
          placeholder="New category name…"
          className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
        />
        <button
          onClick={create}
          disabled={saving || !newName.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Language</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 w-36">
                    {editId === cat.id ? (
                      <select
                        value={editLanguageId ?? ""}
                        onChange={e => setEditLanguageId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full h-8 px-2 text-sm border border-blue-400 rounded outline-none bg-white"
                      >
                        <option value="">—</option>
                        {languages.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-500 text-xs">{languageName(cat.languageId)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === cat.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") update(cat.id); if (e.key === "Escape") setEditId(null) }}
                        className="w-full h-8 px-2 text-sm border border-blue-400 rounded outline-none"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {editId === cat.id ? (
                        <>
                          <button onClick={() => update(cat.id)} disabled={saving} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">Save</button>
                          <button onClick={() => setEditId(null)} className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditLanguageId(cat.languageId) }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => remove(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">No categories yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
