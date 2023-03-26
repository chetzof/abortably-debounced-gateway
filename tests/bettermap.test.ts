import util from 'node:util'

import { isEqual } from 'lodash'
import { expect, test } from 'vitest'

test('d', () => {
  const map = new Map()
  const proxymap = new Proxy(map, {
    get(target, name) {
      if (name === 'get') {
        return function (...arguments_) {
          for (const key of target.keys()) {
            if (!isEqual(arguments_[0], key)) {
              continue
            }

            arguments_[0] = key
            break
          }

          return target[name](arguments_[0])
        }
      }

      return target[name]
    },
  })
  const function1 = () => {}
  const function2 = () => {}
  map.set([function1, 'arg1', { a: 1 }], 1)

  expect(
    util.isDeepStrictEqual(
      [function1, 'arg1', { a: 1 }],
      [function1, 'arg1', { a: 1 }],
    ),
  ).toBe(true)

  // expect(proxymap.get([function1, 'arg1', { a: 1 }])).toBe(1)
  // expect(proxymap.has([function1, 'arg1', { a: 1 }]))
})
