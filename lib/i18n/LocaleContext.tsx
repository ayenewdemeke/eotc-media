"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { translations, type Locale, type TranslationKey } from "./translations"

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => translations.en[key],
})

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1]
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    // 1. Check for existing cookie
    const saved = getCookie("locale") as Locale | undefined
    if (saved === "en" || saved === "am") {
      setLocaleState(saved)
      setDetected(true)
      return
    }

    // 2. No cookie — call detect API, set cookie, update state
    fetch("/api/locale/detect")
      .then(r => r.json())
      .then(({ locale: detected }: { locale: Locale }) => {
        const loc: Locale = detected === "am" ? "am" : "en"
        setLocaleState(loc)
        setCookie("locale", loc)
      })
      .catch(() => {
        // fallback to English on any error
        setCookie("locale", "en")
      })
      .finally(() => setDetected(true))
  }, [])

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc)
    setCookie("locale", loc)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => translations[locale][key] ?? translations.en[key],
    [locale]
  )

  // Avoid flash: render children immediately, locale updates after detection
  if (!detected) {
    // Use cookie hint synchronously if available (avoids flash on reload)
    const hint = getCookie("locale") as Locale | undefined
    const syncLocale: Locale = hint === "am" || hint === "en" ? hint : "en"
    const syncT = (key: TranslationKey) => translations[syncLocale][key] ?? translations.en[key]
    return (
      <LocaleContext.Provider value={{ locale: syncLocale, setLocale, t: syncT }}>
        {children}
      </LocaleContext.Provider>
    )
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
