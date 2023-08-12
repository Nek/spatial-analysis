import { TupleOf } from './types.ts'
import { randomID, Smush32 } from '@thi.ng/random'

export type Point2D = TupleOf<number, 2>
export type Point3D = TupleOf<number, 3>
export type ObserverId = `observer-${string}`

export type Observer = { position: Point2D; rotation: number; FOV: number; id: ObserverId }

export type Domain = {
  observers: Record<ObserverId, Observer>
}

export type Editor = {
  selectedObserverId: ObserverId | null
  transformMode: 'scale' | 'translate' | 'rotate'
  coordinateSystem: 'world' | 'local'
  cameraControl: 'orbit' | null
}

const CONE_NUM = 5
const idsRND = new Smush32(0)
const deviceIds: ObserverId[] = [...Array(CONE_NUM)].map(
  () => randomID(8, 'observer-', '0123456789ABCDEF', idsRND) as ObserverId,
)
const deviceFOVs = [45, 60, 75, 30, 90].map((v) => (v * Math.PI) / 180)

const posRnd = new Smush32(0)

export const initialDomainState: () => Domain = () => ({
  observers: Object.fromEntries(
    deviceIds.map((id, i) => {
      const FOV = deviceFOVs[i]
      // const r = Math.sqrt(((12 / Math.cos(FOV)) * 12) / Math.cos(FOV) - 12 * 12)
      const position = [posRnd.minmax(-3, 3), posRnd.minmax(1, 1.5)] as Point2D
      const rotation = (180 * Math.PI) / 180
      return [id, { position, rotation, FOV, id }]
    }),
  ),
})
export const initialEditorState: () => Editor = () => ({
  cameraControl: 'orbit',
  coordinateSystem: 'world',
  selectedObserverId: null,
  transformMode: 'translate',
  pendingTransform: null,
})