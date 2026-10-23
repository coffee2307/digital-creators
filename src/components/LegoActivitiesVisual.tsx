import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D, Vector3, type Group } from 'three'
import { ArrowDown, ArrowUpRight, Blocks, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollScene } from '../hooks/useScrollScene'
import SceneErrorBoundary from './SceneErrorBoundary'
import { useThemeMode } from '../hooks/useThemeMode'

const colors=['#9484d3','#8bbfad','#e5a28f','#85a9d7','#bca8d8','#e6bf83']
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t)}
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t
const random=(a:number,b:number)=>{const v=Math.sin(a*91.17+b*17.91)*43758.5453;return v-Math.floor(v)}
/* Deliberate urban composition: a central landmark, stepped skyline, separate
   commercial/residential districts and an open plaza in the foreground. */
const houses=[
  {x:-4.9,z:-2.65,n:4,c:0},{x:-3.05,z:-2.65,n:6,c:1},
  {x:-1.2,z:-2.65,n:8,c:3},{x:1.25,z:-2.65,n:11,c:4},
  {x:3.05,z:-2.65,n:6,c:2},{x:4.9,z:-2.65,n:4,c:0},
  {x:-4.6,z:-.65,n:3,c:4},{x:-2.65,z:-.65,n:5,c:2},
  {x:2.65,z:-.65,n:7,c:1},{x:4.6,z:-.65,n:4,c:3},
  {x:-4.25,z:2.25,n:3,c:2},{x:-2.35,z:2.25,n:4,c:0},
  {x:2.35,z:2.25,n:5,c:4},{x:4.25,z:2.25,n:3,c:1},
]
type Brick={x:number;y:number;z:number;color:string;seed:number;rank:number}
const bricks:Brick[]=houses.flatMap((building,bi)=>Array.from({length:building.n},(_,i)=>({
  x:building.x,y:i*.51+.12,z:building.z,
  color:colors[(building.c+(i%4===3?1:0))%colors.length],
  seed:bi*43+i*17+9,rank:i*houses.length+bi
}))).sort((a,b)=>a.rank-b.rank)
const maxRank=Math.max(...bricks.map(b=>b.rank))
const studOffset=[[-.32,-.24],[-.32,.24],[.32,-.24],[.32,.24]]
function Tree({x,z,size=1,dark}:{x:number;z:number;size?:number;dark:boolean}) {
  return <group position={[x,-.05,z]} scale={size}>
    <mesh position={[0,.3,0]}><cylinderGeometry args={[.055,.085,.62,9]}/><meshStandardMaterial color="#b8a69d"/></mesh>
    <mesh position={[0,.8,0]}><icosahedronGeometry args={[.37,1]}/><meshStandardMaterial color={dark ? "#268e81" : "#9acbb8"} emissive={dark ? "#18cbb1" : "#000000"} emissiveIntensity={dark ? .45 : 0} roughness={.8}/></mesh>
    <mesh position={[.15,.9,.13]}><icosahedronGeometry args={[.21,1]}/><meshStandardMaterial color="#bce4ce"/></mesh>
  </group>
}
function Roof({x,z,n,variant,dark}:{x:number;z:number;n:number;variant:number;dark:boolean}){
  const y=n*.51+.19
  return <group position={[x,y,z]}>
    <RoundedBox args={[1.33,.23,1.05]} radius={.08} smoothness={3} position={[0,0,0]}><meshStandardMaterial color={dark ? (variant % 2 ? '#55458f' : '#357a8c') : (variant%2?'#eee2f5':'#e5f1ee')} emissive={dark ? (variant % 2 ? '#ad65ff' : '#45efff') : '#000000'} emissiveIntensity={dark ? .65 : 0} roughness={.43}/></RoundedBox>
    {variant===3?<group>
      <mesh position={[0,.31,0]}><cylinderGeometry args={[.40,.50,.45,8]}/><meshStandardMaterial color={dark ? "#68477e" : "#ddd4eb"} roughness={.38}/></mesh>
      <mesh position={[0,.63,0]}><coneGeometry args={[.47,.45,8]}/><meshStandardMaterial color={dark ? "#ff80d9" : "#e3bad6"} emissive={dark ? "#ed60c4" : "#000000"} emissiveIntensity={dark ? .6 : 0}/></mesh>
      <mesh position={[0,1.0,0]}><cylinderGeometry args={[.025,.025,.42,8]}/><meshStandardMaterial color={dark ? "#7ff6ff" : "#988eb5"}/></mesh>
    </group>:variant===2?<group>
      <mesh position={[0,.30,0]}><cylinderGeometry args={[.32,.39,.42,16]}/><meshStandardMaterial color="#f7d2bb" roughness={.35}/></mesh>
      <mesh position={[0,.65,0]}><sphereGeometry args={[.28,18,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#f4cbaa"/></mesh>
      <mesh position={[0,1.01,0]}><cylinderGeometry args={[.018,.018,.42,8]}/><meshStandardMaterial color="#a69cbd" metalness={.2}/></mesh>
      <mesh position={[0,1.24,0]}><sphereGeometry args={[.065,10,10]}/><meshStandardMaterial color="#fff4c1" emissive="#ecd18d" emissiveIntensity={.65}/></mesh>
    </group>:variant%3===0?
      <group>
        <mesh position={[0,.27,0]}><boxGeometry args={[.64,.43,.66]}/><meshStandardMaterial color={dark ? "#263e6b" : "#f6e9e4"}/></mesh>
        <mesh position={[0,.51,0]}><boxGeometry args={[.81,.09,.82]}/><meshStandardMaterial color={dark ? "#7e6fce" : "#e6c2de"}/></mesh>
        <mesh position={[0,.75,0]}><boxGeometry args={[.065,.42,.065]}/><meshBasicMaterial color={dark ? "#7affff" : "#a8acc3"}/></mesh>
      </group>
      :<mesh position={[0,.23,0]}><boxGeometry args={[.78,.22,.69]}/><meshStandardMaterial color="#e3d4ed"/></mesh>}
  </group>
}
function Village({progressRef,reduced,dark}:{progressRef:React.RefObject<number>;reduced:boolean;dark:boolean}){
  const blocks=useRef<InstancedMesh>(null)
  const studs=useRef<InstancedMesh>(null)
  const windows=useRef<InstancedMesh>(null)
  const roofGroup=useRef<Group>(null)
  const neonGroup=useRef<Group>(null)
  const root=useRef<Group>(null)
  const tmp=useMemo(()=>new Object3D(),[])
  const decoration=useMemo(()=>new Object3D(),[])
  const relative=useMemo(()=>new Vector3(),[])
  useEffect(()=>{
    const block=blocks.current,stud=studs.current,win=windows.current
    if(!block||!stud||!win)return
    bricks.forEach((brick,i)=>{
      const color=new Color(dark ? ['#5f50cd','#289dad','#ec7aaf','#367fdf','#a56ddf','#c99659'][bricks[i].rank%6] : brick.color)
      block.setColorAt(i,color)
      for(let j=0;j<4;j++)stud.setColorAt(i*4+j,color)
      for(let j=0;j<2;j++)win.setColorAt(i*2+j,new Color(dark ? (j===0?'#71fcff':'#ff8dce') : (j===0?'#fff3ce':'#7fa4c3')))
    })
    for(const mesh of [block,stud,win])if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true
  },[dark])
  useFrame((state,dt)=>{
    const p=reduced?1:progressRef.current
    const b=blocks.current,s=studs.current,w=windows.current
    if(!b||!s||!w)return
    bricks.forEach((brick,i)=>{
      const stagger=brick.rank/maxRank*.43
      const t=ease((p-.065-stagger)/.44)
      const startX=(random(brick.seed,1)-.5)*17
      const startY=5+random(brick.seed,2)*6
      const startZ=(random(brick.seed,3)-.5)*16
      tmp.position.set(lerp(startX,brick.x,t),lerp(startY,brick.y,t),lerp(startZ,brick.z,t))
      tmp.rotation.set(lerp(random(brick.seed,4)*2,0,t),lerp(random(brick.seed,5)*5,0,t),lerp(.5,0,t))
      tmp.scale.setScalar(lerp(.45,1,t))
      tmp.updateMatrix()
      b.setMatrixAt(i,tmp.matrix)
      studOffset.forEach(([x,z],j)=>{
        relative.set(x,.28,z).applyMatrix4(tmp.matrix)
        decoration.position.copy(relative)
        decoration.rotation.copy(tmp.rotation)
        decoration.scale.copy(tmp.scale)
        decoration.updateMatrix()
        s.setMatrixAt(i*4+j,decoration.matrix)
      })
      for(let j=0;j<2;j++){
        relative.set(j===0?-.32:.32,.02,.553).applyMatrix4(tmp.matrix)
        decoration.position.copy(relative)
        decoration.rotation.copy(tmp.rotation)
        decoration.scale.copy(tmp.scale)
        decoration.updateMatrix()
        w.setMatrixAt(i*2+j,decoration.matrix)
      }
    })
    for(const mesh of [b,s,w])mesh.instanceMatrix.needsUpdate=true
    if(roofGroup.current) {
      const settled=ease((p-.56)/.28)
      roofGroup.current.scale.set(1,Math.max(.001,settled),1)
    }
    if(neonGroup.current){
      const intensity = ease((p - .52)/.28)
      neonGroup.current.visible = dark && intensity > .001
      neonGroup.current.scale.set(1,Math.max(.001,intensity),1)
    }
    if(root.current){
      const target=.08+ease((p-.68)/.25)*.18
      root.current.rotation.y+=(target-root.current.rotation.y)*Math.min(1,dt*3.2)
      root.current.rotation.x+=(.02-root.current.rotation.x)*Math.min(1,dt*2.7)
      root.current.position.y=Math.sin(state.clock.elapsedTime*.55)*.025
    }
  })
  return <group ref={root}>
    <RoundedBox args={[13.65,.78,9.35]} radius={.24} smoothness={3} position={[0,-.75,.02]}>
      <meshStandardMaterial color={dark ? "#0e1832" : "#f5f0ee"} metalness={dark ? .16 : 0} roughness={.72}/>
    </RoundedBox>
    <RoundedBox args={[13.25,.12,8.95]} radius={.095} smoothness={3} position={[0,-.34,.02]}>
      <meshStandardMaterial color={dark ? "#1d2647" : "#e9e8ee"} roughness={.86}/>
    </RoundedBox>
    {/* One central promenade with a pedestrian path and pockets of grass */}
    <mesh position={[0,-.268,.11]}><boxGeometry args={[.85,.035,8.1]}/><meshStandardMaterial color={dark ? "#243c60" : "#d9d6e2"}/></mesh>
    <mesh position={[0,-.246,.1]}><boxGeometry args={[.05,.015,7.85]}/><meshBasicMaterial color="#fbfaf7"/></mesh>
    <mesh position={[0,-.246,.16]}><boxGeometry args={[12.45,.025,.59]}/><meshStandardMaterial color={dark ? "#203954" : "#d7d6e1"}/></mesh>
    {[-5.6,-3.75,-1.9,1.9,3.75,5.6].map(x=><mesh key={x} position={[x,-.225,.16]}>
      <boxGeometry args={[.58,.022,.055]}/><meshBasicMaterial color="#fff8e8"/>
    </mesh>)}
    {[-6.18,6.18].map(x=><mesh key={x} position={[x,-.252,.12]}>
      <boxGeometry args={[.48,.055,8.15]}/><meshStandardMaterial color={dark ? "#143d42" : "#c7dfd0"}/>
    </mesh>)}
    {[-3.0,.3,3.2].flatMap((z,zi)=>[-6.1,6.1].map((x,xi)=><Tree key={zi+'-'+xi} x={x} z={z} size={zi===1?.9:.7} dark={dark}/>))}
    <instancedMesh ref={blocks} args={[undefined,undefined,bricks.length]} frustumCulled={false}>
      <boxGeometry args={[1.24,.48,1.05]}/><meshStandardMaterial color="#ffffff" emissive={dark ? "#37478e" : "#000000"} emissiveIntensity={dark ? .68 : 0} roughness={.61} metalness={.025}/>
    </instancedMesh>
    <instancedMesh ref={studs} args={[undefined,undefined,bricks.length*4]} frustumCulled={false}>
      <cylinderGeometry args={[.14,.14,.095,12]}/><meshStandardMaterial color="#ffffff" emissive={dark ? "#244876" : "#000000"} emissiveIntensity={dark ? .45 : 0} roughness={.46}/>
    </instancedMesh>
    <instancedMesh ref={windows} args={[undefined,undefined,bricks.length*2]} frustumCulled={false}>
      <boxGeometry args={[.28,.25,.045]}/><meshBasicMaterial color="#ffffff"/>
    </instancedMesh>
    {/* Architectural edge lighting is attached to the buildings, not a screen-space glow filter. */}
    <group ref={neonGroup} visible={false}>
      {houses.map((house,i)=><group key={'neon-'+i}>
        <mesh position={[house.x-.63,house.n*.255+.08,house.z+.526]}>
          <boxGeometry args={[.035,house.n*.51,.035]}/>
          <meshBasicMaterial color={i%2 ? '#ff72d7' : '#5df5ff'} toneMapped={false}/>
        </mesh>
        <mesh position={[house.x+.63,house.n*.255+.08,house.z+.526]}>
          <boxGeometry args={[.035,house.n*.51,.035]}/>
          <meshBasicMaterial color={i%2 ? '#ff72d7' : '#5df5ff'} toneMapped={false}/>
        </mesh>
        <mesh position={[house.x,house.n*.51+.02,house.z+.53]}>
          <boxGeometry args={[1.27,.052,.055]}/>
          <meshBasicMaterial color={i%2 ? '#ff89e3' : '#83ffff'} toneMapped={false}/>
        </mesh>
      </group>)}
    </group>
    {/* Per-building shop awnings and layered façade bands. */}
    <group ref={roofGroup}>
      {houses.map((house,i)=><Roof key={i} x={house.x} z={house.z} n={house.n} variant={i} dark={dark}/>)}
    </group>
    {/* Illuminated chamfered chassis, discrete in daytime. */}
    <group position={[0,-.59,.02]}>
      <mesh position={[0,0,4.7]}><boxGeometry args={[13.24,.055,.075]}/><meshBasicMaterial color={dark ? "#56efff" : "#e3d4f5"} toneMapped={false}/></mesh>
      <mesh position={[0,0,-4.7]}><boxGeometry args={[13.24,.055,.075]}/><meshBasicMaterial color={dark ? "#ba77ff" : "#d2ebdf"} toneMapped={false}/></mesh>
      {[-6.82,6.82].map(x=><mesh key={x} position={[x,0,0]}><boxGeometry args={[.07,.055,9.23]}/><meshBasicMaterial color={dark ? "#78aaff" : "#d7deee"} toneMapped={false}/></mesh>)}
    </group>
    {/* Slender streetlights turn the toy city into a legible miniature world. */}
    {[-5.65,-3.85,-1.9,1.9,3.85,5.65].map((x,i)=><group key={'lamp-'+i} position={[x,-.2,.93]}>
      <mesh position={[0,.39,0]}><cylinderGeometry args={[.026,.039,.85,8]}/><meshStandardMaterial color={dark ? "#3c5784" : "#b6b3c7"} metalness={.32} roughness={.4}/></mesh>
      <mesh position={[0,.87,0]}><sphereGeometry args={[.104,12,10]}/><meshBasicMaterial color={dark ? (i%2 ? "#ff89d8" : "#7cf9ff") : "#fff8d5"} toneMapped={false}/></mesh>
      <mesh position={[0,.87,0]}><sphereGeometry args={[.21,12,8]}/><meshBasicMaterial color={dark ? (i%2 ? "#fa7fc3" : "#73e5ef") : "#ffebcd"} transparent opacity={dark ? .10 : .04} depthWrite={false}/></mesh>
    </group>)}
    <group position={[0,.1,3.2]}>
      <RoundedBox args={[1.9,.32,.79]} radius={.07} smoothness={3}>
        <meshStandardMaterial color="#dccced"/>
      </RoundedBox>
      <mesh position={[0,.43,0]}><boxGeometry args={[1.3,.62,.15]}/><meshStandardMaterial color="#6f6396" roughness={.65}/></mesh>
      <mesh position={[0,.44,.085]}><planeGeometry args={[.99,.34]}/><meshBasicMaterial color="#f8ebca"/></mesh>
    </group>
    {[-1.2,1.3].map((x,i)=><group key={x} position={[x,-.05,3.15]}>
      <mesh position={[0,.15,0]}><cylinderGeometry args={[.4,.45,.25,14]}/><meshStandardMaterial color={i?'#b0d9d1':'#e9c6da'}/></mesh>
      <mesh position={[0,.4,0]}><sphereGeometry args={[.21,16,16]}/><meshStandardMaterial color="#faf3e6"/></mesh>
    </group>)}
  </group>
}
function CityCanvas({progressRef,reduced,dark}:{progressRef:React.RefObject<number>;reduced:boolean;dark:boolean}){
  return <Canvas camera={{position:[15.3,12.2,19],fov:typeof window !== 'undefined' && window.innerWidth<=760 ? 43 : 35}} dpr={[1,1.6]} gl={{alpha:true,antialias:true,powerPreference:'low-power'}}>
    <ambientLight intensity={dark ? .34 : .7}/>
    <hemisphereLight args={[dark ? '#5893b4' : '#ffffff','#b09cc4',dark ? .37 : .55]}/>
    <directionalLight position={[3,10,7]} intensity={dark ? 1.1 : 1.5} color={dark ? "#8bbfff" : "#fff7ed"}/>
    <pointLight position={[-5,5,-5]} intensity={dark ? 18 : 5} color={dark ? "#60f3ff" : "#d8c7f8"} distance={19}/>
    {dark && <pointLight position={[5,5,6]} intensity={13} color="#f97acb" distance={19}/>}
    <Village progressRef={progressRef} reduced={reduced} dark={dark}/>
  </Canvas>
}
const steps=[
 {label:'01 / Ý TƯỞNG',heading:<>Mỗi thành phố khởi đầu từ <em>một viên gạch.</em></>,description:'Những ý tưởng nhỏ đang tìm đến nhau — mỗi viên gạch đều có vị trí trong một tổng thể lớn.'},
 {label:'02 / HỢP TÁC',heading:<>Kết nối từng <em>mảnh sáng tạo.</em></>,description:'Những khối lắp ghép tạo thành các studio, tòa nhà và không gian chung khi bạn tiếp tục cuộn.'},
 {label:'03 / THÀNH PHẨM',heading:<>Một thành phố được tạo nên <em>cùng nhau.</em></>,description:'Từ từng chi tiết nhỏ tới một thành phố sáng tạo có ánh đèn, quảng trường và những công trình đầy màu sắc.'},
]
export default function LegoActivitiesVisual(){
  const {sectionRef,progress,progressRef,reducedMotion}=useScrollScene()
  const dark = useThemeMode() === 'dark'
  const phase=progress<.3?0:progress<.8?1:2
  return <section ref={sectionRef} className={'motion-chapter city-story'+(reducedMotion?' motion-reduced':'')} aria-label="Thành phố khối lắp ghép 3D hình thành theo cuộn">
    <div className="motion-sticky city-stage">
      <div className="motion-topline"><span><Blocks size={15}/> DIGITAL CREATORS / BUILD TOGETHER</span><span>CREATIVE MINI CITY <ArrowDown size={14}/></span></div>
      <div className="motion-copy">
        {steps.map((story,i)=><div key={story.label} className={'motion-copy-panel'+(i===phase?' selected':'')} aria-hidden={!reducedMotion&&i!==phase}>
          <span className="motion-tag"><Sparkles size={15}/>{story.label}</span><h2>{story.heading}</h2><p>{story.description}</p>
          {i===2&&<Link to="/dang-ky" tabIndex={reducedMotion||phase===i?0:-1} className="motion-cta">Tham gia kiến tạo <ArrowUpRight size={16}/></Link>}
        </div>)}
      </div>
      <div className="motion-visual city-visual"><div className="city-tag city-tag-top">A CITY BUILT BY CREATORS</div>
        <SceneErrorBoundary label="Thành phố sáng tạo"><CityCanvas progressRef={progressRef} reduced={reducedMotion} dark={dark}/></SceneErrorBoundary>
        <div className="city-tag city-tag-bottom">DESIGN • CODE • CREATE <span>✳</span></div>
      </div>
      <button type="button" className="motion-skip" onClick={()=>sectionRef.current?.nextElementSibling?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'})}>BỎ QUA HIỆU ỨNG ↗</button>
      <div className="motion-footer"><span>IMAGINE / BUILD / CONNECT</span><div className="motion-progress"><i style={{width:progress*100+'%'}}/></div><strong>0{phase+1} / 03</strong></div>
    </div>
  </section>
}
