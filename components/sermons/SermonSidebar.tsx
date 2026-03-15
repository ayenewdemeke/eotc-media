"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Heart, User, Tv } from "lucide-react"

interface SermonSidebarProps {
  userId?: number
}

export default function SermonSidebar({ userId }: SermonSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/sermons/channels") return pathname.startsWith("/sermons/channels")
    if (path === "/sermons/my-sermons") return pathname === "/sermons/my-sermons" || pathname === "/sermons/submit"
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
      <Link href="/sermons" className={linkClass("/sermons")}>
        <MessageSquare className="w-4 h-4 flex-shrink-0" />
        All Sermons
      </Link>
      <Link href="/sermons/channels" className={linkClass("/sermons/channels")}>
        <Tv className="w-4 h-4 flex-shrink-0" />
        Channels
      </Link>
      {userId ? (
        <>
          <Link href="/sermons/favorites" className={linkClass("/sermons/favorites")}>
            <Heart className="w-4 h-4 flex-shrink-0" />
            Favorites
          </Link>
          <Link href="/sermons/my-sermons" className={linkClass("/sermons/my-sermons")}>
            <User className="w-4 h-4 flex-shrink-0" />
            My Sermons
          </Link>
        </>
      ) : (
        <>
          <Link href="/auth/login" className={dimLink}>
            <Heart className="w-4 h-4 flex-shrink-0" />
            Favorites
          </Link>
          <Link href="/auth/login" className={dimLink}>
            <User className="w-4 h-4 flex-shrink-0" />
            My Sermons
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
