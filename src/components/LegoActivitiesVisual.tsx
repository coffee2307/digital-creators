import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D, Vector3 } from 'three'
import { ArrowDown, ArrowUpRight, Blocks, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollScene } from '../hooks/useScrollScene'
import SceneErrorBoundary from './SceneErrorBoundary'

const palette=['#cdbaf1','#a8d9cd','#f7c8ad','#b5d3f6','#ead2f4','#fae0a6','#8fcfc4']
type Brick={x:number;y:number;z:number;color:string;seed:number;rank:number}
const buildings=[
  {x:-3.6,z:-1.1,floors:5,tone:0},
  {x:-1.9,z:.6,floors:3,tone:1},
  {x:-.3,z:-1.25,floors:8,tone:3},
  {x:1.5,z:.6,floors:6,tone:2},
  {x:3.1,z:-1.15,floors:4,tone:1},
  {x:3.35,z:1.45,floors:2,tone:5},
  {x:-3.3,z:1.65,floors:2,tone:4},
]
const bricks:Brick[]=buildings.flatMap((building,bIndex)=>
  Array.from({length:building.floors},(_,floor)=>({
    x:building.x,y:.02+floor*.53,z:building.z,
    color:palette[(building.tone+(floor===building.floors-1?2:floor%3))%palette.length],
    seed:bIndex*31+floor*11+13,rank:floor*buildings.length+bIndex,
  }))
).sort((a,b)=>a.rank-b.rank)
const maxRank = Math.max(...bricks.map(brick => brick.rank), 1)
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t)}
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t
const studOffsets=[[-.3,-.22],[-.3,.22],[.3,-.22],[.3,.22]]
const positionSeed=(seed:number,offset:number)=>Math.sin(seed*12.9898+offset*78.233)*43758.5453%1

function CityModel({progressRef,reduced}:{progressRef:React.RefObject<number>;reduced:boolean}){
  const blockMesh=useRef<InstancedMesh>(null)
  const studMesh=useRef<InstancedMesh>(null)
  const root=useRef<import('three').Group>(null)
  const dummy=useMemo(()=>new Object3D(),[])
  const studDummy=useMemo(()=>new Object3D(),[])
  const temporary=useMemo(()=>new Vector3(),[])
  useEffect(()=>{
    const block=blockMesh.current,stud=studMesh.current
    if(!block||!stud)return
    bricks.forEach((item,i)=>{
      const color=new Color(item.color)
      block.setColorAt(i,color)
      for(let j=0;j<4;j++)stud.setColorAt(i*4+j,color)
    })
    if(block.instanceColor)block.instanceColor.needsUpdate=true
    if(stud.instanceColor)stud.instanceColor.needsUpdate=true
  },[])
  useFrame((state,delta)=>{
    const p=reduced?1:progressRef.current
    const block=blockMesh.current,stud=studMesh.current
    if(!block||!stud)return
    bricks.forEach((item,i)=>{
      const stagger=item.rank/maxRank*.44
      const t=ease((p-.06-stagger)/.43)
      const spawnX=(positionSeed(item.seed,1))*10
      const spawnY=5+Math.abs(positionSeed(item.seed,2))*6
      const spawnZ=(positionSeed(item.seed,3))*9
      dummy.position.set(lerp(spawnX,item.x,t),lerp(spawnY,item.y,t),lerp(spawnZ,item.z,t))
      dummy.rotation.set(lerp(1.6,0,t),lerp(item.seed*1.14,0,t),lerp(-.6,0,t))
      const s=lerp(.5,1,t)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      block.setMatrixAt(i,dummy.matrix)
      studOffsets.forEach(([x,z],j)=>{
        temporary.set(x,.29,z).applyMatrix4(dummy.matrix)
        studDummy.position.copy(temporary)
        studDummy.rotation.copy(dummy.rotation)
        studDummy.scale.setScalar(s)
        studDummy.updateMatrix()
        stud.setMatrixAt(i*4+j,studDummy.matrix)
      })
    })
    block.instanceMatrix.needsUpdate=true
    stud.instanceMatrix.needsUpdate=true
    if(root.current){
      const turn=.06+ease((p-.73)/.27)*.27
      root.current.rotation.y+=(turn-root.current.rotation.y)*Math.min(1,delta*4)
      root.current.position.y=Math.sin(state.clock.elapsedTime*.5)*.025
    }
  })
  return <group ref={root}>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.37,0]} receiveShadow>
      <planeGeometry args={[12.5,9]}/><meshStandardMaterial color="#eef0f4" roughness={.96}/>
    </mesh>
    <gridHelper args={[13,13,'#c7c1db','#d9d9e3']} position={[0,-.365,0]}/>
    <instancedMesh ref={blockMesh} args={[undefined,undefined,bricks.length]} castShadow receiveShadow frustumCulled={false}>
      <boxGeometry args={[1.2,.5,.9]}/>
      <meshStandardMaterial color="#ffffff" roughness={.42} metalness={.06}/>
    </instancedMesh>
    <instancedMesh ref={studMesh} args={[undefined,undefined,bricks.length*4]} castShadow frustumCulled={false}>
      <cylinderGeometry args={[.145,.145,.10,12]}/>
      <meshStandardMaterial color="#ffffff" roughness={.43} metalness={.06}/>
    </instancedMesh>
    <mesh position={[-1.1,-.28,3.5]}><boxGeometry args={[2.3,.14,.25]}/><meshStandardMaterial color="#d9c7ee"/></mesh>
    <mesh position={[2.7,-.28,3.5]}><boxGeometry args={[2.3,.14,.25]}/><meshStandardMaterial color="#f4cebe"/></mesh>
  </group>
}

