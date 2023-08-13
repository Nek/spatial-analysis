import { ObserverId, Point2D, Point3D } from '$/types'
import { Line, Sphere } from '@react-three/drei'
import { MeshBasicMaterial } from 'three'
import { CachedMaterial } from '$/components/CachedMaterial'

function Intersection({ observerID, points }: { observerID: ObserverId; points: Point2D[] }) {
  const intersectionMarkers = points.map((p: Point2D, ndx: number) => {
    return (
      <Sphere key={`${observerID}-intersection-marker-${ndx}`} args={[0.03, 12, 24]} position={[...p, 0]}>
        <CachedMaterial
          constructor={MeshBasicMaterial}
          parameters={{
            color: 'red'
          }}
        />
      </Sphere>
    )
  })
  const linePoints = points.map(([x, y]): Point3D => [x, y, 0])
  const intersectionLine = linePoints.length > 0 && (
    <Line key={`${observerID}-intersection-line`} points={linePoints} lineWidth={2} color={'red'} />
  )

  return <group key={`${observerID}-intersection`}>{[...intersectionMarkers, intersectionLine]}</group>
}

export { Intersection }
