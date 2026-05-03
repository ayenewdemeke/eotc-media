"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HelpCircle, User, Users } from "lucide-react"
import { useLocale } from "@/lib/i18n/LocaleContext"

interface QuizSidebarProps {
  userId?: number
}

export default function QuizSidebar({ userId }: QuizSidebarProps) {
  const pathname = usePathname()
  const { t } = useLocale()

  const isActive = (path: string) => {
    if (path === "/quiz/my-questions") return pathname === "/quiz/my-questions" || pathname === "/quiz/submit"
    if (path === "/quiz") return pathname === "/quiz"
    return pathname.startsWith(path)
  }

  const linkClass = (path: string) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex-shrink-0 ${
      isActive(path)
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`

  const dimLink = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex-shrink-0"

  return (
    <aside className="
      flex flex-row items-center gap-1 px-4 py-2 border-b border-slate-100
      overflow-x-auto scrollbar-none
      lg:flex-col lg:items-stretch lg:overflow-x-visible lg:border-b-0 lg:border-r lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem)] lg:px-3 lg:py-4
    ">
      <div className="flex flex-row items-center gap-1 flex-nowrap lg:flex-col lg:items-stretch">
        <Link href="/quiz" className={linkClass("/quiz")}>
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {t("quiz_all")}
        </Link>
        {userId ? (
          <>
            <Link href="/quiz/rooms" className={linkClass("/quiz/rooms")}>
              <Users className="w-4 h-4 flex-shrink-0" />
              {t("quiz_rooms")}
            </Link>
            <Link href="/quiz/my-questions" className={linkClass("/quiz/my-questions")}>
              <User className="w-4 h-4 flex-shrink-0" />
              {t("quiz_my")}
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login" className={dimLink}>
              <Users className="w-4 h-4 flex-shrink-0" />
              {t("quiz_rooms")}
            </Link>
            <Link href="/auth/login" className={dimLink}>
              <User className="w-4 h-4 flex-shrink-0" />
              {t("quiz_my")}
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}
