import { PivotControls } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { type PropsWithChildren, createRef } from 'react'
import { SphereGeometry, Group, Mesh, MeshStandardMaterial } from 'three'
extend({ Group, SphereGeometry, Mesh, MeshStandardMaterial })

function Sphere() {
  const sphereRef = createRef<Mesh<SphereGeometry, MeshStandardMaterial>>()
  const pivotRef = createRef<Group>()

  const PivotControls3D = PivotControls as (props: PropsWithChildren<typeof PivotControls['defaultProps']>, deprecatedLegacyContext?: any) => JSX.Element

  return (
    <PivotControls3D anchor={[0, 0, 0]} depthTest={false} visible ref={pivotRef}>
      <mesh position={[0,0,0]} ref={sphereRef} castShadow>
        <sphereGeometry args={[1, 30, 30]} />
        <meshStandardMaterial color={[1,0,0]} />
      </mesh>
    </PivotControls3D>
  )
}

export { Sphere }
