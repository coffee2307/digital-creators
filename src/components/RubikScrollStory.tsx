import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { Quaternion, Vector3, type Group } from 'three'
import { ArrowDown, ArrowUpRight, Lightbulb, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollScene } from '../hooks/useScrollScene'
import SceneErrorBoundary from './SceneErrorBoundary'
import { useThemeMode } from '../hooks/useThemeMode'

type Axis = 'x' | 'y' | 'z'
type Turn = { axis: Axis; layer: number; sign: number }
type Pose = { position: Vector3; rotation: Quaternion }
const axisVectors = { x: new Vector3(1, 0, 0), y: new Vector3(0, 1, 0), z: new Vector3(0, 0, 1) }
const colors = { x: ['#73ecdb','#f38cbf'], y: ['#f0c44b','#a783f4'], z: ['#75b9ff','#ff9975'] }
const scramble: Turn[] = [
  { axis:'x',layer:1,sign:1 }, { axis:'y',layer:-1,sign:-1 },
  { axis:'z',layer:1,sign:1 }, { axis:'x',layer:-1,sign:-1 },
  { axis:'y',layer:1,sign:1 }, { axis:'z',layer:-1,sign:-1 },
  { axis:'x',layer:0,sign:1 }, { axis:'z',layer:0,sign:1 },
  { axis:'y',layer:-1,sign:1 }, { axis:'x',layer:1,sign:-1 },
  { axis:'z',layer:1,sign:-1 }, { axis:'y',layer:0,sign:1 },
]
const solve = [...scramble].reverse().map(move => ({ ...move, sign: -move.sign }))
const baseCoordinates: Vector3[] = []
for (let x=-1; x<=1; x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++) baseCoordinates.push(new Vector3(x,y,z))
const copyPose = (pose: Pose): Pose => ({ position: pose.position.clone(), rotation: pose.rotation.clone() })
function applyTurn(pose: Pose, move: Turn): Pose {
  const next = copyPose(pose)
  if (Math.round(next.position[move.axis]) !== move.layer) return next
  const q = new Quaternion().setFromAxisAngle(axisVectors[move.axis], move.sign * Math.PI / 2)
  next.position.applyQuaternion(q).round()
  next.rotation.premultiply(q)
  return next
}
function buildStates() {
  let starting: Pose[] = baseCoordinates.map(position => ({ position:position.clone(), rotation:new Quaternion() }))
  for (const move of scramble) starting = starting.map(pose => applyTurn(pose, move))
  const states: Pose[][] = [starting.map(copyPose)]
  for (const move of solve) states.push(states[states.length-1].map(pose=>applyTurn(pose,move)))
  return states
}
const allStates = buildStates()
const stickerFaces = [
  { key:'x+', color:colors.x[0],pos:[.498,0,0],rotation:[0,Math.PI/2,0] },
  { key:'x-', color:colors.x[1],pos:[-.498,0,0],rotation:[0,-Math.PI/2,0] },
  { key:'y+', color:colors.y[0],pos:[0,.498,0],rotation:[-Math.PI/2,0,0] },
  { key:'y-', color:colors.y[1],pos:[0,-.498,0],rotation:[Math.PI/2,0,0] },
  { key:'z+', color:colors.z[0],pos:[0,0,.498],rotation:[0,0,0] },
  { key:'z-', color:colors.z[1],pos:[0,0,-.498],rotation:[0,Math.PI,0] },
] as const

function RubikCube({ progressRef, reduced, dark }: {progressRef: React.RefObject<number>;reduced:boolean;dark:boolean}) {
  const meshes = useRef<(Group|null)[]>([])
  const root = useRef<Group>(null)
  const temp = useMemo(() => ({ position:new Vector3(), quaternion:new Quaternion(), rotation:new Quaternion() }), [])
  useFrame((state,delta) => {
    const p = reduced ? 1 : progressRef.current
    const moves = Math.min(solve.length, Math.max(0, (p-.12)/.73 * solve.length))
    const turnIndex = Math.min(solve.length-1,Math.floor(moves))
    const fraction = Math.min(1,moves-turnIndex)
    const move = solve[turnIndex]
    const turn = temp.rotation.setFromAxisAngle(axisVectors[move.axis],move.sign*Math.PI/2*fraction)
    for(let i=0;i<meshes.current.length;i++){
      const mesh = meshes.current[i]
      if(!mesh) continue
      const pose = allStates[Math.floor(moves)][i]
      temp.position.copy(pose.position)
      temp.quaternion.copy(pose.rotation)
      if (moves<solve.length && Math.round(pose.position[move.axis])===move.layer) {
        temp.position.applyQuaternion(turn)
        temp.quaternion.premultiply(turn)
      }
      mesh.position.copy(temp.position).multiplyScalar(1.012)
      mesh.quaternion.copy(temp.quaternion)
    }
    if(root.current){
      root.current.rotation.x += (0.32 + Math.sin(p*Math.PI*2)*.10-root.current.rotation.x)*Math.min(1,delta*5)
      root.current.rotation.y += (0.56+p*1.36-root.current.rotation.y)*Math.min(1,delta*4)
      root.current.position.y = Math.sin(state.clock.elapsedTime*.8)*.045
    }
  })
  return <group ref={root}>
    {baseCoordinates.map((point,index)=><group ref={node=>{meshes.current[index]=node}} key={index}>
      <RoundedBox args={[.96,.96,.96]} radius={.06} smoothness={2}>
        <meshStandardMaterial color={dark ? "#080c1b" : "#20233a"} metalness={dark ? .48 : .38} roughness={.28}/>
      </RoundedBox>
      {stickerFaces.filter(face=>{
        const axis=face.key[0] as Axis
        return point[axis] === (face.key[1]==='+'?1:-1)
      }).map(face=><mesh key={face.key} position={face.pos} rotation={face.rotation}>
        <planeGeometry args={[.78,.78]}/>
        <meshStandardMaterial color={face.color} emissive={face.color} emissiveIntensity={dark ? 1.75 : .38} metalness={.10} roughness={.25} side={2}/>
      </mesh>)}
    </group>)}
  </group>
}

