import { MeshProps, extend } from '@react-three/fiber'
import { type PropsWithChildren, forwardRef, type ForwardedRef } from 'react'
import { Mesh, BoxGeometry, MeshStandardMaterial } from 'three'
extend({ BoxGeometry, Mesh, MeshStandardMaterial })

export type CubeType = Mesh<BoxGeometry, MeshStandardMaterial>

type CubeProps = PropsWithChildren<MeshProps>

const CubeInner = forwardRef<CubeType>((_: CubeProps, ref:  ForwardedRef<CubeType>): JSX.Element => (
  <mesh ref={ref} position-x={2} castShadow>
    <boxGeometry args={[1.5, 1.5, 1.5]} />
    <meshStandardMaterial color={'mediumpurple'} />
  </mesh>
)) 

const Cube = CubeInner as (props: PropsWithChildren<CubeProps>, deprecatedLegacyContext?: any) => JSX.Element

export { Cube }
