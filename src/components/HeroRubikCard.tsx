import { useRef, type PointerEvent } from 'react'
import { Code2, MousePointer2, Palette, Sparkles } from 'lucide-react'

type Side = 'front' | 'right' | 'top' | 'left' | 'back' | 'bottom'
const palette: Record<Side, string[]> = {
  front: ['#b7a0ff', '#77e2db', '#f4b1d0', '#95c4fd', '#dfb7f4', '#ffc19c', '#ecda78', '#8be0bb', '#eda4d2'],
  right: ['#ffd0a9', '#f0afd4', '#b8a9ff', '#ffdc87', '#a9e7d4', '#d9c3fc', '#f2b5a3', '#c3e2a0', '#9bc9ff'],
  top: ['#edc7f8', '#9be8df', '#ffd5b1', '#b6efdf', '#ffeb9a', '#d5c2ff', '#f5b9d7', '#a4d8ff', '#f3d1fc'],
  left: Array(9).fill('#ccb4ed'),
  back: Array(9).fill('#a4dbc9'),
  bottom: Array(9).fill('#f2c6a7'),
}

function CubeFace({ side }: { side: Side }) {
  return <div className={'hero-cube-face hero-cube-face-' + side} aria-hidden="true">
    {palette[side].map((color, index) =>
      <span className="hero-cube-sticker" key={index} style={{ backgroundColor: color }} />)}
  </div>
}

/** Six physically consistent sides: no disappearing or flattened right face. */
export default function HeroRubikCard() {
  const stage = useRef<HTMLDivElement>(null)
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
    stage.current?.style.setProperty('--mouse-x', String(x))
    stage.current?.style.setProperty('--mouse-y', String(y))
  }
  const reset = () => {
    stage.current?.style.setProperty('--mouse-x', '0')
    stage.current?.style.setProperty('--mouse-y', '0')
  }

  return <div ref={stage} className="scene-wrap teaser-scene hero3d" onPointerMove={move}
      onPointerLeave={reset} aria-label="Rubik nổi ba chiều có thể thay đổi góc nhìn bằng chuột">
    <div className="scene-blob scene-blob-a"/><div className="scene-blob scene-blob-b"/>
    <div className="hero3d-floating-stage">
      <div className="hero3d-card">
        <div className="teaser-windowbar"><span/><span/><span/><small>digital-creators / lab-01</small></div>
        <div className="hero3d-head"><span>CREATIVE LOGIC</span><strong>THINK<br/>BEYOND.</strong></div>
        <div className="hero3d-cube-position">
          <div className="hero3d-cube" aria-hidden="true">
            <CubeFace side="front"/><CubeFace side="right"/><CubeFace side="top"/>
            <CubeFace side="left"/><CubeFace side="back"/><CubeFace side="bottom"/>
          </div>
          <div className="hero3d-floor-shadow"/>
        </div>
        <div className="hero3d-footer"><span>03 × 03 / EXPLORE</span><span>PLAY WITH IDEAS <Sparkles size={14}/></span></div>
        <div className="hero3d-glare"/>
      </div>
    </div>
    <span className="scene-chip chip-one"><Palette size={17}/> DESIGN</span>
    <span className="scene-chip chip-two"><Code2 size={17}/> CODE</span>
    <span className="scene-chip chip-three"><Sparkles size={17}/> CREATE</span>
    <span className="scene-help"><MousePointer2 size={15}/> Di chuyển chuột để khám phá chiều sâu 3D</span>
  </div>
}