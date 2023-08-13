import { TupleOf } from '$/types'
import { Euler } from '@react-three/fiber'
import { Object3D } from 'three'
import { useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import { ObserverId, Editor } from '$/types'

type FloatingTransformControlsProps = {
  position: TupleOf<number, 3>
  rotation: Euler
  selectedObserverId: ObserverId | null
  mode: Editor['transformMode']
  space: Editor['coordinateSystem']
  onTransform: (object: Object3D) => void
}
function FloatingTransformControls({
  position,
  rotation,
  selectedObserverId,
  mode,
  space,
  onTransform,
}: FloatingTransformControlsProps) {
  const ref = useRef(null)
  const controls = selectedObserverId && ref.current && (
    <TransformControls
      key={'transform-controls'}
      showZ={mode === 'rotate'}
      showX={mode !== 'rotate'}
      showY={mode !== 'rotate'}
      mode={mode}
      object={ref.current}
      space={space}
      onObjectChange={(e) => onTransform(e?.target?.object)}
    />
  )
  return (
    <>
      <group key={'dummy-transform-target'} ref={ref} position={position} rotation={rotation}></group>
      {controls}
    </>
  )
}

export { FloatingTransformControls }
