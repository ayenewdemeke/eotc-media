import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminBookLanguagesPage() {
  return (
    <LookupAdminPage
      title="Languages"
      description="Manage the languages books can be tagged with."
      noun="language"
      apiBase="/api/books/admin/languages"
    />
  )
}
