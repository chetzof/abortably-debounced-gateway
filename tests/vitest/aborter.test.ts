import { promiseStateAsync } from 'p-state'
import { expect, it, vi } from 'vitest'

import { createAborter } from '@/src/aborter.js'
import { getConventionalTimeoutPromiseAborter } from '@/tests/vitest/util'

it('case1 ', async () => {
  const rawPromises: Array<Promise<number>> = []
  const debounce = createAborter(
    async (signal) => {
      const promise = getConventionalTimeoutPromiseAborter(
        rawPromises.length + 100,
        { signal },
      )
      rawPromises.push(promise)
      return promise
    },
    { debounceThreshold: false },
  )
  const promise1 = debounce()
  const promise2 = debounce()
  const promise3 = debounce()
  const promise4 = debounce()

  void expect(promise1).resolves.toBe(103)
  void expect(promise2).resolves.toBe(103)
  void expect(promise3).resolves.toBe(103)
  void expect(promise4).resolves.toBe(103)

  expect(promise1).toBe(promise2)
  expect(promise1).toBe(promise3)
  expect(promise1).toBe(promise4)

  await promise1

  await expect(promiseStateAsync(rawPromises[0])).resolves.toBe('rejected')
  await expect(promiseStateAsync(rawPromises[1])).resolves.toBe('rejected')
  await expect(promiseStateAsync(rawPromises[2])).resolves.toBe('rejected')
  await expect(promiseStateAsync(rawPromises[3])).resolves.toBe('fulfilled')

  const promise5 = debounce()
  await expect(promise5).resolves.toBe(104)
  await expect(promiseStateAsync(rawPromises[4])).resolves.toBe('fulfilled')
  expect(promise1).not.toBe(promise5)
})

it('different successful runs should have different instances of a promise ', async () => {
  const debounce = createAborter(async (signal) =>
    getConventionalTimeoutPromiseAborter(1, { signal }),
  )
  const promise1 = debounce()
  await promise1

  const promise2 = debounce()
  await promise2
  expect(promise1).not.toBe(promise2)
})

it('the aborted run should have the same instance as the resolved promise ', async () => {
  const debounce = createAborter(
    async (signal) => getConventionalTimeoutPromiseAborter(1, { signal }),
    { debounceThreshold: false },
  )
  const promise1 = debounce()
  const promise2 = debounce()
  await promise2
  expect(promise1).toBe(promise2)
})

it('the sequential calls should be debounced', async () => {
  const getConventionalTimeoutPromiseAborterSpy = vi.fn(
    getConventionalTimeoutPromiseAborter,
  )

  const debounce = createAborter(async (signal) =>
    getConventionalTimeoutPromiseAborterSpy(1, { signal }),
  )

  void debounce()
  expect(getConventionalTimeoutPromiseAborterSpy).toHaveBeenCalledTimes(0)
  await debounce()
  expect(getConventionalTimeoutPromiseAborterSpy).toHaveBeenCalledTimes(1)
})
