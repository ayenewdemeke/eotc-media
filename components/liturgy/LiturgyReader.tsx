"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import {
  Play,
  Pause,
  Music,
  BookOpenText,
  Check,
} from "lucide-react"
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

// ── Role styles — modern, vibrant ──────────────────────

const ROLE_STYLES: Record<
  string,
  { bg: string; text: string; border: string; dotBg: string }
> = {
  priest: {
    bg: "bg-gradient-to-br from-red-50 to-rose-50",
    text: "text-red-700",
    border: "border-l-red-400",
    dotBg: "bg-red-400",
  },
  deacon: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    text: "text-blue-700",
    border: "border-l-blue-400",
    dotBg: "bg-blue-400",
  },
  people: {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    text: "text-emerald-700",
    border: "border-l-emerald-400",
    dotBg: "bg-emerald-400",
  },
  choir: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    text: "text-blue-700",
    border: "border-l-blue-400",
    dotBg: "bg-blue-400",
  },
  assistant_priest: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    text: "text-orange-700",
    border: "border-l-orange-400",
    dotBg: "bg-orange-400",
  },
  assistant_deacon: {
    bg: "bg-gradient-to-br from-cyan-50 to-sky-50",
    text: "text-cyan-700",
    border: "border-l-cyan-400",
    dotBg: "bg-cyan-400",
  },
}

const DEFAULT_ROLE_STYLE = {
  bg: "bg-gradient-to-br from-gray-50 to-slate-50",
  text: "text-gray-700",
  border: "border-l-gray-400",
  dotBg: "bg-gray-400",
}

// ── Helper: get available audio for a text ─────────────

function getAvailableAudio(
  text: LiturgicalText
): { type: AudioType; path: string }[] {
  const result: { type: AudioType; path: string }[] = []
  if (text.audioGeezFilePath)
    result.push({ type: "geez", path: text.audioGeezFilePath })
  if (text.audioEzilFilePath)
    result.push({ type: "ezil", path: text.audioEzilFilePath })
  if (text.audioArarayFilePath)
    result.push({ type: "araray", path: text.audioArarayFilePath })
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

      if (!clickedButton && !clickedDropdown) {
        setShowLanguageOptions(false)
      }
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
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
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

  const getRoleStyle = (roleKey: string) =>
    ROLE_STYLES[roleKey] || DEFAULT_ROLE_STYLE

  const toggleLanguage = (lang: keyof LanguageVisibility) => {
    setLanguageVisibility((prev) => ({
      ...prev,
      [lang]: !prev[lang],
    }))
  }

  // ── Empty state ──────────────────────────────────────

  if (sections.length === 0) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-6 shadow-lg">
          <BookOpenText className="h-10 w-10 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t("liturgy_no_content")}
        </h2>
        <p className="text-sm text-gray-500 text-center max-w-md">
          {t("liturgy_no_content_msg")}
        </p>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <audio ref={audioRef} onEnded={() => setPlayingAudioId(null)} />

      {/* ─── Sticky Tabs Bar ─── */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center">
          {/* Scrollable Section Tabs */}
          <div ref={sectionTabsRef} className="flex-1 overflow-x-auto scrollbar-hide -ml-4 sm:-ml-6 pl-2 sm:pl-4">
            <div className="flex items-center min-w-max">
              {sections.map((section) => {
                const isActive = activeSectionId === section.id
                return (
                  <button
                    key={section.id}
                    data-section-id={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`relative px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {locale === "am" ? section.nameAmharic : section.nameEnglish}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-2">
            {/* Language selector */}
            <div className="relative">
              <button
                ref={languageOptionsRef}
                onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 cursor-pointer transition-all shadow-sm"
              >
                <BookOpenText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("liturgy_language_btn")}</span>
                <svg className={`w-3 h-3 transition-transform ${showLanguageOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLanguageOptions && (
                <div ref={languageDropdownRef} className="absolute right-0 top-full mt-1 w-60 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                  <div className="px-3 py-1.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("liturgy_select_langs")}
                    </p>
                  </div>
                  {[
                    { key: 'geez' as const, label: 'ግዕዝ (Ge\'ez)' },
                    { key: 'amharic' as const, label: 'አማርኛ (Amharic)' },
                    { key: 'transliteration' as const, label: 'English transliteration' },
                    { key: 'translation' as const, label: 'English translation' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => toggleLanguage(key)}
                      className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        languageVisibility[key]
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {languageVisibility[key] && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio type selector */}
            {hasMultipleAudioTypes && (
              <div className="flex items-center gap-0.5 bg-blue-50 border border-blue-200/50 rounded-lg p-0.5">
                <Music className="h-3 w-3 text-blue-600 ml-1" />
                {(["geez", "ezil", "araray"] as AudioType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setGlobalAudioType(type)}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer transition-all ${
                      globalAudioType === type
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {AUDIO_LABELS[type]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Liturgical Texts */}
        {activeSection && activeSection.texts.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {activeSection.texts.map((text) => {
              const style = getRoleStyle(text.role.roleKey)
              const audioPath = getAudioForText(text)
              const audioKey = audioPath ? `${text.id}-${audioPath}` : null
              const isPlaying = playingAudioId === audioKey

              return (
                <div
                  key={text.id}
                  className="relative"
                >
                  <div
                    className={`relative border-l-[3px] ${style.border} rounded-2xl bg-white shadow-md transition-all duration-200 overflow-hidden`}
                  >

                    <div className="relative p-4 sm:p-6">
                      {/* Role badge + audio row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${style.dotBg} animate-pulse`} />
                          <span
                            className={`text-xs font-bold ${style.text} uppercase tracking-wider`}
                          >
                            {getRoleName(text.role)}
                          </span>
                        </div>

                        {audioPath && (
                          <button
                            onClick={() => playAudio(audioPath, text.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-md ${
                              isPlaying
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                            }`}
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="h-3.5 w-3.5" />
                                <span>Playing</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" />
                                <span>Play</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Text content */}
                      <div className="space-y-3 font-[family-name:var(--font-inter)]">
                        {languageVisibility.geez && text.textGeez && (
                          <p className="text-lg sm:text-xl leading-relaxed text-gray-900 font-semibold tracking-wide">
                            {text.textGeez}
                          </p>
                        )}
                        {languageVisibility.amharic && text.textAmharic && (
                          <p className="text-base sm:text-lg leading-relaxed text-gray-800 tracking-wide">
                            {text.textAmharic}
                          </p>
                        )}
                        {languageVisibility.transliteration &&
                          text.textEnglishTransliteration && (
                            <p className="text-base sm:text-lg leading-relaxed text-gray-800">
                              {text.textEnglishTransliteration}
                            </p>
                          )}
                        {languageVisibility.translation && text.textEnglishTranslation && (
                          <p className="text-base sm:text-lg leading-relaxed text-gray-800">
                            {text.textEnglishTranslation}
                          </p>
                        )}
                      </div>

                      {/* Remark */}
                      {text.remark && (
                        <div className="mt-4 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-l-3 border-amber-400 rounded-xl">
                          <p className="text-sm text-amber-900 leading-relaxed">
                            <span className="font-bold">{t("liturgy_note")}</span> {text.remark}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : activeSection ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <BookOpenText className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-base text-gray-500 font-medium">
              {t("liturgy_no_section")}
            </p>
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-sm text-gray-500">
              Select a section to begin reading
            </p>
          </div>
        )}

        {/* Bottom padding for mobile scroll */}
        <div className="h-20" />
      </div>
    </div>
  )
}
