import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Brush, Paintbrush, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollScene } from '../hooks/useScrollScene'

const W = 960
const H = 768
const ROWS = 18
const COLS = 15
const clamp = (value: number) => Math.max(0, Math.min(1, value))
function noise(n: number) {
  const x = Math.sin(n * 92.417 + 18.915) * 43758.5453
  return x - Math.floor(x)
}
type Stroke = { x: number; y: number; dx: number; bow: number; width: number; seed: number }
const strokes: Stroke[] = Array.from({ length: ROWS * COLS }, (_, i) => {
  const row = Math.floor(i / COLS)
  const col = i % COLS
  const reverse = row % 2 === 1
  const slot = reverse ? COLS - 1 - col : col
  // Staggered brush passes with irregular direction, angle, breadth and overlap.
  const x = -26 + slot * 69 + (noise(i + 3) - .5) * 34
  const y = 10 + row * 43 + (noise(i + 47) - .5) * 34
  const length = 73 + noise(i + 91) * 71
  return {
    x: Math.max(-22, Math.min(W + 12, x)),
    y: Math.max(-12, Math.min(H + 12, y)),
    dx: reverse ? -length : length,
    bow: (noise(i + 138) - .5) * 39,
    width: 48 + noise(i + 179) * 33,
    seed: i,
  }
})

function strokeTip(p: number) {
  const scaled = clamp(p) * strokes.length
  const index = Math.min(strokes.length - 1, Math.floor(scaled))
  const mark = strokes[index]
  const f = clamp(scaled - index)
  // The visible brush tip follows the actual Bézier curve, not a disconnected path.
  const x = mark.x + mark.dx * f
  const y = mark.y + 2 * (1 - f) * f * mark.bow
  return { x: Math.max(19, Math.min(W - 19, x)), y: Math.max(18, Math.min(H - 18, y)), angle: Math.atan2(mark.bow * (1 - 2 * f) * 2, mark.dx) * 180 / Math.PI }
}

function drawLine(ctx: CanvasRenderingContext2D, mark: Stroke, fraction: number, offset: number, width: number) {
  const f = clamp(fraction)
  if (f === 0) return
  const startX = mark.x
  const endX = mark.x + mark.dx * f
  ctx.beginPath()
  ctx.moveTo(startX, mark.y + offset)
  ctx.quadraticCurveTo(
    mark.x + mark.dx * f * .5,
    mark.y + offset + mark.bow * .95,
    endX,
    mark.y + offset + mark.bow * 2 * f * (1 - f),
  )
  ctx.lineWidth = width
  ctx.stroke()
}

/** Paint onto the bare stage with uneven pigmented ribbons, small dry bristle gaps
 * and a deterministic reveal mask; scrolling backward cleanly reverses the artwork. */
function renderPainting(
  output: HTMLCanvasElement,
  mask: HTMLCanvasElement,
  composite: HTMLCanvasElement,
  art: HTMLCanvasElement,
  pigment: string[],
  amount: number,
) {
  const ctx = output.getContext('2d')
  const m = mask.getContext('2d')
  const c = composite.getContext('2d')
  if (!ctx || !m || !c) return
  ctx.clearRect(0, 0, W, H)
  m.clearRect(0, 0, W, H)
  const count = clamp(amount) * strokes.length
  if (count <= 0) return

  m.lineJoin = 'round'
  m.lineCap = 'round'
  const visible = Math.min(strokes.length, Math.ceil(count))
  for (let i = 0; i < visible; i++) {
    const mark = strokes[i]
    const f = clamp(count - i)
    const pressure = .87 + .13 * Math.sin(f * Math.PI)
    m.strokeStyle = '#fff'
    m.globalAlpha = .98
    drawLine(m, mark, f, 0, mark.width * pressure)
    // Uneven bristle edges and overlapping splayed bristle tips.
    m.globalAlpha = .66
    drawLine(m, mark, f, -mark.width * .39, mark.width * .17)
    drawLine(m, mark, f, mark.width * .35, mark.width * .14)
    if (f > .26 && mark.seed % 3 === 0) {
      m.globalAlpha = .36
      m.fillStyle = '#fff'
      for (let j = 0; j < 3; j++) {
        const px = mark.x + mark.dx * Math.min(f, .28 + j * .15)
        const py = mark.y + mark.bow * .35 + (noise(mark.seed * 13 + j) - .5) * mark.width
        m.beginPath()
        m.ellipse(px, py, 2 + noise(j + mark.seed) * 4, 1.5 + noise(mark.seed + j * 7) * 2.5, .35, 0, Math.PI * 2)
        m.fill()
      }
    }
  }
  m.globalAlpha = 1

  c.globalCompositeOperation = 'source-over'
  c.clearRect(0, 0, W, H)
  c.drawImage(art, 0, 0)
  c.globalCompositeOperation = 'destination-in'
  c.drawImage(mask, 0, 0)
  c.globalCompositeOperation = 'source-over'
  ctx.drawImage(composite, 0, 0)

  // Small textured strokes sit ON TOP of the original painting. This keeps Van
  // Gogh's brushwork recognizable while giving the reveal irregular impasto.
  ctx.lineCap = 'round'
  for (let i = 0; i < visible; i++) {
    const mark = strokes[i]
    const f = clamp(count - i)
    if (f <= 0 || i % 2 !== 0) continue
    ctx.strokeStyle = pigment[i] || 'rgba(106,142,204,.2)'
    ctx.globalAlpha = .26
    drawLine(ctx, mark, f, -mark.width * .19, 2 + noise(i + 347) * 3)
    ctx.globalAlpha = .17
    drawLine(ctx, mark, f, mark.width * .23, 1.2 + noise(i + 322) * 2.5)
    if (i % 7 === 0) {
      ctx.globalAlpha = .19
      ctx.setLineDash([4, 10, 1, 7])
      drawLine(ctx, mark, f, mark.width * .43, 2)
      ctx.setLineDash([])
    }
  }
  ctx.globalAlpha = 1
}

function makeCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  return canvas
}

function PaintingCanvas({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const brushRef = useRef<SVGSVGElement>(null)
  const surfaces = useMemo(() => {
    if (typeof document === 'undefined') return null
    return { mask: makeCanvas(), composite: makeCanvas(), art: makeCanvas() }
  }, [])
  const pigment = useRef<string[]>([])
  const imageLoaded = useRef(false)
  const current = useRef(0)
  const target = useRef(0)
  const frame = useRef(0)
  const last = useRef(0)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!surfaces) return
    let alive = true
    const image = new Image()
    image.onload = () => {
      if (!alive) return
      const context = surfaces.art.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(image, 0, 0, W, H)
      const pixels = context.getImageData(0, 0, W, H).data
      pigment.current = strokes.map(mark => {
        const x = Math.max(0, Math.min(W - 1, Math.round(mark.x + mark.dx * .55)))
        const y = Math.max(0, Math.min(H - 1, Math.round(mark.y)))
        const k = (y * W + x) * 4
        return 'rgb(' + pixels[k] + ',' + pixels[k + 1] + ',' + pixels[k + 2] + ')'
      })
      imageLoaded.current = true
      setReady(true)
    }
    image.onerror = () => { if (alive) setFailed(true) }
    image.src = import.meta.env.BASE_URL + 'starry-night.webp'
    return () => { alive = false }
  }, [surfaces])

  useEffect(() => {
    target.current = reducedMotion ? 1 : clamp((progress - .015) / .945)
    if (!ready || !surfaces || !canvasRef.current) return
    if (frame.current) return

    const animate = (time: number) => {
      frame.current = 0
      const dt = last.current ? Math.min(48, time - last.current) : 16
      last.current = time
      // Frame-rate-independent easing: scroll stays reversible without jitter.
      const factor = reducedMotion ? 1 : 1 - Math.exp(-dt / 66)
      current.current += (target.current - current.current) * factor
      if (Math.abs(target.current - current.current) < .0007) current.current = target.current
      if (imageLoaded.current) {
        renderPainting(canvasRef.current!, surfaces.mask, surfaces.composite, surfaces.art, pigment.current, current.current)
      }
      const tip = strokeTip(current.current)
      const brush = brushRef.current
      if (brush) {
        brush.style.left = (tip.x / W * 100) + '%'
        brush.style.top = (tip.y / H * 100) + '%'
        brush.style.setProperty('--brush-tilt', (Math.sin(tip.angle * Math.PI / 180) * 6 - 8).toFixed(2) + 'deg')
        brush.style.opacity = String(reducedMotion ? 0 : clamp(Math.min(current.current * 30, (1 - current.current) * 9)))
      }
      if (current.current !== target.current) frame.current = requestAnimationFrame(animate)
      else last.current = 0
    }
    frame.current = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(frame.current); frame.current = 0; last.current = 0 }
  }, [progress, reducedMotion, ready, surfaces])

  return <figure className="painter-viewport">
    <div className="painter-surface">
      <div className="painter-surface-grain" aria-hidden="true" />
      <canvas ref={canvasRef} className="painter-canvas" width={W} height={H}
        role="img" aria-label="Nét cọ sơn dầu dần vẽ Đêm đầy sao theo vị trí cuộn" />
      {failed && <p className="paint-load-fallback">Không tải được tranh. <a href="https://commons.wikimedia.org/wiki/File:VanGogh-starry_night.jpg">Xem bản gốc</a></p>}
      <svg ref={brushRef} className="painter-brush" viewBox="0 0 170 225" aria-hidden="true">
        <defs>
          <linearGradient id="brush-handle-wood" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c58e59"/><stop offset=".42" stopColor="#e3bc8e"/><stop offset="1" stopColor="#895a40"/></linearGradient>
          <linearGradient id="brush-ferrule" x1="0" y1="0" x2="1" y2=".4"><stop stopColor="#fffaf4"/><stop offset=".4" stopColor="#9297aa"/><stop offset=".73" stopColor="#eef0ee"/><stop offset="1" stopColor="#7e829c"/></linearGradient>
        </defs>
        <path d="M68 4Q80 -5 92 5L87 157L74 157Z" fill="url(#brush-handle-wood)" stroke="#9f7457" strokeWidth="1.5"/>
        <path d="M72 45L88 44" stroke="#f9e2c0" strokeOpacity=".6" strokeWidth="2"/>
        <path d="M70 153L90 153L93 185Q80 192 67 184Z" fill="url(#brush-ferrule)" stroke="#8e8c96" strokeWidth="1.5"/>
        <path d="M69 168L91 168M70 177L91 177" stroke="#fefbfa" strokeOpacity=".54"/>
        <path d="M68 184Q69 201 80 221Q92 203 93 185Z" fill="#e6d6b7" stroke="#9c8c7b" strokeWidth="1.2"/>
        <path d="M74 206Q78 219 80 221Q88 209 88 204Q81 213 74 206Z" fill="#4264ab"/>
        <path d="M75 188L79 214M81 190L81 219M87 188L84 210" fill="none" stroke="#9a8b77" strokeOpacity=".5"/>
      </svg>
    </div>
    <figcaption className="painter-caption"><span className="painter-caption-dot"/> THE STARRY NIGHT · VINCENT VAN GOGH · 1889</figcaption>
  </figure>
}

