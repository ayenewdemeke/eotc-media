import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminSubCategoriesPage() {
  return (
    <LookupAdminPage
      title="Sub-categories"
      description="Break categories down into more specific topics."
      noun="sub-category"
      apiBase="/api/quiz/admin/sub-categories"
      relations={[
        {
          key: "categoryId",
          label: "Category",
          optionsUrl: "/api/quiz/admin/categories",
          required: true,
          filterable: true,
        },
      ]}
    />
  )
}
