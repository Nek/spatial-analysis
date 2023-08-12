import { CameraControls, Cone, Line, Sphere, TransformControls } from '@react-three/drei'
import { ForwardedRef, forwardRef, Suspense, useCallback, useState } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Color, Group, Object3D } from 'three'

import { randomID, Smush32 } from '@thi.ng/random'
import { produce, enableMapSet } from 'immer'
enableMapSet()

import { intersectRayLine } from '@thi.ng/geom-isec'

import { type Vec } from '@thi.ng/vectors'
import { TupleOf } from './types.ts'
import { Observer, ObserverID, Point2D, State } from './domain.ts'

function Light() {
  return (
    <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
      <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
    </directionalLight>
  )
}

const CONE_NUM = 5
const idsRND = new Smush32(0)
const deviceIds: ObserverID[] = [...Array(CONE_NUM)].map(
  () => randomID(8, 'observer-', '0123456789ABCDEF', idsRND) as ObserverID,
)
const deviceFOVs = [45, 60, 75, 30, 90].map((v) => (v * Math.PI) / 180)

const posRnd = new Smush32(0)

type IntersectArgs = [Vec, Vec, Vec, Vec]

const ObserverView = forwardRef(
  (
    props: {
      id: string
      color: Color
      rotation: number
      position: TupleOf<number, 2>
      r: number
      onUpdate: (self: Object3D) => void
      onClick: (obj: Object3D) => void
    },
    ref: ForwardedRef<Group>,
  ) => {
    return (
      <group
        key={props.id}
        name="cone"
        ref={ref}
        rotation={[0, 0, props.rotation, 'XYZ']}
        position={[...props.position, 0]}
        onUpdate={(self) => props.onUpdate(self)}
        onClick={(e) => props.onClick(e.eventObject)}
      >
        <Cone args={[props.r, 12, 24]} position={[0, -6, 0]}>
          <meshBasicMaterial
            color={props.color}
            opacity={0.25}
            transparent={true}
            depthWrite={false}
            depthTest={false}
          />
        </Cone>
      </group>
    )
  },
)

const observers: Record<ObserverID, Observer> = Object.fromEntries(
  deviceIds.map((id, i) => {
    const FOV = deviceFOVs[i]
    // const r = Math.sqrt(((12 / Math.cos(FOV)) * 12) / Math.cos(FOV) - 12 * 12)
    const position = [posRnd.minmax(-3, 3), posRnd.minmax(1, 1.5)] as Point2D
    const rotation = (180 * Math.PI) / 180
    return [id, { position, rotation, FOV, id }]
  }),
)

function SceneView() {
  const [state, setState] = useState<State>({
    observers,
    objectToObserverID: new Map<Object3D, ObserverID>(),
    observerIdToObject: {},
  })

  const devicesWithNegativeY = Object.entries(state.observers).filter(([_, val]) => val.position[1] < 0)
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
  const [selected, setSelected] = useState<Object3D | null>()
  useHotkeys('Escape', () => {
    setSelected(null)
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
    (obj: Object3D) => {
      setState(
        produce((draft) => {
          const observerID = state.objectToObserverID.get(obj)
          if (observerID) {
            draft.observers[observerID].position = [obj.position.x, obj.position.y]
            draft.observers[observerID].rotation = obj.rotation.z
          }
        }),
      )
    },
    [state.objectToObserverID],
  )

  return (
    <Suspense fallback={<Sphere />}>
      {selected && (
        <TransformControls
          showZ={transformMode === 'rotate'}
          showX={transformMode !== 'rotate'}
          showY={transformMode !== 'rotate'}
          mode={transformMode}
          object={selected}
          space={space}
          onObjectChange={(e) => handleTransform(e?.target?.object)}
        />
      )}
      <group>
        <>
          {Object.values(state.observers).map(({ id, position, rotation, FOV }) => {
            const a = FOV / 2
            const r = Math.sqrt(((12 / Math.cos(a)) * 12) / Math.cos(a) - 12 * 12)
            const color =
              state.observerIdToObject[id] === selected ? new Color('rgb(255,0,0)') : new Color('rgb(164,84,217)')
            console.log(
              '!!!',
              selected && state.observers[state.objectToObserverID.get(selected) || 'observer-00000000'],
            )
            return (
              <ObserverView
                key={id}
                id={id}
                rotation={rotation}
                position={position}
                r={r}
                color={color}
                onUpdate={(object) => {
                  setState(
                    produce((draft) => {
                      draft.objectToObserverID.set(object, id)
                      draft.observerIdToObject[id] = object
                    }),
                  )
                }}
                onClick={(object: Object3D) => setSelected(object)}
              />
            )
          })}
        </>
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

export { SceneView }
