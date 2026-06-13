"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Music, Mic, FileText, Globe, Tag, Layers, CheckSquare,
  MessageSquare, BookMarked, BookOpen, User, Users, HelpCircle, Award,
  BookType, Star, Home, Menu, X, Bell, Search, ChevronLeft, ChevronDown,
  LogOut, type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, music: Music, mic: Mic, fileText: FileText,
  globe: Globe, tag: Tag, layers: Layers, checkSquare: CheckSquare,
  messageSquare: MessageSquare, bookMarked: BookMarked, bookOpen: BookOpen,
  user: User, users: Users, helpCircle: HelpCircle, award: Award,
  bookType: BookType, star: Star, home: Home,
}

export interface AdminNavItem {
  title: string
  href: string
  icon: string
  /** Active only when pathname equals href exactly (e.g. dashboard). */
  exact?: boolean
  /** "pending": active when ?status=pending. "none": active when not pending. */
  status?: "pending" | "none"
}

interface AdminShellProps {
  brandTitle: string
  brandSubtitle: string
  brandIcon: string
  nav: AdminNavItem[]
  backHref: string
  backLabel: string
  children: React.ReactNode
}

function initials(name?: string | null) {
  if (!name) return "U"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function AdminShell({
  brandTitle, brandSubtitle, brandIcon, nav, backHref, backLabel, children,
}: AdminShellProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const user = session?.user
  const userName = user?.name || "User"
  const BrandIcon = ICONS[brandIcon] ?? LayoutDashboard

  function isActive(item: AdminNavItem) {
    const base = item.href.split("?")[0]
    if (item.exact) return pathname === base
    if (item.status === "pending") return pathname === base && searchParams.get("status") === "pending"
    if (item.status === "none") return pathname === base && searchParams.get("status") !== "pending"
    return pathname === base || pathname.startsWith(base + "/")
  }

  const navLink = (item: AdminNavItem) => {
    const Icon = ICONS[item.icon] ?? LayoutDashboard
    const active = isActive(item)
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        title={collapsed ? item.title : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span className="truncate">{item.title}</span>}
      </Link>
    )
  }

  return (
    <div className="admin-theme min-h-screen bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href={backHref} className={cn("flex items-center gap-2", collapsed && "mx-auto")}>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <BrandIcon className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight text-sidebar-foreground">{brandTitle}</span>
                <span className="text-xs text-sidebar-foreground/50">{brandSubtitle}</span>
              </div>
            )}
          </Link>
          <button
            className="text-sidebar-foreground hover:text-sidebar-foreground/70 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <div className="hidden justify-end px-2 py-2 lg:flex">
          <button
            className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.map(navLink)}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Back link */}
        <div className="px-3 py-2">
          <Link
            href={backHref}
            title={collapsed ? backLabel : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{backLabel}</span>}
          </Link>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* User profile */}
        <div className="p-3">
          <div className={cn("flex items-center gap-3 rounded-md px-3 py-2", collapsed && "justify-center px-0")}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ? `/api/main/profile/pictures/${user.image}` : undefined} alt={userName} />
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials(user?.name)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
                  <p className="truncate text-xs text-sidebar-foreground/50">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={cn("transition-all duration-200", collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64")}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-card">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden md:flex">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="search" placeholder="Search…" className="w-72 border-0 bg-muted/50 pl-9 focus-visible:ring-1" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative rounded-md p-2 text-foreground hover:bg-accent" title="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>
              <div className="flex items-center gap-3 border-l pl-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image ? `/api/main/profile/pictures/${user.image}` : undefined} alt={userName} />
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials(user?.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium xl:block">{userName}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}
