import { setTimeout } from 'node:timers/promises'

import { expect, it, vi } from 'vitest'

import { createGateway } from '@/src/gateway'
import {
  getConventionalTimeoutPromiseAborter,
  getTimeoutPromiseAborter,
} from '@/tests/util'

it('debouncer should make only 1 call', async () => {
  const spy = vi.fn(async (_argument1: string, _argument2) => true)
  const factory = createGateway()
  await Promise.all([
    factory.runAuto(spy, 'ls', {}),
    factory.runAuto(spy, 'ls', {}),
    factory.runAuto(spy, 'ls', {}),
    factory.runAuto(spy, 'ls', {}),
    factory.runAuto(spy, 'ls', {}),
    factory.runAuto(spy, 'ls', {}),
    factory.runAuto(spy, 'ls', {}),
  ])

  expect(spy).toHaveBeenCalledTimes(1)
})

it('case5 ', async () => {
  const factory = createGateway()

  const fun = async (signal: AbortSignal) =>
    getTimeoutPromiseAborter(200, signal)

  await Promise.all([factory.run(fun), factory.run(fun)])
})

it('should debounce requests withing a threshold and abort old request above the threshhold ', async () => {
  const factory = createGateway()

  const abortFunction = vi.fn(getConventionalTimeoutPromiseAborter)
  // expect(util.isDeepStrictEqual(abortFunction, abortFunction)).toBe(false)
  //debounce
  void factory.runAuto(abortFunction, 100, {})
  expect(abortFunction).toHaveBeenCalledTimes(0)
  //debounce
  void factory.runAuto(abortFunction, 100, {})
  expect(abortFunction).toHaveBeenCalledTimes(0)
  //run
  factory.runAuto(abortFunction, 100, {})
  expect(abortFunction).toHaveBeenCalledTimes(0)
  //wait
  await setTimeout(50)
  expect(abortFunction).toHaveBeenCalledTimes(1)

  const abort = abortFunction.mock.lastCall[1].signal
  expect(abort.aborted).toBe(false)
  //abort
  void factory.runAuto(abortFunction, 100, {})
  expect(abort.aborted).toBe(true)
  await setTimeout(50)
  void factory.runAuto(abortFunction, 100, {})
})