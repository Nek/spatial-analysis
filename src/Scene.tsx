import { OrbitControls } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { type PropsWithChildren, createRef } from 'react'
import { AmbientLight, DirectionalLight } from 'three'
extend({ AmbientLight, DirectionalLight })
import { Cube, type CubeType } from './components/Cube'
import { Plane } from './components/Plane'
import { Sphere } from './components/Sphere'

function Scene() {

  const cubeRef = createRef<CubeType>()

  useFrame((_, delta) => {
      cubeRef.current!.rotation.y += delta / 3
  })

  const OrbitControls3D = OrbitControls as (props: PropsWithChildren<typeof OrbitControls['defaultProps']>, deprecatedLegacyContext?: any) => JSX.Element

  return (
    <>

      <OrbitControls3D makeDefault />

      <directionalLight
        position={[-2, 2, 3]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024 * 2, 1024 * 2]}
      />
      <ambientLight intensity={0.2} />

      <Cube ref={cubeRef} />
      <Sphere />
      <Plane />
    </>
  )
}

export { Scene }
