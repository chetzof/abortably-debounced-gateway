const equal = require('fast-deep-equal')

export function fu() {
  {
    const map = new Map()
    return new Proxy(map, {
      get(target, name, receiver) {
        return function (...arguments_) {
          for (const key of target.keys()) {
            if (!equal(arguments_[0], key)) {
              continue
            }

            arguments_[0] = key
            break
          }

          return target[name](arguments_[0])
        }
      },
    })
  }
}
