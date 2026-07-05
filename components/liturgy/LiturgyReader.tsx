"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { Play, Pause, Music, BookOpenText, Check } from "lucide-react"
import { useLocale } from "@/lib/i18n/LocaleContext"

// ── Types ──────────────────────────────────────────────

interface Role {
  id: number
  roleKey: string
  nameEnglish: string
  nameAmharic: string
}

interface LiturgicalText {
  id: number
  orderIndex: number
  textGeez: string
  textAmharic: string
  textEnglishTransliteration: string
  textEnglishTranslation: string
  remark: string | null
  audioGeezFilePath: string | null
  audioEzilFilePath: string | null
  audioArarayFilePath: string | null
  role: Role
}

interface Section {
  id: number
  nameEnglish: string
  nameAmharic: string
  nameGeez: string
  orderIndex: number
  texts: LiturgicalText[]
}

interface LiturgyReaderProps {
  sections: Section[]
  roles: Role[]
}

// ── Language visibility state ──────────────────────────

interface LanguageVisibility {
  geez: boolean
  amharic: boolean
  transliteration: boolean
  translation: boolean
}

type RoleLanguage = "english" | "amharic"

// ── Audio types ────────────────────────────────────────

type AudioType = "geez" | "ezil" | "araray"

const AUDIO_LABELS: Record<AudioType, string> = {
  geez: "Ge'ez",
  ezil: "Ezil",
  araray: "Araray",
}

// ── Role styles ────────────────────────────────────────

