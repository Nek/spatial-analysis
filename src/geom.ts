import { Object3D } from 'three'
import { Domain, Observer, ObserverId, Point2D, Point3D, DeepReadonly, TupleOf } from '$/types'
import { intersectRayLine } from '@thi.ng/geom-isec'
import { Euler } from '@react-three/fiber'

export const objectToObserver: (object: Pick<Object3D, 'position' | 'rotation'>) => {
  position: Point2D
  rotation: number
} = (object) => ({
  position: [object.position.x, object.position.y],
  rotation: object.rotation.z,
})

export const observerToObject: (observer: DeepReadonly<Pick<Observer, 'position' | 'rotation'>> | null) => {
  position: Point3D
  rotation: Euler
} = (observer) => {
  const { position, rotation } = observer || { position: [0, 0], rotation: 0 }
  return {
    position: [...(position || [0, 0]), 0] as Point3D,
    rotation: [0, 0, rotation || 0, 'XYZ'],
  }
}

type IntersectArgs = [Point2D, Point2D, Point2D, Point2D]
type IntersectStartMiddleEndArgs = TupleOf<IntersectArgs, 3>
type AxisIntersection = [ObserverId, Point2D[]]
export const intersectWithXAxis: (observers: DeepReadonly<Domain['observers']>) => AxisIntersection[] = (observers) => {
  return Object.entries(observers)
    .map(([observerId, observer]): [ObserverId, IntersectStartMiddleEndArgs] => {
      const middle: IntersectArgs = [
        observer.position as Point2D,
        [Math.sin(observer.rotation), -Math.cos(observer.rotation)],
        [-10, 0],
        [10, 0],
      ]
      const end: IntersectArgs = [
        observer.position as Point2D,
        [Math.sin(observer.rotation - observer.FOV / 2), -Math.cos(observer.rotation - observer.FOV / 2)],
        [-10, 0],
        [10, 0],
      ]
      const start: IntersectArgs = [
        observer.position as Point2D,
        [Math.sin(observer.rotation + observer.FOV / 2), -Math.cos(observer.rotation + observer.FOV / 2)],
        [-10, 0],
        [10, 0],
      ]
      return [observerId as ObserverId, [start, middle, end]]
    })
    .map(([key, pointsIntersectArgs]) => {
      const points = pointsIntersectArgs
        .map((pointArgs) => {
          const maybeIntersection = intersectRayLine(...pointArgs)
          return maybeIntersection.isec
        })
        .filter((p): p is Point2D => p !== undefined)
      return [key, points as Point2D[]]
    })
}
