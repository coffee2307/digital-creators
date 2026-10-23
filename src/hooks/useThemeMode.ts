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

export function setSiteTheme(mode: SiteTheme) {
  document.documentElement.dataset.theme = mode
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
    'content', mode === 'dark' ? '#080c19' : '#faf9f6'
  )
  try { window.localStorage.setItem('dc-theme', mode) } catch { /* private browsing */ }
  window.dispatchEvent(new Event(event))
}
