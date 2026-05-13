"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music, Heart, User, Tv, ListMusic } from "lucide-react"
import { useLocale } from "@/lib/i18n/LocaleContext"

interface HymnSidebarProps {
  userId?: number
}

export default function HymnSidebar({ userId }: HymnSidebarProps) {
  const pathname = usePathname()
  const { t } = useLocale()

  const isActive = (path: string) => {
    if (path === "/hymns/channels") return pathname.startsWith("/hymns/channels")
    if (path === "/hymns/my-hymns") return pathname === "/hymns/my-hymns" || pathname === "/hymns/submit"
    if (path === "/hymns/collections") return pathname.startsWith("/hymns/collections")
    return pathname === path
  }

  const linkClass = (path: string) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex-shrink-0 ${
      isActive(path)
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`

  const dimLink = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex-shrink-0"

  const links = (
    <>
      <Link href="/hymns" className={linkClass("/hymns")}>
        <Music className="w-4 h-4 flex-shrink-0" />
        {t("hymn_all")}
      </Link>
      <Link href="/hymns/channels" className={linkClass("/hymns/channels")}>
        <Tv className="w-4 h-4 flex-shrink-0" />
        {t("hymn_channels")}
      </Link>
      {userId ? (
        <>
          <Link href="/hymns/favorites" className={linkClass("/hymns/favorites")}>
            <Heart className="w-4 h-4 flex-shrink-0" />
            {t("hymn_favorites")}
          </Link>
          <Link href="/hymns/collections" className={linkClass("/hymns/collections")}>
            <ListMusic className="w-4 h-4 flex-shrink-0" />
            {t("hymn_my_lists")}
          </Link>
          <Link href="/hymns/my-hymns" className={linkClass("/hymns/my-hymns")}>
            <User className="w-4 h-4 flex-shrink-0" />
            {t("hymn_my_uploads")}
          </Link>
        </>
      ) : (
        <>
          <Link href="/auth/login" className={dimLink}>
            <Heart className="w-4 h-4 flex-shrink-0" />
            {t("hymn_favorites")}
          </Link>
          <Link href="/auth/login" className={dimLink}>
            <ListMusic className="w-4 h-4 flex-shrink-0" />
            {t("hymn_my_lists")}
          </Link>
          <Link href="/auth/login" className={dimLink}>
            <User className="w-4 h-4 flex-shrink-0" />
            {t("hymn_my_uploads")}
          </Link>
        </>
      )}
    </>
  )

  return (
    <aside className="
      flex flex-row items-center gap-1 px-4 py-2 border-b border-slate-100
      overflow-x-auto scrollbar-none
      lg:flex-col lg:items-stretch lg:overflow-x-visible lg:border-b-0 lg:border-r lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem)] lg:px-3 lg:py-4
    ">
      <div className="flex flex-row items-center gap-1 flex-nowrap lg:flex-col lg:items-stretch">
        {links}
      </div>
    </aside>
  )
}
