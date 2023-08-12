import { CameraControls, Line, Sphere, TransformControls } from '@react-three/drei'
import { Suspense, useCallback, useState } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Color, Object3D } from 'three'

import { randomID, Smush32 } from '@thi.ng/random'
import { produce, enableMapSet } from 'immer'
enableMapSet()

import { intersectRayLine } from '@thi.ng/geom-isec'

import { type Vec } from '@thi.ng/vectors'
import { Observer, ObserverID, Point2D, Point3D, State } from './domain.ts'
import { ObserverView } from './ObserverView.tsx'
import { TupleOf } from './types.ts'

const CONE_NUM = 5
const idsRND = new Smush32(0)
const deviceIds: ObserverID[] = [...Array(CONE_NUM)].map(
  () => randomID(8, 'observer-', '0123456789ABCDEF', idsRND) as ObserverID,
)
const deviceFOVs = [45, 60, 75, 30, 90].map((v) => (v * Math.PI) / 180)

const posRnd = new Smush32(0)

type IntersectArgs = [Vec, Vec, Vec, Vec]

const observers: Record<ObserverID, Observer> = Object.fromEntries(
  deviceIds.map((id, i) => {
    const FOV = deviceFOVs[i]
    // const r = Math.sqrt(((12 / Math.cos(FOV)) * 12) / Math.cos(FOV) - 12 * 12)
    const position = [posRnd.minmax(-3, 3), posRnd.minmax(1, 1.5)] as Point2D
    const rotation = (180 * Math.PI) / 180
    return [id, { position, rotation, FOV, id }]
  }),
)

function Intersection ({ observerID, points }: { observerID: ObserverID; points: Point2D[] }) {
  const intersectionMarkers = points.map((p: Point2D, ndx: number) => {
    return (
      <Sphere key={`${observerID}-intersection-marker-${ndx}`} args={[0.03, 12, 24]} position={[...p, 0]}>
        <meshBasicMaterial color={'red'} />
      </Sphere>
    )
  })
  const linePoints = points.map(([x, y]): Point3D => [x, y, 0])
  const intersectionLine = linePoints.length > 0 && (
    <Line key={`${observerID}-intersection-line`} points={linePoints} color={'red'} lineWidth={2} opacity={0.5} />
  )

  return <group key={`${observerID}-intersection`}>{[...intersectionMarkers, intersectionLine]}</group>
}

function Scene() {
  const [state, setState] = useState<State>({
    observers,
    objectToObserverID: new Map<Object3D, ObserverID>(),
    observerIdToObject: {},
  })

  type IntersectStartMiddleEndArgs = TupleOf<IntersectArgs, 3>

  type AxisIntersection = [ObserverID, Point2D[]]
  const axisXIntersections: AxisIntersection[] = Object.entries(state.observers)
    .map(([observerID, observer]): [ObserverID, IntersectStartMiddleEndArgs] => {
      const middle: IntersectArgs = [
        observer.position,
        [Math.sin(observer.rotation), -Math.cos(observer.rotation)],
        [-10, 0],
        [10, 0],
      ]
      const end: IntersectArgs = [
        observer.position,
        [Math.sin(observer.rotation - observer.FOV / 2), -Math.cos(observer.rotation - observer.FOV / 2)],
        [-10, 0],
        [10, 0],
      ]
      const start: IntersectArgs = [
        observer.position,
        [Math.sin(observer.rotation + observer.FOV / 2), -Math.cos(observer.rotation + observer.FOV / 2)],
        [-10, 0],
        [10, 0],
      ]
      return [observerID as ObserverID, [start, middle, end]]
    })
    .map(([key, pointsIntersectArgs]) => {
      const points = pointsIntersectArgs
        .map((pointArgs) => {
          const maybeIntersection = intersectRayLine(...pointArgs)
          return maybeIntersection.isec
        })
        .filter((p): p is Vec => p !== undefined)
      return [key, points as Point2D[]]
    })
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
          key={'transform-controls'}
          showZ={transformMode === 'rotate'}
          showX={transformMode !== 'rotate'}
          showY={transformMode !== 'rotate'}
          mode={transformMode}
          object={selected}
          space={space}
          onObjectChange={(e) => handleTransform(e?.target?.object)}
        />
      )}
      {Object.values(state.observers).map(({ id, position, rotation, FOV }) => {
        const a = FOV / 2
        const r = Math.sqrt(((12 / Math.cos(a)) * 12) / Math.cos(a) - 12 * 12)
        const color =
          state.observerIdToObject[id] === selected ? new Color('rgb(255,0,0)') : new Color('rgb(164,84,217)')
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
      {axisXIntersections.flatMap(([key, points]) => (
        <Intersection observerID={key} points={points} />
      ))}
      <ambientLight intensity={0.2} />
      <CameraControls key={'camera-controls'} makeDefault enabled={orbit} />
      <gridHelper />
      <axesHelper args={[5]} />
      <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
        <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
      </directionalLight>
    </Suspense>
  )
}

export { Scene }
