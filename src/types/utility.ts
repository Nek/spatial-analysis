export type TupleOf<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type primitive = string | number | boolean | undefined | null
export type DeepReadonly<T> =
  T extends primitive ? T :
    T extends Array<infer U> ? DeepReadonlyArray<U> :
      DeepReadonlyObject<T>

export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type Args<T> = T extends (...args: infer U) => any ? U : never;
