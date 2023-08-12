import { TupleOf } from './types.ts'
import { Object3D } from 'three'

export type Point2D = TupleOf<number, 2>
export type Point3D = TupleOf<number, 3>
export type ObserverID = `observer-${string}`

export type Observer = { position: Point2D; rotation: number; FOV: number, id: ObserverID }

export type Domain = {
  observers: Record<ObserverID, Observer>
}

export type Editor = {
  selectedObserverId: ObserverID | null,
  transformMode: "scale" | "translate" | "rotate",
  coordinateSystem: "world" | "local",
  cameraControl: "orbit" | null,
  pendingTransform: Object3D | null,
}