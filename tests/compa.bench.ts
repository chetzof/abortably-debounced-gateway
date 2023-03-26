import { Map as MapDeepEqual } from 'collections-deep-equal'
import { bench, describe } from 'vitest'

import { fu } from './fu'

describe('sort', () => {
  bench('my', () => {
    const key = { a: 1 }
    const map = fu()
    map.set(key, true)
    map.get(key)
  })
  bench('custom', () => {
    const key = { a: 1 }
    const map = new MapDeepEqual()
    map.set(key, true)
    map.get(key)
  })

  bench('native', () => {
    const key = { a: 1 }
    const map = new Map()
    map.set(key, true)
    map.get(key)
  })
})
