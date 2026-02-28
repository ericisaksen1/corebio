"use client"

import { useRef, useEffect, useState, useMemo, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Environment, ContactShadows, Lightformer } from "@react-three/drei"
import * as THREE from "three"
import Link from "next/link"

function createRubberTexture(): THREE.CanvasTexture {
  const w = 256
  const h = 256
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!

  // Dark gray base
  ctx.fillStyle = "#2a2a2a"
  ctx.fillRect(0, 0, w, h)

  // Fine noise grain for rubber surface texture
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const v = 30 + Math.random() * 25
      ctx.fillStyle = `rgb(${v},${v},${v})`
      ctx.fillRect(x, y, 2, 2)
    }
  }

  // Subtle circular stipple marks (like molded rubber)
  ctx.globalAlpha = 0.08
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 1 + Math.random() * 3
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = Math.random() > 0.5 ? "#1a1a1a" : "#3a3a3a"
    ctx.fill()
  }

  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 16
  return texture
}

function createBrushedMetalTexture(): THREE.CanvasTexture {
  const w = 512
  const h = 256
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!

  // Base silver
  ctx.fillStyle = "#c8c8c8"
  ctx.fillRect(0, 0, w, h)

  // Horizontal brush strokes — varying brightness lines
  for (let y = 0; y < h; y++) {
    const brightness = 160 + Math.random() * 70
    ctx.strokeStyle = `rgb(${brightness},${brightness},${brightness})`
    ctx.lineWidth = 0.5 + Math.random() * 1.5
    ctx.globalAlpha = 0.3 + Math.random() * 0.4
    ctx.beginPath()
    ctx.moveTo(0, y + Math.random() * 2)
    ctx.lineTo(w, y + Math.random() * 2)
    ctx.stroke()
  }

  // A few deeper scratch lines
  ctx.globalAlpha = 0.15
  for (let i = 0; i < 30; i++) {
    const y = Math.random() * h
    ctx.strokeStyle = `rgb(${120 + Math.random() * 40},${120 + Math.random() * 40},${120 + Math.random() * 40})`
    ctx.lineWidth = 0.5 + Math.random() * 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y + (Math.random() - 0.5) * 4)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 16
  return texture
}

function createLabelTexture(aspectRatio: number): THREE.CanvasTexture {
  // Size canvas to match the physical surface aspect ratio
  const h = 512
  const w = Math.round(h * aspectRatio)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!

  // Transparent background
  ctx.clearRect(0, 0, w, h)

  // Rounded rectangle label
  const pad = 20
  const cornerRadius = 30
  ctx.beginPath()
  ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, cornerRadius)
  ctx.fillStyle = "#ffffff"
  ctx.fill()

  const cx = w / 2

  // Brand name
  ctx.fillStyle = "#111111"
  ctx.font = "bold 72px Arial, Helvetica, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("CORE BIOGEN", cx, h * 0.37)

  // Divider line
  ctx.strokeStyle = "#cccccc"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w * 0.2, h * 0.47)
  ctx.lineTo(w * 0.8, h * 0.47)
  ctx.stroke()

  // Subtitle
  ctx.fillStyle = "#666666"
  ctx.font = "36px Arial, Helvetica, sans-serif"
  ctx.fillText("Research Peptide", cx, h * 0.59)

  // Purity badge
  ctx.font = "bold 28px Arial, Helvetica, sans-serif"
  ctx.fillStyle = "#2563eb"
  ctx.fillText("99%+ PURITY", cx, h * 0.72)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 16
  return texture
}

