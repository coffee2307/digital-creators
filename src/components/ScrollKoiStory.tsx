import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

type Keyframe = { at: number; x: number; y: number; rotation: number; scale: number; yaw: number }
const path: Keyframe[] = [
  { at: 0, x: .12, y: .16, rotation: -12, scale: .75, yaw: 0 },
  { at: .17, x: .25, y: -.01, rotation: -7, scale: 1.02, yaw: 0 },
  { at: .33, x: .34, y: -.14, rotation: -17, scale: 1.15, yaw: 0 },
  { at: .43, x: .33, y: .04, rotation: 9, scale: 1.03, yaw: 180 },
  { at: .62, x: -.23, y: .16, rotation: 5, scale: .98, yaw: 180 },
  { at: .73, x: -.38, y: -.08, rotation: -12, scale: .87, yaw: 360 },
  { at: .88, x: .22, y: -.02, rotation: -9, scale: 1.07, yaw: 360 },
  { at: 1, x: .4, y: -.26, rotation: -22, scale: .65, yaw: 360 },
]

const chapters = [
  {
    index: '01',
    kicker: 'EVERYTHING STARTS WITH A SPARK',
    title: <>Mọi ý tưởng đều có một <em>điểm bắt đầu.</em></>,
    description: 'Tò mò chính là bước đầu tiên. Một câu hỏi, một nét vẽ hoặc một dòng mã đều có thể mở ra thế giới mới.',
    note: 'KHÁM PHÁ',
  },
  {
    index: '02',
    kicker: 'LET YOUR IDEAS FLOW',
    title: <>Không chỉ tưởng tượng. <em>Hãy thử tạo ra.</em></>,
    description: 'Từ thiết kế, video đến lập trình: cứ thử, sai, chỉnh sửa và tiếp tục. Ý tưởng trở nên sống động khi được thực hành.',
    note: 'SÁNG TẠO',
  },
  {
    index: '03',
    kicker: 'BETTER WHEN WE CREATE TOGETHER',
    title: <>Những góc nhìn khác nhau tạo nên <em>điều đặc biệt.</em></>,
    description: 'Cùng chia sẻ và phát triển ý tưởng. Mỗi người một thế mạnh, cùng học hỏi để tiến xa hơn.',
    note: 'KẾT NỐI',
  },
  {
    index: '04',
    kicker: 'THE NEXT CHAPTER IS YOURS',
    title: <>Một thế giới mới đang chờ <em>bạn khám phá.</em></>,
    description: 'Digital Creators là một lời mời mở: hãy mang theo sự tò mò và trở thành một phần của hành trình sáng tạo.',
    note: 'PHÁT TRIỂN',
  },
]
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
function interpolate(a: number, b: number, progress: number) { return a + (b - a) * progress }
function sample(progress: number) {
  let i = 0
  while (i < path.length - 2 && progress > path[i+1].at) i++
  const left = path[i], right = path[i+1]
  const t = clamp((progress - left.at) / (right.at - left.at), 0, 1)
  const eased = t * t * (3 - 2 * t)
  return {
    x: interpolate(left.x, right.x, eased),
    y: interpolate(left.y, right.y, eased),
    rotation: interpolate(left.rotation, right.rotation, eased),
    scale: interpolate(left.scale, right.scale, eased),
    yaw: interpolate(left.yaw, right.yaw, eased),
  }
}

