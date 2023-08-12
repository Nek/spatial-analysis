import { Color, Object3D } from 'three'
import { TupleOf } from './types.ts'
import { Cone } from '@react-three/drei'

const ObserverView = (props: {
  id: string
  color: Color
  rotation: number
  position: TupleOf<number, 2>
  r: number
  onUpdate: (self: Object3D) => void
  onClick: (obj: Object3D) => void
}) => {
  return (
    <group
      key={props.id}
      name="cone"
      rotation={[0, 0, props.rotation, 'XYZ']}
      position={[...props.position, 0]}
      onUpdate={(self) => props.onUpdate(self)}
      onClick={(e) => props.onClick(e.eventObject)}
    >
      <Cone args={[props.r, 12, 24]} position={[0, -6, 0]}>
        <meshBasicMaterial color={props.color} opacity={0.25} transparent={true} depthWrite={false} depthTest={false} />
      </Cone>
    </group>
  )
}

export { ObserverView }
