import { redirect } from "next/navigation"

// Redirect old individual anaphora pages to the single liturgy page
export default function AnaphoraPage() {
  redirect("/liturgy")
}
