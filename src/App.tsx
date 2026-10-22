import { lazy, Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Check, Code2, Compass, Film,
  Globe2, Heart, Lightbulb, Menu, MousePointer2, Palette, Rocket, Send,
  Shapes, Sparkles, UsersRound, WandSparkles, X, type LucideIcon,
} from 'lucide-react'
import { focusAreas, interests, plannedActivities } from './data/site'
import ScrollKoiStory from './components/ScrollKoiStory'
import CreativeLab from './components/CreativeLab'

const CreativeScene = lazy(() => import('./components/CreativeScene'))
const fieldIcons: LucideIcon[] = [Palette, Film, Globe2, Code2, WandSparkles]
const menu = [
  { path: '/', label: 'Trang chủ' },
  { path: '/gioi-thieu', label: 'Giới thiệu' },
  { path: '/hoat-dong', label: 'Hoạt động' },
]

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return reduced
}
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch { return false }
}

function Logo() {
  return <Link to="/" aria-label="Digital Creators - Trang chủ" className="logo">
    <span className="logo-mark"><Shapes size={22} strokeWidth={2}/></span>
    <span className="logo-type"><strong>digital<span>creators</span></strong><small>KHÔNG GIAN SÁNG TẠO SỐ</small></span>
  </Link>
}

function Header() {
  const [opened, setOpened] = useState(false)
  const location = useLocation()
  useEffect(() => { setOpened(false); window.scrollTo({top: 0, behavior: 'instant'}) }, [location.pathname])
  useEffect(() => {
    const before = document.body.style.overflow
    document.body.style.overflow = opened ? 'hidden' : before
    return () => { document.body.style.overflow = before }
  }, [opened])
  return <>
    <header className="site-header"><div className="wrap nav-bar">
      <Logo/>
      <nav className="desktop-links" aria-label="Điều hướng chính">
        {menu.map(item => <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({isActive}) => isActive ? 'active' : ''}>{item.label}</NavLink>)}
      </nav>
      <div className="nav-actions">
        <Link className="btn btn-ink header-join" to="/dang-ky">Tham gia CLB <ArrowUpRight size={17}/></Link>
        <button className="menu-toggle" aria-label={opened ? 'Đóng menu' : 'Mở menu'} aria-controls="mobile-navigation" aria-expanded={opened} onClick={() => setOpened(v => !v)}>{opened ? <X size={24}/> : <Menu size={24}/>}</button>
      </div>
    </div></header>
    <div className={'menu-shade' + (opened ? ' show' : '')} onClick={() => setOpened(false)} aria-hidden="true"/>
    <nav id="mobile-navigation" className={'mobile-navigation' + (opened ? ' show' : '')} aria-label="Điều hướng trên điện thoại" aria-hidden={!opened}>
      {menu.map((item, i) => <Link key={item.path} to={item.path} tabIndex={opened ? 0 : -1}><small>0{i+1}</small>{item.label}<ArrowUpRight size={20}/></Link>)}
      <Link className="mobile-register" tabIndex={opened ? 0 : -1} to="/dang-ky">Đăng ký tham gia <ArrowRight size={20}/></Link>
      <p>SÁNG TẠO — KẾT NỐI — PHÁT TRIỂN</p>
    </nav>
  </>
}

function Footer() {
  return <footer className="footer"><div className="wrap">
    <div className="footer-grid">
      <div><Logo/><p>Một không gian để học hỏi, kết nối và cùng biến những ý tưởng nhỏ thành sản phẩm số.</p></div>
      <div className="footer-nav"><strong>KHÁM PHÁ</strong><Link to="/">Trang chủ</Link><Link to="/gioi-thieu">Giới thiệu</Link><Link to="/hoat-dong">Hoạt động dự kiến</Link><Link to="/dang-ky">Đăng ký</Link></div>
      <div className="footer-info"><strong>GHI CHÚ</strong><p>Website giới thiệu đề xuất thành lập CLB Sáng tạo số. Các hoạt động chưa được tổ chức và đều mang tính dự kiến.</p></div>
    </div>
    <div className="footer-base"><span>© {new Date().getFullYear()} Digital Creators</span><span>MADE TO CREATE <Heart size={13}/></span></div>
  </div></footer>
}

