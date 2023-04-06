import { test, expect, type Page } from '@playwright/test'
import { preview, build } from 'vite'

import { createServer, getServerPort } from '../../../src/node/shared/server'
import { createTargetServerRaw } from '../../utils'

let proxyServer: ReturnType<typeof createServer>
let targetServer: ReturnType<typeof createTargetServerRaw>
test.beforeAll(async () => {
  proxyServer = createServer()
  targetServer = createTargetServerRaw()
  await proxyServer.listen({ port: 9555 })
  await targetServer.listen()
})

test.afterAll(async () => {
  await proxyServer.close()
  await targetServer.close()
})

test('the contains the endpoint response', async ({ page }) => {
  // Listen for all console logs
  page.on('console', (message) => {
    console.log(message.text())
  })

  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Example Domain')
})

test('lol', async ({ page, context }) => {
  await page.goto('/')
  page.on('console', (message) => {
    console.log(message.text())
  })
  const a = await page.evaluate(
    async ([port]) => await window.runTest('request-interception', port),
    [getServerPort(targetServer.server)],
  )
  await page.evaluate(async () => {
    const a = await import('./request-interception.mock')
    console.log(a)
  })
  expect(a).toContain('hit')
  await page.pause()
})

test.skip('holy shit', async ({ page }) => {
  const config = {
    build: {
      manifest: true,
      rollupOptions: {
        input:
          '/Users/chetzof/Work/node-intercache/tests/e2e/scenarios/request-interception.mock.ts',
      },
    },
    logLevel: 'silent',
    preview: {
      // open: true,
      port: 8080,
    },
    root: '/Users/chetzof/Work/node-intercache/exp',
    server: {
      cors: false,
      origin: 'http://127.0.0.1:8080',
    },
  }

  await build(config)

  await preview(config)

  await page.goto('http://127.0.0.1:8080/')
  await page.evaluate(async () => {
    const script = document.createElement('script')
    script.addEventListener('load', () => {
      console.log('loaded')
    })

    script.type = 'text/javascript'
    script.src =
      'http://127.0.0.1:8080/assets/request-interception.mock.3f723480.js'

    document.head.append(script)
  })
  //  await page.setContent(
  //    `
  // <script src="http://127.0.0.1:8080/assets/request-interception.mock.8206a16a.js"/>
  //  `,
  //    {
  //      waitUntil: 'networkidle',
  //    },
  //  )
  await page.setContent(
    `
  dawda
   `,
  )
  await page.pause()
})

async function createServer(page: Page) {
  const config = {
    build: {
      manifest: true,
      rollupOptions: {
        input:
          '/Users/chetzof/Work/node-intercache/tests/e2e/scenarios/request-interception.mock.ts',
      },
    },
    logLevel: 'silent',
    preview: {
      // open: true,
      port: 8080,
    },
    root: '/Users/chetzof/Work/node-intercache/exp',
    server: {
      cors: false,
      origin: 'http://127.0.0.1:8080',
    },
  }

  await build(config)

  await preview(config)

  await page.goto('http://127.0.0.1:8080/')
  await page.evaluate(async () => {
    const script = document.createElement('script')
    script.addEventListener('load', () => {
      console.log('loaded')
    })

    script.type = 'text/javascript'
    script.src =
      'http://127.0.0.1:8080/assets/request-interception.mock.3f723480.js'

    document.head.append(script)
  })
  //  await page.setContent(
  //    `
  // <script src="http://127.0.0.1:8080/assets/request-interception.mock.8206a16a.js"/>
  //  `,
  //    {
  //      waitUntil: 'networkidle',
  //    },
  //  )
  // await page.setContent(
  //   `
  // dawda
  //  `,
  // )
  // await page.pause()
}
