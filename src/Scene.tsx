import { OrbitControls, MarchingCubes, MarchingCube } from '@react-three/drei'
import { Object3DNode, extend, useFrame } from '@react-three/fiber'
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
  Box3,
  MeshPhysicalMaterial,
  Group,
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
  Group,
  MeshPhysicalMaterial,
})
import { OctreeHelper } from 'sparse-octree'
import {Octree} from 'linear-octree'
extend({ OctreeHelper })

declare module '@react-three/fiber' {
  interface ThreeElements {
    octreeHelper: Object3DNode<OctreeHelper, typeof OctreeHelper>
  }
}

import { useLoader } from '@react-three/fiber'
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader'
import marchCubes from './marchCubes'

function Light() {
  return (
    <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
      <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
    </directionalLight>
  )
}

type AtomJSON = [number, number, number, [number, number, number]]

function CaffeineMolecule() {

  const caffeineData = useLoader(PDBLoader, '/protein.pdb')

  const [molecules, setMolecules] = useState<Octree<Color[]>>()

  const ref = createRef()

  useEffect(() => {
    const pdb = caffeineData
    const { atoms } = pdb.json as { atoms: AtomJSON[] }
    let positions: Vector3[] = []
    let colors: Color[] = []
    for (let i = 0; i < atoms.length; i++) {
      const atom = atoms[i]
      const [x, y, z, [r, g, b]] = atom
      positions.push(new Vector3(x, y, z))
      colors.push(new Color(r / 255, g / 255, b / 255))
    }

    const depth = 3

    const {octree, texture3D} = marchCubes({positions, colors}, depth)

    const canvas = document.getElementById('debug')! as HTMLCanvasElement

    const maxDim = Math.pow(2, depth)
    canvas.width = maxDim
    canvas.height = maxDim * maxDim
    // canvas.style.width = `${maxDim}px`
    // canvas.style.height = `${maxDim * maxDim}px`
    const ctx = canvas.getContext('2d')
    texture3D.forEach((layer, i) => {
      ctx!.putImageData(layer, 0, i * maxDim)
    })
    // console.log("0,0,0", octree.get(new Vector3(1,1,1), level))

    setMolecules(octree)
  }, [caffeineData])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta / 3
  })

  return <octreeHelper args={[molecules]} />
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