function Eyebrow({children}: {children: ReactNode}) {
  return <span className="eyebrow"><span className="dot"/> {children}</span>
}
function Intro({code, title, desc}: {code: string; title: string; desc: string}) {
  return <div className="intro"><Eyebrow>{code}</Eyebrow><h2>{title}</h2><p>{desc}</p></div>
}
function Scene() {
  const reduced = useReducedMotion()
  const [webgl] = useState(supportsWebGL)
  return <div className="scene-wrap">
    <div className="scene-blob scene-blob-a"/><div className="scene-blob scene-blob-b"/>
    {webgl ? <Suspense fallback={<div className="scene-placeholder"><Shapes size={70}/></div>}><CreativeScene reducedMotion={reduced}/></Suspense> : <div className="scene-placeholder"><Shapes size={96}/><span>MAKE • CREATE • EXPLORE</span></div>}
    <span className="scene-chip chip-one"><Palette size={17}/> DESIGN</span>
    <span className="scene-chip chip-two"><Code2 size={17}/> CODE</span>
    <span className="scene-chip chip-three"><Sparkles size={17}/> CREATE</span>
    <span className="scene-help"><MousePointer2 size={15}/> Một chút chuyển động, thêm nhiều cảm hứng</span>
  </div>
}
function FieldCards() {
  return <div className="fields">
    {focusAreas.map((field, i) => {
      const Icon = fieldIcons[i]
      return <article className={'field-card theme-' + field.tone} key={field.id}>
        <div className="field-meta"><span>/{field.id}</span><ArrowUpRight size={21}/></div>
        <div className="field-art"><Icon size={48} strokeWidth={1.35}/><i>✳</i></div>
        <span className="field-english">{field.label}</span><h3>{field.title}</h3><p>{field.description}</p>
      </article>
    })}
  </div>
}
function ActivityCards() {
  const icons: LucideIcon[] = [BookOpen, Palette, UsersRound, Rocket]
  return <div className="activities">
    {plannedActivities.map((activity, i) => {
      const Icon = icons[i]
      return <article className={'activity theme-' + activity.tone} key={activity.number}>
        <div className="activity-art"><span className="activity-counter">{activity.number} / DỰ KIẾN</span><div className="activity-icon"><Icon size={62} strokeWidth={1.1}/></div><span className="star star-left">✳</span><span className="star star-right">✦</span></div>
        <div className="activity-text"><span className="activity-kind">{activity.category}</span><h3>{activity.title}</h3><p>{activity.description}</p><div className="tags">{activity.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
      </article>
    })}
  </div>
}

function Home() {
  return <>
    <section className="wrap hero"><div className="hero-text">
      <div className="hero-caption"><span className="asterisk">✳</span> A SPACE FOR YOUNG CREATORS <span className="caption-rule"/></div>
      <h1>Nơi ý tưởng <em>được tự do</em> bay xa<span className="period">.</span></h1>
      <p>Chào mừng bạn đến với <strong>Digital Creators</strong> — không gian để học sinh khám phá công nghệ, kết nối những người yêu sáng tạo và biến ý tưởng thành sản phẩm số.</p>
      <div className="hero-buttons"><Link className="btn btn-ink" to="/gioi-thieu">Tìm hiểu câu lạc bộ <ArrowUpRight size={18}/></Link><Link className="btn btn-white" to="/hoat-dong">Khám phá hoạt động <ArrowRight size={18}/></Link></div>
      <div className="hero-foot"><div className="triple-circles"><i/><i/><i/></div>SÁNG TẠO <b>·</b> KẾT NỐI <b>·</b> PHÁT TRIỂN</div>
    </div><Scene/></section>
    <div className="marquee" aria-label="Sáng tạo, kết nối, phát triển"><div className="marquee-rail">{[0,1].map(i=><span key={i}>DESIGN <b>✳</b> CODE <b>✳</b> CREATE <b>✳</b> EXPLORE <b>✳</b> CONNECT <b>✳</b> </span>)}</div></div>
    <section className="section wrap"><div className="section-heading"><Intro code="01 / KHÁM PHÁ" title="Có rất nhiều cách để sáng tạo." desc="Không cần giỏi sẵn từ đầu. Chỉ cần tò mò, dám thử và sẵn sàng cùng nhau học hỏi."/><span className="side-note">FIND YOUR THING ↗</span></div><FieldCards/></section>
    <CreativeLab/>
    <section className="section story"><div className="wrap story-grid"><div className="story-art"><div className="orbit orbit-outer"/><div className="orbit orbit-inner"/><div className="idea-center"><Lightbulb size={78} strokeWidth={1.2}/></div><span className="idea-pill idea-top">IDEAS <Sparkles size={15}/></span><span className="idea-pill idea-bottom">MAKE IT REAL <ArrowUpRight size={15}/></span></div>
      <div className="story-content"><Eyebrow>02 / CÂU CHUYỆN</Eyebrow><h2>Từ một ý tưởng nhỏ, <em>có thể bắt đầu</em> điều lớn lao.</h2><p>Digital Creators được đề xuất nhằm tạo một môi trường học sinh cùng khám phá thiết kế, công nghệ và sáng tạo nội dung, học qua trải nghiệm và phát triển kỹ năng cùng nhau.</p><div className="story-values"><span><Check size={17}/> Học hỏi cùng nhau</span><span><Check size={17}/> Trân trọng mọi ý tưởng</span><span><Check size={17}/> Cùng tạo nên sản phẩm số</span></div><Link className="text-link" to="/gioi-thieu">Khám phá câu chuyện <ArrowUpRight size={18}/></Link></div>
    </div></section>
    <ScrollKoiStory/>
    <section className="section wrap"><div className="section-heading"><Intro code="04 / CÙNG THỰC HIỆN" title="Không chỉ học. Chúng mình còn tạo ra." desc="Các nội dung sau là những hoạt động dự kiến tổ chức sau khi câu lạc bộ được thành lập."/><Link className="text-link" to="/hoat-dong">Xem tất cả <ArrowUpRight size={18}/></Link></div><ActivityCards/></section>
    <section className="section wrap"><CallToAction/></section>
  </>
}

function CallToAction() {
  return <div className="cta"><div className="cta-copy"><Eyebrow>YOUR NEXT IDEA STARTS HERE</Eyebrow><h2>Ý tưởng tiếp theo có thể đến từ <em>bạn.</em></h2><p>Bạn không cần kinh nghiệm trước đó. Hãy bắt đầu với sự tò mò và tinh thần muốn khám phá.</p><Link to="/dang-ky" className="btn btn-ink">Đăng ký tham gia <ArrowUpRight size={18}/></Link></div><div className="cta-orb" aria-hidden="true"><span>LET'S</span><strong>CREATE!</strong><small>✳ ✳ ✳</small></div></div>
}
function PageHeader({number, eyebrow, title, desc}: {number: string; eyebrow: string; title: string; desc: string}) {
  return <div className="page-header wrap"><div className="page-header-text"><Eyebrow>{number} / {eyebrow}</Eyebrow><h1>{title}</h1><p>{desc}</p></div><div className="page-decoration"><span>✳</span><i>✦</i></div></div>
}
function About() {
  return <>
    <PageHeader number="01" eyebrow="GIỚI THIỆU" title="Một nơi dành cho những tâm trí tò mò." desc="Nơi những ý tưởng được lắng nghe, những kỹ năng được khám phá và những kết nối mới có cơ hội hình thành."/>
    <section className="wrap section about-content"><div className="about-main"><Eyebrow>VÌ SAO CÓ DIGITAL CREATORS?</Eyebrow><h2>Vì sáng tạo không nên chỉ nằm trong trí tưởng tượng.</h2><p>Trong thời đại công nghệ số, các kỹ năng như thiết kế đồ họa, chỉnh sửa video, lập trình và sáng tạo nội dung ngày càng hữu ích đối với học sinh. CLB được đề xuất nhằm tạo môi trường để các bạn tiếp cận những kỹ năng này, phát huy ý tưởng và học hỏi lẫn nhau.</p><div className="about-highlight"><Sparkles size={32}/><span>Học từ trải nghiệm. Lớn lên cùng ý tưởng.</span></div></div><div className="about-aside"><div className="about-sticker"><span>✳</span><strong>THINK.<br/>CREATE.<br/>SHARE.</strong></div></div></section>
    <section className="section wrap"><Intro code="NHỮNG ĐIỀU HƯỚNG TỚI" title="Mục tiêu của chúng mình." desc="Bốn định hướng để mỗi thành viên có cơ hội học hỏi và phát triển theo cách của riêng mình."/><div className="goal-grid">{[
      {icon: Palette, title:'Phát triển kỹ năng số', desc:'Sử dụng các công cụ thiết kế và công nghệ để tạo sản phẩm thực tế.'},
      {icon: Lightbulb, title:'Nuôi dưỡng tư duy sáng tạo', desc:'Khuyến khích đặt câu hỏi, thử nghiệm và tìm giải pháp cho vấn đề.'},
      {icon: UsersRound, title:'Làm việc cùng nhau', desc:'Rèn kỹ năng giao tiếp, hợp tác, trình bày và phản hồi ý tưởng.'},
      {icon: Rocket, title:'Biến ý tưởng thành sản phẩm', desc:'Thực hiện, chia sẻ, đánh giá và hoàn thiện các sản phẩm số.'},
    ].map((g,i)=><div className="goal" key={g.title}><div className="goal-icon"><g.icon size={25}/></div><span>0{i+1}</span><h3>{g.title}</h3><p>{g.desc}</p></div>)}</div></section>
    <section className="wrap section"><div className="audience"><div><Eyebrow>AI CÓ THỂ THAM GIA?</Eyebrow><h2>Không quan trọng bạn đang ở vạch xuất phát nào.</h2><p>CLB hướng đến tất cả học sinh trong trường quan tâm tới công nghệ, thiết kế, video, lập trình hoặc sáng tạo nội dung. <strong>Chưa có kinh nghiệm? Không sao cả.</strong> Sẵn sàng học hỏi chính là điều quan trọng.</p><Link className="btn btn-ink" to="/dang-ky">Đăng ký khám phá <ArrowUpRight size={17}/></Link></div><div className="audience-visual"><UsersRound size={102} strokeWidth={1}/><span>YOU BELONG HERE ✳</span></div></div></section>
  </>
}
function Activities() {
  return <>
    <PageHeader number="02" eyebrow="HOẠT ĐỘNG" title="Học bằng cách làm. Lớn lên qua từng ý tưởng." desc="Từ thử nghiệm công cụ đến những dự án sáng tạo nhóm — hãy cùng hình dung những gì chúng mình có thể tạo ra."/>
    <section className="section wrap"><div className="notice"><Sparkles size={20}/><p><strong>Hoạt động dự kiến.</strong> Các nội dung dưới đây là kế hoạch đề xuất, chưa phải hoạt động đã được CLB tổ chức.</p></div><ActivityCards/></section>
    <section className="section wrap"><div className="process"><Intro code="HÀNH TRÌNH Ý TƯỞNG" title="Từ tò mò đến thành phẩm." desc="Một hành trình thực hành đơn giản có thể được áp dụng trong các hoạt động nhóm."/><div className="steps">{[
      ['01','Khám phá','Tìm ý tưởng và học công cụ mới.'],
      ['02','Thử nghiệm','Phác thảo, thiết kế và lập trình.'],
      ['03','Hợp tác','Trao đổi, góp ý và cải thiện.'],
      ['04','Chia sẻ','Giới thiệu sản phẩm và học điều mới.']
    ].map(([no,title,desc])=><div className="step" key={no}><span>{no}</span><ArrowDownRight size={22}/><h3>{title}</h3><p>{desc}</p></div>)}</div></div></section>
    <section className="section wrap"><CallToAction/></section>
  </>
}
function Register() {
  const [chosen, setChosen] = useState<string[]>([])
  const [error, setError] = useState(false)
  const [sent, setSent] = useState(false)
  function toggle(value: string) { setChosen(v=>v.includes(value)?v.filter(x=>x!==value):[...v,value]);setError(false) }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!chosen.length) {setError(true);return}
    e.currentTarget.reset()
    setChosen([])
    setSent(true)
  }
  return <>
    <PageHeader number="03" eyebrow="ĐĂNG KÝ" title="Bắt đầu với một lời chào." desc="Chọn lĩnh vực bạn yêu thích và thử trải nghiệm cách đăng ký vào không gian sáng tạo số."/>
    <section className="section wrap register-layout"><div className="register-info"><div className="register-art"><Compass size={90} strokeWidth={1.05}/><span>LET'S MAKE<br/><strong>SOMETHING!</strong></span></div><Eyebrow>BIẾN TÒ MÒ THÀNH HÀNH ĐỘNG</Eyebrow><h2>Mọi hành trình sáng tạo đều có một điểm bắt đầu.</h2><p>Bạn yêu công nghệ, muốn khám phá thiết kế hay thử sức với lập trình? Hãy điền biểu mẫu để trải nghiệm quy trình đăng ký.</p><div className="privacy-note"><Check size={17}/><p>Đây chỉ là bản demo. <strong>Thông tin không được gửi, lưu lại hay chuyển đến bất kỳ máy chủ nào.</strong></p></div></div>
      <div className="register-card"><div className="form-title"><span className="form-mark"><Send size={24}/></span><div><h2>Đăng ký tham gia</h2><p>Biểu mẫu mô phỏng · Chưa tiếp nhận đăng ký thật</p></div></div>
      {sent ? <div className="form-success" role="status"><div className="success-icon"><Check size={32}/></div><h3>Hoàn tất bản đăng ký mô phỏng!</h3><p>Bạn đã trải nghiệm thành công biểu mẫu. Không có thông tin nào được gửi đi hoặc lưu trữ. Khi CLB được thành lập và mở đăng ký thật, website sẽ được cập nhật.</p><button className="btn btn-ink" onClick={()=>setSent(false)}>Thử đăng ký lại <ArrowRight size={18}/></button></div> :
      <form onSubmit={handleSubmit}><div className="form-field"><label htmlFor="full-name">Họ và tên <b>*</b></label><input required maxLength={100} id="full-name" name="full-name" autoComplete="name" placeholder="Nhập họ và tên của bạn"/></div>
      <div className="form-row"><div className="form-field"><label htmlFor="classroom">Lớp <b>*</b></label><input required maxLength={30} id="classroom" name="classroom" placeholder="Ví dụ: 12A1"/></div><div className="form-field"><label htmlFor="contact">Email / liên hệ <b>*</b></label><input required maxLength={120} id="contact" name="contact" placeholder="Thông tin liên hệ"/></div></div>
      <fieldset className="form-field interest-field"><legend>Bạn quan tâm lĩnh vực nào? <b>*</b></legend><p>Có thể chọn nhiều lĩnh vực</p><div className="choices">{interests.map((interest, i) => {const Icon = fieldIcons[i];const active=chosen.includes(interest);return <label key={interest} className={'choice'+(active?' checked':'')}><input type="checkbox" name="interest" value={interest} checked={active} onChange={()=>toggle(interest)}/><Icon size={17}/><span>{interest}</span><span className="checkbox-indicator">{active && <Check size={13}/>}</span></label>})}</div>{error&&<span className="field-error" role="alert">Vui lòng chọn ít nhất một lĩnh vực.</span>}</fieldset>
      <div className="form-field"><label htmlFor="motivation">Lý do muốn tham gia CLB <b>*</b></label><textarea required maxLength={1000} minLength={5} rows={4} id="motivation" name="motivation" placeholder="Điều gì khiến bạn hào hứng với sáng tạo số?"/></div>
      <div className="form-disclaimer">Đây là website minh họa. Nút gửi chỉ hiển thị xác nhận, không thu thập dữ liệu thật.</div><button className="btn btn-ink submit" type="submit">Gửi đăng ký mô phỏng <ArrowUpRight size={18}/></button></form>}
      </div>
    </section>
  </>
}
function NotFound() {return <div className="not-found wrap"><span>404 / LOST IN SPACE</span><h1>Trang này chưa tồn tại.</h1><p>Đôi khi một đường dẫn cũng cần một chút sáng tạo.</p><Link className="btn btn-ink" to="/">Trở về trang chủ <ArrowRight size={18}/></Link></div>}

function AppShell() {
  return <><Header/><main id="main" tabIndex={-1}><Routes><Route path="/" element={<Home/>}/><Route path="/gioi-thieu" element={<About/>}/><Route path="/hoat-dong" element={<Activities/>}/><Route path="/dang-ky" element={<Register/>}/><Route path="*" element={<NotFound/>}/></Routes></main><Footer/></>
}
export default function App() {
  return <HashRouter><button className="skip-link" onClick={() => document.getElementById('main')?.focus()}>Bỏ qua điều hướng</button><AppShell/></HashRouter>
}
