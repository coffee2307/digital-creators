import { useState } from 'react'
import { ArrowUpRight, Check, Code2, Film, MousePointer2, Palette, Play, Pause, Sparkles } from 'lucide-react'

const moods = [
  { name: 'Lavender', color: '#dbcdf4', contrast: '#9279ba', soft: '#f6efff' },
  { name: 'Peach', color: '#f6cdbc', contrast: '#d58f80', soft: '#fff3eb' },
  { name: 'Mint', color: '#c9e6d7', contrast: '#7dab96', soft: '#f1faf5' },
]
export default function CreativeLab() {
  const [mood, setMood] = useState(0)
  const [playing, setPlaying] = useState(false)
  const chosen = moods[mood]
  return <section className="creative-lab-section" aria-labelledby="lab-heading">
    <div className="wrap">
      <div className="lab-heading">
        <div><span className="lab-eyebrow"><Sparkles size={15}/> THE CREATIVE PLAYGROUND — 02</span><h2 id="lab-heading">Sáng tạo không chỉ để ngắm.<br/><em>Hãy thử chạm vào.</em></h2></div>
        <p>Một vài thí nghiệm nhỏ để bạn cảm nhận tinh thần Digital Creators: thử màu, tạo chuyển động và khám phá công nghệ ngay trên trang.</p>
      </div>
      <div className="lab-grid">
        <article className="lab-card lab-design">
          <div className="lab-card-top"><span><Palette size={16}/> 01 / DESIGN STUDIO</span><ArrowUpRight size={18}/></div>
          <div className="lab-design-screen" style={{'--lab-main': chosen.color,'--lab-accent': chosen.contrast,'--lab-soft': chosen.soft} as React.CSSProperties}>
            <div className="lab-windowbar"><span/><span/><span/><small>creative-canvas.fig</small></div>
            <div className="lab-canvas">
              <div className="lab-orbital-shape"><div className="lab-orbital-inner">DC<span>✳</span></div></div>
              <div className="lab-stamp lab-stamp-one">THINK<br/>DIFFERENT</div>
              <div className="lab-stamp lab-stamp-two"><MousePointer2 size={13}/> DRAG TO CREATE</div>
              <span className="lab-ruler lab-ruler-top">0 1 2 3 4 5 6 7 8 9</span>
              <span className="lab-ruler lab-ruler-side">0 1 2 3 4 5 6 7 8 9</span>
            </div>
          </div>
          <div className="lab-card-bottom"><div><strong>Color playground</strong><span>Thử phối những gam màu dịu mắt.</span></div><div className="lab-color-picker" role="group" aria-label="Chọn bảng màu">{moods.map((item,index)=><button key={item.name} onClick={()=>setMood(index)} className={mood===index?'chosen':''} style={{backgroundColor:item.color}} aria-label={'Chọn màu '+item.name} aria-pressed={mood===index}>{mood===index&&<Check size={14}/>}</button>)}</div></div>
        </article>
        <article className="lab-card lab-motion">
          <div className="lab-card-top"><span><Film size={16}/> 02 / MOTION ROOM</span><ArrowUpRight size={18}/></div>
          <div className={'lab-motion-screen'+(playing?' is-playing':'')}>
            <div className="lab-motion-shape"><div className="lab-motion-bubble"/><div className="lab-motion-diamond"/><div className="lab-motion-loop"/></div>
            <div className="lab-motion-overlay">MAKE<br/><em>IT MOVE.</em></div>
            <button className="lab-play" onClick={()=>setPlaying(!playing)} aria-label={playing?'Tạm dừng hoạt ảnh':'Phát hoạt ảnh'}>{playing?<Pause size={19} fill="currentColor"/>:<Play size={19} fill="currentColor"/>}</button>
          </div>
          <div className="lab-timeline"><div className="lab-timeline-label">ANIMATION / TIMELINE</div><div className="lab-timeline-track"><span/><span/><span/><i className={playing?'is-running':''}/></div></div>
          <div className="lab-card-bottom"><div><strong>Motion experiments</strong><span>Bấm Play để xem hình khối chuyển động.</span></div><span className="lab-mini-icon">↗</span></div>
        </article>
        <article className="lab-card lab-code">
          <div className="lab-card-top"><span><Code2 size={16}/> 03 / CODE SPACE</span><ArrowUpRight size={18}/></div>
          <div className="lab-code-window">
            <div className="lab-code-header"><span/><span/><span/><em>your-first-idea.ts</em></div>
            <div className="lab-code-body"><span className="line-no">01</span><code><span className="code-purple">const</span> curiosity = <span className="code-teal">true</span>;</code>
            <span className="line-no">02</span><code><span className="code-purple">const</span> idea = <span className="code-peach">"anything"</span>;</code>
            <span className="line-no">03</span><code/>
            <span className="line-no">04</span><code><span className="code-purple">if</span> (curiosity) {'{'}</code>
            <span className="line-no">05</span><code>  <span className="code-blue">create</span>(idea);</code>
            <span className="line-no">06</span><code>{'}'}</code>
            <span className="line-no">07</span><code className="code-caret">▍</code></div>
            <div className="lab-terminal"><span className="lab-terminal-dot"/> Ready to create something new.</div>
          </div>
          <div className="lab-card-bottom"><div><strong>Code your curiosity</strong><span>Mọi sản phẩm số đều bắt đầu từ một ý tưởng.</span></div><span className="lab-mini-icon">↗</span></div>
        </article>
      </div>
    </div>
  </section>
}
