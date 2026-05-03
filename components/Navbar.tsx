"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Settings,
  BookOpen,
  Mic,
  Music,
  HelpCircle,
  BookMarked,
  MessageSquare,
} from "lucide-react"
import { useLocale } from "@/lib/i18n/LocaleContext"

export default function Navbar() {
  const { t, locale, setLocale } = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isOthersDropdownOpen, setIsOthersDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session, status } = useSession()
  const user = session?.user || null
  const dropdownRef = useRef<HTMLDivElement>(null)
  const othersRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (othersRef.current && !othersRef.current.contains(event.target as Node)) {
        setIsOthersDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isActive = (link: { href: string; activePrefix?: string }) =>
    pathname?.startsWith(link.activePrefix ?? link.href)

  const roles = (user as { roles?: string[] })?.roles ?? []
  const hasMainAdmin = roles.some(r => ["super_admin", "admin"].includes(r))
  const hasLiturgyAdmin = roles.some(r => ["super_admin", "admin", "liturgy_admin"].includes(r))
  const hasHymnAdmin = roles.some(r => ["super_admin", "admin", "hymn_admin"].includes(r))
  const hasSermonAdmin = roles.some(r => ["super_admin", "admin", "sermon_admin"].includes(r))
  const hasBookAdmin = roles.some(r => ["super_admin", "admin", "book_admin"].includes(r))
  const hasQuizAdmin = roles.some(r => ["super_admin", "admin", "quiz_admin"].includes(r))

  const navLinks = [
    { href: "/bible/amharic/1954/1/1", activePrefix: "/bible", label: t("nav_bible"), icon: BookOpen },
    { href: "/liturgy", activePrefix: "/liturgy", label: t("nav_liturgy"), icon: Mic },
    { href: "/hymns", activePrefix: "/hymns", label: t("nav_hymns"), icon: Music },
  ]

  const moreLinks = [
    { href: "/quiz", label: t("nav_quiz"), icon: HelpCircle },
    { href: "/books", label: t("nav_books"), icon: BookMarked },
    { href: "/sermons", label: t("nav_sermons"), icon: MessageSquare },
  ]

  if (status === "loading") {
    return (
      <nav className="fixed top-0 w-full h-16 bg-white border-b border-gray-200 z-50">
        <div className="max-w-full mx-auto px-4 h-full flex items-center justify-between">
          <div className="animate-pulse h-8 w-36 bg-gray-200 rounded-lg" />
          <div className="animate-pulse h-9 w-24 bg-gray-200 rounded-lg" />
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full h-16 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200"
            : "bg-white border-b border-gray-200"
        }`}
      >
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Desktop Navigation grouped on the left */}
            <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group mr-2">
              <div className="relative">
                <Image
                  src="/icons/icon.png"
                  alt="EOTC Media"
                  width={36}
                  height={36}
                  className="rounded-lg"
                  unoptimized
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-gray-900 tracking-tight">
                  EOTC Media
                </span>
                <span className="block text-[10px] font-medium text-gray-500 -mt-0.5 tracking-widest uppercase">
                  Media Resources
                </span>
              </div>
              <span className="text-base font-bold text-gray-900 tracking-tight sm:hidden">
                EOTC Media
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                  {isActive(link) && (
                    <span className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-blue-600 rounded-full" />
                  )}
                </Link>
              ))}

              {/* More Dropdown */}
              <div className="relative" ref={othersRef}>
                <button
                  onClick={() => setIsOthersDropdownOpen(!isOthersDropdownOpen)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                    isOthersDropdownOpen
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {t("nav_more")}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      isOthersDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOthersDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 overflow-hidden">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                          isActive(link)
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <link.icon className="h-4 w-4 text-gray-400" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </div>{/* end left group */}

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Language switcher */}
              <button
                onClick={() => setLocale(locale === "en" ? "am" : "en")}
                title="Switch language"
                className="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800 transition-colors cursor-pointer select-none"
              >
                <span className={locale === "en" ? "text-blue-600" : "text-gray-400"}>EN</span>
                <span className="text-gray-300">|</span>
                <span className={locale === "am" ? "text-blue-600" : "text-gray-400"}>አማ</span>
              </button>

              {user ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <Image
                      src={
                        user.image
                          ? `/api/main/profile/pictures/${user.image}`
                          : "/images/placeholders/profile-default.jpg"
                      }
                      alt={user.name || ""}
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-gray-200"
                      unoptimized
                    />
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1.5">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          {t("nav_profile")}
                        </Link>
                        {hasMainAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-gray-400" />
                            {t("nav_main_admin")}
                          </Link>
                        )}
                        {hasLiturgyAdmin && (
                          <Link
                            href="/liturgy/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-gray-400" />
                            {t("nav_liturgy_admin")}
                          </Link>
                        )}
                        {hasHymnAdmin && (
                          <Link
                            href="/hymns/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-gray-400" />
                            {t("nav_hymn_admin")}
                          </Link>
                        )}
                        {hasSermonAdmin && (
                          <Link
                            href="/sermons/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-gray-400" />
                            {t("nav_sermon_admin")}
                          </Link>
                        )}
                        {hasBookAdmin && (
                          <Link
                            href="/books/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-gray-400" />
                            {t("nav_book_admin")}
                          </Link>
                        )}
                        {hasQuizAdmin && (
                          <Link
                            href="/quiz/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-gray-400" />
                            {t("nav_quiz_admin")}
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full cursor-pointer transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("nav_signout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden md:inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  {t("nav_signin")}
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-16 right-0 w-80 max-w-[90vw] bg-white h-[calc(100vh-4rem)] shadow-xl overflow-y-auto">
            {/* User Header */}
            {user && (
              <div className="p-5 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      user.image
                        ? `/api/main/profile/pictures/${user.image}`
                        : "/images/placeholders/profile-default.jpg"
                    }
                    alt={user.name || ""}
                    width={44}
                    height={44}
                    className="rounded-full border-2 border-gray-200"
                    unoptimized
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <div className="py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium transition-all ${
                    isActive(link)
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <link.icon className={`h-5 w-5 ${isActive(link) ? "text-blue-500" : "text-gray-400"}`} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="mx-5 border-t border-gray-100" />

            {/* More Links */}
            <div className="py-2">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium transition-all ${
                    isActive(link)
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <link.icon className={`h-5 w-5 ${isActive(link) ? "text-blue-500" : "text-gray-400"}`} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="mx-5 border-t border-gray-100" />

            {/* Account Links */}
            {user ? (
              <div className="py-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-400" />
                  Profile
                </Link>
                {hasMainAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Main admin
                  </Link>
                )}
                {hasLiturgyAdmin && (
                  <Link
                    href="/liturgy/admin"
                    className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Liturgy admin
                  </Link>
                )}
                {hasHymnAdmin && (
                  <Link
                    href="/hymns/admin"
                    className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Hymn admin
                  </Link>
                )}
                {hasSermonAdmin && (
                  <Link
                    href="/sermons/admin"
                    className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Sermon admin
                  </Link>
                )}
                {hasBookAdmin && (
                  <Link
                    href="/books/admin"
                    className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Book admin
                  </Link>
                )}
                {hasQuizAdmin && (
                  <Link
                    href="/quiz/admin"
                    className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Quiz admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-medium text-red-600 hover:bg-red-50 w-full cursor-pointer transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="p-5">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  {t("nav_signin")}
                </Link>
              </div>
            )}

            {/* Mobile language switcher */}
            <div className="px-5 pb-5 pt-1">
              <button
                onClick={() => setLocale(locale === "en" ? "am" : "en")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800 transition-colors cursor-pointer select-none"
              >
                <span className={locale === "en" ? "text-blue-600" : "text-gray-400"}>EN</span>
                <span className="text-gray-300">|</span>
                <span className={locale === "am" ? "text-blue-600" : "text-gray-400"}>አማ</span>
                <span className="text-xs text-gray-400 ml-1">{locale === "en" ? "English" : "አማርኛ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
