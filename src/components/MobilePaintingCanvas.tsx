import { useEffect, useRef, useState } from 'react'

/** Low-memory mobile painter. Work is limited to a 420×336 canvas and ~12fps.
 * The RAF is stable across scroll events, and stops when the page is hidden. */
const W = 420
const H = 336
const COUNT = 88
const clamp = (n: number) => Math.max(0, Math.min(1, n))
const rand = (n: number) => {
  const x = Math.sin(n * 81.31 + 19.17) * 43758.5453
  return x - Math.floor(x)
}
type Stroke = { x: number; y: number; dx: number; dy: number; bend: number; width: number }
const strokes: Stroke[] = Array.from({ length: COUNT }, (_, i) => {
  const angle = i * 2.39996323 + (rand(i + 13) - .5) * .5
  const r = Math.sqrt((i + .5) / COUNT)
  const cx = W * .50 + Math.cos(angle) * W * .44 * r
  const cy = H * .49 + Math.sin(angle) * H * .43 * r
  const a = angle + Math.PI / 2 + (rand(i + 45) - .5) * .9
  const length = 75 + rand(i + 84) * 55
  const dx = Math.cos(a) * length
  const dy = Math.sin(a) * length
  return { x: cx - dx * .50, y: cy - dy * .50, dx, dy,
    bend: (rand(i + 121) - .5) * 31, width: 30 + rand(i + 160) * 29 }
})

function line(ctx: CanvasRenderingContext2D, s: Stroke, f: number, offset = 0, width = s.width) {
  if (f <= 0) return
  const length = Math.hypot(s.dx, s.dy) || 1
  const nx = -s.dy / length
  const ny = s.dx / length
  ctx.beginPath()
  ctx.moveTo(s.x + nx * offset, s.y + ny * offset)
  ctx.bezierCurveTo(
    s.x + s.dx * f * .28 + nx * (offset + s.bend),
    s.y + s.dy * f * .28 + ny * (offset + s.bend),
    s.x + s.dx * f * .75 + nx * (offset - s.bend * .38),
    s.y + s.dy * f * .75 + ny * (offset - s.bend * .38),
    s.x + s.dx * f + nx * offset,
    s.y + s.dy * f + ny * offset,
  )
  ctx.lineWidth = width
  ctx.stroke()
}

function tipAt(amount: number) {
  const n = clamp(amount) * COUNT
  const i = Math.min(COUNT - 1, Math.floor(n))
  const s = strokes[i]
  const phase = n === COUNT ? 1 : n - i
  if (i > 0 && phase < .18) {
    const previous = strokes[i - 1]
    const t = phase / .18
    const ease = t * t * (3 - 2 * t)
    return {
      x: previous.x + previous.dx + (s.x - previous.x - previous.dx) * ease,
      y: previous.y + previous.dy + (s.y - previous.y - previous.dy) * ease - Math.sin(Math.PI * t) * 8,
    }
  }
  const t = clamp((phase - .18) / .82)
  return { x: s.x + s.dx * t, y: s.y + s.dy * t }
}

function edgeMask() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.translate(W * .5, H * .5)
  ctx.scale(1, .81)
  const gradient = ctx.createRadialGradient(0, 0, W * .31, 0, 0, W * .55)
  gradient.addColorStop(0, '#fff')
  gradient.addColorStop(.62, '#fff')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(-W, -H, W * 2, H * 2)
  return canvas
}

