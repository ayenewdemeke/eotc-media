import Image from "next/image"
import Link from "next/link"

export default function ApplicationLogo() {
  return (
    <Link href="/" className="flex items-center justify-center gap-2">
      <Image 
        src="/icons/icon.png" 
        alt="EOTC Media" 
        width={40} 
        height={40}
        priority
      />
      <span className="text-xl font-semibold">EOTC Media</span>
    </Link>
  )
}
