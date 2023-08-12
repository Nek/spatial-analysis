import { CameraControls, Sphere } from '@react-three/drei'
import { Suspense, useState } from 'react'
import { Color, Object3D } from 'three'

import { produce, enableMapSet } from 'immer'
enableMapSet()

import { ObserverId, Domain, Editor, initialDomainState, initialEditorState } from './state.ts'
import { ObserverView } from './ObserverView.tsx'
import { useHotkeys } from './useHotkeys.ts'
import { Intersection } from './Intersection.tsx'
import { FloatingTransformControls } from './FloatingTransformControls.tsx'
import { intersectWithXAxis, objectToObserver, observerToObject } from './geom.ts'

function Scene() {
  const [domain, setDomain] = useState<Domain>(initialDomainState)

  const [editor, setEditor] = useState<Editor>(initialEditorState)

  const axisXIntersections = intersectWithXAxis(domain.observers)

  useHotkeys(setEditor)

  const handleTransform = (observerID: ObserverId, object: Object3D) =>
    setDomain(
      produce((draft) => {
        if (observerID) {
          const { position, rotation } = objectToObserver(object)
          draft.observers[observerID].position = position
          draft.observers[observerID].rotation = rotation
        }
      }),
    )

  const { position, rotation } = observerToObject(
    (editor.selectedObserverId && domain.observers[editor.selectedObserverId]) || { position: [0, 0], rotation: 0 },
  )

  return (
    <Suspense fallback={<Sphere />}>
      <FloatingTransformControls
        space={editor.coordinateSystem}
        mode={editor.transformMode}
        selectedObserverId={editor.selectedObserverId}
        position={position}
        rotation={rotation}
        onTransform={handleTransform}
      />
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
