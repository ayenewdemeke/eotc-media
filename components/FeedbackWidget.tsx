"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Check } from "lucide-react"
import { useLocale } from "@/lib/i18n/LocaleContext"

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useLocale()

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, name, email, phone }),
      })
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setDone(false)
        setMessage("")
        setName("")
        setEmail("")
        setPhone("")
      }, 2000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">{t("feedback_header")}</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {done ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium">{t("feedback_success_msg")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("feedback_description")}
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  required
                  placeholder={t("feedback_placeholder")}
                  className="w-full text-sm text-slate-700 placeholder-slate-400 border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <p className="text-xs text-slate-400">{t("feedback_contact")}</p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t("feedback_name_placeholder")}
                  className="w-full text-sm text-slate-700 placeholder-slate-400 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t("auth_email")}
                  className="w-full text-sm text-slate-700 placeholder-slate-400 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={t("feedback_phone_placeholder")}
                  className="w-full text-sm text-slate-700 placeholder-slate-400 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? t("feedback_sending") : t("feedback_submit_btn")}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full shadow-lg transition-all hover:shadow-xl"
      >
        <MessageCircle className="w-4 h-4" />
        {t("feedback_btn")}
      </button>
    </div>
  )
}
