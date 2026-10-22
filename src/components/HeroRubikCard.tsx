import { useRef, type PointerEvent } from 'react'
import { Code2, MousePointer2, Palette, Sparkles } from 'lucide-react'

const faceColors = [
  ['#b49aff','#7ae2d7','#f5b0cf','#9dc8ff','#dcb7f9','#ffbf9b','#ecd979','#8eddb9','#f0a4cf'],
  ['#76d9f0','#9cb4f9','#8fcda9','#edb9e6','#9fd7d7','#bac0f7','#eec58f','#bd9fdb','#77d8cb'],
  ['#e0b9f6','#9fe1d3','#f6c0aa','#eccee5','#9bd6f3','#c1afe8','#a3dbc7','#ecd99d','#e2b7f5'],
]
function CubeFace({ index }: { index: number }) {
  return <div className={'hero-cube-face hero-cube-face-' + index}>
    {faceColors[index].map((color,i)=><span key={i} className="hero-cube-sticker" style={{background:color}}/>)}
  </div>
}
export default function HeroRubikCard() {
  const container = useRef<HTMLDivElement>(null)
  const reset = () => {
    if (!container.current) return
    container.current.style.setProperty('--mouse-x','0')
    container.current.style.setProperty('--mouse-y','0')
  }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const box = event.currentTarget.getBoundingClientRect()
    const x = Math.max(-1,Math.min(1,(event.clientX-box.left)/box.width*2-1))
    const y = Math.max(-1,Math.min(1,(event.clientY-box.top)/box.height*2-1))
    if (!container.current) return
    container.current.style.setProperty('--mouse-x',x.toFixed(3))
    container.current.style.setProperty('--mouse-y',y.toFixed(3))
  }
  return <div ref={container} className="scene-wrap teaser-scene hero3d" onPointerMove={move} onPointerLeave={reset} aria-label="Thẻ không gian sáng tạo nổi 3D, có khối Rubik và các nhãn xoay theo con trỏ">
    <div className="scene-blob scene-blob-a"/><div className="scene-blob scene-blob-b"/>
    <div className="hero3d-floating-stage">
      <div className="hero3d-card">
        <div className="teaser-windowbar"><span/><span/><span/><small>digital-creators / lab-01</small></div>
        <div className="hero3d-head"><span>CREATIVE LOGIC</span><strong>THINK<br/>BEYOND.</strong></div>
        <div className="hero3d-cube-position">
          <div className="hero3d-cube">
            <CubeFace index={0}/><CubeFace index={1}/><CubeFace index={2}/>
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
