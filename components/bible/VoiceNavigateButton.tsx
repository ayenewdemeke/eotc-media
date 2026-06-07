"use client"

import { useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Loader2 } from "lucide-react"

interface Props {
  language: string
  version: string
  className?: string
}

type State = "idle" | "listening" | "processing" | "error"

interface SpeechRec {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}
type SpeechRecognitionCtor = new () => SpeechRec

const SPEECH_LANG: Record<string, string> = {
  amharic: "am-ET",
  oromifa: "om",
  english: "en-US",
}

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  return (
    (window as unknown as Record<string, unknown>).SpeechRecognition as SpeechRecognitionCtor | undefined ??
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition as SpeechRecognitionCtor | undefined ??
    null
  )
}

export default function VoiceNavigateButton({ language, version, className = "" }: Props) {
  const router = useRouter()
  const [uiState, setUiState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const stateRef = useRef<State>("idle")
  const recRef = useRef<SpeechRec | null>(null)

  function setState(s: State) {
    stateRef.current = s
    setUiState(s)
  }

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) {
      setErrorMsg("Voice input is not supported in this browser. Try Chrome or Edge.")
      setState("error")
      return
    }

    const rec = new SR()
    rec.lang = SPEECH_LANG[language] ?? "en-US"
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onstart = () => setState("listening")

    rec.onresult = async (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      const transcript = e.results[0][0].transcript
      setState("processing")
      try {
        const res = await fetch("/api/bible/voice-navigate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript, language, version }),
        })
        const data = await res.json()
        if (res.ok && data.url) {
          setState("idle")
          router.push(data.url)
        } else {
          setErrorMsg(data.error ?? "Could not understand the reference")
          setState("error")
        }
      } catch {
        setErrorMsg("Connection error. Please try again.")
        setState("error")
      }
    }

    rec.onerror = (e: { error: string }) => {
      if (e.error === "no-speech") setErrorMsg("No speech detected. Try again.")
      else if (e.error === "not-allowed") setErrorMsg("Microphone access denied.")
      else setErrorMsg("Voice error. Please try again.")
      setState("error")
    }

    rec.onend = () => {
      if (stateRef.current === "listening") setState("idle")
    }

    recRef.current = rec
    rec.start()
  }, [language, version, router])

  function handleClick() {
    if (uiState === "listening") {
      recRef.current?.abort()
      setState("idle")
    } else {
      setErrorMsg("")
      startListening()
    }
  }

  const isListening = uiState === "listening"
  const isProcessing = uiState === "processing"
  const isError = uiState === "error"

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        title={language === "amharic" ? "በድምጽ ምዕራፍ ፈልግ" : "Navigate by voice"}
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors flex-shrink-0 ${
          isListening  ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse" :
          isProcessing ? "bg-blue-100 text-blue-600" :
          isError      ? "bg-amber-100 text-amber-600 hover:bg-amber-200" :
                         "text-slate-500 bg-slate-100 hover:bg-slate-200"
        } ${className}`}
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-3.5 h-3.5" />
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}
      </button>

      {(isListening || isProcessing || isError) && (
        <div
          className="absolute top-full right-0 mt-1.5 z-50 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none max-w-[220px] text-right leading-snug"
          style={{ background: isListening ? "#dc2626" : isProcessing ? "#2563eb" : "#1e293b", color: "#fff" }}
        >
          {isListening  && (language === "amharic" ? "እየሰማ ነው…" : "Listening…")}
          {isProcessing && (language === "amharic" ? "እየፈለገ ነው…" : "Processing…")}
          {isError      && errorMsg}
        </div>
      )}
    </div>
  )
}
