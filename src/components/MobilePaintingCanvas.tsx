import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * Shared scroll-controlled painting for phones and desktops.
 * No autonomous animation, timer, brush easing or accumulated progress.
 * Every painted pixel and the tip position come from the SAME scroll value.
 */
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const rand = (n: number) => {
  const x = Math.sin(n * 79.13 + 17.97) * 43758.5453
  return x - Math.floor(x)
}
type Track = { y: number; flip: boolean; wave: number; phase: number; width: number }
type Point = { x: number; y: number }
type Geometry = { width: number; height: number; tracks: Track[] }
const configurations = {
  mobile: { width: 420, height: 336, rows: 17 },
  desktop: { width: 840, height: 672, rows: 23 },
} as const

function geometry(mobile: boolean): Geometry {
  const spec = mobile ? configurations.mobile : configurations.desktop
  const band = spec.height / spec.rows
  const tracks: Track[] = Array.from({ length: spec.rows }, (_, row) => ({
    y: band * (row + .5),
    flip: row % 2 === 1,
    wave: band * (.08 + rand(row + 5) * .13),
    phase: rand(row + 19) * Math.PI * 2,
    width: band * (1.26 + rand(row + 48) * .28),
  }))
  return { width: spec.width, height: spec.height, tracks }
}

/** The tip and the actual stroke use exactly this point function. */
function pointOnRow(g: Geometry, row: number, t: number): Point {
  const track = g.tracks[row]
  const f = clamp(t)
  const left = g.width * .025
  const right = g.width * .975
  const x = track.flip ? right - (right - left) * f : left + (right - left) * f
  const wiggle = Math.sin(f * Math.PI * 2 + track.phase) - Math.sin(track.phase) * (1 - f)
  const finer = Math.sin(f * Math.PI * 5 + track.phase * .5) * .24
  return { x, y: track.y + (wiggle + finer) * track.wave }
}

function currentTip(g: Geometry, progress: number): Point {
  const scaled = clamp(progress) * g.tracks.length
  const index = Math.min(g.tracks.length - 1, Math.floor(scaled))
  const phase = scaled >= g.tracks.length ? 1 : scaled - index
  // 94% of each chapter paints across a row, 6% lowers the brush into next row.
  if (phase <= .94 || index === g.tracks.length - 1) {
    return pointOnRow(g, index, phase >= .94 ? 1 : phase / .94)
  }
  const from = pointOnRow(g, index, 1)
  const to = pointOnRow(g, index + 1, 0)
  const t = (phase - .94) / .06
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
}

function drawStroke(ctx: CanvasRenderingContext2D, g: Geometry, row: number, part: number, shift: number, width: number) {
  if (part <= 0) return
  const steps = Math.max(2, Math.ceil(part * 52))
  ctx.beginPath()
  for (let step = 0; step <= steps; step++) {
    const f = part * (step / steps)
    const point = pointOnRow(g, row, f)
    if (step === 0) ctx.moveTo(point.x, point.y + shift)
    else ctx.lineTo(point.x, point.y + shift)
  }
  ctx.lineWidth = width
  ctx.stroke()
}

function makeEdge(g: Geometry): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = g.width
  out.height = g.height
  const ctx = out.getContext('2d')
  if (!ctx) return out
  // Organic, feathered edges instead of an opaque rectangle.
  const edge = ctx.createImageData(g.width, g.height)
  for (let y = 0; y < g.height; y++) for (let x = 0; x < g.width; x++) {
    const nx = (x - g.width * .5) / (g.width * .47)
    const ny = (y - g.height * .5) / (g.height * .46)
    const angle = Math.atan2(ny, nx)
    const radius = Math.hypot(nx, ny) /
      (1 + .043 * Math.sin(angle * 7) + .025 * Math.sin(angle * 13 + .8))
    const q = clamp((radius - .81) / .19)
    const fade = 1 - q * q * (3 - 2 * q)
    const index = (y * g.width + x) * 4
    edge.data[index] = 255
    edge.data[index + 1] = 255
    edge.data[index + 2] = 255
    edge.data[index + 3] = Math.round(fade * 255)
  }
  ctx.putImageData(edge, 0, 0)
  return out
}

