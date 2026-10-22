import { ArrowDown, ArrowUpRight, Layers3, Origami, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollScene } from '../hooks/useScrollScene'

const mix=(a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t))
const ease=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x)}
const lerpPoints=(a:number[],b:number[],t:number)=>{
  return a.map((n,i)=>mix(n,b[i],ease(t))).join(' ')
}
const square=[190,90,450,90,450,350,190,350]
const diamond=[320,63,475,218,320,373,165,218]
const kite=[320,75,385,220,320,363,255,220]
const text=[
  {label:'01 / TỜ GIẤY',headline:<>Mỗi ý tưởng bắt đầu từ <em>một trang giấy.</em></>,desc:'Chỉ với một tờ giấy đơn giản, sự tò mò có thể mở ra vô vàn khả năng.'},
  {label:'02 / NẾP GẤP',headline:<>Thử, chỉnh sửa và <em>tạo hình.</em></>,desc:'Mỗi nếp gấp là một lựa chọn. Mỗi lần thử đưa ý tưởng gần hơn với hình hài của nó.'},
  {label:'03 / HÌNH HÀI',headline:<>Để sáng tạo <em>cất cánh.</em></>,desc:'Từ mặt phẳng đến hạc giấy, một ý tưởng nhỏ đã trở thành thứ có thể chạm tới.'}
]
function OrigamiArt({progress}:{progress:number}) {
  const fold1=ease(progress/.34)
  const fold2=ease((progress-.24)/.29)
  const bird=ease((progress-.46)/.35)
  const wing=ease((progress-.65)/.25)
  const flatShape=lerpPoints(square,diamond,fold1)
  const layeredShape=lerpPoints(diamond,kite,fold2)
  return <svg className="origami-art" viewBox="0 0 640 440" role="img" aria-label="Một tờ giấy lần lượt gấp thành hình thoi rồi thành hạc giấy">
    <defs>
      <linearGradient id="fold-paper" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffdfa"/><stop offset=".55" stopColor="#f6f0fc"/><stop offset="1" stopColor="#d6cce9"/></linearGradient>
      <linearGradient id="fold-wing" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffdf9"/><stop offset=".57" stopColor="#e0d8ee"/><stop offset="1" stopColor="#b7cfd0"/></linearGradient>
      <linearGradient id="fold-shadow" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f5ddcb"/><stop offset="1" stopColor="#b8afda"/></linearGradient>
      <filter id="paper-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="17" stdDeviation="14" floodColor="#9682a5" floodOpacity=".18"/></filter>
    </defs>
    <g opacity={1-bird} filter="url(#paper-shadow)">
      <polygon points={flatShape} fill="url(#fold-paper)" stroke="#d8cce0" strokeWidth="2.5" opacity={1-fold2}/>
      <polygon points={layeredShape} fill="#fefbf7" stroke="#d2c3db" strokeWidth="2.5" opacity={fold2}/>
      <g opacity={1-fold2}>
        <path d="M190 90L450 350M450 90L190 350" stroke="#d3c6dd" strokeWidth="1.4" strokeDasharray="7 7" opacity={fold1*.85}/>
        <path d="M320 90L320 350M190 220L450 220" stroke="#d2c6da" strokeWidth="1.4" strokeDasharray="5 8" opacity={fold1}/>
      </g>
      <polygon points={lerpPoints([320,63,475,218,320,373],[320,75,385,220,320,363],fold2)} fill="#ddd2ed" opacity={fold2*.70}/>
      <polygon points={lerpPoints([320,63,165,218,320,373],[320,75,255,220,320,363],fold2)} fill="#e8f1ec" opacity={fold2*.72}/>
      <path d="M320 74L320 365" stroke="#bdb4ce" strokeWidth="2" opacity={fold2}/>
    </g>
    <g opacity={bird} filter="url(#paper-shadow)">
      <path d="M299 242L172 165L219 283L306 278Z" fill="url(#fold-shadow)" stroke="#c2aec4" strokeWidth="2"/>
      <path d="M314 254L376 275L447 190L431 265L372 300L302 289Z" fill="#f3e4e4" stroke="#bfaecb" strokeWidth="2"/>
      <g style={{transformOrigin:'310px 252px',transform:`rotate(${mix(42,-11,wing)}deg)`}}>
        <path d="M310 252L184 71L236 253L318 279Z" fill="url(#fold-wing)" stroke="#bfb2d3" strokeWidth="2"/>
        <path d="M310 252L184 71L256 234Z" fill="#ece4f3"/>
        <path d="M184 71L256 234L236 253" fill="#d5c8e7"/>
        <path d="M310 252L184 71" fill="none" stroke="#b5a9d3" strokeWidth="1.5"/>
      </g>
      <g style={{transformOrigin:'341px 250px',transform:`rotate(${mix(-42,7,wing)}deg)`}}>
        <path d="M338 253L370 52L422 239L351 285Z" fill="#f9f6fa" stroke="#b8bad0" strokeWidth="2"/>
        <path d="M338 253L370 52L378 231Z" fill="#d9e7e4"/>
        <path d="M370 52L422 239L378 231" fill="#f5e0df"/>
        <path d="M338 253L370 52" fill="none" stroke="#bac3d5" strokeWidth="1.5"/>
      </g>
      <path d="M305 265L358 262L337 308L319 321Z" fill="#e6d7ec" stroke="#b6acc8" strokeWidth="2"/>
      <path d="M346 273L421 172L444 148L463 158L440 171L404 248L375 293" fill="#f5f0f7" stroke="#bac4cf" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M444 148L463 158L478 170L455 170Z" fill="#efb7a1"/>
      <path d="M358 272L420 175" stroke="#d1b8cd" strokeWidth="2"/>
      <circle cx="455" cy="162" r="2.8" fill="#77697f"/>
      <path d="M305 276L352 287L323 319Z" fill="#cfc6e5"/>
    </g>
    <g opacity={progress<.15?.7:.25}>
      <path d="M104 86l18 0m-9-9v18M525 336l22 0m-11-11v22" stroke="#cab7da" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="490" cy="100" r="3" fill="#eabdab"/><circle cx="144" cy="337" r="5" fill="#b8d4ca"/>
    </g>
  </svg>
}

