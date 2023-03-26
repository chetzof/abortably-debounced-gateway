import { expect, test } from 'vitest'

import { alias } from '@/src/alias'
import { util } from '@/tests/util'

test('must return true', () => {
  expect(util()).toBe(true)
  expect(alias()).toBe(true)
})
