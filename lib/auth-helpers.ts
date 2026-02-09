import { Session } from "next-auth"

const LITURGY_ADMIN_ROLES = ["super_admin", "admin", "liturgy_admin"]

export function hasLiturgyAdminAccess(session: Session | null): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) return false
  
  return session.user.roles.some(role => 
    role && LITURGY_ADMIN_ROLES.includes(role)
  )
}

export function checkLiturgyAdminAccess(session: Session | null): void {
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  if (!hasLiturgyAdminAccess(session)) {
    throw new Error("Forbidden: Liturgy admin access required")
  }
}
