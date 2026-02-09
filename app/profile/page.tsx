import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
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
        <div className="flex justify-center">
          <div className="w-full" style={{ maxWidth: '50%' }}>
            {/* Profile Image */}
            <div className="text-center my-12">
              <Image
                src={user.image ? `/api/main/profile/pictures/${user.image}` : "/images/placeholders/profile-default.jpg"}
                alt={user.name}
                width={200}
                height={200}
                className="rounded inline-block"
                style={{ width: '25%', height: 'auto' }}
                unoptimized
              />
            </div>

            {/* Profile Information */}
            <ul className="list-none border border-gray-300 rounded">
              <li className="px-4 py-3 border-b border-gray-300 bg-white">
                <span>Name</span>
                <span className="float-end text-gray-700">{user.name}</span>
              </li>
              <li className="px-4 py-3 bg-white">
                <span>Email</span>
                <span className="float-end text-gray-700">{user.email}</span>
              </li>
            </ul>

            {/* Edit Button */}
            <div className="text-end my-12">
              <Link
                href="/profile/edit"
                className="inline-block px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
