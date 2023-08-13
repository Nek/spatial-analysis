import { CameraControls, Sphere } from '@react-three/drei'
import { Suspense } from 'react'
import { Color, Object3D } from 'three'

import { store } from '$/store'
import { ObserverView } from '$/components/ObserverView'
import { useHotkeys } from '$/hooks/useHotkeys'
import { Intersection } from '$/components/Intersection'
import { FloatingTransformControls } from '$/components/FloatingTransformControls'
import { intersectWithXAxis, objectToObserver, observerToObject } from '$/geom'
import { useSnapshot } from 'valtio'
import { Point2D } from '$/types'

const redColor = new Color('red')
const purpleColor = new Color('purple')


function Scene() {
  const snap = useSnapshot(store)
  const axisXIntersections = intersectWithXAxis(snap.domain.observers)

  useHotkeys(store.editor)

  const handleTransform = (object: Object3D) => {
    const observerID = snap.editor.selectedObserverId
    if (observerID) {
      const { position, rotation } = objectToObserver(object)
      store.domain.observers[observerID].position = position
      store.domain.observers[observerID].rotation = rotation
    }
  }

  const { position, rotation } = observerToObject(
    snap.editor.selectedObserverId && snap.domain.observers[snap.editor.selectedObserverId],
  )

  return (
    <Suspense fallback={<Sphere />}>
      <FloatingTransformControls
        space={snap.editor.coordinateSystem}
        mode={snap.editor.transformMode}
        selectedObserverId={snap.editor.selectedObserverId}
        position={position}
        rotation={rotation}
        onTransform={handleTransform}
      />
      {Object.values(snap.domain.observers).map(({ id, position, rotation, FOV }) => {
        const a = FOV / 2
        const r = Math.sqrt(((12 / Math.cos(a)) * 12) / Math.cos(a) - 12 * 12)
        return (
          <ObserverView
            key={id}
            id={id}
            rotation={rotation}
            position={position as Point2D}
            r={r}
            color={id === snap.editor.selectedObserverId ? redColor : purpleColor}
            onClick={() => {
              store.editor.selectedObserverId = id
            }}
          />
        )
      })}
      {axisXIntersections.flatMap(([key, points]) => (
        <Intersection observerID={key} points={points} />
      ))}
      <ambientLight intensity={0.2} />
      <CameraControls key={'camera-controls'} makeDefault enabled={snap.editor.cameraControl === 'orbit'} />
      <gridHelper />
      <axesHelper args={[5]} />
      <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
        <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
      </directionalLight>
    </Suspense>
  )
}

export { Scene }
