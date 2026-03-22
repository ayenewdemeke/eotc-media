"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, CheckCircle, Plus, Trash2, X, ChevronDown } from "lucide-react"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"

interface Option { id: number; name: string }
interface Category extends Option {}
interface SubCategory extends Option { categoryId: number }
interface ChoiceInput { choiceText: string; isCorrect: boolean }

const inputCls = "w-full h-10 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white transition-colors"

function MultiSelect({
  label, required, value, onChange, options, placeholder, disabled,
}: {
  label: string; required?: boolean; value: number[]
  onChange: (v: number[]) => void; options: Option[]; placeholder: string; disabled?: boolean
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
        <button
          type="button"
          onClick={() => { if (!disabled) setOpen(o => !o) }}
          disabled={disabled}
          className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white text-left flex items-center justify-between disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-colors hover:border-slate-300 focus:outline-none focus:border-blue-400"
        >
          <span className={value.length === 0 ? "text-slate-400" : "text-slate-900"}>
            {value.length === 0 ? placeholder : `${value.length} selected`}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto max-h-52">
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-slate-400">No options available</p>
            ) : options.map(opt => (
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
                <button type="button" onClick={() => toggle(opt.id)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SubmitQuestionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [questionText, setQuestionText] = useState("")
  const [typeId, setTypeId] = useState("")
  const [difficultyId, setDifficultyId] = useState("")
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<number[]>([])
  const [choices, setChoices] = useState<ChoiceInput[]>([
    { choiceText: "", isCorrect: false },
    { choiceText: "", isCorrect: false },
    { choiceText: "", isCorrect: false },
    { choiceText: "", isCorrect: false },
  ])

  const [languages, setLanguages] = useState<Option[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([])
  const [questionTypes, setQuestionTypes] = useState<Option[]>([])
  const [difficulties, setDifficulties] = useState<Option[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/quiz/admin/languages").then(r => r.json()),
      fetch("/api/quiz/admin/categories").then(r => r.json()),
      fetch("/api/quiz/admin/sub-categories").then(r => r.json()),
      fetch("/api/quiz/admin/question-types").then(r => r.json()),
      fetch("/api/quiz/admin/difficulties").then(r => r.json()),
    ]).then(([langs, cats, subs, types, diffs]) => {
      setLanguages(langs)
      setAllCategories(cats)
      setAllSubCategories(subs)
      setQuestionTypes(types)
      setDifficulties(diffs)
    })
  }, [])

  const visibleSubCategories = selectedCategoryIds.length > 0
    ? allSubCategories.filter(sc => selectedCategoryIds.includes(sc.categoryId))
    : []

  function handleCategoryChange(ids: number[]) {
    setSelectedCategoryIds(ids)
    setSelectedSubCategoryIds([])
  }

  function updateChoice(idx: number, field: keyof ChoiceInput, value: string | boolean) {
    setChoices(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  function markCorrect(idx: number) {
    // Toggle: if already correct, remove; otherwise set as the correct one (for now allow single correct)
    setChoices(prev => prev.map((c, i) => ({ ...c, isCorrect: i === idx ? !c.isCorrect : c.isCorrect })))
  }

  function addChoice() {
    if (choices.length >= 6) return
    setChoices(prev => [...prev, { choiceText: "", isCorrect: false }])
  }

  function removeChoice(idx: number) {
    if (choices.length <= 2) return
    setChoices(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!questionText.trim()) { setError("Question text is required."); return }
    if (!typeId) { setError("Please select a question type."); return }
    if (selectedLanguageIds.length === 0) { setError("Please select at least one language."); return }
    if (selectedCategoryIds.length === 0) { setError("Please select at least one category."); return }
    const filledChoices = choices.filter(c => c.choiceText.trim())
    if (filledChoices.length < 2) { setError("Please fill at least 2 answer choices."); return }
    if (!filledChoices.some(c => c.isCorrect)) { setError("Please mark at least one correct answer."); return }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: questionText.trim(),
          typeId: parseInt(typeId),
          difficultyId: difficultyId ? parseInt(difficultyId) : null,
          languageIds: selectedLanguageIds,
          categoryIds: selectedCategoryIds,
          subCategoryIds: selectedSubCategoryIds,
          choices: filledChoices,
        }),
      })
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Question Submitted!</h1>
            <p className="text-slate-500 mb-6">Your question has been submitted and is pending review. Thank you for contributing!</p>
            <button onClick={() => router.push("/quiz/my-questions")}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              View My Questions
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
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-3xl">
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-slate-900">Submit a Question</h1>
                <p className="text-sm text-slate-400 mt-0.5">Contribute a quiz question for community review</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Question Text */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question</h2>
                  </div>
                  <div className="p-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                      rows={4}
                      placeholder="Type your question here…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-y"
                    />
                  </div>
                </section>

                {/* Type & Difficulty */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type & Difficulty</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Question Type <span className="text-red-500">*</span>
                      </label>
                      <select value={typeId} onChange={e => setTypeId(e.target.value)}
                        className={inputCls + " cursor-pointer"}>
                        <option value="">Select type…</option>
                        {questionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Difficulty</label>
                      <select value={difficultyId} onChange={e => setDifficultyId(e.target.value)}
                        className={inputCls + " cursor-pointer"}>
                        <option value="">Select difficulty…</option>
                        {difficulties.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Classification */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classification</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MultiSelect label="Language" required value={selectedLanguageIds}
                      onChange={setSelectedLanguageIds} options={languages} placeholder="Select language…" />
                    <MultiSelect label="Category" required value={selectedCategoryIds}
                      onChange={handleCategoryChange} options={allCategories} placeholder="Select category…" />
                    <MultiSelect label="Sub-category" value={selectedSubCategoryIds}
                      onChange={setSelectedSubCategoryIds} options={visibleSubCategories}
                      placeholder={selectedCategoryIds.length > 0 ? "Select sub-category…" : "Select category first"}
                      disabled={selectedCategoryIds.length === 0} />
                  </div>
                </section>

                {/* Choices */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Answer Choices</h2>
                    <span className="text-xs text-slate-400">Check the box next to the correct answer(s)</span>
                  </div>
                  <div className="p-5 space-y-3">
                    {choices.map((choice, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-7 h-7 flex-shrink-0 rounded-md bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <input
                          value={choice.choiceText}
                          onChange={e => updateChoice(idx, "choiceText", e.target.value)}
                          placeholder={`Choice ${String.fromCharCode(65 + idx)}…`}
                          className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                        />
                        <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={choice.isCorrect}
                            onChange={() => markCorrect(idx)}
                            className="w-4 h-4 rounded border-slate-300 text-green-600 cursor-pointer"
                          />
                          <span className="text-xs text-slate-500 hidden sm:block">Correct</span>
                        </label>
                        <button type="button" onClick={() => removeChoice(idx)}
                          disabled={choices.length <= 2}
                          className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {choices.length < 6 && (
                      <button type="button" onClick={addChoice}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer mt-1">
                        <Plus className="w-4 h-4" />
                        Add choice
                      </button>
                    )}
                  </div>
                </section>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
                )}

                <div className="flex items-center justify-end gap-3 pb-4">
                  <button type="button" onClick={() => router.push("/quiz/my-questions")}
                    className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Question
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
