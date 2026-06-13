let scriptLoaded = false
const callbacks: (() => void)[] = []

export function whenYTReady(cb: () => void) {
  if (typeof window === "undefined") return
  const w = window as typeof window & { YT?: { Player: unknown }; onYouTubeIframeAPIReady?: () => void }
  if (w.YT?.Player) { cb(); return }
  if (!scriptLoaded) {
    scriptLoaded = true
    w.onYouTubeIframeAPIReady = () => {
      callbacks.splice(0).forEach(fn => fn())
    }
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(tag)
  }
  callbacks.push(cb)
}
