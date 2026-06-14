import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminBookAuthorsPage() {
  return (
    <LookupAdminPage
      title="Authors"
      description="Manage the list of book authors."
      noun="author"
      apiBase="/api/books/admin/authors"
    />
  )
}
