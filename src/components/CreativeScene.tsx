import { Float, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { MathUtils, type Group } from 'three'

function Workspace({ reducedMotion }: { reducedMotion: boolean }) {
  const rig = useRef<Group>(null)

  useFrame(({ pointer }, delta) => {
    if (!rig.current || reducedMotion) return
    rig.current.rotation.y = MathUtils.damp(rig.current.rotation.y, pointer.x * 0.17, 3, delta)
    rig.current.rotation.x = MathUtils.damp(rig.current.rotation.x, -pointer.y * 0.1, 3, delta)
  })

  return (
    <group ref={rig} rotation={[0.05, -0.12, -0.06]}>
      <Float speed={reducedMotion ? 0 : 1.3} rotationIntensity={reducedMotion ? 0 : 0.12} floatIntensity={reducedMotion ? 0 : 0.32}>
        <group position={[0, 0.0, 0]} rotation={[0.07, -0.16, -0.1]}>
          <RoundedBox args={[3.4, 3.9, 0.4]} radius={0.32} smoothness={4}>
            <meshStandardMaterial color="#e4d9f8" metalness={0.03} roughness={0.46} />
          </RoundedBox>
          <RoundedBox position={[0, 0, 0.27]} args={[3.0, 3.45, 0.075]} radius={0.24} smoothness={4}>
            <meshStandardMaterial color="#faf8ff" roughness={0.8} />
          </RoundedBox>
          <mesh position={[0, 1.25, 0.32]}>
            <boxGeometry args={[2.35, 0.14, 0.015]} />
            <meshBasicMaterial color="#b8a8ec" />
          </mesh>
          <mesh position={[-0.83, 1.52, 0.32]}>
            <sphereGeometry args={[0.07, 18, 18]} />
            <meshBasicMaterial color="#ffa7a4" />
          </mesh>
          <mesh position={[-0.59, 1.52, 0.32]}>
            <sphereGeometry args={[0.07, 18, 18]} />
            <meshBasicMaterial color="#f9d98b" />
          </mesh>
          <mesh position={[-0.35, 1.52, 0.32]}>
            <sphereGeometry args={[0.07, 18, 18]} />
            <meshBasicMaterial color="#bde5c8" />
          </mesh>
          <RoundedBox position={[0, 0.27, 0.38]} args={[2.42, 1.63, 0.06]} radius={0.14} smoothness={4}>
            <meshStandardMaterial color="#d2edf0" />
          </RoundedBox>
          <mesh position={[-0.34, 0.35, 0.45]} rotation={[0, 0, -0.22]}>
            <torusGeometry args={[0.54, 0.23, 16, 64]} />
            <meshStandardMaterial color="#b3a0ed" roughness={0.4} />
          </mesh>
          <mesh position={[0.52, 0.22, 0.52]} rotation={[0.4, 0.1, 0.4]}>
            <icosahedronGeometry args={[0.43, 0]} />
            <meshStandardMaterial color="#ffc0a7" roughness={0.44} flatShading />
          </mesh>
          <RoundedBox position={[-0.65, -1.05, 0.4]} args={[1.1, 0.34, 0.08]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#b7d7c5" />
          </RoundedBox>
          <RoundedBox position={[0.58, -1.05, 0.4]} args={[1.1, 0.34, 0.08]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#e6d5f8" />
          </RoundedBox>
        </group>
      </Float>
      <Float speed={reducedMotion ? 0 : 2} rotationIntensity={reducedMotion ? 0 : 0.35} floatIntensity={reducedMotion ? 0 : 0.5}>
        <mesh position={[-2.23, 1.17, 0.7]} rotation={[0.3, 0.2, -0.4]}>
          <torusGeometry args={[0.52, 0.13, 16, 64]} />
          <meshStandardMaterial color="#9ecbd0" roughness={0.3} metalness={0.15} />
        </mesh>
        <mesh position={[2.18, 1.42, -0.25]} rotation={[0.2, 0.4, 0.16]}>
          <octahedronGeometry args={[0.72, 0]} />
          <meshStandardMaterial color="#ffcab5" roughness={0.5} flatShading />
        </mesh>
        <mesh position={[2.24, -0.76, 0.55]} rotation={[0.2, 0.4, -0.3]}>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial color="#b3c8ed" roughness={0.4} />
        </mesh>
        <mesh position={[-2.22, -1.36, -0.15]} rotation={[0.3, 0.4, 0.6]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#f2d2a8" roughness={0.5} />
        </mesh>
      </Float>
      <mesh position={[-1.8, 2.15, -1.35]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#b5daca" />
      </mesh>
      <mesh position={[1.58, -1.88, -0.7]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#d4b7e9" />
      </mesh>
    </group>
  )
}

export default function CreativeScene({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <div className="creative-scene" aria-label="Mô hình 3D không gian sáng tạo số gồm bảng thiết kế và các khối hình pastel" role="img">
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 8.7], fov: 38 }} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}>
        <ambientLight intensity={2.4} />
        <directionalLight position={[3, 5, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-4, -3, 3]} intensity={1.4} color="#dbdbff" />
        <Suspense fallback={null}>
          <Workspace reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  )
}
