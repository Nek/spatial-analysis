import { OrbitControls } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { createRef, Suspense, useEffect, useState, useLayoutEffect } from 'react'
import {
  AmbientLight,
  BufferGeometry,
  Color,
  DirectionalLight,
  SphereGeometry,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  Vector3,
  InstancedMesh,
  Matrix4,
} from 'three'
extend({
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  BufferGeometry,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  InstancedMesh,
  MeshNormalMaterial,
})

import { useLoader } from '@react-three/fiber'
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader'

function Light() {
  return (
    <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
      <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
    </directionalLight>
  )
}

function CaffeineMolecule() {
  const caffeineData = useLoader(PDBLoader, '/protein.pdb')

  const [molecules, setMolecules] = useState<{position: [number, number, number], color: [number, number, number]}[]>([])

  const ref = createRef()
  useLayoutEffect(() => {
    const instancedMesh = ref.current
    molecules.forEach(({position: [x, y , z], color: [r, g, b]}, i) => {
      const m = new Matrix4()
      m.setPosition(x, y, z)
      instancedMesh.setMatrixAt(i, m)
      instancedMesh.setColorAt(i, new Color(r, g, b))
    })
    instancedMesh.needsUpdate = true
  }, [molecules])

  useEffect(() => {
    const pdb = caffeineData
    const json = pdb.json

    const newMolecules = []

    for (let i = 0; i < json.atoms.length; i++) {
      const atom = json.atoms[i]
      const [x,y,z, [r, g, b]] = atom
      newMolecules.push({position: [x,y,z] as [number, number, number], color: [r / 255, g / 255, b / 255] as [number, number, number]})
    }

    setMolecules(newMolecules)
  }, [caffeineData])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta / 3
  })

  return (
    <>
      <instancedMesh castShadow receiveShadow ref={ref} args={[undefined, undefined, molecules.length]}>
        <sphereGeometry args={[0.75, 12, 8]} />
        <meshStandardMaterial />
      </instancedMesh>
    </>
  )
}

function Scene() {
  return (
    <>
      <OrbitControls makeDefault />
      <Light />
      <ambientLight intensity={0.2} />
      <Suspense fallback={null}>
        <CaffeineMolecule />
      </Suspense>
    </>
  )
}

export { Scene }