/** Bespoke SVG/2.5D character. No third-party imagery or models are used. */
function KoiIllustration() {
  return <svg className="koi-art" viewBox="0 0 640 380" aria-hidden="true">
    <defs>
      <linearGradient id="koi-body" x1=".1" y1=".1" x2=".8" y2="1"><stop offset="0%" stopColor="#fffdfb"/><stop offset="32%" stopColor="#f6f4f1"/><stop offset="65%" stopColor="#d6e7e8"/><stop offset="100%" stopColor="#9bbfc5"/></linearGradient>
      <radialGradient id="koi-lustre" cx=".43" cy=".2" r=".76"><stop offset="0%" stopColor="#ffffff" stopOpacity=".98"/><stop offset="48%" stopColor="#ffffff" stopOpacity=".15"/><stop offset="100%" stopColor="#7b9ea9" stopOpacity=".20"/></radialGradient>
      <linearGradient id="koi-coral" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#ffe6cb"/><stop offset=".3" stopColor="#f4a98f"/><stop offset=".75" stopColor="#e88983"/><stop offset="1" stopColor="#d87579"/></linearGradient>
      <linearGradient id="koi-tail" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a8b8d0"/><stop offset=".47" stopColor="#e2b3b5"/><stop offset="1" stopColor="#f5c1a5"/></linearGradient>
      <linearGradient id="koi-fins" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e6a8b1"/><stop offset="1" stopColor="#a1aacb"/></linearGradient>
      <radialGradient id="koi-eye"><stop stopColor="#475260"/><stop offset=".72" stopColor="#263441"/><stop offset="1" stopColor="#111b2c"/></radialGradient>
      <filter id="koi-shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
      <filter id="koi-soft-light"><feGaussianBlur stdDeviation="2.5"/></filter>
      <clipPath id="koi-body-mask"><path d="M151 192C204 134 303 105 409 122C472 132 519 153 529 182C543 214 480 252 405 264C293 285 201 252 151 192Z"/></clipPath>
    </defs>
    <ellipse cx="322" cy="321" rx="193" ry="20" fill="#9488b9" opacity=".13" filter="url(#koi-shadow)"/>
    <g className="koi-tail">
      <path d="M167 187C124 133 96 75 56 66C65 107 90 152 113 189C87 229 72 281 67 321C117 306 145 253 172 206Z" fill="url(#koi-tail)" stroke="#ad95ab" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M165 189Q106 116 64 71M163 197Q102 269 73 315M154 188Q101 188 83 193" stroke="#fff3e9" strokeOpacity=".65" strokeWidth="4" fill="none"/>
      <path d="M167 192C130 148 103 119 74 106M166 195C120 224 101 268 85 294" stroke="#936e9e" strokeOpacity=".3" strokeWidth="2.5" fill="none"/>
    </g>
    <g className="koi-fin-top">
      <path d="M252 144C252 119 283 65 324 58C344 78 351 116 342 143Z" fill="url(#koi-fins)" stroke="#b4a0c4" strokeWidth="3"/>
      <path d="M264 131Q288 91 318 64M291 132Q312 89 324 70M322 135Q328 96 328 77" fill="none" stroke="#fff7ef" strokeOpacity=".6" strokeWidth="3"/>
    </g>
    <g className="koi-fin-bottom">
      <path d="M298 253C277 283 294 326 335 341C365 313 376 269 359 239Z" fill="url(#koi-fins)" stroke="#b7a0bd" strokeWidth="3"/>
      <path d="M322 262Q314 297 332 330M345 255Q355 291 340 332" fill="none" stroke="#fef9f5" strokeOpacity=".7" strokeWidth="3"/>
    </g>
    <path d="M151 192C204 134 303 105 409 122C472 132 519 153 529 182C543 214 480 252 405 264C293 285 201 252 151 192Z" fill="url(#koi-body)" stroke="#91a7b8" strokeOpacity=".45" strokeWidth="3"/>
    <g clipPath="url(#koi-body-mask)">
      <path d="M185 164C212 129 248 129 283 142C308 160 308 196 287 213C251 236 218 216 208 201Z" fill="url(#koi-coral)" opacity=".91"/>
      <path d="M309 131C336 104 374 99 404 118C435 134 446 160 422 174C402 191 373 177 345 178C321 173 296 156 309 131Z" fill="url(#koi-coral)" opacity=".94"/>
      <path d="M429 224C448 203 477 201 497 221L478 267 420 278Z" fill="url(#koi-coral)" opacity=".74"/>
      <path d="M151 192C204 134 303 105 409 122C472 132 519 153 529 182C543 214 480 252 405 264C293 285 201 252 151 192Z" fill="url(#koi-lustre)"/>
      <path d="M189 170Q275 117 371 130Q432 136 474 158" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="15" filter="url(#koi-soft-light)"/>
      <g fill="none" stroke="#8a9fb2" strokeOpacity=".18" strokeWidth="2">
        <path d="M210 198q15 14 30 0m-20 25q15 14 30 0m4-48q15 14 30 0m-24 30q15 14 30 0m-24 26q15 14 30 0m10-63q15 14 30 0m-26 33q15 14 30 0m-26 30q15 14 30 0m6-57q15 14 30 0m-24 27q15 14 30 0m-20 26q15 14 30 0"/>
      </g>
      <path d="M159 194Q193 226 240 239Q334 277 439 242" fill="none" stroke="#698aa8" strokeOpacity=".22" strokeWidth="7"/>
    </g>
    <g className="koi-fin-side">
      <path d="M384 212C354 219 338 262 350 311C389 294 424 263 430 230C428 218 412 210 384 212Z" fill="url(#koi-fins)" fillOpacity=".91" stroke="#baa0ba" strokeWidth="3"/>
      <path d="M398 224Q385 255 358 301M413 229Q395 267 366 298" stroke="#fff8f2" opacity=".7" strokeWidth="3" fill="none"/>
    </g>
    <path d="M469 149Q449 179 467 211" fill="none" stroke="#a1aebb" strokeWidth="2" opacity=".55"/>
    <ellipse cx="482" cy="171" rx="17" ry="18" fill="#faf8f3" stroke="#b1b8bb" strokeWidth="2.5"/>
    <circle cx="486" cy="169" r="11" fill="url(#koi-eye)"/>
    <circle cx="489" cy="165" r="4.1" fill="#fff"/>
    <circle cx="481" cy="174" r="2" fill="#c9d8e3"/>
    <path d="M514 197Q523 201 532 192" stroke="#a77b86" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M520 192Q542 181 550 189Q550 202 527 205" fill="url(#koi-coral)" stroke="#d58d8e" strokeWidth="2.5"/>
    <path d="M520 202Q536 215 548 216" stroke="#d2a29e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M491 216q20 9 30 1" stroke="#b29fa3" strokeWidth="2" strokeOpacity=".7" fill="none"/>
    <circle cx="207" cy="177" r="4" fill="#fff8f3" opacity=".8"/><circle cx="247" cy="141" r="5" fill="#fff" opacity=".63"/><circle cx="384" cy="147" r="6" fill="#fff" opacity=".5"/>
  </svg>
}

export default function ScrollKoiStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const activeRef = useRef(0)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage || reduced) return
    let frame = 0
    let desired = 0
    let current = 0
    let previous = 0
    let ticking = false
    stage.dataset.chapter = '0'
    const paint = () => {
      current += (desired - current) * .55
      if (Math.abs(current - desired) < .00012) current = desired
      const sampled = sample(current)
      const vw = window.innerWidth
      const vh = window.innerHeight
      stage.style.setProperty('--koi-x', `${sampled.x * vw}px`)
      stage.style.setProperty('--koi-y', `${sampled.y * vh}px`)
      stage.style.setProperty('--koi-angle', `${sampled.rotation}deg`)
      stage.style.setProperty('--koi-scale', String(sampled.scale))
      stage.style.setProperty('--koi-yaw', `${sampled.yaw}deg`)
      stage.style.setProperty('--koi-progress', String(current))
      const velocity = Math.abs(current - previous)
      stage.style.setProperty('--tail-angle', `${Math.sin(current * 37) * (8 + Math.min(20, velocity * 1400))}deg`)
      previous = current
      const next = current < .255 ? 0 : current < .50 ? 1 : current < .755 ? 2 : 3
      if (next !== activeRef.current) {
        activeRef.current = next
        stage.dataset.chapter = String(next)
        setActive(next)
      }
      if (Math.abs(current - desired) > .00012) frame = window.requestAnimationFrame(paint)
      else ticking = false
    }
    const update = () => {
      const rect = section.getBoundingClientRect()
      desired = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight), 0, 1)
      if (!ticking) {
        ticking = true
        frame = window.requestAnimationFrame(paint)
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.cancelAnimationFrame(frame)
    }
  }, [reduced])

  return <section className={'koi-story' + (reduced ? ' koi-reduced' : '')} ref={sectionRef} aria-label="Hành trình sáng tạo cùng linh vật cá chép">
    <div className="koi-stage" ref={stageRef}>
      <div className="koi-grain"/>
      <div className="koi-halo koi-halo-one"/><div className="koi-halo koi-halo-two"/>
      <div className="koi-masthead"><span><Sparkles size={15}/> DIGITAL CREATORS / MOTION STORY</span><span>SCROLL-DRIVEN EXPERIENCE <ArrowDown size={14}/></span></div>
      <span className="koi-outline-text" aria-hidden="true">IMAGINE<br/>BEYOND</span>
      <div className="koi-decoration koi-decoration-code" aria-hidden="true"><span>const idea =</span><strong>'anything'</strong><span>;</span></div>
      <div className="koi-decoration koi-decoration-orbit" aria-hidden="true">✳</div>
      <div className="koi-ring koi-ring-a"/><div className="koi-ring koi-ring-b"/>
      <div className="koi-bubbles" aria-hidden="true">{Array.from({length: 13}, (_, i) => <i key={i} style={{ '--bubble-i': i } as React.CSSProperties}/>)}</div>
      <div className="koi-swimmer"><div className="koi-swimmer-face"><KoiIllustration/></div></div>
      <div className="koi-content" aria-live="off">
        {chapters.map((chapter, index) => <div key={chapter.index} className={'koi-chapter'+(active === index?' koi-chapter-active':'')} aria-hidden={active !== index}>
          <span className="koi-kicker"><span>✳</span>{chapter.kicker}</span>
          <h2>{chapter.title}</h2>
          <p>{chapter.description}</p>
          {index === 3 && <Link className="koi-join" to="/dang-ky" tabIndex={active === index ? 0 : -1}>Khám phá hành trình <ArrowUpRight size={17}/></Link>}
        </div>)}
      </div>
      <div className="koi-bottom-rail"><span className="koi-bottom-label">MỘT Ý TƯỞNG, NHIỀU KHẢ NĂNG.</span>
        <div className="koi-progress-track"><div className="koi-progress-fill"/></div>
        <span className="koi-step-index">0{active+1} <b>/ 04</b></span>
        <span className="koi-active-name">{chapters[active].note}</span>
      </div>
      <span className="koi-scroll-hint">CUỘN ĐỂ DẪN LỐI <ArrowDown size={16}/></span>
    </div>
  </section>
}