const chapters = [
  { label:'01 / KHỞI NGUỒN', headline:<>Một khoảng trắng. <em>Vô vàn ý tưởng.</em></>, desc:'Cũng như một bức tranh bắt đầu từ tấm toan, hành trình sáng tạo bắt đầu từ trí tò mò.' },
  { label:'02 / NÉT CỌ', headline:<>Mỗi nét vẽ đem <em>cảm hứng thành hình.</em></>, desc:'Từng dải sơn dầu, nét cọ chồng lên nhau và những sắc màu bất ngờ dần kể nên một câu chuyện.' },
  { label:'03 / TÁC PHẨM', headline:<>Biến cảm hứng thành <em>một thế giới rực rỡ.</em></>, desc:'Một tác phẩm được hình thành từng nét — như những ý tưởng số mà chúng ta có thể cùng nhau tạo ra.' },
]
export default function PaintingAboutVisual() {
  const { sectionRef, progress, reducedMotion } = useScrollScene()
  const step = progress < .28 ? 0 : progress < .72 ? 1 : 2
  return <section ref={sectionRef} className={'motion-chapter painting-story' + (reducedMotion ? ' motion-reduced' : '')} aria-label="Cọ sơn dầu vẽ trực tiếp trên nền theo cuộn trang">
    <div className="motion-sticky painting-stage">
      <div className="motion-topline"><span><Paintbrush size={15}/> DIGITAL CREATORS / ART IN MOTION</span><span>OIL PAINTING <ArrowDown size={14}/></span></div>
      <div className="motion-copy">
        {chapters.map((item, i) => <div key={item.label} className={'motion-copy-panel' + (step===i ? ' selected' : '')}
            aria-hidden={!reducedMotion && step!==i}>
          <span className="motion-tag"><Brush size={15}/>{item.label}</span><h2>{item.headline}</h2><p>{item.desc}</p>
          {i===2 && <Link to="/dang-ky" className="motion-cta" tabIndex={reducedMotion || step===i ? 0 : -1}>Khám phá cùng CLB <ArrowUpRight size={17}/></Link>}
        </div>)}
      </div>
      <div className="motion-visual painting-visual"><PaintingCanvas progress={progress} reducedMotion={reducedMotion}/></div>
      <button type="button" className="motion-skip" onClick={() => sectionRef.current?.nextElementSibling?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block:'start' })}>BỎ QUA HIỆU ỨNG ↗</button>
      <div className="motion-footer"><span>IMAGINE / PAINT / CREATE</span><div className="motion-progress"><i style={{ width: progress*100+'%' }}/></div><strong>0{step+1} / 03</strong></div>
    </div>
  </section>
}