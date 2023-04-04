import pDebounce from 'p-debounce'
import pDefer from 'p-defer'

import type { SignalFunction } from '@/src/types'

import type { DeferredPromise } from 'p-defer'

export function createAborter<V, T extends Promise<V>>(
  expression: SignalFunction<V, T>,
  {
    debug = false,
    debounceThreshold = 10,
  }: { debug?: boolean; debounceThreshold?: number | false } = {},
): (debounced?: boolean) => DeferredPromise<V>['promise'] {
  let previousPromise: T | undefined
  let controller = new AbortController()
  let deferred = pDefer<V>()
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  function abortable(debounced = false): DeferredPromise<V>['promise'] {
    if (!previousPromise && !debounced) {
      // eslint-disable-next-line no-use-before-define
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

  const debouncedAbortable =
    debounceThreshold === false
      ? abortable
      : pDebounce(abortable, debounceThreshold)

  return abortable
}
