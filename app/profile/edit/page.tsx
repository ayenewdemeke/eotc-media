import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import EditProfileForm from "@/app/profile/edit/EditProfileForm"

export const dynamic = 'force-dynamic'

export default async function EditProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const user = {
    name: session.user.name || '',
    email: session.user.email || '',
    image: session.user.image || null,
    roles: session.user.roles || []
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <EditProfileForm user={user} />
      </div>
      <Footer />
    </>
  )
}
