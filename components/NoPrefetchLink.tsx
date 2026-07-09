import Link from "next/link"
import { forwardRef, type ComponentPropsWithoutRef } from "react"

type Props = ComponentPropsWithoutRef<typeof Link>

// Drop-in replacement for next/link with prefetch DISABLED by default.
// Next prefetches every <Link> in view; for nav rendered on every page that
// fired one server (DB-querying) request per link on load — a big source of DB
// load. With this, those pages load on click instead. Pass `prefetch` to override.
const NoPrefetchLink = forwardRef<HTMLAnchorElement, Props>(function NoPrefetchLink(
  { prefetch = false, ...props },
  ref
) {
  return <Link ref={ref} prefetch={prefetch} {...props} />
})

export default NoPrefetchLink
