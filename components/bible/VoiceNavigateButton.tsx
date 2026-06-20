"use client"

import { useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { useLocale } from "@/lib/i18n/LocaleContext"

interface Props {
  language: string
  version: string
  className?: string
  variant?: "icon" | "pill"
}

type State = "idle" | "listening" | "processing" | "error"

const MAX_RECORDING_MS = 8000

export default function VoiceNavigateButton({ language, version, className = "", variant = "icon" }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [uiState, setUiState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const stateRef = useRef<State>("idle")
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startListening = useCallback(async () => {
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access failed"
      setErrorMsg(
        msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("notallowed")
          ? "Microphone access denied."
          : `[mic] ${msg}`
      )
      stateRef.current = "error"
      setUiState("error")
      return
    }

    const mimeType =
      ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find(
        (t) => MediaRecorder.isTypeSupported(t)
      ) ?? ""
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    const chunks: Blob[] = []

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      if (stateRef.current !== "listening") return

      stateRef.current = "processing"
      setUiState("processing")

      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" })
      try {
        const fd = new FormData()
        fd.append("audio", blob, "recording")
        fd.append("language", language)
        fd.append("version", version)

        const res = await fetch("/api/bible/voice-navigate", { method: "POST", body: fd })
        const data = await res.json()
        if (res.ok && data.url) {
          stateRef.current = "idle"
          setUiState("idle")
          router.push(data.url)
        } else {
          setErrorMsg(data.error ?? "Could not understand the reference")
          stateRef.current = "error"
          setUiState("error")
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Connection error")
        stateRef.current = "error"
        setUiState("error")
      }
    }

    recorder.start()
    stateRef.current = "listening"
    setUiState("listening")
    recorderRef.current = recorder

    timerRef.current = setTimeout(() => {
      if (stateRef.current === "listening") recorder.stop()
    }, MAX_RECORDING_MS)
  }, [language, version, router])

  function handleClick() {
    if (uiState === "listening") {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      recorderRef.current?.stop()
    } else if (uiState !== "processing") {
      setErrorMsg("")
      startListening()
    }
  }

  const isListening = uiState === "listening"
  const isProcessing = uiState === "processing"
  const isError = uiState === "error"

  if (variant === "pill") {
    const popupText =
      isListening  ? (language === "amharic" ? "እየሰማ ነው…" : "Listening…") :
      isProcessing ? (language === "amharic" ? "እየፈለገ ነው…" : "Processing…") :
      isError      ? errorMsg : null
    return (
      <div className="relative flex-1 min-w-0">
        <button
          onClick={handleClick}
          className={`w-full flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-medium transition-all ${
            isListening  ? "bg-red-500 text-white animate-pulse" :
            isProcessing ? "bg-blue-500 text-white" :
            isError      ? "bg-amber-50 text-amber-700 border border-amber-200" :
                           "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
          } ${className}`}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          ) : isListening ? (
            <MicOff className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Mic className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate">{t("bible_voice_search")}</span>
        </button>

        {popupText && (
          <div
            className="absolute top-full left-0 mt-1.5 z-50 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap leading-snug"
            style={{ background: isListening ? "#dc2626" : isProcessing ? "#2563eb" : "#1e293b", color: "#fff" }}
          >
            {popupText}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        title={language === "amharic" ? "በድምጽ ምዕራፍ ፈልግ" : "Navigate by voice"}
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors flex-shrink-0 ${
          isListening  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" :
          isProcessing ? "bg-blue-500 text-white" :
          isError      ? "bg-amber-100 text-amber-600 hover:bg-amber-200" :
                         "text-blue-600 bg-blue-100 hover:bg-blue-200"
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
