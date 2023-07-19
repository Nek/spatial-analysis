import { OrbitControls } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { type PropsWithChildren, createRef } from 'react'
import { AmbientLight, DirectionalLight, OrthographicCamera } from 'three'
extend({ AmbientLight, DirectionalLight, OrthographicCamera })
import { Cube, type CubeType } from './components/Cube'
import { Plane } from './components/Plane'
import { Sphere } from './components/Sphere'

function Light() {
  return (
    <directionalLight position={[5, 5, -8]} castShadow intensity={1.5} shadow-mapSize={2048} shadow-bias={-0.001}>
      <orthographicCamera attach="shadow-camera" args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
    </directionalLight>
  )
}

function Scene() {
  const cubeRef = createRef<CubeType>()
  useFrame((_, delta) => {
    if (cubeRef.current) cubeRef.current.rotation.y += delta / 3
  })
  const OrbitControls3D = OrbitControls as (props: PropsWithChildren<typeof OrbitControls['defaultProps']>, deprecatedLegacyContext?: any) => JSX.Element
  return (
    <>
      <OrbitControls3D makeDefault />
      <Light />
      <ambientLight intensity={0.2} />
      <Cube ref={cubeRef} />
      <Sphere />
      <Plane />
    </>
  )
}

export { Scene }
