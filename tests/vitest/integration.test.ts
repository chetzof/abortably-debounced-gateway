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

it('execa', async () => {
  const gateway = createGateway()
  const { execa } = await import('execa')

  const execaSpy = vi.fn(execa)
  void gateway.runAuto(execaSpy, 'ls', { shell: true })
  void gateway.runAuto(execaSpy, 'ls', { shell: true })
  expect(execaSpy).toHaveBeenCalledTimes(0)
  await setTimeout(20)
  expect(execaSpy).toHaveBeenCalledTimes(1)
  await gateway.runAuto(execaSpy, 'ls', { shell: true })
  expect(execaSpy.mock.calls[0][1].signal.aborted).toBe(true)
})