function Vial({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF("/models/vial.glb")
  const groupRef = useRef<THREE.Group>(null)
  const initializedRef = useRef(false)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (!initializedRef.current) {
      // Center the model so it spins in place
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      scene.position.sub(center)

      let largestMesh: THREE.Mesh | null = null
      let largestVolume = 0

      // Classify by original material and apply per-part materials
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh) || !child.material) return
        const mat = child.material as THREE.MeshStandardMaterial
        const { r, g, b } = mat.color
        const brightness = r * 0.299 + g * 0.587 + b * 0.114
        // Glass in GLB: black + metalness=1 + roughness=0 (perfectly smooth)
        const isGlass = mat.roughness < 0.05
        const isDark = brightness < 0.08 && !isGlass
        const isMetal = mat.metalness > 0.5 && !isGlass

        if (isGlass) {
          // Cylinder001 — inner cylinder, hide it
          child.visible = false
        } else if (isDark) {
          // Rubber stopper — textured rubber
          const rubberTex = createRubberTexture()
          child.material = new THREE.MeshPhysicalMaterial({
            map: rubberTex,
            color: new THREE.Color("#333333"),
            roughness: 0.9,
            metalness: 0,
            clearcoat: 0.15,
            clearcoatRoughness: 0.6,
            envMapIntensity: 0.8,
            sheen: 0.4,
            sheenRoughness: 0.8,
            sheenColor: new THREE.Color("#444444"),
          })
        } else if (isMetal) {
          if (mat.roughness > 0.9) {
            // Cylinder005/006 — these are the glass body (white, roughness=1 in GLB)
            const box = new THREE.Box3().setFromObject(child)
            const sz = box.getSize(new THREE.Vector3())
            const vol = sz.x * sz.y * sz.z
            // Hide the smaller inner wall, keep only the outer shell
            if (vol < 0.8) {
              child.visible = false
              return
            }
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color("#e4eaf0"),
              transparent: true,
              opacity: 0.6,
              roughness: 0.05,
              metalness: 0,
              envMapIntensity: 2.5,
              clearcoat: 1,
              clearcoatRoughness: 0,
              reflectivity: 1,
              specularIntensity: 1,
              specularColor: new THREE.Color("#ffffff"),
              side: THREE.DoubleSide,
              depthWrite: false,
            })
          } else {
            // Crimp — brushed silver aluminum cap
            const brushedTex = createBrushedMetalTexture()
            child.material = new THREE.MeshPhysicalMaterial({
              map: brushedTex,
              color: new THREE.Color("#e0e0e0"),
              metalness: 0.85,
              roughness: 0.4,
              envMapIntensity: 1,
              clearcoat: 0.2,
              clearcoatRoughness: 0.15,
              reflectivity: 0.5,
              specularIntensity: 0.5,
              specularColor: new THREE.Color("#ffffff"),
            })
          }
        }

        // Track largest mesh (glass body) for label placement
        const meshBox = new THREE.Box3().setFromObject(child)
        const size = meshBox.getSize(new THREE.Vector3())
        const vol = size.x * size.y * size.z
        if (vol > largestVolume) {
          largestVolume = vol
          largestMesh = child
        }
      })

      // Add label on the largest mesh (glass body)
      if (largestMesh) {
        const bodyBox = new THREE.Box3().setFromObject(largestMesh)
        const bodySize = bodyBox.getSize(new THREE.Vector3())
        const bodyCenter = bodyBox.getCenter(new THREE.Vector3())

        const labelRadius = Math.max(bodySize.x, bodySize.z) * 0.505
        const labelHeight = bodySize.y * 0.45
        const arcAngle = Math.PI * 1.6 // 80% wrap
        const arcLength = labelRadius * arcAngle
        const surfaceAspect = arcLength / labelHeight

        const labelTexture = createLabelTexture(surfaceAspect)

        const labelGeo = new THREE.CylinderGeometry(
          labelRadius, labelRadius, labelHeight, 64, 1, true,
          -arcAngle / 2, arcAngle
        )
        const labelMat = new THREE.MeshPhysicalMaterial({
          map: labelTexture,
          roughness: 0.4,
          metalness: 0,
          clearcoat: 0.3,
          clearcoatRoughness: 0.2,
          side: THREE.FrontSide,
          transparent: true,
          alphaTest: 0.1,
        })
        const labelMesh = new THREE.Mesh(labelGeo, labelMat)
        labelMesh.position.copy(bodyCenter)
        labelMesh.position.y -= bodySize.y * 0.05
        scene.add(labelMesh)
      }

      initializedRef.current = true
    }

    const speed = 0.3 + scrollProgress * 2.5
    groupRef.current.rotation.y += delta * speed
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      scrollProgress * 0.3,
      0.05
    )
  })

  return (
    <group ref={groupRef} scale={1.5}>
      <primitive object={scene} />
    </group>
  )
}

