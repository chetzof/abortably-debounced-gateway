import { Map } from 'collections-deep-equal'
import isPlainObject from 'lodash/isPlainObject'

import { createAborter } from '@/src/aborter'
import type {
  OverloadedParameters,
  OverloadedReturnType,
  SignalFunction,
} from '@/src/types'

function autowireParameters<T>(
  signal: AbortSignal,
  executorArguments: OverloadedParameters<T>,
) {
  const tailArgument = executorArguments.at(-1)

  if (!isPlainObject(tailArgument)) {
    return [...executorArguments, { signal }]
  }

  return [
    ...executorArguments.slice(0, -1),
    {
      ...(tailArgument as Record<string, string>),
      signal,
    },
  ]
}

export function createGateway() {
  const registry = new Map<
    SignalFunction<any, Promise<any>> | any,
    () => Promise<any>
  >()

  return {
    run<V, P extends Promise<V>>(promiseFactory: SignalFunction<V, P>): P {
      if (!registry.has(promiseFactory)) {
        registry.set(promiseFactory, createAborter(promiseFactory))
      }

      const factory = registry.get(promiseFactory) as () => P

      return factory()
    },
    runAuto<V, R extends Promise<V>, T extends (...arguments_: any[]) => R>(
      executor: T,
      ...executorArguments: OverloadedParameters<T>
    ): OverloadedReturnType<T> {
      const key = [executor, executorArguments]

      if (!registry.has(key)) {
        registry.set(
          key,
          createAborter((signal) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            executor(...autowireParameters(signal, executorArguments)),
          ),
        )
      }

      const factory = registry.get(key) as () => OverloadedReturnType<T>
      return factory()
    },
  }
}
