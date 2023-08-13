import { Observer, ObserverId } from '$/types'

export type Domain = {
  observers: {
    [id: ObserverId]: Observer
  }
}