import { clearTimeout } from 'node:timers'
import util from 'node:util'

import { pSignal } from 'p-signal'

import { createPromiseMixin } from '../src'

export function i(...data) {
  console.log(
    ...data.map((row) =>
      util.inspect(row, {
        showHidden: true,
        colors: true,
        showProxy: true,
        depth: 10,
      }),
    ),
  )
}
export function s() {
  console.log('------------------------------------------------')
  console.log('\n')
}

export function getTimeoutPromise(ms: number = 1000) {
  let cancel
  const promise = new Promise<boolean>((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      resolve(ms)
    }, ms)

    cancel = () => {
      clearTimeout(timeoutID)
      reject(pSignal())
    }
  })

  return createPromiseMixin(promise, {
    cancel,
  })
}

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
  { signal }: { signal: AbortSignal },
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
