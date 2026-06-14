"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Suspense } from "react"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMsg("Invalid unsubscribe link."); return }
    setStatus("loading")
    fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) setStatus("done")
        else { setStatus("error"); setErrorMsg(data.error ?? "Something went wrong.") }
      })
      .catch(() => { setStatus("error"); setErrorMsg("Network error. Please try again.") })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <p className="text-lg font-bold text-gray-800 mb-1">EOTC Media</p>
        <p className="text-sm text-gray-400 mb-8">Ethiopian Orthodox Tewahedo Church</p>

        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Processing your request…</p>
          </>
        )}
        {status === "done" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-800 mb-2">Unsubscribed</p>
            <p className="text-gray-500 text-sm">You will no longer receive emails from EOTC Media.</p>
            <p className="text-gray-400 text-xs mt-4">ከEOTC Media ኢሜይሎች ተወግደዋል።</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-800 mb-2">Link invalid</p>
            <p className="text-gray-500 text-sm">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  )
}
