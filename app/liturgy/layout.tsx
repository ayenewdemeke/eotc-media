export default function LiturgyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Don't wrap admin pages with the main layout
  return children
}
