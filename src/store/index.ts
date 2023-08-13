import { randomID, Smush32 } from '@thi.ng/random'
import { proxy } from 'valtio'
import { Editor, Domain, ObserverId, Point2D } from '$/types'

const CONE_NUM = 5
const idsRND = new Smush32(0)
const deviceIds: ObserverId[] = [...Array(CONE_NUM)].map(
  () => randomID(8, 'observer-', '0123456789ABCDEF', idsRND) as ObserverId,
)
const deviceFOVs = [45, 60, 75, 30, 90].map((v) => (v * Math.PI) / 180)

const posRnd = new Smush32(0)

const initialDomainState: () => Domain = () => ({
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
const initialEditorState: () => Editor = () => ({
  cameraControl: 'orbit',
  coordinateSystem: 'world',
  selectedObserverId: null,
  transformMode: 'translate',
})

export const store = proxy<{ domain: Domain; editor: Editor; }>({
  domain: initialDomainState(),
  editor: initialEditorState(),
})