// Enable Draco decoder for compressed GLB
useGLTF.preload("/models/vial.glb")

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.InstancedMesh>(null)
  const backboneRef = useRef<THREE.InstancedMesh>(null)
  const rungRef = useRef<THREE.InstancedMesh>(null)

  const { sphereCount, backboneCount, rungCount } = useMemo(() => {
    const turns = 3
    const pointsPerTurn = 20
    const totalPoints = turns * pointsPerTurn
    const height = 12
    const radius = 1.2
    const dummy = new THREE.Object3D()
    const upVec = new THREE.Vector3(0, 1, 0)

    // Compute all transforms
    const sphereTransforms: THREE.Matrix4[] = []
    const backboneTransforms: THREE.Matrix4[] = []
    const rungTransforms: THREE.Matrix4[] = []

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints
      const angle = t * turns * Math.PI * 2
      const y = (t - 0.5) * height

      const ax = Math.cos(angle) * radius
      const az = Math.sin(angle) * radius
      const bx = Math.cos(angle + Math.PI) * radius
      const bz = Math.sin(angle + Math.PI) * radius

      // Strand A sphere
      dummy.position.set(ax, y, az)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      sphereTransforms.push(dummy.matrix.clone())

      // Strand B sphere
      dummy.position.set(bx, y, bz)
      dummy.updateMatrix()
      sphereTransforms.push(dummy.matrix.clone())

      // Backbone tubes
      if (i > 0) {
        const prevAngle = ((i - 1) / totalPoints) * turns * Math.PI * 2
        const prevY = ((i - 1) / totalPoints - 0.5) * height

        // Strand A backbone
        const startA = new THREE.Vector3(Math.cos(prevAngle) * radius, prevY, Math.sin(prevAngle) * radius)
        const endA = new THREE.Vector3(ax, y, az)
        const midA = startA.clone().add(endA).multiplyScalar(0.5)
        const dirA = endA.clone().sub(startA)
        const lenA = dirA.length()
        dummy.position.copy(midA)
        dummy.quaternion.setFromUnitVectors(upVec, dirA.normalize())
        dummy.scale.set(1, lenA / 1, 1) // scale Y to match segment length
        dummy.updateMatrix()
        backboneTransforms.push(dummy.matrix.clone())

        // Strand B backbone
        const startB = new THREE.Vector3(Math.cos(prevAngle + Math.PI) * radius, prevY, Math.sin(prevAngle + Math.PI) * radius)
        const endB = new THREE.Vector3(bx, y, bz)
        const midB = startB.clone().add(endB).multiplyScalar(0.5)
        const dirB = endB.clone().sub(startB)
        const lenB = dirB.length()
        dummy.position.copy(midB)
        dummy.quaternion.setFromUnitVectors(upVec, dirB.normalize())
        dummy.scale.set(1, lenB / 1, 1)
        dummy.updateMatrix()
        backboneTransforms.push(dummy.matrix.clone())
      }

      // Rungs every 4 points
      if (i % 4 === 0) {
        const startR = new THREE.Vector3(ax, y, az)
        const endR = new THREE.Vector3(bx, y, bz)
        const midR = startR.clone().add(endR).multiplyScalar(0.5)
        const dirR = endR.clone().sub(startR)
        const lenR = dirR.length()
        dummy.position.copy(midR)
        dummy.quaternion.setFromUnitVectors(upVec, dirR.normalize())
        dummy.scale.set(1, lenR / 1, 1)
        dummy.updateMatrix()
        rungTransforms.push(dummy.matrix.clone())
      }
    }

    // Apply transforms after refs are ready
    requestAnimationFrame(() => {
      if (sphereRef.current) {
        sphereTransforms.forEach((m, i) => sphereRef.current!.setMatrixAt(i, m))
        sphereRef.current.instanceMatrix.needsUpdate = true
      }
      if (backboneRef.current) {
        backboneTransforms.forEach((m, i) => backboneRef.current!.setMatrixAt(i, m))
        backboneRef.current.instanceMatrix.needsUpdate = true
      }
      if (rungRef.current) {
        rungTransforms.forEach((m, i) => rungRef.current!.setMatrixAt(i, m))
        rungRef.current.instanceMatrix.needsUpdate = true
      }
    })

    return {
      sphereCount: sphereTransforms.length,
      backboneCount: backboneTransforms.length,
      rungCount: rungTransforms.length,
    }
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -10]} scale={1.5} rotation={[0, 0, Math.PI / 4]}>
      {/* Nucleotide spheres — 1 draw call */}
      <instancedMesh ref={sphereRef} args={[undefined, undefined, sphereCount]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshPhysicalMaterial color="#4488cc" transparent opacity={0.35} roughness={0.3} metalness={0.1} clearcoat={0.5} />
      </instancedMesh>

      {/* Backbone tubes — 1 draw call */}
      <instancedMesh ref={backboneRef} args={[undefined, undefined, backboneCount]}>
        <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
        <meshPhysicalMaterial color="#5599dd" transparent opacity={0.25} roughness={0.4} />
      </instancedMesh>

      {/* Base pair rungs — 1 draw call */}
      <instancedMesh ref={rungRef} args={[undefined, undefined, rungCount]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshPhysicalMaterial color="#88bbee" transparent opacity={0.2} roughness={0.5} />
      </instancedMesh>
    </group>
  )
}

