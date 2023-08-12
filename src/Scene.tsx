import { CameraControls, Sphere, TransformControls } from '@react-three/drei'
import { Suspense, useRef, useState } from 'react'
import { Color, Object3D } from 'three'

import { randomID, Smush32 } from '@thi.ng/random'
import { produce, enableMapSet } from 'immer'
enableMapSet()

import { intersectRayLine } from '@thi.ng/geom-isec'

import { type Vec } from '@thi.ng/vectors'
import { Observer, ObserverID, Point2D, Domain, Editor } from './states.ts'
import { ObserverView } from './ObserverView.tsx'
import { TupleOf } from './types.ts'
import { useHotkeys } from './useHotkeys.ts'
import { Intersection } from './Intersection.tsx'

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

const initialDomainState: () => Domain = () => ({ observers })
const initialEditorState: () => Editor = () => ({
  cameraControl: 'orbit',
  coordinateSystem: 'world',
  selectedObserverId: null,
  transformMode: 'translate',
  pendingTransform: null,
})

function Scene() {
  const [domain, setDomain] = useState<Domain>(initialDomainState)

  const [editor, setEditor] = useState<Editor>(initialEditorState)

  type IntersectStartMiddleEndArgs = TupleOf<IntersectArgs, 3>

  type AxisIntersection = [ObserverID, Point2D[]]
  const axisXIntersections: AxisIntersection[] = Object.entries(domain.observers)
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

  useHotkeys(setEditor)

  const handleTransform = (observerID: ObserverID, object: Object3D) =>
    setDomain(
      produce((draft) => {
        if (observerID) {
          draft.observers[observerID].position = [object.position.x, object.position.y]
          draft.observers[observerID].rotation = object.rotation.z
        }
      }),
    )

  const ref = useRef(null)
  return (
    <Suspense fallback={<Sphere />}>
      <group
        ref={ref}
        position={[...(domain.observers[editor.selectedObserverId || 'observer-00000000']?.position || [0, 0]), 0]}
        rotation={[0, 0, domain.observers[editor.selectedObserverId || 'observer-00000000']?.rotation || 0, 'XYZ']}
      ></group>
      )
      {editor.selectedObserverId && (
        <>
          {ref.current && (
            <TransformControls
              key={'transform-controls'}
              showZ={editor.transformMode === 'rotate'}
              showX={editor.transformMode !== 'rotate'}
              showY={editor.transformMode !== 'rotate'}
              mode={editor.transformMode}
              object={ref.current}
              space={editor.coordinateSystem}
              onObjectChange={(e) =>
                editor.selectedObserverId && handleTransform(editor.selectedObserverId, e?.target?.object)
              }
            />
          )}
        </>
      )}
      {Object.values(domain.observers).map(({ id, position, rotation, FOV }) => {
        const a = FOV / 2
        const r = Math.sqrt(((12 / Math.cos(a)) * 12) / Math.cos(a) - 12 * 12)
        const color = id === editor.selectedObserverId ? new Color('rgb(255,0,0)') : new Color('rgb(164,84,217)')
        return (
          <ObserverView
            key={id}
            id={id}
            rotation={rotation}
            position={position}
            r={r}
            color={color}
            onClick={() =>
              setEditor(
                produce((draft) => {
                  draft.selectedObserverId = id
                }),
              )
            }
          />
        )
      })}
      {axisXIntersections.flatMap(([key, points]) => (
        <Intersection observerID={key} points={points} />
      ))}
      <ambientLight intensity={0.2} />
      <CameraControls key={'camera-controls'} makeDefault enabled={editor.cameraControl === 'orbit'} />
      <gridHelper />
      <axesHelper args={[5]} />
      <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
        <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
      </directionalLight>
    </Suspense>
  )
}

export { Scene }
