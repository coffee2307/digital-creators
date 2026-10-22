import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Brush, Paintbrush, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollScene } from '../hooks/useScrollScene'

const W = 960
const H = 768
const rows = 20
const cols = 12
const total = rows * cols
const clamp = (n: number) => Math.min(1, Math.max(0, n))
const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t) }
const seeded = (n: number) => {
  const x = Math.sin(n * 94.37 + 73.91) * 43758.5453
  return x - Math.floor(x)
}
type Mark = { x: number; y: number; length: number; drift: number; width: number; reverse: boolean }
const marks: Mark[] = Array.from({ length: total }, (_, i) => {
  const row = Math.floor(i / cols)
  const col = i % cols
  const reverse = row % 2 === 1
  const x = 8 + (reverse ? (cols - 1 - col) : col) * 79 + (seeded(i + 8) - .5) * 17
  const y = 17 + row * 39 + (seeded(i + 27) - .5) * 15
  return { x, y, length: 85 + seeded(i + 99) * 34, drift: (seeded(i + 119) - .5) * 20, width: 42 + seeded(i + 19) * 17, reverse }
})
function tipAt(p: number) {
  const f = clamp(p) * total
  const index = Math.min(total - 1, Math.floor(f))
  const m = marks[index]
  const t = f >= total ? 1 : f - index
  const x = m.reverse ? m.x + m.length * (1 - t) : m.x + m.length * t
  return { x: Math.max(18, Math.min(W - 20, x)), y: m.y + m.drift * Math.sin(t * Math.PI) }
}

function paintFrame(ctx: CanvasRenderingContext2D, mask: HTMLCanvasElement, image: HTMLImageElement | null, amount: number) {
  const p = clamp(amount)
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f8f4eb'
  ctx.fillRect(0, 0, W, H)
  if (!image || p <= 0) return
  if (p >= .997) {
    ctx.drawImage(image, 0, 0, W, H)
    return
  }
  const mctx = mask.getContext('2d')
  if (!mctx) return
  mctx.clearRect(0, 0, W, H)
  mctx.strokeStyle = '#fff'
  mctx.lineCap = 'round'
  mctx.lineJoin = 'round'
  const count = p * total
  for (let i = 0; i < Math.ceil(count); i++) {
    const m = marks[i]
    const frac = clamp(count - i)
    const a = m.reverse ? m.x + m.length : m.x
    const b = m.reverse ? m.x : m.x + m.length
    const x = a + (b - a) * frac
    mctx.lineWidth = m.width
    mctx.globalAlpha = 1
    mctx.beginPath()
    mctx.moveTo(a, m.y)
    mctx.quadraticCurveTo(a + (x-a)*.53, m.y + m.drift * 1.55, x, m.y + Math.sin(frac * Math.PI)*m.drift)
    mctx.stroke()
    // Slight bristle variation around each oil-paint ribbon.
    mctx.lineWidth = m.width * .23
    mctx.globalAlpha = .72
    mctx.beginPath()
    mctx.moveTo(a, m.y - m.width * .48)
    mctx.quadraticCurveTo((a+x)/2, m.y + m.drift - m.width*.47, x, m.y - m.width * .48)
    mctx.stroke()
  }
  mctx.globalAlpha = 1
  const painted = document.createElement('canvas')
  painted.width = W
  painted.height = H
  const pctx = painted.getContext('2d')
  if (!pctx) return
  pctx.drawImage(image, 0, 0, W, H)
  pctx.globalCompositeOperation = 'destination-in'
  pctx.drawImage(mask, 0, 0)
  ctx.drawImage(painted, 0, 0)
}

