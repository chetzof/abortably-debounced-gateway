import { createPromiseMixin } from 'promise-supplement'

type InnerShape<R> = (
  resolve: (value: R) => void,
  reject: (reason?: any) => void,
) => () => void

export function getAbortablePromiseTemplate<
  R,
  O,
  A extends any[],
  // T = (...inputArguments: A) => any,
  // T extends (...inputArguments: any[]) => InnerShape<R> = (
  //   ...inputArguments: any[]
  // ) => InnerShape<R>,
>(
  inputShape: <I>(
    ...inputArguments: A
  ) => <V>(
    resolve: (value: V) => void,
    reject: (reason?: any) => void,
  ) => () => void,
  // inputShape: T extends (...inputArguments: A) => infer B
  //   ? (...inputArguments: A) => B
  //   : never,
): (...input: O) => Promise<any> {
  const controller = new AbortController()
  const signal = controller.signal

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/promise-function-async
  return function (...arguments_) {
    const executor = inputShape(...arguments_)

    return createPromiseMixin(
      new Promise<R>((resolve, reject) => {
        if (signal.aborted) {
          reject(signal.reason)
        }
        const abortHandler = executor(resolve, reject)

        signal.addEventListener('abort', () => {
          abortHandler()
          reject(signal.reason)
        })
      }),
      {
        abort: (reason?: any) => {
          controller.abort(reason)
        },
      },
    )
  }
}
