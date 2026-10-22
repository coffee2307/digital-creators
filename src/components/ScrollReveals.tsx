import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Lightweight entrance reveals; content remains visible without observer support. */
export default function ScrollReveals() {
  const location = useLocation()
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches || !('IntersectionObserver' in window)) return
    const elements = Array.from(document.querySelectorAll<HTMLElement>(
      '.field-card, .activity, .lab-card, .lab-heading, .story-content, .story-art, .intro, .goal, .cta, .audience, .register-card, .page-header-text'
    ))
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('dc-in-view')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: .075, rootMargin: '0px 0px -25px 0px' })
    elements.forEach((element, index) => {
      element.classList.add('dc-reveal')
      element.style.setProperty('--dc-reveal-delay', `${index % 5 * 50}ms`)
      observer.observe(element)
    })
    return () => {
      observer.disconnect()
      elements.forEach(element => {
        element.classList.remove('dc-reveal','dc-in-view')
        element.style.removeProperty('--dc-reveal-delay')
      })
    }
  }, [location.pathname])
  return null
}
