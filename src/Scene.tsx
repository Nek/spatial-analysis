import { CameraControls, Cone, Select, Sphere, TransformControls } from '@react-three/drei'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Group, type Object3D, Vector3 } from 'three'

import { randomID, Smush32 } from '@thi.ng/random'
import { produce } from 'immer'

// declare module '@react-three/fiber' {
//   interface ThreeElements {
//     octreeHelper: Object3DNode<OctreeHelper, typeof OctreeHelper>
//   }
// }

function useRefs<T>(
  initialValue: Record<string, T | null>,
): [Record<string, T | null>, (element: T | null, key: string) => void] {
  const refsByKey = useRef<Record<string, T | null>>(initialValue)

  const setRef = (element: T | null, key: string) => {
    refsByKey.current[key] = element
  }

  return [{ ...refsByKey.current }, setRef]
}

function Light() {
  return (
    <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
      <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
    </directionalLight>
  )
}
type DeviceDatum = { position: [number, number]; rotation: number; FOV: number }

const CONE_NUM = 5
const idsRND = new Smush32(0)
const deviceIds = [...Array(CONE_NUM)].map(() => randomID(8, 'device-', '0123456789ABCDEF', idsRND))
const deviceFOVs = [45, 60, 75, 30, 90].map((v) => ((v / 2) * Math.PI) / 180)

const posRnd = new Smush32(0)
const defaultDeviceData: [string, DeviceDatum][] = deviceIds.map((id, i) => {
  const FOV = deviceFOVs[i]
  // const r = Math.sqrt(((12 / Math.cos(FOV)) * 12) / Math.cos(FOV) - 12 * 12)
  const position = [posRnd.minmax(-3, 3), posRnd.minmax(1, 1.5)] as [number, number]
  const rotation = (180 * Math.PI) / 180
  return [id, { position, rotation, FOV }]
})
function Scene() {
  const [refsByKey, setRef] = useRefs<Group>({})

  const [deviceData, setDeviceData] = useState<Record<string, DeviceDatum>>(Object.fromEntries(defaultDeviceData))
  useEffect(() => {
    console.log('deviceData', deviceData)
  }, [deviceData])

  const [selected, setSelected] = useState<Object3D[]>([])
  const active = selected[0]
  useHotkeys('Escape', () => {
    setSelected([])
  })

  const [transformMode, setTransformMode] = useState<'scale' | 'translate' | 'rotate'>('translate')
  useHotkeys('t', () => {
    setTransformMode('translate')
  })
  useHotkeys(
    's',
    () => {
      setTransformMode('scale')
    },
    {
      enabled: false,
    },
  )
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

  const handleTransform = useCallback(
    (id: number) => {
      console.log(id)

      setDeviceData(
        produce((draft) => {
          const keyVal = Object.entries(refsByKey).find(([_, val]) => val?.id === id)
          if (keyVal) {
            const [key, val] = keyVal
            if (val?.position) {
              draft[key].position = [val?.position.x, val?.position.y]
            }
            if (val?.rotation) {
              draft[key].rotation = val?.rotation.z
            }
          }
        }),
      )
    },
    [refsByKey],
  )

  return (
    <Suspense fallback={<Sphere />}>
      {active && (
        <TransformControls
          showZ={transformMode === 'rotate'}
          showX={transformMode !== 'rotate'}
          showY={transformMode !== 'rotate'}
          mode={transformMode}
          object={active}
          space={space}
          onObjectChange={(e) => handleTransform(e?.target?.object?.id)}
        />
      )}
      <group>
        <Select
          filter={(selected) => selected.filter((s) => s.name === 'cone')}
          // onChange={(e) => setSelected(e)}
          onClick={(e) => {
            let res = e.object
            while (e.object.parent && res.name !== 'cone') {
              res = e.object.parent
            }
            setSelected([res])
          }}
        >
          <group ref={objectsG}>
            {defaultDeviceData.map(([id, { position, rotation, FOV }]) => {
              const a = FOV
              const r = Math.sqrt(((12 / Math.cos(a)) * 12) / Math.cos(a) - 12 * 12)
              return (
                <group
                  name="cone"
                  key={id}
                  ref={(el) => setRef(el, id)}
                  rotation={[0, 0, rotation, 'XYZ']}
                  position={[...position, 0]}
                >
                  <Cone args={[r, 12, 24]} position={[0, -6, 0]}>
                    <meshBasicMaterial
                      color={'rgb(164,84,217)'}
                      opacity={0.25}
                      transparent={true}
                      depthWrite={false}
                      depthTest={false}
                    />
                  </Cone>
                </group>
              )
            })}
          </group>
        </Select>
      </group>
      <ambientLight intensity={0.2} />
      <CameraControls makeDefault enabled={orbit} />
      <gridHelper />
      <axesHelper args={[5]} />
      <Light />
    </Suspense>
  )
}

export { Scene }
