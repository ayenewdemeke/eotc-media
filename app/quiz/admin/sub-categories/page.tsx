"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Category { id: number; name: string }
interface SubCategory { id: number; name: string; categoryId: number; category?: Category }

export default function AdminSubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null)
  const [newName, setNewName] = useState("")
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const [subRes, catRes] = await Promise.all([
      fetch("/api/quiz/admin/sub-categories"),
      fetch("/api/quiz/admin/categories"),
    ])
    if (subRes.ok) setSubCategories(await subRes.json())
    if (catRes.ok) setCategories(await catRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create() {
    if (!newName.trim() || !newCategoryId) return
    setSaving(true)
    await fetch("/api/quiz/admin/sub-categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), categoryId: newCategoryId }),
    })
    setNewName("")
    setNewCategoryId(null)
    setSaving(false)
    load()
  }

  async function update(id: number) {
    if (!editName.trim()) return
    setSaving(true)
    await fetch(`/api/quiz/admin/sub-categories/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), categoryId: editCategoryId }),
    })
    setEditId(null)
    setSaving(false)
    load()
  }

  async function remove(id: number) {
    if (!confirm("Delete this sub-category?")) return
    await fetch(`/api/quiz/admin/sub-categories/${id}`, { method: "DELETE" })
    load()
  }

  function categoryName(id: number) {
    return categories.find(c => c.id === id)?.name ?? "—"
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Sub-Categories</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <select value={newCategoryId ?? ""} onChange={e => setNewCategoryId(e.target.value ? parseInt(e.target.value) : null)}
          className="h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white">
          <option value="">Category…</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && create()}
          placeholder="New sub-category name…"
          className="flex-1 min-w-[160px] h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
        <button onClick={create} disabled={saving || !newName.trim() || !newCategoryId}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />Add
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subCategories.map(sc => (
                <tr key={sc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 w-36">
                    {editId === sc.id ? (
                      <select value={editCategoryId ?? ""} onChange={e => setEditCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full h-8 px-2 text-sm border border-blue-400 rounded outline-none bg-white">
                        <option value="">—</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    ) : (
                      <span className="text-slate-500 text-xs">{categoryName(sc.categoryId)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === sc.id ? (
                      <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") update(sc.id); if (e.key === "Escape") setEditId(null) }}
                        className="w-full h-8 px-2 text-sm border border-blue-400 rounded outline-none" />
                    ) : (
                      <span className="font-medium text-slate-900">{sc.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {editId === sc.id ? (
                        <>
                          <button onClick={() => update(sc.id)} disabled={saving} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">Save</button>
                          <button onClick={() => setEditId(null)} className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(sc.id); setEditName(sc.name); setEditCategoryId(sc.categoryId) }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => remove(sc.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {subCategories.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">No sub-categories yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
