import { CameraControls, TransformControls, Sphere, Select, Cone } from '@react-three/drei'
import { Object3DNode, extend, useFrame } from '@react-three/fiber'
import { RefObject, Suspense, useEffect, useRef, useState } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Group, type Object3D } from 'three'

// declare module '@react-three/fiber' {
//   interface ThreeElements {
//     octreeHelper: Object3DNode<OctreeHelper, typeof OctreeHelper>
//   }
// }

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
  const [selected, setSelected] = useState<Object3D[]>([])
  const active = selected[0]
  useHotkeys('Escape', () => {
    setSelected([])
  })

  const [transformMode, setTransformMode] = useState<'scale' | 'translate' | 'rotate'>('translate')
  useHotkeys('t', () => {
    setTransformMode('translate')
  })
  useHotkeys('s', () => {
    setTransformMode('scale')
  })
  useHotkeys('r', () => {
    setTransformMode('rotate')
  })

  const [space, setSpace] = useState<'world' | 'local'>('world')
  useHotkeys('q', () => {
    setSpace(space === 'world' ? 'local' : 'world')
  })

  const [orbit, setOrbit] = useState(false)

  useHotkeys(' ', (event) => {
    setOrbit(!orbit)
    event.preventDefault()
  })

  const objectsG = useRef<Group | null>(null)

  // useFrame(() => {
  //   if (objectsG.current) {
  //     console.log(objectsG.current?.children[0])
  //     // objectsG.current?.children.forEach((o) => console.log(o))
  //   }
  // })

  return (
    <Suspense fallback={<Sphere />}>
      <CameraControls makeDefault enabled={orbit} />
      <gridHelper />
      <axesHelper args={[5]} />
      <Light />
      {active && (
        <TransformControls
          mode={transformMode}
          object={active}
          space={space}
          onObjectChange={(e) => console.log(e?.target.object)}
        />
      )}
      {/*<mesh>*/}
      {/*  <coneGeometry args={[1, 3, 32]} />*/}
      {/*  <meshBasicMaterial color={'red'} opacity={0.5} />*/}
      {/*</mesh>*/}
      <Select box multiple={true} onChange={(e) => setSelected(e)}>
        <group ref={objectsG}>
          {[...Array(5)].map((_, i) => {
            return (
              <group key={'cone' + i} position={[0, 6, 0]}>
                <Cone args={[1, 12, 24]} position={[0, 0, 0]}>
                  <meshBasicMaterial color={'rgb(164,84,217)'} opacity={0.25} transparent={true} depthWrite={false} />
                </Cone>
              </group>
            )
          })}
        </group>
      </Select>
      <ambientLight intensity={0.2} />
    </Suspense>
  )
}

export { Scene }
