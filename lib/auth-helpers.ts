import { Session } from "next-auth"

const MAIN_ADMIN_ROLES = ["super_admin", "admin"]

export function hasMainAdminAccess(session: Session | null): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) return false
  return session.user.roles.some(role => role && MAIN_ADMIN_ROLES.includes(role))
}

export function checkMainAdminAccess(session: Session | null): void {
  if (!session?.user) throw new Error("Unauthorized")
  if (!hasMainAdminAccess(session)) throw new Error("Forbidden: Admin access required")
}

const LITURGY_ADMIN_ROLES = ["super_admin", "admin", "liturgy_admin"]
const HYMN_ADMIN_ROLES = ["super_admin", "admin", "hymn_admin"]

export function hasLiturgyAdminAccess(session: Session | null): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) return false
  return session.user.roles.some(role => role && LITURGY_ADMIN_ROLES.includes(role))
}

export function checkLiturgyAdminAccess(session: Session | null): void {
  if (!session?.user) throw new Error("Unauthorized")
  if (!hasLiturgyAdminAccess(session)) throw new Error("Forbidden: Liturgy admin access required")
}

export function hasHymnAdminAccess(session: Session | null): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) return false
  return session.user.roles.some(role => role && HYMN_ADMIN_ROLES.includes(role))
}

export function checkHymnAdminAccess(session: Session | null): void {
  if (!session?.user) throw new Error("Unauthorized")
  if (!hasHymnAdminAccess(session)) throw new Error("Forbidden: Hymn admin access required")
}

const SERMON_ADMIN_ROLES = ["super_admin", "admin", "sermon_admin"]

export function hasSermonAdminAccess(session: Session | null): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) return false
  return session.user.roles.some(role => role && SERMON_ADMIN_ROLES.includes(role))
}

export function checkSermonAdminAccess(session: Session | null): void {
  if (!session?.user) throw new Error("Unauthorized")
  if (!hasSermonAdminAccess(session)) throw new Error("Forbidden: Sermon admin access required")
}

const BOOK_ADMIN_ROLES = ["super_admin", "admin", "book_admin"]

export function hasBookAdminAccess(session: Session | null): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) return false
  return session.user.roles.some(role => role && BOOK_ADMIN_ROLES.includes(role))
}

export function checkBookAdminAccess(session: Session | null): void {
  if (!session?.user) throw new Error("Unauthorized")
  if (!hasBookAdminAccess(session)) throw new Error("Forbidden: Book admin access required")
}

const QUIZ_ADMIN_ROLES = ["super_admin", "admin", "quiz_admin"]

export function hasQuizAdminAccess(session: Session | null): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) return false
  return session.user.roles.some(role => role && QUIZ_ADMIN_ROLES.includes(role))
}

export function checkQuizAdminAccess(session: Session | null): void {
  if (!session?.user) throw new Error("Unauthorized")
  if (!hasQuizAdminAccess(session)) throw new Error("Forbidden: Quiz admin access required")
}
