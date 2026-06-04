import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminCategoriesPage() {
  return (
    <LookupAdminPage
      title="Categories"
      description="Group quiz questions by topic. Optionally tie a category to a language."
      noun="category"
      apiBase="/api/quiz/admin/categories"
      relations={[
        {
          key: "languageId",
          label: "Language",
          optionsUrl: "/api/quiz/admin/languages",
        },
      ]}
    />
  )
}