const ROLE_STYLES: Record<string, { accent: string; pill: string }> = {
  priest:           { accent: "bg-rose-400",    pill: "bg-rose-50 text-rose-700 ring-rose-100" },
  deacon:           { accent: "bg-blue-500",    pill: "bg-blue-50 text-blue-700 ring-blue-100" },
  people:           { accent: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  choir:            { accent: "bg-violet-400",  pill: "bg-violet-50 text-violet-700 ring-violet-100" },
  assistant_priest: { accent: "bg-orange-400",  pill: "bg-orange-50 text-orange-700 ring-orange-100" },
  assistant_deacon: { accent: "bg-cyan-500",    pill: "bg-cyan-50 text-cyan-700 ring-cyan-100" },
}

const DEFAULT_ROLE_STYLE = { accent: "bg-slate-300", pill: "bg-slate-100 text-slate-600 ring-slate-100" }

// ── Helper: get available audio for a text ─────────────

function getAvailableAudio(text: LiturgicalText): { type: AudioType; path: string }[] {
  const result: { type: AudioType; path: string }[] = []
  if (text.audioGeezFilePath)  result.push({ type: "geez",   path: text.audioGeezFilePath })
  if (text.audioEzilFilePath)  result.push({ type: "ezil",   path: text.audioEzilFilePath })
  if (text.audioArarayFilePath) result.push({ type: "araray", path: text.audioArarayFilePath })
  return result
}

// ── Main Component ─────────────────────────────────────

export function LiturgyReader({ sections }: LiturgyReaderProps) {
  const { locale, t } = useLocale()
  const [activeSectionId, setActiveSectionId] = useState<number | null>(
    sections.length > 0 ? sections[0].id : null
  )
  const [languageVisibility, setLanguageVisibility] = useState<LanguageVisibility>({
    geez: true,
    amharic: true,
    transliteration: true,
    translation: true,
  })
  const roleLanguage: RoleLanguage = locale === "am" ? "amharic" : "english"
  const [globalAudioType, setGlobalAudioType] = useState<AudioType>("geez")
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [showLanguageOptions, setShowLanguageOptions] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sectionTabsRef = useRef<HTMLDivElement>(null)
  const languageOptionsRef = useRef<HTMLButtonElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? null,
    [sections, activeSectionId]
  )

  const hasMultipleAudioTypes = useMemo(() => {
    if (!activeSection) return false
    return activeSection.texts.some((t) => getAvailableAudio(t).length > 1)
  }, [activeSection])

  // Close language options on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedButton = languageOptionsRef.current?.contains(event.target as Node)
      const clickedDropdown = languageDropdownRef.current?.contains(event.target as Node)
      if (!clickedButton && !clickedDropdown) setShowLanguageOptions(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Scroll active tab into view
  useEffect(() => {
    if (sectionTabsRef.current && activeSectionId) {
      const activeTab = sectionTabsRef.current.querySelector(
        `[data-section-id="${activeSectionId}"]`
      ) as HTMLElement
      if (activeTab) activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [activeSectionId])

  // ── Audio controls ───────────────────────────────────

  const playAudio = (path: string, textId: number) => {
    const key = `${textId}-${path}`
    if (audioRef.current) {
      if (playingAudioId === key) {
        audioRef.current.pause()
        setPlayingAudioId(null)
      } else {
        audioRef.current.src = path
        audioRef.current.play()
        setPlayingAudioId(key)
      }
    }
  }

  const getAudioForText = (text: LiturgicalText): string | null => {
    const available = getAvailableAudio(text)
    if (available.length === 0) return null
    const preferred = available.find((a) => a.type === globalAudioType)
    return preferred ? preferred.path : available[0].path
  }

  // ── Handlers ─────────────────────────────────────────

  const handleSectionChange = (id: number) => {
    setActiveSectionId(id)
    setPlayingAudioId(null)
    if (audioRef.current) audioRef.current.pause()
  }

  const getRoleName = (role: Role) =>
    roleLanguage === "amharic" ? role.nameAmharic : role.nameEnglish

  const getRoleStyle = (roleKey: string) => ROLE_STYLES[roleKey] || DEFAULT_ROLE_STYLE

  const toggleLanguage = (lang: keyof LanguageVisibility) =>
    setLanguageVisibility((prev) => ({ ...prev, [lang]: !prev[lang] }))

  // ── Empty state ──────────────────────────────────────

  if (sections.length === 0) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <BookOpenText className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1.5">{t("liturgy_no_content")}</h2>
        <p className="text-sm text-slate-400 text-center max-w-sm">{t("liturgy_no_content_msg")}</p>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────

  const sectionLinkClass = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 lg:whitespace-normal ${
      active
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`

  return (
    <div className="min-h-screen bg-white">
      <audio ref={audioRef} onEnded={() => setPlayingAudioId(null)} />

      <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">

        {/* ─── Sections — left sidebar on desktop, horizontal bar on mobile ─── */}
        <aside className="
          flex flex-row items-center gap-1 px-4 py-2 border-b border-slate-100
          overflow-x-auto scrollbar-hide
          lg:flex-col lg:items-stretch lg:gap-0.5 lg:overflow-x-visible lg:overflow-y-auto lg:border-b-0 lg:border-r lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem)] lg:px-3 lg:py-4
        ">
          <div ref={sectionTabsRef} className="flex flex-row items-center gap-1 flex-nowrap lg:flex-col lg:items-stretch lg:gap-0.5">
            {sections.map((section) => (
              <button
                key={section.id}
                data-section-id={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={sectionLinkClass(activeSectionId === section.id)}
              >
                {locale === "am" ? section.nameAmharic : section.nameEnglish}
              </button>
            ))}
          </div>
        </aside>

        {/* ─── Main column ─── */}
        <main className="min-w-0">

        {/* ─── Sticky controls toolbar ─── */}
        <div className="sticky top-16 z-20 bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-end gap-1.5">
            {/* Language selector */}
            <div className="relative">
              <button
                ref={languageOptionsRef}
                onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
              >
                <BookOpenText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("liturgy_language_btn")}</span>
                <svg
                  className={`w-3 h-3 text-slate-400 transition-transform ${showLanguageOptions ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLanguageOptions && (
                <div
                  ref={languageDropdownRef}
                  className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-[100]"
                >
                  <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    {t("liturgy_select_langs")}
                  </p>
                  {[
                    { key: "geez" as const,            label: "ግዕዝ (Ge'ez)" },
                    { key: "amharic" as const,         label: "አማርኛ (Amharic)" },
                    { key: "transliteration" as const, label: "Transliteration" },
                    { key: "translation" as const,     label: "English translation" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => toggleLanguage(key)}
                      className="flex items-center gap-3 w-full px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        languageVisibility[key] ? "bg-slate-900 border-slate-900" : "border-slate-200"
                      }`}>
                        {languageVisibility[key] && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className="text-[13px] text-slate-700">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio type selector */}
            {hasMultipleAudioTypes && (
              <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                <Music className="h-3 w-3 text-slate-500 ml-1.5" />
                {(["geez", "ezil", "araray"] as AudioType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setGlobalAudioType(type)}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-all ${
                      globalAudioType === type
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {AUDIO_LABELS[type]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        {activeSection && activeSection.texts.length > 0 ? (
          <div className="space-y-3">
            {activeSection.texts.map((text) => {
              const style = getRoleStyle(text.role.roleKey)
              const audioPath = getAudioForText(text)
              const audioKey = audioPath ? `${text.id}-${audioPath}` : null
              const isPlaying = playingAudioId === audioKey

              return (
                <div
                  key={text.id}
                  className="relative rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 overflow-hidden"
                >
                  {/* Colored left accent */}
                  <div className={`absolute inset-y-0 left-0 w-[3px] ${style.accent}`} />

                  <div className="pl-5 sm:pl-7 pr-4 sm:pr-6 py-4 sm:py-5">

                    {/* Role + audio row */}
                    <div className="flex items-center justify-between gap-3 mb-3.5">
                      <span className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ring-1 ring-inset ${style.pill}`}>
                        {getRoleName(text.role)}
                      </span>

                      {audioPath && (
                        <button
                          onClick={() => playAudio(audioPath, text.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer active:scale-95 ${
                            isPlaying
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isPlaying
                            ? <><Pause className="h-3 w-3" /><span>Pause</span></>
                            : <><Play  className="h-3 w-3" /><span>Play</span></>
                          }
                        </button>
                      )}
                    </div>

                    {/* Text content */}
                    <div className="space-y-3">
                      {languageVisibility.geez && text.textGeez && (
                        <p className="text-[17px] sm:text-[19px] leading-[1.85] text-slate-900 font-semibold tracking-wide">
                          {text.textGeez}
                        </p>
                      )}
                      {languageVisibility.amharic && text.textAmharic && (
                        <p className="text-[15px] sm:text-[16px] leading-relaxed text-slate-700">
                          {text.textAmharic}
                        </p>
                      )}
                      {languageVisibility.transliteration && text.textEnglishTransliteration && (
                        <p className="text-[13px] sm:text-[14px] leading-relaxed text-slate-400 italic">
                          {text.textEnglishTransliteration}
                        </p>
                      )}
                      {languageVisibility.translation && text.textEnglishTranslation && (
                        <p className="text-[13px] sm:text-[14px] leading-relaxed text-slate-500">
                          {text.textEnglishTranslation}
                        </p>
                      )}
                    </div>

                    {/* Remark */}
                    {text.remark && (
                      <p className="mt-3 text-[12px] text-slate-400 leading-relaxed italic">{text.remark}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : activeSection ? (
          <div className="py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpenText className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">{t("liturgy_no_section")}</p>
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-sm text-slate-400">Select a section to begin reading</p>
          </div>
        )}

          <div className="h-16" />
        </div>
        </main>
      </div>
    </div>
  )
}
