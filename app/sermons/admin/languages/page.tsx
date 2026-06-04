import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminSermonLanguagesPage() {
  return (
    <LookupAdminPage
      title="Languages"
      description="Manage the languages sermons can be tagged with."
      noun="language"
      apiBase="/api/sermons/admin/languages"
    />
  )
}
