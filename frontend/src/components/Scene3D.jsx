import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

/* ── Rotating torus knot — the diagnostic "core" ── */
function DiagnosticCore() {
  const knotRef  = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()
  const coreRef  = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (knotRef.current)  { knotRef.current.rotation.x  = t * 0.18; knotRef.current.rotation.y  = t * 0.12 }
    if (ring1Ref.current) { ring1Ref.current.rotation.x = t * 0.35; ring1Ref.current.rotation.z = t * 0.08 }
    if (ring2Ref.current) { ring2Ref.current.rotation.y = -t * 0.55; ring2Ref.current.rotation.z = t * 0.15 }
    if (ring3Ref.current) { ring3Ref.current.rotation.z = t * 0.4;  ring3Ref.current.rotation.x = t * 0.2 }
    if (coreRef.current)  { coreRef.current.rotation.x  = t * 0.3;  coreRef.current.rotation.y  = t * 0.4 }
  })

  return (
    <group>
      {/* Torus knot — tangled wiring / engine internals */}
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[1.1, 0.28, 160, 20, 2, 3]} />
        <meshStandardMaterial
          color="#C9FF3B" emissive="#C9FF3B" emissiveIntensity={0.25}
          wireframe transparent opacity={0.85}
        />
      </mesh>

      {/* Outer scanning ring — yellow */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[3.0, 0.012, 8, 256]} />
        <meshStandardMaterial color="#C9FF3B" emissive="#C9FF3B" emissiveIntensity={1.2} />
      </mesh>

      {/* Mid ring — cyan */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.35, 0.008, 8, 256]} />
        <meshStandardMaterial color="#00CFFF" emissive="#00CFFF" emissiveIntensity={1.2} />
      </mesh>

      {/* Inner ring — red */}
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <torusGeometry args={[1.7, 0.006, 8, 256]} />
        <meshStandardMaterial color="#FF2D20" emissive="#FF2D20" emissiveIntensity={1.4} />
      </mesh>

      {/* Icosahedron core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} wireframe />
      </mesh>

      {/* Centre point glow */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#C9FF3B" emissive="#C9FF3B" emissiveIntensity={4} />
      </mesh>
    </group>
  )
}

/* ── Floating particle cloud ── */
function ParticleCloud({ count = 2500 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Distribute on a sphere shell for an "electron cloud" look
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 4 + Math.random() * 5
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.04
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.02) * 0.15
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial size={0.025} color="#C9FF3B" sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </Points>
  )
}

/* ── Secondary sparse cyan particles ── */
function CyanDust({ count = 600 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 22
      arr[i * 3 + 1] = (Math.random() - 0.5) * 22
      arr[i * 3 + 2] = (Math.random() - 0.5) * 22
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = -clock.elapsedTime * 0.025
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial size={0.018} color="#00CFFF" sizeAttenuation transparent opacity={0.4} depthWrite={false} />
    </Points>
  )
}

/* ── Lights ── */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[6, 6, 6]}   intensity={2}   color="#C9FF3B" />
      <pointLight position={[-6, -4, -4]} intensity={1.5} color="#00CFFF" />
      <pointLight position={[0, -6, 4]}   intensity={1}   color="#FF2D20" />
    </>
  )
}

/* ── Exported canvas ── */
export default function Scene3D({ style }) {
  return (
    <Canvas
      style={style}
      camera={{ position: [0, 0, 8], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Lights />
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
        <DiagnosticCore />
      </Float>
      <ParticleCloud />
      <CyanDust />
    </Canvas>
  )
}
