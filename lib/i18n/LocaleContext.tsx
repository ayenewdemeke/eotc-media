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

  useEffect(() => {
    const saved = getCookie("locale") as Locale | undefined
    if (saved === "en" || saved === "am") {
      setLocaleState(saved)
      return
    }

    fetch("/api/locale/detect")
      .then(r => r.json())
      .then(({ locale: detected }: { locale: Locale }) => {
        const loc: Locale = detected === "am" ? "am" : "en"
        setLocaleState(loc)
        setCookie("locale", loc)
      })
      .catch(() => setCookie("locale", "en"))
  }, [])

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc)
    setCookie("locale", loc)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => translations[locale][key] ?? translations.en[key],
    [locale]
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
