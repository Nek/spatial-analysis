import { CameraControls, TransformControls, Sphere, Select, OrbitControls, Cone } from '@react-three/drei'
import { Object3DNode, extend, useFrame } from '@react-three/fiber'

import { OctreeHelper } from 'sparse-octree'
import { RefObject, Suspense, useEffect, useRef, useState } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { type Object3D } from 'three'

extend({ OctreeHelper })

declare module '@react-three/fiber' {
  interface ThreeElements {
    octreeHelper: Object3DNode<OctreeHelper, typeof OctreeHelper>
  }
}

function Light() {
  return (
    <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
      <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
    </directionalLight>
  )
}

const EditableCone = () => {
  const mesh = useRef(null)
  useEffect(() => console.log(mesh.current), [mesh.current])
  return (
    <>
      <mesh ref={mesh}>
        <coneGeometry args={[1, 3, 32]} />
        <meshBasicMaterial color={'red'} opacity={0.5} />
      </mesh>
      <TransformControls object={mesh.current!} mode="translate" />
    </>
  )
}

function Scene() {
  const cone = useRef<any>(null!)
  const mesh = useRef(null)
  const [selected, setSelected] = useState<Object3D>()

  console.log(selected)

  return (
    <Suspense fallback={<Sphere />}>
      <gridHelper />
      <axesHelper args={[5]} />
      <Light />
      {selected && <TransformControls object={selected} />}
      <group>
        <Cone
          onClick={(e) => {
            console.log(e)
            return setSelected(e.object)
          }}
        />
      </group>
      <mesh onClick={(e) => setSelected(e.object)}>
        <coneGeometry args={[1, 3, 32]} />
        <meshBasicMaterial color={'red'} opacity={0.5} />
      </mesh>
      <ambientLight intensity={0.2} />
      {/*<OrbitControls makeDefault />*/}
    </Suspense>
  )
}

export { Scene }
