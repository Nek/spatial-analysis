import { CameraControls, Cone, Line, Select, Sphere, TransformControls } from '@react-three/drei'
import { createRef, ForwardedRef, forwardRef, Suspense, useCallback, useRef, useState } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Group, Object3D } from 'three'

import { randomID, Smush32 } from '@thi.ng/random'
import { produce } from 'immer'
import { intersectRayLine } from '@thi.ng/geom-isec'

import { type Vec } from '@thi.ng/vectors'

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
const deviceFOVs = [45, 60, 75, 30, 90].map((v) => (v * Math.PI) / 180)

const posRnd = new Smush32(0)
const defaultDeviceData: [string, DeviceDatum][] = deviceIds.map((id, i) => {
  const FOV = deviceFOVs[i]
  // const r = Math.sqrt(((12 / Math.cos(FOV)) * 12) / Math.cos(FOV) - 12 * 12)
  const position = [posRnd.minmax(-3, 3), posRnd.minmax(1, 1.5)] as [number, number]
  const rotation = (180 * Math.PI) / 180
  return [id, { position, rotation, FOV }]
})

type IntersectArgs = [Vec, Vec, Vec, Vec]

const Observer = forwardRef(function Observer(props: { rotation: number, position: [number, number], r: number }, ref: ForwardedRef<Group>) {
  return <group
    name='cone'
    ref={ref}
    rotation={[0, 0, props.rotation, 'XYZ']}
    position={[...props.position, 0]}
  >
    <Cone args={[props.r, 12, 24]} position={[0, -6, 0]}>
      <meshBasicMaterial
        color={'rgb(164,84,217)'}
        opacity={0.25}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </Cone>
  </group>
})

function Scene() {
  const [refsByKey, setRef] = useRefs<Group>({})

  const [deviceData, setDeviceData] = useState<Record<string, DeviceDatum>>(Object.fromEntries(defaultDeviceData))

  const devicesWithNegativeY = Object.entries(deviceData).filter(([_, val]) => val.position[1] < 0)
  const intersections: [string, Vec[]][] = devicesWithNegativeY
    .map(([key, val]): [string, [IntersectArgs, IntersectArgs, IntersectArgs]] => {
      const middle: IntersectArgs = [val.position, [Math.sin(val.rotation), -Math.cos(val.rotation)], [-10, 0], [10, 0]]
      const end: IntersectArgs = [
        val.position,
        [Math.sin(val.rotation - val.FOV / 2), -Math.cos(val.rotation - val.FOV / 2)],
        [-10, 0],
        [10, 0],
      ]
      const start: IntersectArgs = [
        val.position,
        [Math.sin(val.rotation + val.FOV / 2), -Math.cos(val.rotation + val.FOV / 2)],
        [-10, 0],
        [10, 0],
      ]
      return [key, [start, middle, end]]
    })
    .map(([key, pointsIntersectArgs]): [string, Vec[]] => {
      const points = pointsIntersectArgs
        .map((pointArgs) => {
          const maybeIntersection = intersectRayLine(...pointArgs)
          return maybeIntersection.isec
        })
        .filter((p): p is Vec => p !== undefined)
      return [key, points]
    })
  console.log(intersections)
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
  useHotkeys('c', () => {
    setSpace(space === 'world' ? 'local' : 'world')
  })

  const [orbit, setOrbit] = useState(true)
  useHotkeys(' ', (event) => {
    setOrbit(!orbit)
    event.preventDefault()
  })

  const handleTransform = useCallback(
    (id: number) => {
      setDeviceData(
        produce((draft) => {
          const keyVal = Object.entries(refsByKey).find(([_, val]) => val?.id === id)
          if (keyVal) {
            const [key, val] = keyVal
            if (val?.position) {
              draft[key].position = [val?.position.x, val?.position.y]
            }
            if (val?.rotation) {
              console.log(val?.rotation.z)
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
          <group>
            {defaultDeviceData.map(([id, { position, rotation, FOV }]) => {
              const a = FOV / 2
              const r = Math.sqrt(((12 / Math.cos(a)) * 12) / Math.cos(a) - 12 * 12)
              const ref = createRef<Group>()
              setRef(ref.current, id)
              return (
                <Observer key={id} ref={ref} rotation={rotation} position={position} r={r} />
              )
            })}
          </group>
        </Select>
      </group>
      <group>
        {intersections.flatMap(([key, points]) => {
          const yIntersections = points.map((p) => {
            return (
              <Sphere args={[0.03, 12, 24]} position={[...(p as [number, number]), 0]}>
                <meshBasicMaterial color={'red'} />
              </Sphere>
            )
          })
          const linePoints = points.map(([x, y]): [number, number, number] => [x, y, 0])
          const yLine = linePoints.length > 0 && <Line points={linePoints} color={'red'} lineWidth={2} opacity={0.5} />

          return <group key={key + '-y-intersections'}>{[...yIntersections, yLine]}</group>
        })}
      </group>
      {/*{Array.isArray(intersection) && (*/}

      {/*)}*/}
      <ambientLight intensity={0.2} />
      <CameraControls makeDefault enabled={orbit} />
      <gridHelper />
      <axesHelper args={[5]} />
      <Light />
    </Suspense>
  )
}

export { Scene }
