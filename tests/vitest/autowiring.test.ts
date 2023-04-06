import { expect, it, vi } from 'vitest'

import { createGateway } from '@/src/gateway'

const spyWithDefaultLiteralArgument = vi.fn(
  async (
    _one: boolean,
    _two: Partial<{ foo: string; signal: AbortSignal }> = {},
  ) => true,
)

const spyWithNoRequestArguments = vi.fn(
  async (_two: Partial<{ foo: string; signal: AbortSignal }> = {}) => true,
)

it('if the last argument is an object, should merge signal object with that object argument', async () => {
  const factory = createGateway()

  await factory.runAuto(spyWithDefaultLiteralArgument, true, { foo: 'bar' })
  expect(spyWithDefaultLiteralArgument).toHaveBeenLastCalledWith(true, {
    signal: spyWithDefaultLiteralArgument.mock.lastCall[1].signal,
    foo: 'bar',
  })
})

it('if the last argument is not an object, should append a new literal object as an argument', async () => {
  const factory = createGateway()

  await factory.runAuto(spyWithDefaultLiteralArgument, true)
  expect(spyWithDefaultLiteralArgument).toHaveBeenLastCalledWith(true, {
    signal: spyWithDefaultLiteralArgument.mock.lastCall[1].signal,
  })
})

it('if the call does not have arguments, should append a new literal object as an argument', async () => {
  const factory = createGateway()

  await factory.runAuto(spyWithNoRequestArguments)
  expect(spyWithNoRequestArguments).toHaveBeenLastCalledWith({
    signal: spyWithNoRequestArguments.mock.lastCall[0].signal,
  })
})
