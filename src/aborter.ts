import pDebounce from 'p-debounce'
import pDefer from 'p-defer'
import { createPromiseMixin } from 'promise-supplement'

import type { SignalFunction } from '@/src/types.js'

import type { DeferredPromise } from 'p-defer'

interface Aborter<V> {
  (debounced?: boolean): DeferredPromise<V>['promise'] & {
    abortAndReject: () => void
  }
  abort: () => number
  abortAndResolveWith: () => Awaited<DeferredPromise<V>['promise']>
  abortAndReject: () => any
  getAbortController: () => AbortController
}

interface AbortReference {
  internal: AbortController
  external: AbortController
}

function refreshControllers(reference: AbortReference) {
  const externalListener = () => {
    console.log('aborted externally:begin ')
    reference.internal.abort()
    reference.external = new AbortController()
    // reference.external.signal.addEventListener('abort', externalListener)
    console.log('aborted externally: end')
  }

  const interalListener = () => {
    console.log('aborted internally: begin')
    reference.internal = new AbortController()
    reference.internal.signal.addEventListener('abort', interalListener)
    console.log('aborted internally: end')
  }

  reference.external.signal.addEventListener('abort', externalListener)
  reference.internal.signal.addEventListener('abort', interalListener)

  return reference
}

export function createAborter<V, T extends Promise<V>>(
  expression: SignalFunction<V, T>,
  {
    debug = false,
    debounceThreshold = 10,
  }: { debug?: boolean; debounceThreshold?: number | false } = {},
): Aborter<V> {
  let currentRunningPromise: T | undefined
  let inhibitAbortExeceptions = true

  const abortControllerPointer = refreshControllers({
    internal: new AbortController(),
    external: new AbortController(),
  })

  let deferred = pDefer<V>()

  deferred.promise = createPromiseMixin(deferred.promise, {
    abortAndReject: () => {
      abortable.abortAndReject()
    },
  })

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  function abortable(debounced = false): DeferredPromise<V>['promise'] {
    if (!currentRunningPromise && !debounced) {
      // eslint-disable-next-line no-use-before-define
      return debouncedAbortable(true)
    }

    if (currentRunningPromise) {
      abortControllerPointer.internal.abort()
      if (debug) {
        currentRunningPromise
          .then((s) => {
            console.log(s)
          })
          .catch((error) => {
            console.log(error)
          })
      }
    }

    const newPromise = expression(abortControllerPointer.internal.signal)

    void newPromise
      .then((value) => {
        const oldDeferred = deferred
        deferred = pDefer<V>()

        oldDeferred.resolve(value)

        currentRunningPromise = undefined
        return value
      })
      .catch((error) => {
        if (
          (error.code === DOMException.ABORT_ERR ||
            error.code === 'ABORT_ERR') &&
          inhibitAbortExeceptions
        ) {
          return
        }

        deferred.reject(error)
      })

    currentRunningPromise = newPromise
    return deferred.promise
  }

  abortable.abortAndReject = () => {
    inhibitAbortExeceptions = false
    abortControllerPointer.external.abort()
  }

  abortable.getAbortController = () => abortControllerPointer.external

  const debouncedAbortable =
    debounceThreshold === false
      ? abortable
      : pDebounce(abortable, debounceThreshold)

  return abortable
}