export default function OrigamiAboutVisual(){
  const {sectionRef,progress,reducedMotion}=useScrollScene()
  const stage=progress<.30?0:progress<.72?1:2
  return <section ref={sectionRef} className={'motion-chapter origami-story'+(reducedMotion?' motion-reduced':'')} aria-label="Origami hạc giấy gấp theo cuộn trang">
    <div className="motion-sticky origami-stage">
      <div className="motion-topline"><span><Origami size={15}/> DIGITAL CREATORS / ART OF MAKING</span><span>PAPER TO CRANE <ArrowDown size={14}/></span></div>
      <div className="motion-copy">
        {text.map((item,index)=><div key={item.label} className={'motion-copy-panel'+(stage===index?' selected':'')} aria-hidden={!reducedMotion&&index!==stage}>
          <span className="motion-tag"><Sparkles size={15}/>{item.label}</span><h2>{item.headline}</h2><p>{item.desc}</p>
          {index===2 && <Link to="/dang-ky" className="motion-cta" tabIndex={reducedMotion||stage===index?0:-1}>Khám phá khả năng của bạn <ArrowUpRight size={16}/></Link>}
        </div>)}
      </div>
      <div className="motion-visual origami-visual">
        <div className="paper-measurement paper-measurement-top">FOLD / EXPLORE / CREATE</div>
        <OrigamiArt progress={reducedMotion?1:progress}/>
        <div className="paper-measurement paper-measurement-bottom">CREATIVITY TAKES SHAPE ↗</div>
      </div>
      <button type="button" className="motion-skip" onClick={() => sectionRef.current?.nextElementSibling?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth',block:'start'})}>BỎ QUA HIỆU ỨNG ↗</button>
      <div className="motion-footer"><span>PAPER → POSSIBILITIES</span><div className="motion-progress"><i style={{width:(progress*100)+'%'}}/></div><strong>0{stage+1} / 03</strong></div>
    </div>
  </section>
}
