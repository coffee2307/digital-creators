import { useSyncExternalStore } from 'react'

export type SiteTheme = 'light' | 'dark'
const event = 'digital-creators-theme'

export function currentTheme(): SiteTheme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function subscribe(listener: () => void) {
  window.addEventListener(event, listener)
  return () => window.removeEventListener(event, listener)
}

export function useThemeMode() {
  return useSyncExternalStore(subscribe, currentTheme, () => 'light')
}

/** Native View Transitions crossfade/iris reveal when supported; CSS fallback elsewhere. */
export function setSiteTheme(mode: SiteTheme, origin?: { x: number; y: number }) {
  if (currentTheme() === mode) return
  const root = document.documentElement
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const x = origin?.x ?? window.innerWidth - 88
  const y = origin?.y ?? 34
  const apply = () => {
    root.dataset.theme = mode
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      'content', mode === 'dark' ? '#080c19' : '#faf9f6'
    )
    try { window.localStorage.setItem('dc-theme', mode) } catch { /* private browsing */ }
    window.dispatchEvent(new Event(event))
  }

  const documentWithTransition = document as Document & {
    startViewTransition?: (update: () => void) => { ready: Promise<void> }
  }
  if (reduce || !documentWithTransition.startViewTransition) {
    apply()
    return
  }
  const maxRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  try {
    const transition = documentWithTransition.startViewTransition(() => apply())
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
        { duration: 620, easing: 'cubic-bezier(.22,.82,.18,1)', pseudoElement: '::view-transition-new(root)' }
      )
    }).catch(() => {})
  } catch {
    apply()
  }
}