function PaintingCanvas({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const mask = useMemo(() => {
    if (typeof document === 'undefined') return null
    const element = document.createElement('canvas')
    element.width = W
    element.height = H
    return element
  }, [])
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [failed, setFailed] = useState(false)
  const amount = reducedMotion ? 1 : ease((progress - .025) / .90)

  useEffect(() => {
    let alive = true
    const img = new Image()
    img.onload = () => { if (alive) setImage(img) }
    img.onerror = () => { if (alive) setFailed(true) }
    img.src = import.meta.env.BASE_URL + 'starry-night.webp'
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d', { alpha: false })
    if (!ctx || !mask) return
    paintFrame(ctx, mask, image, amount)
  }, [image, amount, mask])
  const tip = tipAt(amount)
  return <div className="painter-viewport">
    <div className="painter-frame">
      <div className="painter-canvas-wrap">
        <canvas ref={canvas} width={W} height={H} className="painter-canvas" aria-label="Bức Đêm đầy sao của Vincent van Gogh hiện dần qua nét cọ theo cuộn trang" role="img" />
        {failed && <div className="paint-load-fallback">Không thể tải ảnh tác phẩm. <a href="https://commons.wikimedia.org/wiki/File:VanGogh-starry_night.jpg">Xem ảnh gốc</a></div>}
      </div>
      <div className="paint-frame-badge"><span>THE STARRY NIGHT</span><small>VINCENT VAN GOGH — 1889</small></div>
    </div>
    <svg className={'painter-brush' + (reducedMotion ? ' painter-brush-rest' : '')} style={{left: (tip.x / W * 100) + '%',top: (tip.y / H * 100) + '%'}} viewBox="0 0 170 225" role="img" aria-label="Cây cọ vẽ màu dầu">
      <defs>
        <linearGradient id="brush-handle-wood" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#cd9867"/><stop offset=".42" stopColor="#eac6a2"/><stop offset="1" stopColor="#86563e"/></linearGradient>
        <linearGradient id="brush-ferrule" x1="0" y1="0" x2="1" y2=".4"><stop stopColor="#fdf6ed"/><stop offset=".4" stopColor="#9a9db1"/><stop offset=".73" stopColor="#e2e3ed"/><stop offset="1" stopColor="#757d98"/></linearGradient>
      </defs>
      <g transform="rotate(-38 79 163)">
        <path d="M69 6Q81 -3 91 7L87 157L74 157Z" fill="url(#brush-handle-wood)" stroke="#a57755" strokeWidth="1.4"/>
        <path d="M74 38L87 37" stroke="#fff4dd" strokeOpacity=".5" strokeWidth="2"/>
        <path d="M70 150L90 150L92 181Q81 187 68 181Z" fill="url(#brush-ferrule)" stroke="#b0acb3" strokeWidth="1.8"/>
        <path d="M69 163L91 163M70 170L91 170" stroke="#fff" strokeOpacity=".47"/>
        <path d="M68 180Q66 195 73 207Q77 216 80 222Q93 206 94 181Z" fill="#e8d8b7" stroke="#998c82" strokeWidth="1.3"/>
        <path d="M74 203Q77 219 80 222Q87 209 90 202Q84 209 74 203Z" fill="#3155a2"/>
        <path d="M75 183L77 208M81 185L82 216M88 185L85 207" stroke="#a29788" strokeWidth="1" opacity=".5"/>
      </g>
    </svg>
    <div className="painter-caption"><span className="painter-caption-dot"/> OIL ON CANVAS / LIVE BRUSHSTROKES</div>
  </div>
}
const content = [
  {label:'01 / KHỞI NGUỒN', headline:<>Một khoảng trắng. <em>Vô vàn ý tưởng.</em></>,desc:'Cũng như một bức tranh bắt đầu từ tấm toan, hành trình sáng tạo bắt đầu từ trí tò mò.'},
  {label:'02 / NÉT CỌ', headline:<>Mỗi nét vẽ đem <em>cảm hứng thành hình.</em></>,desc:'Cuộn tiếp để cây cọ lần lượt đưa những xoáy trời xanh, ánh sao vàng và sắc màu sơn dầu vào bức tranh.'},
  {label:'03 / TÁC PHẨM', headline:<>Từ cảm hứng đến <em>một thế giới rực rỡ.</em></>,desc:'Một tác phẩm được hình thành từng nét — cũng như những ý tưởng số mà chúng ta có thể cùng nhau tạo ra.'}
]
export default function PaintingAboutVisual() {
  const {sectionRef, progress, reducedMotion} = useScrollScene()
  const step = progress < .28 ? 0 : progress < .72 ? 1 : 2
  return <section ref={sectionRef} className={'motion-chapter painting-story' + (reducedMotion ? ' motion-reduced' : '')} aria-label="Bức tranh Đêm đầy sao được vẽ theo chuyển động cuộn">
    <div className="motion-sticky painting-stage">
      <div className="motion-topline"><span><Paintbrush size={15}/> DIGITAL CREATORS / ART IN MOTION</span><span>OIL PAINTING <ArrowDown size={14}/></span></div>
      <div className="motion-copy">
        {content.map((item,i)=><div key={item.label} className={'motion-copy-panel' + (step===i?' selected':'')} aria-hidden={!reducedMotion && step!==i}>
          <span className="motion-tag"><Brush size={15}/>{item.label}</span><h2>{item.headline}</h2><p>{item.desc}</p>
          {i===2 && <Link to="/dang-ky" className="motion-cta" tabIndex={reducedMotion||step===i?0:-1}>Khám phá cùng CLB <ArrowUpRight size={17}/></Link>}
        </div>)}
      </div>
      <div className="motion-visual painting-visual"><PaintingCanvas progress={progress} reducedMotion={reducedMotion}/></div>
      <button type="button" className="motion-skip" onClick={()=>sectionRef.current?.nextElementSibling?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'})}>BỎ QUA HIỆU ỨNG ↗</button>
      <div className="motion-footer"><span>IMAGINE / PAINT / CREATE</span><div className="motion-progress"><i style={{width:progress*100+'%'}}/></div><strong>0{step+1} / 03</strong></div>
    </div>
  </section>
}
