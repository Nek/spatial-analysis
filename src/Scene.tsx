import { CameraControls, TransformControls, Sphere, Select, Cone } from '@react-three/drei'
import { Suspense, useRef, useState } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Group, type Object3D } from 'three'

import { Smush32 } from '@thi.ng/random'
const rnd = new Smush32(0)

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

  const [orbit, setOrbit] = useState(true)
  useHotkeys(' ', (event) => {
    setOrbit(!orbit)
    event.preventDefault()
  })

  const objectsG = useRef<Group | null>(null)

  return (
    <Suspense fallback={<Sphere />}>
      <CameraControls makeDefault enabled={orbit} />
      <gridHelper />
      <axesHelper args={[5]} />
      <Light />
      {active && (
        <TransformControls
          showZ={transformMode === 'rotate'}
          showX={transformMode !== 'rotate'}
          showY={transformMode !== 'rotate'}
          mode={transformMode}
          object={active}
          space={space}
          onObjectChange={(e) => console.log(e?.target.object)}
        />
      )}
      <Select box multiple={true} onChange={(e) => setSelected(e)} onClick={(e) => setSelected([e.object])}>
        <group ref={objectsG}>
          {[...Array(5)].map((_, i) => {
            return (
              <group
                key={'cone' + i}
                rotation={[0, 0, (180 * Math.PI) / 180, 'XYZ']}
                position={[rnd.minmax(-3, 3), rnd.minmax(1, 1.5), 0]}
              >
                <Cone args={[1, 12, 24]} position={[0, -6, 0]}>
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
