import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminLanguagesPage() {
  return (
    <LookupAdminPage
      title="Languages"
      description="Manage the languages hymns can be tagged with."
      noun="language"
      apiBase="/api/hymns/admin/languages"
    />
  )
}
