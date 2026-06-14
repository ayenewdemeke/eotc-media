import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminCategoriesPage() {
  return (
    <LookupAdminPage
      title="Categories"
      description="Group hymns by topic. Optionally tie a category to a language."
      noun="category"
      apiBase="/api/hymns/admin/categories"
      relations={[
        {
          key: "languageId",
          label: "Language",
          optionsUrl: "/api/hymns/admin/languages",
        },
      ]}
    />
  )
}