function RubikCanvas({progressRef,reduced,dark}:{progressRef:React.RefObject<number>;reduced:boolean;dark:boolean}) {
  return <Canvas className="rubik-canvas" camera={{position:[5.7,4.7,8.5],fov:37}} dpr={[1,1.6]} gl={{alpha:true,antialias:true,powerPreference:'low-power'}}>
    <ambientLight intensity={dark ? .48 : 1.5}/>
    <directionalLight position={[4,9,7]} intensity={dark ? 1.55 : 3} color={dark ? "#b5daff" : "#ffffff"}/>
    <pointLight position={[-4,-1,3]} intensity={dark ? 19 : 15} color={dark ? "#54eaff" : "#b5c7ff"} distance={12}/>
    <pointLight position={[4,2,-3]} intensity={dark ? 18 : 12} color={dark ? "#ff56ca" : "#ff98c6"} distance={12}/>
    <RubikCube progressRef={progressRef} reduced={reduced} dark={dark}/>
  </Canvas>
}
const copy = [
  {tag:'01 / TƯ DUY',title:<>Mọi ý tưởng đều bắt đầu từ <em>một thử thách.</em></>,detail:'Đôi khi mọi thứ trông thật phức tạp. Nhưng mỗi vấn đề đều có thể được khám phá từ những bước nhỏ nhất.'},
  {tag:'02 / KHÁM PHÁ',title:<>Từng bước tìm ra <em>lời giải.</em></>,detail:'Hãy tiếp tục cuộn: từng tầng Rubik thay đổi vị trí theo hành trình giải mã, từng lựa chọn tạo nên tiến bộ.'},
  {tag:'03 / PHÁT TRIỂN',title:<>Từ hỗn độn đến <em>trật tự.</em></>,detail:'Một khối Rubik hoàn chỉnh — tượng trưng cho tư duy logic, sự kiên trì và tinh thần không ngừng khám phá.'}
]
export default function RubikScrollStory(){
  const {sectionRef,progress,progressRef,reducedMotion}=useScrollScene()
  const dark = useThemeMode() === 'dark'
  const step=progress<.23?0:progress<.78?1:2
  return <section ref={sectionRef} id="hanh-trinh" className={'motion-chapter rubik-story'+(reducedMotion?' motion-reduced':'')} aria-label="Rubik 3x3 tự giải theo cuộn trang">
    <div className="motion-sticky rubik-stage">
      <div className="motion-topline"><span><Sparkles size={16}/> DIGITAL CREATORS / THINK IN 3D</span><span>RUBIK 3×3 <ArrowDown size={14}/></span></div>
      <div className="motion-overline">THINK<br/>DIFFERENT</div>
      <div className="motion-copy">
        {copy.map((part,i)=><div key={part.tag} className={'motion-copy-panel'+(step===i?' selected':'')} aria-hidden={!reducedMotion&&step!==i}>
          <span className="motion-tag"><Lightbulb size={15}/>{part.tag}</span>
          <h2>{part.title}</h2><p>{part.detail}</p>
          {i===2 && <Link className="motion-cta" to="/gioi-thieu" tabIndex={reducedMotion||step===i?0:-1}>Khám phá CLB <ArrowUpRight size={17}/></Link>}
        </div>)}
      </div>
      <div className="motion-visual rubik-visual"><div className="rubik-ambient"/><div className="rubik-halo"/>
        <SceneErrorBoundary label="Rubik 3×3"><RubikCanvas progressRef={progressRef} reduced={reducedMotion} dark={dark}/></SceneErrorBoundary>
        <div className="visual-corner-label">27 CUBIES <span>·</span> 12 REVERSE MOVES</div>
      </div>
      <button type="button" className="motion-skip" onClick={() => sectionRef.current?.nextElementSibling?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth',block:'start'})}>BỎ QUA HIỆU ỨNG ↗</button>
      <div className="motion-footer"><span>SCROLL TO SOLVE</span><div className="motion-progress"><i style={{width:(progress*100)+'%'}}/></div><strong>0{step+1} / 03</strong></div>
    </div>
  </section>
}
