import { clearTimeout, setTimeout as setTimeoutCallback } from 'node:timers'

export async function getTimeoutPromiseAborter(
  ms: number,
  signal: AbortSignal,
) {
  return new Promise<number>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
    }

    const timeoutID = setTimeout(() => {
      resolve(ms)
    }, ms)

    signal.addEventListener('abort', () => {
      clearTimeout(timeoutID)
      reject(signal.reason)
    })
  })
}

export async function getConventionalTimeoutPromiseAborter(
  ms: number,
  { signal }: { signal?: AbortSignal } = {},
) {
  return new Promise<number>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason)
    }

    const timeoutID = setTimeout(() => {
      resolve(ms)
    }, ms)

    signal?.addEventListener('abort', () => {
      console.log('aborted!')
      clearTimeout(timeoutID)
      reject(signal.reason)
    })
  })
}

export async function getRejectingNoopPromise() {
  return new Promise((_resolve, reject) => {
    reject(new Error('Reason'))
  })
}

export async function getResolvedNoopPromise() {
  return new Promise<true>((resolve) => {
    setTimeoutCallback(() => {
      resolve(true)
    }, 0)
  })
}
