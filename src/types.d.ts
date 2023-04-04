export type OverloadedReturnType<T> = T extends {
  (...arguments_: any[]): infer R
  (...arguments_: any[]): infer R
  (...arguments_: any[]): infer R
  (...arguments_: any[]): infer R
}
  ? R
  : T extends {
      (...arguments_: any[]): infer R
      (...arguments_: any[]): infer R
      (...arguments_: any[]): infer R
    }
  ? R
  : T extends {
      (...arguments_: any[]): infer R
      (...arguments_: any[]): infer R
    }
  ? R
  : T extends (...arguments_: any[]) => infer R
  ? R
  : any
export type OverloadedParameters<T> = T extends {
  (...arguments_: infer A1): any
  (...arguments_: infer A2): any
  (...arguments_: infer A3): any
  (...arguments_: infer A4): any
}
  ? A1 | A2 | A3 | A4
  : T extends {
      (...arguments_: infer A1): any
      (...arguments_: infer A2): any
      (...arguments_: infer A3): any
    }
  ? A1 | A2 | A3
  : T extends { (...arguments_: infer A1): any; (...arguments_: infer A2): any }
  ? A1 | A2
  : T extends (...arguments_: infer A) => any
  ? A
  : any

export type SignalFunction<V, T extends Promise<V>> = (signal: AbortSignal) => T
