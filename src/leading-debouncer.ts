import { Map } from 'collections-deep-equal'
import isPlainObject from 'lodash/isPlainObject'
import pDebounce from 'p-debounce'
import pDefer from 'p-defer'

import type { OverloadedParameters, OverloadedReturnType } from '@/types'

type SignalFunction<V, T extends Promise<V>> = (signal: AbortSignal) => T

export function createAborter<V, T extends Promise<V>>(
  expression: SignalFunction<V, T>,
  { debug = false }: { debug?: boolean } = {},
) {
  let previousPromise: T | undefined
  let controller = new AbortController()
  let deferred = pDefer<V>()

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const abortable = function (debounced = false) {
    if (!previousPromise && !debounced) {
      return debouncedAbortable(true)
    }

    if (previousPromise) {
      controller.abort()
      if (debug) {
        previousPromise
          .then((s) => {
            console.log(s)
          })
          .catch((error) => {
            console.log(error)
          })
      }

      controller = new AbortController()
    }

    const newPromise = expression(controller.signal)

    void newPromise
      .then((value) => {
        const oldDeferred = deferred
        deferred = pDefer<V>()
        oldDeferred.resolve(value)

        previousPromise = undefined
        return value
      })
      .catch((error) => {
        if (
          error.code !== DOMException.ABORT_ERR &&
          error.code !== 'ABORT_ERR'
        ) {
          throw error
        }
      })

    previousPromise = newPromise
    return deferred.promise
  }

  const debouncedAbortable = pDebounce(abortable, 10)

  return abortable
}

export function createGateway() {
  const registry = new Map<
    SignalFunction<any, Promise<any>> | any,
    () => Promise<any>
  >()

  return {
    run<V, P extends Promise<V>>(promiseFactory: SignalFunction<V, P>): P {
      if (!registry.has(promiseFactory)) {
        registry.set(promiseFactory, createAborter(promiseFactory))
      }

      const factory = registry.get(promiseFactory) as () => P

      return factory()
    },
    runAuto<V, R extends Promise<V>, T extends (...arguments_: any[]) => R>(
      executor: T,
      ...executorArguments: OverloadedParameters<T>
    ): OverloadedReturnType<T> {
      const key = [executor, executorArguments]
      if (!registry.has(key)) {
        const argumentCount = executor.length

        registry.set(
          key,
          createAborter((signal) => {
            const parameters = Array.from({ length: argumentCount }).map(
              (_value, index) => {
                if (
                  index === argumentCount - 1 &&
                  (executorArguments[index] === undefined ||
                    isPlainObject(executorArguments[index]))
                ) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  return { ...executorArguments[index], signal }
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return executorArguments[index]
              },
            )
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return executor(...parameters)
          }),
        )
      }

      const factory = registry.get(key) as () => OverloadedReturnType<T>
      return factory()
    },
  }
}
