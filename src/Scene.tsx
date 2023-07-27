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
import { Octree, KeyDesign } from 'linear-octree'
import { OctreeHelper } from 'sparse-octree'

extend({ OctreeHelper })

declare module '@react-three/fiber' {
  interface ThreeElements {
    octreeHelper: Object3DNode<OctreeHelper, typeof OctreeHelper>
  }
}

import { useLoader } from '@react-three/fiber'
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader'

function Light() {
  return (
    <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
      <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
    </directionalLight>
  )
}

type Cell = Color[]

type AtomJSON = [number, number, number, [number, number, number]]

function CaffeineMolecule() {
  const depth = 3

  const maxDim = Math.pow(2, depth)

  const caffeineData = useLoader(PDBLoader, '/protein.pdb')

  const [molecules, setMolecules] = useState<Octree<Cell>>()

  const ref = createRef()

  function pointsToField(points: AtomJSON[], depth: number) {
    const positions = []
    const colors: Color[] = []

    for (let i = 0; i < points.length; i++) {
      const atom = points[i]
      const [x, y, z, [r, g, b]] = atom
      positions.push(new Vector3(x, y, z))
      colors.push(new Color(r / 255, g / 255, b / 255))
    }

    const bBox = new Box3()

    // calculate bounding box of the molecule
    bBox.setFromPoints(positions)

    // calculate the minimum and maximum of the bounding box
    let minMin = Math.min(bBox.min.x, bBox.min.y, bBox.min.z)
    let maxMax = Math.max(bBox.max.x, bBox.max.y, bBox.max.z)

    // calculate the width of a cell taking in account outer padding of always empty cells
    const cellWidth = (maxMax - minMin) / (maxDim - 2)

    // add padding to bounding box
    minMin -= cellWidth
    maxMax += cellWidth

    bBox.set(new Vector3(minMin, minMin, minMin), new Vector3(maxMax, maxMax, maxMax))

    const keyDesign = new KeyDesign(depth, depth, depth)

    const octree = new Octree<Cell>(bBox, keyDesign)

    const box = new Box3()

    keyDesign.getMinKeyCoordinates(box.min)
    keyDesign.getMaxKeyCoordinates(box.max)

    const level = 0

    const keyCoordinates = new Vector3()

    for (const key of keyDesign.keyRange(box.min, box.max)) {
      octree.set(keyDesign.unpackKey(key, keyCoordinates), level, [])
    }

    function addPoint(position: Vector3, color: Color) {
      const keyCoordinates = new Vector3()
      octree.calculateKeyCoordinates(position, level, keyCoordinates)
      const data = octree.get(keyCoordinates, level)
      octree.set(keyCoordinates, level, [...data!, color])
    }

    // calculate the radius of an atom
    const atomR = Math.sqrt(cellWidth * cellWidth) / 2

    positions.forEach((position, i) => {
      const sides = [
        [atomR, 0, 0],
        [0, atomR, 0],
        [0, 0, atomR],
        [-atomR, 0, 0],
        [0, -atomR, 0],
        [0, 0, -atomR],
      ].map((side) => {
        return position.clone().add(new Vector3(...side))
      })
      sides.forEach((side) => addPoint(side, colors[i]))
    })

    return octree
  }

  function octreeTo3DTexture(octree: Octree<Cell>, depth: number) {
    const maxDim = Math.pow(2, depth)
    const level = 0
    const keyDesign = new KeyDesign(depth, depth, depth)
    const box = new Box3()

    keyDesign.getMinKeyCoordinates(box.min)
    keyDesign.getMaxKeyCoordinates(box.max)

    const keyCoordinates = new Vector3()

    const layers = []

    let maxDensity = 0
    for (const key of keyDesign.keyRange(box.min, box.max)) {
      keyDesign.unpackKey(key, keyCoordinates)
      maxDensity = Math.max(maxDensity, octree.get(keyCoordinates, level)!.length)
    }

    for (let x = 0; x < maxDim; x++) {
      const layer = new Uint8ClampedArray(maxDim * maxDim * 4)
      for (let y = 0; y < maxDim; y++) {
        for (let z = 0; z < maxDim; z++) {
          const keyCoordinates = new Vector3(x, y, z)
          const data = octree.get(keyCoordinates, level)!
          if (data.length === 0) {
            layer.set([0, 0, 0, 0], (y + z * maxDim) * 4)
          } else {
            const color = (
              data.length > 1
                ? data.reduce((acc, color) => {
                    return acc.lerp(color, 0.5)
                  })
                : data[0]
            )
              .toArray()
              .map((comp) => Math.round(comp * 255))
            const alpha = Math.round((data.length / maxDensity) * 255)
            layer.set([...color, alpha], (y + z * maxDim) * 4)
          }
        }
      }
      layers.push(new ImageData(layer, maxDim))
    }

    return layers
  }

  useEffect(() => {
    const pdb = caffeineData
    const { atoms } = pdb.json as { atoms: AtomJSON[] }

    const octree = pointsToField(atoms, depth)
    const layers = octreeTo3DTexture(octree, depth)

    const canvas = document.getElementById('debug')! as HTMLCanvasElement
    canvas.width = maxDim
    canvas.height = maxDim * maxDim
    // canvas.style.width = `${maxDim}px`
    // canvas.style.height = `${maxDim * maxDim}px`
    const ctx = canvas.getContext('2d')
    layers.forEach((layer, i) => {
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
