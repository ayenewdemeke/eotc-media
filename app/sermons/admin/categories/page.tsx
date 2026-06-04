import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminSermonCategoriesPage() {
  return (
    <LookupAdminPage
      title="Categories"
      description="Group sermons by topic. Optionally tie a category to a language."
      noun="category"
      apiBase="/api/sermons/admin/categories"
      relations={[
        {
          key: "languageId",
          label: "Language",
          optionsUrl: "/api/sermons/admin/languages",
        },
      ]}
    />
  )
}
