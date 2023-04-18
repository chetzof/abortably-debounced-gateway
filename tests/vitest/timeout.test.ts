import { clearTimeout, setTimeout } from 'node:timers'

import { it } from 'vitest'

import { getAbortablePromiseTemplate } from '@/src/abortable-promise'

// const abortableTimeout = getAbortablePromiseTemplate(
//   (resolve, reject, ...inputArgs: ) => {
//     const timeoutID = setTimeout(() => {
//       resolve(10)
//     }, 10)
//
//     signal.addEventListener('abort', () => {
//       clearTimeout(timeoutID)
//     })
//   },
// )

type Te<T> = (resolve: (argument: T) => void) => void

const te: Te<number> = <O>(resolve) => {
  console.log('a')
}

const tte: Te<number> = function <T>(resolve) {
  console.log('a')
}

const sum =
  <T>(timeout: T) =>
  (resolve) => {
    const timeoutID = setTimeout(() => {
      resolve(timeout)
    }, timeout)

    return () => {
      clearTimeout(timeoutID)
    }
  }

async function test(signal: AbortSignal) {
  const a = await fetch('dawdaw')
}

it('dawd', async () => {
  // const abortableFetch =getAbortablePromiseTemplate()
  const abortableTimeout = getAbortablePromiseTemplate(
    (timeout: number) => (resolve) => {
      const timeoutID = setTimeout(() => {
        resolve<string>(timeout)
      }, timeout)

      return () => {
        clearTimeout(timeoutID)
      }
    },
  )
  const promise = await abortableTimeout('1', 'd')
  console.log(promise.abort())
  console.log(await promise)
  // promise.abort()
})
