import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminBookSubCategoriesPage() {
  return (
    <LookupAdminPage
      title="Sub-categories"
      description="Break categories down into more specific topics."
      noun="sub-category"
      apiBase="/api/books/admin/sub-categories"
      relations={[
        {
          key: "categoryId",
          label: "Category",
          optionsUrl: "/api/books/admin/categories",
          required: true,
          filterable: true,
        },
      ]}
    />
  )
}