function paint(canvas: HTMLCanvasElement, mask: HTMLCanvasElement, edge: HTMLCanvasElement, image: HTMLImageElement, progress: number) {
  const ctx = canvas.getContext('2d')
  const m = mask.getContext('2d')
  if (!ctx || !m) return
  const p = clamp(progress)
  const count = p >= .98 ? COUNT : p * COUNT
  m.clearRect(0, 0, W, H)
  m.lineCap = 'round'
  m.lineJoin = 'round'
  m.strokeStyle = '#fff'
  for (let i = 0; i < Math.ceil(count); i++) {
    const f = clamp((count - i - .18) / .82)
    if (!f) continue
    const s = strokes[i]
    m.globalAlpha = 1
    line(m, s, f)
    m.globalAlpha = .56
    line(m, s, f, s.width * .34, s.width * .17)
    line(m, s, f, -s.width * .37, s.width * .13)
  }
  m.globalAlpha = 1
  ctx.clearRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'source-over'
  ctx.drawImage(image, 0, 0, W, H)
  if (p < .98) {
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(mask, 0, 0)
  }
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(edge, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
}

type Props = { progress: number; reducedMotion: boolean }
export default function MobilePaintingCanvas({ progress, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const brushRef = useRef<SVGSVGElement>(null)
  const auraRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef(0)
  const drawnRef = useRef(0)
  const restartRef = useRef<() => void>(() => {})
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let live = true
    const img = new Image()
    img.onload = () => { if (live) setImage(img) }
    img.onerror = () => { if (live) setFailed(true) }
    img.src = import.meta.env.BASE_URL + 'starry-night.webp'
    return () => { live = false }
  }, [])

  useEffect(() => {
    targetRef.current = reducedMotion ? 1 : clamp((progress - .015) / .945)
    restartRef.current()
  }, [progress, reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    if (!canvas.getContext('2d')) {
      setFailed(true)
      return
    }
    const mask = document.createElement('canvas')
    mask.width = W
    mask.height = H
    const edge = edgeMask()
    let raf = 0
    let previous = 0
    let lastDrawn = -1
    let lastPaint = 0
    let brushX = -100
    let brushY = -100
    let bounds = canvas.getBoundingClientRect()
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { bounds = canvas.getBoundingClientRect() })
      : null
    resizeObserver?.observe(canvas)
    let alive = true

    const frame = (time: number) => {
      raf = 0
      if (!alive || document.hidden) return
      const dt = previous ? Math.min(80, Math.max(1, time - previous)) : 16
      previous = time
      const target = targetRef.current
      const remaining = target - drawnRef.current
      const maxStep = reducedMotion ? 1 : dt * .00023
      drawnRef.current += Math.sign(remaining) * Math.min(Math.abs(remaining), maxStep)
      if (Math.abs(drawnRef.current - target) < .001) drawnRef.current = target
      const value = drawnRef.current
      if (Math.abs(lastDrawn - value) > .009 && (time - lastPaint >= 82 || value === target)) {
        paint(canvas, mask, edge, image, value)
        lastDrawn = value
        lastPaint = time
      }
      const tip = tipAt(value)
      const x = tip.x / W * bounds.width
      const y = tip.y / H * bounds.height
      const easing = 1 - Math.exp(-dt / 165)
      brushX = brushX < -50 ? x : brushX + (x - brushX) * easing
      brushY = brushY < -50 ? y : brushY + (y - brushY) * easing
      if (brushRef.current) {
        brushRef.current.style.transform = 'translate3d(' + brushX.toFixed(1) + 'px, ' + brushY.toFixed(1) + 'px, 0) translate(-47%, -97%) rotate(-9deg)'
        brushRef.current.style.opacity = reducedMotion ? '0' : String(clamp(Math.min(value * 24, (1 - value) * 8)))
      }
      if (auraRef.current) auraRef.current.style.opacity = String(.08 + value * .8)
      if (Math.abs(target - value) > .001 || Math.hypot(brushX - x, brushY - y) > 2) {
        raf = requestAnimationFrame(frame)
      } else previous = 0
    }

    const start = () => {
      if (alive && !document.hidden && !raf) raf = requestAnimationFrame(frame)
    }
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        previous = 0
      } else start()
    }
    restartRef.current = start
    document.addEventListener('visibilitychange', visibility)
    start()
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      restartRef.current = () => {}
    }
  }, [image, reducedMotion])

  return <figure className="painter-viewport painter-mobile-viewport">
    <div className="painter-surface">
      <div ref={auraRef} className="painter-aura" aria-hidden="true"/>
      <canvas ref={canvasRef} width={W} height={H} className="painter-canvas painter-mobile-canvas"
        role="img" aria-label="Nét cọ dần vẽ Đêm đầy sao khi cuộn" />
      {failed && <img className="painter-mobile-fallback" src={import.meta.env.BASE_URL + 'starry-night.webp'} alt="Đêm đầy sao của Vincent van Gogh"/>}
      <svg ref={brushRef} className="painter-brush painter-mobile-brush" viewBox="0 0 120 195" aria-hidden="true">
        <defs>
          <linearGradient id="mobile-wood" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#dfab73"/><stop offset="1" stopColor="#8f5f45"/>
          </linearGradient>
        </defs>
        <path d="M53 4Q60 -1 67 4L64 142H56Z" fill="url(#mobile-wood)" stroke="#9c7250" strokeWidth="1.3"/>
        <path d="M55 139H65L68 166H52Z" fill="#a9b1c1" stroke="#f5efe8" strokeWidth="2"/>
        <path d="M53 165Q55 182 60 193Q68 181 67 165Z" fill="#e2ccac" stroke="#8f8078" strokeWidth="1.1"/>
        <path d="M57 183Q59 191 60 193Q63 190 64 183Z" fill="#4164a6"/>
      </svg>
    </div>
    <figcaption className="painter-caption"><span className="painter-caption-dot"/> THE STARRY NIGHT · VINCENT VAN GOGH · 1889</figcaption>
  </figure>
}
