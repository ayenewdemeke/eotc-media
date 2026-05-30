import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { QuizAdminSidebar } from "@/components/admin/quiz/QuizAdminSidebar"
import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { hasQuizAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function QuizAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/auth/login")
  if (!hasQuizAdminAccess(session)) redirect("/")

  return (
    <SidebarProvider>
      <QuizAdminSidebar />
      <SidebarInset>
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
