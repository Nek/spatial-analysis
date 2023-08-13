import { ObserverId } from '$/types'

export type Editor = {
  selectedObserverId: ObserverId | null
  transformMode: 'scale' | 'translate' | 'rotate'
  coordinateSystem: 'world' | 'local'
  cameraControl: 'orbit' | null
}
