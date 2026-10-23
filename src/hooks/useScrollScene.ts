import { useEffect, useRef, useState } from 'react'

export function useScrollScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let raf = 0
    const sync = () => {
      raf = 0
      if (reducedMotion) {
        progressRef.current = 1
        setProgress(1)
        return
      }
      const rect = section.getBoundingClientRect()
      // svh-based sticky chapters must use their own rendered height. iOS
      // browser bars change innerHeight while scrolling, causing jumps.
      const sticky = section.querySelector<HTMLElement>('.motion-sticky')
      const stickyHeight = sticky?.offsetHeight ?? window.innerHeight
      const distance = Math.max(1, section.offsetHeight - stickyHeight)
      const value = Math.max(0, Math.min(1, -rect.top / distance))
      progressRef.current = value
      setProgress(previous => Math.abs(previous - value) >= .005 ? value : previous)
    }
    const requestSync = () => {
      if (!raf) raf = window.requestAnimationFrame(sync)
    }
    requestSync()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)
    return () => {
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
      window.cancelAnimationFrame(raf)
    }
  }, [reducedMotion])

  return { sectionRef, progress, progressRef, reducedMotion }
}
