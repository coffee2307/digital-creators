import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUpRight, Brush, Paintbrush } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollScene } from '../hooks/useScrollScene'
import MobilePaintingCanvas from './MobilePaintingCanvas'

const chapters = [
  { label: '01 / KHỞI NGUỒN', headline: <>Một khoảng trắng. <em>Vô vàn ý tưởng.</em></>,
    desc: 'Cũng như một bức tranh bắt đầu từ tấm toan, hành trình sáng tạo bắt đầu từ trí tò mò.' },
  { label: '02 / NÉT CỌ', headline: <>Mỗi nét vẽ đem <em>cảm hứng thành hình.</em></>,
    desc: 'Từng dải sơn dầu, nét cọ chồng lên nhau và những sắc màu bất ngờ dần kể nên một câu chuyện.' },
  { label: '03 / TÁC PHẨM', headline: <>Biến cảm hứng thành <em>một thế giới rực rỡ.</em></>,
    desc: 'Một tác phẩm được hình thành từng nét — như những ý tưởng số mà chúng ta có thể cùng nhau tạo ra.' },
]

/** Both breakpoints share one synchronous paint/brush scroll clock.
 * Only resolution and CSS layout change at the 760px breakpoint. */
export default function PaintingAboutVisual() {
  const { sectionRef, progress, reducedMotion } = useScrollScene()
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
  )
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const step = progress < .28 ? 0 : progress < .72 ? 1 : 2
  return <section ref={sectionRef}
    className={'motion-chapter painting-story' + (reducedMotion ? ' motion-reduced' : '')}
    aria-label="Cọ sơn dầu vẽ từ trên xuống dưới, đồng bộ theo cuộn trang">
    <div className="motion-sticky painting-stage">
      <div className="motion-topline">
        <span><Paintbrush size={15}/> DIGITAL CREATORS / ART IN MOTION</span>
        <span>OIL PAINTING <ArrowDown size={14}/></span>
      </div>
      <div className="motion-copy">
        {chapters.map((item, i) => <div key={item.label}
          className={'motion-copy-panel' + (step === i ? ' selected' : '')}
          aria-hidden={!reducedMotion && step !== i}>
          <span className="motion-tag"><Brush size={15}/>{item.label}</span>
          <h2>{item.headline}</h2><p>{item.desc}</p>
          {i === 2 && <Link to="/dang-ky" className="motion-cta"
            tabIndex={reducedMotion || step === i ? 0 : -1}>
            Khám phá cùng CLB <ArrowUpRight size={17}/>
          </Link>}
        </div>)}
      </div>
      <div className="motion-visual painting-visual">
        <MobilePaintingCanvas progress={progress} reducedMotion={reducedMotion} mobile={mobile}/>
      </div>
      <button type="button" className="motion-skip"
        onClick={() => sectionRef.current?.nextElementSibling?.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth', block: 'start',
        })}>
        BỎ QUA HIỆU ỨNG ↗
      </button>
      <div className="motion-footer">
        <span>IMAGINE / PAINT / CREATE</span>
        <div className="motion-progress"><i style={{ width: progress * 100 + '%' }}/></div>
        <strong>0{step + 1} / 03</strong>
      </div>
    </div>
  </section>
}
