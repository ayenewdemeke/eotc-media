"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  LayoutDashboard, HelpCircle, Globe, Tag, Layers,
  CheckSquare, Award, BookType, Home,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"

const BASE = "/quiz/admin"

const menuItems = [
  { title: "Dashboard", href: BASE, icon: LayoutDashboard },
  { title: "New questions", href: `${BASE}/questions?status=pending`, icon: HelpCircle },
  { title: "All questions", href: `${BASE}/questions`, icon: HelpCircle },
  { title: "Languages", href: `${BASE}/languages`, icon: Globe },
  { title: "Categories", href: `${BASE}/categories`, icon: Tag },
  { title: "Sub categories", href: `${BASE}/sub-categories`, icon: Layers },
  { title: "Difficulties", href: `${BASE}/difficulties`, icon: Award },
  { title: "Question types", href: `${BASE}/question-types`, icon: BookType },
  { title: "Approval statuses", href: `${BASE}/approval-statuses`, icon: CheckSquare },
]

export function QuizAdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = (href: string) => {
    if (href === BASE) return pathname === BASE
    if (href === `${BASE}/questions?status=pending`) {
      return pathname === `${BASE}/questions` && searchParams.get("status") === "pending"
    }
    if (href === `${BASE}/questions`) {
      return pathname === `${BASE}/questions` && searchParams.get("status") !== "pending"
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Quiz admin</span>
            <span className="text-xs text-muted-foreground">Management panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/quiz">
                <Home className="h-4 w-4" />
                <span>Back to Quiz</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