function paint(
  canvas: HTMLCanvasElement,
  mask: HTMLCanvasElement,
  edge: HTMLCanvasElement,
  image: HTMLImageElement,
  g: Geometry,
  progress: number,
) {
  const ctx = canvas.getContext('2d')
  const m = mask.getContext('2d')
  if (!ctx || !m) return
  const p = clamp(progress)
  ctx.clearRect(0, 0, g.width, g.height)
  if (p <= 0) return
  m.clearRect(0, 0, g.width, g.height)
  m.strokeStyle = '#fff'
  m.lineCap = 'round'
  m.lineJoin = 'round'
  const count = p * g.tracks.length
  for (let row = 0; row < Math.ceil(count); row++) {
    const fraction = clamp((count - row) / .94)
    if (!fraction) continue
    const track = g.tracks[row]
    m.globalAlpha = 1
    drawStroke(m, g, row, fraction, 0, track.width)
    m.globalAlpha = .65
    drawStroke(m, g, row, fraction, -track.width * .3, track.width * .23)
    drawStroke(m, g, row, fraction, track.width * .33, track.width * .20)
  }
  m.globalAlpha = 1

  ctx.globalCompositeOperation = 'source-over'
  ctx.drawImage(image, 0, 0, g.width, g.height)
  if (p < .999) {
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(mask, 0, 0)
  }
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(edge, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
}

type Props = { progress: number; reducedMotion: boolean; mobile?: boolean }

export default function MobilePaintingCanvas({ progress, reducedMotion, mobile = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [failed, setFailed] = useState(false)
  const cached = useRef<{ g: Geometry; mask: HTMLCanvasElement; edge: HTMLCanvasElement; mode: boolean } | null>(null)
  const visibleProgress = reducedMotion ? 1 : clamp((progress - .015) / .945)
  const dimensions = mobile ? configurations.mobile : configurations.desktop
  const brushGeometry = geometry(mobile)
  const tip = currentTip(brushGeometry, visibleProgress)
  const brushOpacity = reducedMotion ? 0 : clamp(Math.min(visibleProgress * 22, (1 - visibleProgress) * 12))

  useEffect(() => {
    let mounted = true
    const art = new Image()
    art.onload = () => { if (mounted) setImage(art) }
    art.onerror = () => { if (mounted) setFailed(true) }
    art.src = import.meta.env.BASE_URL + 'starry-night.webp'
    return () => { mounted = false }
  }, [])

  // One synchronous render for one scroll value. No time-based catch-up,
  // brush lag, separate RAF or fallback interval, even in Safari.
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    if (!cached.current || cached.current.mode !== mobile) {
      const g = geometry(mobile)
      const mask = document.createElement('canvas')
      mask.width = g.width
      mask.height = g.height
      cached.current = { g, mask, edge: makeEdge(g), mode: mobile }
    }
    const { g, mask, edge } = cached.current
    paint(canvas, mask, edge, image, g, visibleProgress)
  }, [visibleProgress, mobile, image])

  const brushStyle: CSSProperties = {
    left: (tip.x / dimensions.width * 100) + '%',
    top: (tip.y / dimensions.height * 100) + '%',
    transform: 'translate3d(-47%, -97%, 0) rotate(-9deg)',
    opacity: brushOpacity,
  }
  const auraStyle: CSSProperties = { opacity: .08 + visibleProgress * .80 }

  return <figure className={'painter-viewport' + (mobile ? ' painter-mobile-viewport' : '')}
    data-paint-progress={visibleProgress.toFixed(4)}
    data-brush-row={Math.min(brushGeometry.tracks.length - 1, Math.floor(visibleProgress * brushGeometry.tracks.length))}
    style={{ '--paint-reveal': visibleProgress } as CSSProperties}>
    <div className="painter-surface">
      <div className="painter-aura" style={auraStyle} aria-hidden="true"/>
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height}
        className={'painter-canvas' + (mobile ? ' painter-mobile-canvas' : '')}
        role="img" aria-label="Cọ vẽ ngang qua lại từ trên xuống, đồng bộ với thao tác cuộn" />
      {failed && <img className="painter-mobile-fallback"
        src={import.meta.env.BASE_URL + 'starry-night.webp'} alt="Đêm đầy sao của Vincent van Gogh" />}
      <svg className={'painter-brush' + (mobile ? ' painter-mobile-brush' : '')}
        style={brushStyle} viewBox="0 0 120 195" aria-hidden="true">
        <defs><linearGradient id="painting-handle-wood" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#dfab73"/><stop offset="1" stopColor="#8f5f45"/>
        </linearGradient></defs>
        <path d="M53 4Q60 -1 67 4L64 142H56Z" fill="url(#painting-handle-wood)" stroke="#9c7250" strokeWidth="1.3"/>
        <path d="M55 139H65L68 166H52Z" fill="#a9b1c1" stroke="#f5efe8" strokeWidth="2"/>
        <path d="M53 165Q55 182 60 193Q68 181 67 165Z" fill="#e2ccac" stroke="#8f8078" strokeWidth="1.1"/>
        <path d="M57 183Q59 191 60 193Q63 190 64 183Z" fill="#4164a6"/>
      </svg>
    </div>
    <figcaption className="painter-caption"><span className="painter-caption-dot"/> THE STARRY NIGHT · VINCENT VAN GOGH · 1889</figcaption>
  </figure>
}
