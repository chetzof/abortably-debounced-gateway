import { setTimeout } from 'node:timers/promises'

import { expect, it, vi } from 'vitest'

import { createGateway } from '@/src'

it('fetcher', async () => {
  const gateway = createGateway()
  const fetchSpy = vi.fn(fetch)
  void gateway.runAuto(fetchSpy, 'http://example.com')
  void gateway.runAuto(fetchSpy, 'http://example.com/test')
  expect(fetchSpy).toHaveBeenCalledTimes(0)
  await setTimeout(20)
  expect(fetchSpy).toHaveBeenCalledTimes(2)
  void gateway.runAuto(fetchSpy, 'http://example.com')
  expect(fetchSpy.mock.calls[0][1].signal.aborted).toBe(true)
  expect(fetchSpy.mock.calls[1][1].signal.aborted).toBe(false)
})
