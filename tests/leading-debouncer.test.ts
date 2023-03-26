import { setTimeout } from 'node:timers/promises'

import { promiseStateAsync } from 'p-state'
import { expect, it, vi } from 'vitest'

import {
  getConventionalTimeoutPromiseAborter,
  getTimeoutPromiseAborter,
} from './util'

import { createGateway, createAborter } from '../src/leading-debouncer'

const getAbortableTimeoutFactory = async (signal: AbortSignal, timeout = 200) =>
  getTimeoutPromiseAborter(timeout, signal)

it('case1 ', async () => {
  const rawPromises: Array<Promise<number>> = []
  const debounce = createAborter(async (signal) => {
    const promise = getTimeoutPromiseAborter(rawPromises.length + 100, signal)
    rawPromises.push(promise)
    return promise
  })
  const promise1 = debounce()
  const promise2 = debounce()
  const promise3 = debounce()
  const promise4 = debounce()

  await expect(promise1).resolves.toBe(103)
  await expect(promise2).resolves.toBe(103)
  await expect(promise3).resolves.toBe(103)
  await expect(promise4).resolves.toBe(103)

  expect(promise1).toBe(promise2)
  expect(promise1).toBe(promise3)
  expect(promise1).toBe(promise4)

  await expect(promiseStateAsync(rawPromises[0])).resolves.toBe('rejected')
  await expect(promiseStateAsync(rawPromises[1])).resolves.toBe('rejected')
  await expect(promiseStateAsync(rawPromises[2])).resolves.toBe('rejected')
  await expect(promiseStateAsync(rawPromises[3])).resolves.toBe('fulfilled')

  const promise5 = debounce()
  await expect(promise5).resolves.toBe(104)
  await expect(promiseStateAsync(rawPromises[4])).resolves.toBe('fulfilled')
  expect(promise1).not.toBe(promise5)
})

it('case fetch', async () => {
  const rawPromises: Array<Promise<Response>> = []
  const debounce = createAborter(async (signal) => {
    const promise = fetch('http://example.com', {
      signal,
    })
    rawPromises.push(promise)
    return promise
  })

  await Promise.all([debounce(), debounce()])
  await expect(promiseStateAsync(rawPromises[0])).resolves.toBe('rejected')
  await expect(promiseStateAsync(rawPromises[1])).resolves.toBe('fulfilled')
})

it('case3 ', async () => {
  createAborter.global(Symbol('foo'))

  const promise1 = execa('sleep', [1])
  const promise2 = execa('sleep', [1])

  createAborter.pushGlobal(Symbol('foo'), promise1)
  createAborter.pushGlobal(Symbol('foo'), promise2)

  await promise1
  await promise2

  expect(promise1.killed).toBe(true)
  expect(promise2.killed).toBe(false)
})

it('case4 ', async () => {
  const { execa } = await import('execa')
  const factory = createGateway()
  console.log(
    await Promise.all([
      factory.runAuto(execa, 'ls'),
      factory.runAuto(execa, 'ls'),
    ]),
  )
})

it('case5 ', async () => {
  const factory = createGateway()

  const fun = async (signal: AbortSignal) =>
    getTimeoutPromiseAborter(200, signal)

  await Promise.all([factory.run(fun), factory.run(fun)])
})

it.only('aa', async () => {
  const factory = createGateway()

  const getConventionalTimeoutPromiseAborterSpy = vi.fn(
    getConventionalTimeoutPromiseAborter,
  )

  //debounce
  void factory.runAuto(getConventionalTimeoutPromiseAborterSpy, 100)
  expect(getConventionalTimeoutPromiseAborterSpy).toHaveBeenCalledTimes(0)
  //debounce
  void factory.runAuto(getConventionalTimeoutPromiseAborterSpy, 100)
  expect(getConventionalTimeoutPromiseAborterSpy).toHaveBeenCalledTimes(0)
  //run
  void factory.runAuto(getConventionalTimeoutPromiseAborterSpy, 100)
  expect(getConventionalTimeoutPromiseAborterSpy).toHaveBeenCalledTimes(0)
  //wait
  await setTimeout(50)
  expect(getConventionalTimeoutPromiseAborterSpy).toHaveBeenCalledTimes(1)
  const abort = getConventionalTimeoutPromiseAborterSpy.mock.lastCall[1].signal
  expect(abort.aborted).toBe(false)
  //abort
  void factory.runAuto(getConventionalTimeoutPromiseAborterSpy, 100)
  expect(abort.aborted).toBe(true)
  await setTimeout(50)
  void factory.runAuto(getConventionalTimeoutPromiseAborterSpy, 100)

  // console.log(getConventionalTimeoutPromiseAborterSpy.mock.lastCall[1].signal)
})
