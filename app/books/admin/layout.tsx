import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { BookAdminSidebar } from "@/components/admin/books/BookAdminSidebar"
import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { hasBookAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function BookAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (!hasBookAdminAccess(session)) redirect("/")

  return (
    <SidebarProvider className="admin-theme">
      <BookAdminSidebar />
      <SidebarInset>
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
