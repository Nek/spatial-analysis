import { TupleOf } from './types.ts'
import { Object3D } from 'three'

export type Point2D = TupleOf<number, 2>
export type ObserverID = `observer-${string}`

export type Observer = { position: Point2D; rotation: number; FOV: number, id: ObserverID }

export type State = {
  observers: Record<ObserverID, Observer>
  observerIdToObject: Record<ObserverID, Object3D>
  objectToObserverID: Map<Object3D, ObserverID>
}