import { createGateway } from '../../../browser/my-lib'

export async function run(port: number) {
  // await intercept()
  // const response = await fetch(`http://localhost:5173/`)
  // const body = await response.text()
  // console.log(body)
  const gateway = createGateway()
  console.log(gateway)
  gateway.runAuto(fetch, 'http://localhost:5173/')
  gateway.runAuto(fetch, 'http://localhost:5173/')
  const a = await gateway.runAuto(fetch, 'http://localhost:5173/')
  console.log(a)
  // console.assert(1 % 2 === 0, 'ooo')
  // return body
}

run().then(() => {
  console.log('done')
})