function CityCanvas({progressRef,reduced}:{progressRef:React.RefObject<number>;reduced:boolean}){
  return <Canvas camera={{position:[12,10,15],fov:36}} dpr={[1,1.6]} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} shadows={false}>
    <ambientLight intensity={1.8}/><directionalLight position={[3,9,8]} intensity={2.9} color="#ffffff"/>
    <pointLight position={[-5,6,-4]} intensity={18} distance={18} color="#e1cafc"/>
    <CityModel progressRef={progressRef} reduced={reduced}/>
  </Canvas>
}
const stories=[
  {label:'01 / NHỮNG MẢNH GHÉP',heading:<>Mỗi sáng tạo bắt đầu từ <em>một khối nhỏ.</em></>,description:'Một mảnh ghép riêng lẻ tưởng như rất nhỏ bé, nhưng có thể trở thành nền móng cho điều lớn lao.'},
  {label:'02 / LÀM VIỆC CÙNG NHAU',heading:<>Khi ý tưởng <em>tìm thấy nhau.</em></>,description:'Các khối màu lần lượt trở về vị trí, xếp chồng và hình thành những công trình đầu tiên.'},
  {label:'03 / XÂY DỰNG',heading:<>Cùng xây nên <em>một thành phố sáng tạo.</em></>,description:'Từ những mảnh ghép và nhiều góc nhìn, chúng ta có thể tạo nên một không gian chung để phát triển.'}
]
export default function LegoActivitiesVisual(){
  const {sectionRef,progress,progressRef,reducedMotion}=useScrollScene()
  const phase=progress<.30?0:progress<.8?1:2
  return <section ref={sectionRef} className={'motion-chapter city-story'+(reducedMotion?' motion-reduced':'')} aria-label="Thành phố khối lắp ghép hình thành theo cuộn trang">
    <div className="motion-sticky city-stage">
      <div className="motion-topline"><span><Blocks size={15}/> DIGITAL CREATORS / BUILD TOGETHER</span><span>BRICK CITY <ArrowDown size={14}/></span></div>
      <div className="motion-copy">
        {stories.map((story,i)=><div key={story.label} className={'motion-copy-panel'+(i===phase?' selected':'')} aria-hidden={!reducedMotion&&i!==phase}>
          <span className="motion-tag"><Sparkles size={15}/>{story.label}</span><h2>{story.heading}</h2><p>{story.description}</p>
          {i===2 && <Link to="/dang-ky" tabIndex={reducedMotion||phase===i?0:-1} className="motion-cta">Tham gia kiến tạo <ArrowUpRight size={16}/></Link>}
        </div>)}
      </div>
      <div className="motion-visual city-visual">
        <div className="city-tag city-tag-top">DESIGN + CODE + CREATE</div>
        <SceneErrorBoundary label="Thành phố sáng tạo"><CityCanvas progressRef={progressRef} reduced={reducedMotion}/></SceneErrorBoundary>
        <div className="city-tag city-tag-bottom">ONE BLOCK AT A TIME ✳</div>
      </div>
      <button type="button" className="motion-skip" onClick={() => sectionRef.current?.nextElementSibling?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth',block:'start'})}>BỎ QUA HIỆU ỨNG ↗</button>
      <div className="motion-footer"><span>CREATE / BUILD / CONNECT</span><div className="motion-progress"><i style={{width:(progress*100)+'%'}}/></div><strong>0{phase+1} / 03</strong></div>
    </div>
  </section>
}