function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      {/* Studio lighting environment with custom Lightformer panels */}
      <Environment resolution={512} background={false}>
        {/* Key light — large softbox, upper right */}
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[4, 5, -3]}
          scale={[10, 5, 1]}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />
        {/* Fill light — opposite side, cooler, softer */}
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#c0d0ff"
          position={[-5, 2, 3]}
          scale={[8, 4, 1]}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />
        {/* Rim light — behind product, creates edge highlight */}
        <Lightformer
          form="rect"
          intensity={4}
          position={[0, 1, -6]}
          scale={[12, 3, 1]}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />
        {/* Top accent — overhead fill */}
        <Lightformer
          form="circle"
          intensity={1.5}
          position={[0, 8, 0]}
          scale={[5, 5, 1]}
          rotation-x={Math.PI / 2}
        />
        {/* Bottom fill — subtle warm uplight */}
        <Lightformer
          form="circle"
          intensity={0.4}
          color="#fff4e0"
          position={[0, -3, 0]}
          scale={[8, 8, 1]}
          rotation-x={Math.PI / 2}
        />
      </Environment>

      {/* Direct lights to supplement IBL */}
      <ambientLight intensity={0.3} />
      <spotLight
        position={[5, 5, 2]}
        intensity={1.5}
        angle={Math.PI / 5}
        penumbra={0.4}
        color="#ffffff"
      />
      <spotLight
        position={[-3, 3, 4]}
        intensity={0.8}
        angle={Math.PI / 4}
        penumbra={0.5}
        color="#d0e0ff"
      />

      <DNAHelix />

      <Vial scrollProgress={scrollProgress} />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={10}
        blur={2.5}
        far={4}
        resolution={256}
      />
    </>
  )
}

export function Hero3D() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = rect.height
      // Progress from 0 (top in view) to 1 (scrolled past)
      const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight))
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#070b14]"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/80 via-transparent to-[#0d1f3c]/60" />

      <div
        className="relative grid grid-cols-1 items-center gap-0 lg:grid-cols-2"
        style={{ minHeight: "calc(100dvh - var(--header-height, 64px) - var(--toolbar-height, 0px))" }}
      >
        {/* Text content */}
        <div className="z-10 flex items-center justify-center px-6 py-20 text-center lg:px-12 lg:text-left">
          <div className="w-full max-w-[800px]">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            High-Integrity Peptides,{" "}
            <span className="text-blue-400">Proven Quality</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300 sm:text-xl lg:mx-0 mx-auto">
            Core Biogen delivers research-use peptides manufactured to exceed
            99% purity standards, with every batch independently verified through
            third-party laboratory testing for accuracy and consistency.
          </p>
          <div className="mt-10">
            <Link
              href="/products"
              className="inline-flex h-14 items-center rounded-lg bg-blue-600 px-10 text-lg font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Shop Now
            </Link>
          </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="relative h-[400px] w-full bg-gradient-to-br from-gray-100 to-gray-200 lg:h-full lg:min-h-full">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{
              antialias: true,
              alpha: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
            }}
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              <Scene scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </section>
  )
}
