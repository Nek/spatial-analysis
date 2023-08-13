import { TupleOf } from './utility'

export type Point2D = TupleOf<number, 2>
export type Point3D = TupleOf<number, 3>
export type ObserverId = `observer-${string}`
export type Observer = { position: Point2D; rotation: number; FOV: number; id: ObserverId }
export type NeverEmptyArray<T> = [T, ...T[]]