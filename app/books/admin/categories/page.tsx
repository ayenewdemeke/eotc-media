import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminBookCategoriesPage() {
  return (
    <LookupAdminPage
      title="Categories"
      description="Group books by topic."
      noun="category"
      apiBase="/api/books/admin/categories"
    />
  )
}
