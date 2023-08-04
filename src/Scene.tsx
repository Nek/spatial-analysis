import { CameraControls, TransformControls, Sphere, Select, Cone } from '@react-three/drei'
import { Suspense, useRef, useState } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Group, type Object3D } from 'three'

import { randomID, Smush32 } from '@thi.ng/random'

// declare module '@react-three/fiber' {
//   interface ThreeElements {
//     octreeHelper: Object3DNode<OctreeHelper, typeof OctreeHelper>
//   }
// }

function useRefs<T>(): [Record<string, T | null>, (element: T | null, key: string) => void] {
  const refsByKey = useRef<Record<string, T | null>>({})

  const setRef = (element: T | null, key: string) => {
    refsByKey.current[key] = element
  }

  return [refsByKey.current, setRef]
}

function Light() {
  return (
    <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
      <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
    </directionalLight>
  )
}

const idsRND = new Smush32(0)
const CONE_IDS = [...Array(5)].map(() => randomID(8, 'cone-', '0123456789ABCDEF', idsRND))
function Scene() {
  const [refsByKey, setRef] = useRefs()

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
  const posRnd = new Smush32(0)

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
      <Select
        filter={(selected) => {
          console.log('!!!')
          const res = selected.filter((s) => s.name === 'cone')
          console.log(res)
          return res
        }}
        // onChange={(e) => setSelected(e)}
        onClick={(e) => {
          let res = e.object
          while (e.object.parent && res.name !== 'cone') {
            res = e.object.parent
            console.log(res)
          }
          console.log(res)
          setSelected([res])
        }}
      >
        <group ref={objectsG}>
          {CONE_IDS.map((id) => {
            return (
              <group
                name="cone"
                key={id}
                ref={(el) => setRef(el, id)}
                rotation={[0, 0, (180 * Math.PI) / 180, 'XYZ']}
                position={[posRnd.minmax(-3, 3), posRnd.minmax(1, 1.5), 0]}
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
