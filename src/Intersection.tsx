import { ObserverId, Point2D, Point3D } from './state.ts'
import { Line, Sphere } from '@react-three/drei'

function Intersection({ observerID, points }: { observerID: ObserverId; points: Point2D[] }) {
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

export { Intersection }
